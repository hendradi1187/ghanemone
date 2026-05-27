import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { BboxQueryDto } from './dto/bbox-query.dto';
import type { WithinQueryDto } from './dto/within-query.dto';
import type { TransformGeometryDto, TransformGeometryResponseDto } from './dto/transform-geometry.dto';
import type { BboxQueryResponseDto, GeoJsonFeatureCollectionDto } from './dto/geojson-response.dto';

/**
 * SpatialService — generic spatial query layer for Ghanem.one.
 *
 * Rules enforced:
 * - All storage CRS: EPSG:4326 — enforced at DB level via CHECK constraints
 * - Transform on read to 3857 is handled by tile server (Martin); this service returns 4326
 * - ST_AsGeoJSON queries ALWAYS include bbox filter or are bounded by table size guard
 * - GIST indexes exist on every geometry column (enforced in Sprint 9.1 migration)
 * - $queryRawUnsafe used for cursor-conditional SQL: table/column names are whitelist-controlled
 */
@Injectable()
export class SpatialService {
  protected readonly logger = new Logger(SpatialService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Bbox query — find features intersecting a bounding envelope
  // ---------------------------------------------------------------------------

  async bboxQuery(dto: BboxQueryDto): Promise<BboxQueryResponseDto> {
    const { minLon, minLat, maxLon, maxLat, type, limit = 100, cursor } = dto;

    if (minLon >= maxLon || minLat >= maxLat) {
      throw new BadRequestException('Invalid bbox: minLon must be < maxLon and minLat must be < maxLat');
    }

    const effectiveLimit = Math.min(limit, 1000);
    const config = this.getBboxQueryConfig(type);

    // Build parameterized query — table + column names from whitelist config (safe)
    // $1=minLon $2=minLat $3=maxLon $4=maxLat $5=limit [$6=cursor if present]
    const cursorClause = cursor ? ` AND id > $6::uuid` : '';
    const params: unknown[] = [minLon, minLat, maxLon, maxLat, effectiveLimit];
    if (cursor) params.push(cursor);

    const sql = `
      SELECT
        id,
        ST_AsGeoJSON(${config.geomCol}) AS geojson,
        ${config.selectCols.join(', ')}
      FROM ${config.table}
      WHERE ${config.geomCol} IS NOT NULL
        AND ST_Intersects(${config.geomCol}, ST_MakeEnvelope($1::float8, $2::float8, $3::float8, $4::float8, 4326))
        ${cursorClause}
      ORDER BY id
      LIMIT $5
    `;

    const rawRows = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      sql,
      ...params,
    );

    const rows = rawRows.map((r) => ({
      id: r['id'] as string,
      geojson: (r['geojson'] as string | null) ?? 'null',
      props: config.toProps(r),
    }));

    const features = rows.map((r) => ({
      type: 'Feature' as const,
      id: r.id,
      geometry: r.geojson && r.geojson !== 'null'
        ? (JSON.parse(r.geojson) as Record<string, unknown>)
        : null,
      properties: r.props,
    }));

    const nextCursor =
      rows.length === effectiveLimit ? (rows[rows.length - 1]?.id ?? null) : null;

    return {
      type: 'FeatureCollection',
      features,
      count: features.length,
      nextCursor,
    };
  }

  /**
   * Configuration for each layer type — table name, geometry column, and columns to select.
   * All values are hard-coded (not user-supplied) so $queryRawUnsafe is safe here.
   */
  private getBboxQueryConfig(type: string): {
    table: string;
    geomCol: string;
    selectCols: string[];
    toProps: (r: Record<string, unknown>) => Record<string, unknown>;
  } {
    switch (type) {
      case 'datasets':
        return {
          table: 'datasets',
          geomCol: 'bbox',
          selectCols: ['title', 'category', 'status', 'sensitivity_level', 'center_lat', 'center_lon'],
          toProps: (r) => ({
            title: r['title'],
            category: r['category'],
            status: r['status'],
            sensitivityLevel: r['sensitivity_level'],
            centerLat: r['center_lat'],
            centerLon: r['center_lon'],
          }),
        };
      case 'work_areas':
        return {
          table: 'work_areas',
          geomCol: 'geometry',
          selectCols: ['name', 'operator', 'status', 'total_area_km2'],
          toProps: (r) => ({
            name: r['name'],
            operator: r['operator'],
            status: r['status'],
            totalAreaKm2: r['total_area_km2'],
          }),
        };
      case 'wells':
        return {
          table: 'wells',
          geomCol: 'point',
          selectCols: ['name', 'operator', 'type', 'status', 'latitude', 'longitude', 'total_depth_m'],
          toProps: (r) => ({
            name: r['name'],
            operator: r['operator'],
            type: r['type'],
            status: r['status'],
            latitude: r['latitude'],
            longitude: r['longitude'],
            totalDepthM: r['total_depth_m'],
          }),
        };
      case 'pipelines':
        return {
          table: 'pipelines',
          geomCol: 'line',
          selectCols: ['name', 'operator', 'type', 'status', 'length_km', 'diameter_in'],
          toProps: (r) => ({
            name: r['name'],
            operator: r['operator'],
            type: r['type'],
            status: r['status'],
            lengthKm: r['length_km'],
            diameterIn: r['diameter_in'],
          }),
        };
      case 'facilities':
        return {
          table: 'facilities',
          geomCol: 'point',
          selectCols: ['name', 'type', 'operator', 'status', 'latitude', 'longitude'],
          toProps: (r) => ({
            name: r['name'],
            type: r['type'],
            operator: r['operator'],
            status: r['status'],
            latitude: r['latitude'],
            longitude: r['longitude'],
          }),
        };
      case 'seismic_coverages':
        return {
          table: 'seismic_coverages',
          geomCol: 'area',
          selectCols: ['name', 'operator', 'survey_type', 'survey_year', 'area_km2'],
          toProps: (r) => ({
            name: r['name'],
            operator: r['operator'],
            surveyType: r['survey_type'],
            surveyYear: r['survey_year'],
            areaKm2: r['area_km2'],
          }),
        };
      default:
        throw new BadRequestException(`Unsupported layer type: ${String(type)}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Within query — find features completely inside a polygon
  // ---------------------------------------------------------------------------

  async withinQuery(dto: WithinQueryDto): Promise<BboxQueryResponseDto> {
    const { type, limit = 500 } = dto;

    if (!dto.wktPolygon && !dto.geojson) {
      throw new BadRequestException('Provide either wktPolygon or geojson parameter');
    }

    let wkt: string;
    if (dto.wktPolygon) {
      wkt = dto.wktPolygon;
    } else {
      const geojsonStr = dto.geojson!;
      try {
        JSON.parse(geojsonStr);
      } catch {
        throw new BadRequestException('geojson parameter is not valid JSON');
      }
      const result = await this.prisma.$queryRaw<Array<{ wkt: string }>>`
        SELECT ST_AsText(ST_GeomFromGeoJSON(${geojsonStr})) AS wkt
      `;
      const wktRow = result[0];
      if (!wktRow?.wkt) throw new BadRequestException('Could not parse GeoJSON geometry');
      wkt = wktRow.wkt;
    }

    const config = this.getBboxQueryConfig(type);
    const effectiveLimit = Math.min(limit, 2000);

    const sql = `
      SELECT
        id,
        ST_AsGeoJSON(${config.geomCol}) AS geojson,
        ${config.selectCols.join(', ')}
      FROM ${config.table}
      WHERE ${config.geomCol} IS NOT NULL
        AND ST_Within(${config.geomCol}, ST_GeomFromText($1, 4326))
      ORDER BY id
      LIMIT $2
    `;

    const rawRows = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      sql,
      wkt,
      effectiveLimit,
    );

    const features = rawRows.map((r) => ({
      type: 'Feature' as const,
      id: r['id'] as string,
      geometry:
        r['geojson'] && r['geojson'] !== 'null'
          ? (JSON.parse(r['geojson'] as string) as Record<string, unknown>)
          : null,
      properties: config.toProps(r),
    }));

    return {
      type: 'FeatureCollection',
      features,
      count: features.length,
      nextCursor: null,
    };
  }

  // ---------------------------------------------------------------------------
  // CRS transform — uses PostGIS ST_Transform
  // ---------------------------------------------------------------------------

  async transformGeometry(dto: TransformGeometryDto): Promise<TransformGeometryResponseDto> {
    const { geometry, fromSrid, toSrid } = dto;

    let geojsonStr: string;
    try {
      geojsonStr = JSON.stringify(geometry);
    } catch {
      throw new BadRequestException('geometry is not serializable JSON');
    }

    // ST_SetSRID asserts source CRS before transform — prevents silent wrong results
    // reason: Prisma serialise number literal sebagai bigint untuk template tagged;
    // cast ::integer agar match ST_SetSRID/ST_Transform signatures.
    const rows = await this.prisma.$queryRaw<Array<{ result: string | null }>>`
      SELECT ST_AsGeoJSON(
        ST_Transform(
          ST_SetSRID(ST_GeomFromGeoJSON(${geojsonStr}), ${fromSrid}::integer),
          ${toSrid}::integer
        )
      ) AS result
    `;

    const row = rows[0];
    if (!row?.result) {
      throw new BadRequestException(
        `CRS transform failed from SRID ${fromSrid} to SRID ${toSrid}. ` +
        'Verify both SRIDs are supported by the PostGIS PROJ database.',
      );
    }

    return {
      geometry: JSON.parse(row.result) as Record<string, unknown>,
      srid: toSrid,
      fromSrid,
    };
  }

  // ---------------------------------------------------------------------------
  // GeoJSON export endpoints — full FeatureCollection per resource
  // Uses single-query jsonb_agg aggregate — one round-trip, no streaming needed
  // at current dataset sizes (1M+ would need cursor-based streaming; TODO Sprint 9.3)
  // ---------------------------------------------------------------------------

  async exportWorkAreas(): Promise<GeoJsonFeatureCollectionDto> {
    const rows = await this.prisma.$queryRaw<Array<{ fc: GeoJsonFeatureCollectionDto }>>`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'totalFeatures', COUNT(*),
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(geometry)::jsonb,
            'properties', jsonb_build_object(
              'name', name,
              'slug', slug,
              'operator', operator,
              'status', status,
              'contractStart', contract_start,
              'contractEnd', contract_end,
              'color', color,
              'totalAreaKm2', total_area_km2,
              'centerLat', center_lat,
              'centerLon', center_lon
            )
          )
        ), '[]'::jsonb)
      ) AS fc
      FROM work_areas
      WHERE geometry IS NOT NULL
    `;

    return (rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }) as GeoJsonFeatureCollectionDto;
  }

  async exportWells(): Promise<GeoJsonFeatureCollectionDto> {
    const rows = await this.prisma.$queryRaw<Array<{ fc: GeoJsonFeatureCollectionDto }>>`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'totalFeatures', COUNT(*),
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(point)::jsonb,
            'properties', jsonb_build_object(
              'name', name,
              'uwi', uwi,
              'operator', operator,
              'type', type,
              'status', status,
              'latitude', latitude,
              'longitude', longitude,
              'totalDepthM', total_depth_m,
              'formation', formation,
              'workAreaId', work_area_id
            )
          )
        ), '[]'::jsonb)
      ) AS fc
      FROM wells
      WHERE point IS NOT NULL
    `;

    return (rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }) as GeoJsonFeatureCollectionDto;
  }

  async exportPipelines(): Promise<GeoJsonFeatureCollectionDto> {
    const rows = await this.prisma.$queryRaw<Array<{ fc: GeoJsonFeatureCollectionDto }>>`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'totalFeatures', COUNT(*),
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(line)::jsonb,
            'properties', jsonb_build_object(
              'name', name,
              'operator', operator,
              'type', type,
              'status', status,
              'lengthKm', length_km,
              'diameterIn', diameter_in,
              'workAreaId', work_area_id
            )
          )
        ), '[]'::jsonb)
      ) AS fc
      FROM pipelines
      WHERE line IS NOT NULL
    `;

    return (rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }) as GeoJsonFeatureCollectionDto;
  }

  async exportFacilities(): Promise<GeoJsonFeatureCollectionDto> {
    const rows = await this.prisma.$queryRaw<Array<{ fc: GeoJsonFeatureCollectionDto }>>`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'totalFeatures', COUNT(*),
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(point)::jsonb,
            'properties', jsonb_build_object(
              'name', name,
              'type', type,
              'operator', operator,
              'status', status,
              'latitude', latitude,
              'longitude', longitude,
              'waterDepthM', water_depth_m,
              'installYear', install_year,
              'workAreaId', work_area_id
            )
          )
        ), '[]'::jsonb)
      ) AS fc
      FROM facilities
      WHERE point IS NOT NULL
    `;

    return (rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }) as GeoJsonFeatureCollectionDto;
  }

  async exportSeismicCoverages(): Promise<GeoJsonFeatureCollectionDto> {
    const rows = await this.prisma.$queryRaw<Array<{ fc: GeoJsonFeatureCollectionDto }>>`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'totalFeatures', COUNT(*),
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(area)::jsonb,
            'properties', jsonb_build_object(
              'name', name,
              'operator', operator,
              'surveyType', survey_type,
              'surveyYear', survey_year,
              'areaKm2', area_km2,
              'bandwidth', bandwidth,
              'acquisitionMethod', acquisition_method,
              'processingVendor', processing_vendor,
              'workAreaId', work_area_id
            )
          )
        ), '[]'::jsonb)
      ) AS fc
      FROM seismic_coverages
      WHERE area IS NOT NULL
    `;

    return (rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }) as GeoJsonFeatureCollectionDto;
  }

  /**
   * Export a single dataset's bbox geometry as GeoJSON Feature.
   */
  async exportDatasetById(id: string): Promise<Record<string, unknown>> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string; geojson: string | null;
      title: string; category: string; status: string; sensitivity_level: string;
      center_lat: number | null; center_lon: number | null;
      bbox_json: unknown;
    }>>`
      SELECT
        id,
        ST_AsGeoJSON(bbox) AS geojson,
        title,
        category,
        status,
        sensitivity_level,
        center_lat,
        center_lon,
        bbox_json
      FROM datasets
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    const row = rows[0];
    if (!row) throw new NotFoundException(`Dataset ${id} not found`);

    return {
      type: 'Feature',
      id: row.id,
      geometry: row.geojson ? (JSON.parse(row.geojson) as Record<string, unknown>) : null,
      properties: {
        title: row.title,
        category: row.category,
        status: row.status,
        sensitivityLevel: row.sensitivity_level,
        centerLat: row.center_lat,
        centerLon: row.center_lon,
        bboxJson: row.bbox_json,
      },
    };
  }
}
