# Spatial Query Patterns — Ghanem.one

PostGIS 3.4 on PostgreSQL 15. All geometry stored in EPSG:4326 (WGS84 geographic).
Transform to EPSG:3857 (Web Mercator) at read time for tile output.

---

## 1. Bounding-box intersection (most common)

Used everywhere: catalog search, map viewport filter, tile generation.

```sql
-- Find datasets whose bbox intersects a viewport rectangle.
-- $1=minLon $2=minLat $3=maxLon $4=maxLat
-- MUST use ST_Intersects + ST_MakeEnvelope — NOT ST_Within (too strict) or raw coord comparisons.
SELECT id, title, category, center_lat, center_lon
FROM datasets
WHERE ST_Intersects(
  bbox,
  ST_MakeEnvelope($1, $2, $3, $4, 4326)
)
AND status = 'APPROVED'
ORDER BY download_count DESC
LIMIT 100;
```

EXPLAIN ANALYZE should show `Bitmap Index Scan on datasets_bbox_gist`.
If it shows `Seq Scan`, run `VACUUM ANALYZE datasets` and recheck.

---

## 2. Datasets within a Work Area polygon

Used for "show all datasets in WK ONWJ" queries.

```sql
-- Datasets whose bbox centroid falls inside a WK polygon.
-- Using ST_Within on bbox polygon vs WK polygon can be too strict for large datasets
-- that span WK boundaries. Use ST_Intersects for inclusiveness.
SELECT d.id, d.title, d.category, d.center_lat, d.center_lon
FROM datasets d
JOIN work_areas w ON ST_Intersects(d.bbox, w.geometry)
WHERE w.id = $1
  AND d.status = 'APPROVED'
ORDER BY d.year DESC;
```

For strict containment (dataset entirely inside WK):
```sql
SELECT d.*
FROM datasets d
JOIN work_areas w ON ST_Within(d.bbox, w.geometry)
WHERE w.slug = $1;
```

---

## 3. Wells within radius (proximity search)

Used for "wells near a point" API — e.g., find nearest wells to a click on the map.

```sql
-- $1=longitude $2=latitude $3=radius_meters
-- geography cast converts EPSG:4326 lon/lat to spheroidal distance (accurate).
SELECT
  id,
  name,
  operator,
  type,
  status,
  latitude,
  longitude,
  ST_Distance(
    point::geography,
    ST_MakePoint($1, $2)::geography
  ) AS distance_m
FROM wells
WHERE ST_DWithin(
  point::geography,
  ST_MakePoint($1, $2)::geography,
  $3
)
ORDER BY distance_m
LIMIT 50;
```

ST_DWithin on geography uses the GIST index on `wells_point_gist`.

---

## 4. GeoJSON FeatureCollection export

Used for direct map consumption and WFS-style responses.

```sql
-- NEVER run without bbox filter on > 10K features — will OOM.
-- Always require ST_Intersects(geometry, bbox_arg) as WHERE clause.
SELECT json_build_object(
  'type',     'FeatureCollection',
  'features', json_agg(
    json_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(geometry)::json,
      'properties', json_build_object(
        'id',            id,
        'name',          name,
        'operator',      operator,
        'status',        status,
        'total_area_km2',total_area_km2
      )
    )
  )
)
FROM work_areas
WHERE ST_Intersects(geometry, ST_MakeEnvelope($1, $2, $3, $4, 4326));
```

For streaming large results, use a cursor or chunked OFFSET/LIMIT with an ordered key:
```sql
SELECT ST_AsGeoJSON(geometry) AS geom_json, id, name, operator
FROM work_areas
WHERE id > $last_id           -- keyset pagination
ORDER BY id
LIMIT 500;
```

---

## 5. CRS transform — EPSG:4326 to EPSG:3857 (Web Mercator)

Always transform ON READ, never on storage.

```sql
-- Export wells in Web Mercator for tile generation
SELECT
  id,
  name,
  ST_AsGeoJSON(ST_Transform(point, 3857)) AS point_3857
FROM wells
WHERE ST_Intersects(
  point,
  ST_Transform(ST_MakeEnvelope($1, $2, $3, $4, 3857), 4326)
);
```

For Indonesian UTM zones (DGN95 / EPSG:23830–23845 import):
```sql
-- Import from TM-3 zone (e.g. Zone 48.3, EPSG:23830) → store as 4326
INSERT INTO wells (name, operator, latitude, longitude, point)
SELECT
  name,
  operator,
  ST_Y(ST_Transform(source_geom, 4326)),
  ST_X(ST_Transform(source_geom, 4326)),
  ST_Transform(source_geom, 4326)
FROM staging_wells_utm;
```

PROJ 9 supports all EPSG:23830–23845 zones. Verify with:
```sql
SELECT * FROM spatial_ref_sys WHERE srid BETWEEN 23830 AND 23845;
```

---

## 6. Topology validation on import

Run before inserting any imported geometry.

```sql
-- Check validity
SELECT id, name, ST_IsValid(geometry) AS valid, ST_IsValidReason(geometry) AS reason
FROM staging_work_areas
WHERE NOT ST_IsValid(geometry);

-- Auto-repair with ST_MakeValid (GEOS 3.10+)
UPDATE staging_work_areas
SET geometry = ST_MakeValid(geometry)
WHERE NOT ST_IsValid(geometry);

-- Final check — unfixable features should be logged and excluded
SELECT COUNT(*) FROM staging_work_areas WHERE NOT ST_IsValid(geometry);
-- Expected: 0
```

The `validate_and_repair_geometry()` trigger handles this automatically on INSERT/UPDATE,
but explicit pre-validation is recommended for bulk imports.

---

## 7. Seismic coverage area calculation

```sql
-- Find seismic surveys covering a given exploration block
SELECT
  sc.id,
  sc.name,
  sc.survey_year,
  sc.survey_type,
  sc.area_km2,
  ST_Area(ST_Intersection(sc.area, wa.geometry)::geography) / 1e6 AS overlap_km2,
  (ST_Area(ST_Intersection(sc.area, wa.geometry)) / ST_Area(sc.area) * 100)::int AS coverage_pct
FROM seismic_coverages sc
JOIN work_areas wa ON ST_Intersects(sc.area, wa.geometry)
WHERE wa.slug = $1
ORDER BY sc.survey_year DESC;
```

---

## 8. Pipeline length and spatial stats

```sql
-- Pipeline summary per WK
SELECT
  wa.name AS work_area,
  COUNT(p.id) AS pipeline_count,
  SUM(p.length_km) AS total_length_km,
  STRING_AGG(DISTINCT p.type::text, ', ') AS pipeline_types
FROM pipelines p
JOIN work_areas wa ON p.work_area_id = wa.id
GROUP BY wa.id, wa.name
ORDER BY total_length_km DESC NULLS LAST;
```

---

## 9. Martin tile server — SQL function source

Martin uses PostgreSQL functions as tile sources. Example for well points:

```sql
CREATE OR REPLACE FUNCTION public.wells_tiles(z integer, x integer, y integer)
RETURNS bytea AS $$
DECLARE
  bounds geometry;
  mvt    bytea;
BEGIN
  -- Tile bounds in EPSG:3857
  bounds := ST_TileEnvelope(z, x, y);

  SELECT ST_AsMVT(tile_data, 'wells', 4096, 'geom')
  INTO mvt
  FROM (
    SELECT
      id,
      name,
      operator,
      type,
      status,
      ST_AsMVTGeom(
        ST_Transform(point, 3857),
        bounds,
        4096,
        64,
        true
      ) AS geom
    FROM wells
    WHERE ST_Intersects(
      point,
      ST_Transform(bounds, 4326)     -- transform query bbox to 4326 for GIST hit
    )
      AND status != 'ABANDONED'      -- optional: filter in tile func
  ) AS tile_data;

  RETURN mvt;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;
```

Register in `martin.toml`:
```toml
[[function_sources]]
id       = "wells_tiles"
schema   = "public"
function = "wells_tiles"
```

---

## 10. EXPLAIN ANALYZE — index verification

Run this after seed to confirm GIST indexes are used:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, title FROM datasets
WHERE ST_Intersects(
  bbox,
  ST_MakeEnvelope(110, -8, 115, -6, 4326)
);
```

Expected output snippet:
```
Bitmap Heap Scan on datasets  (cost=... rows=...)
  ->  Bitmap Index Scan on datasets_bbox_gist
        Index Cond: (bbox && '...'::geometry)
```

If `Seq Scan` appears:
1. `SET enable_seqscan = OFF;` temporarily to force index.
2. Check row count — planner may prefer seq scan if table is tiny (< 1000 rows).
3. Run `VACUUM ANALYZE datasets;` to refresh statistics.
4. At 1M+ features, GIST will always win.

---

## 11. BRIN index — time-series production data

For tables with monotonically increasing timestamps (e.g., production monthly reports):

```sql
-- BRIN is 100-1000x smaller than B-tree for sequential data
CREATE INDEX datasets_created_at_brin ON datasets USING BRIN (created_at);

-- Query: datasets published in a date range
SELECT id, title FROM datasets
WHERE published_at BETWEEN '2023-01-01' AND '2024-12-31'
  AND ST_Intersects(bbox, ST_MakeEnvelope($1, $2, $3, $4, 4326));
```

---

## Performance targets

| Query type                    | Target p95 | Index used              |
|-------------------------------|-----------|-------------------------|
| Tile generation (MVT)         | < 200 ms  | `_gist` on geometry col |
| Catalog bbox filter           | < 50 ms   | `datasets_bbox_gist`    |
| Well radius search (5 km)     | < 30 ms   | `wells_point_gist`      |
| WK polygon lookup             | < 20 ms   | `work_areas_geometry_gist` |
| GeoJSON export (< 10K feat)   | < 500 ms  | GIST + bbox filter mandatory |

Rule: `SELECT ST_AsGeoJSON(geom) FROM table` without WHERE bbox filter is FORBIDDEN
on any table with > 10K rows. Always pass `ST_MakeEnvelope($1,$2,$3,$4,4326)` as filter.
