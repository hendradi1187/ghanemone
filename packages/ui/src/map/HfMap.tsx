/**
 * HfMap — react-leaflet wrapper untuk render basemap + dataset overlay.
 *
 * Ported pola dari `prototype-realmap.jsx` (lihat root prototype):
 *   - Basemap pluggable (OSM/Carto/Satellite/Topo)
 *   - Dataset di-render sebagai bbox polygon (kalau ada bbox) atau marker
 *   - Tooltip on hover (name + category)
 *   - Click handler → callback dengan dataset id
 *   - ResizeObserver untuk invalidateSize saat container resize
 *
 * Important:
 *   - Consumer harus `import 'leaflet/dist/leaflet.css'` sekali (di main.tsx).
 *   - SSR-incompatible — react-leaflet butuh window. Vite SPA-only di sini OK.
 *
 * A11y:
 *   - Container `<div role="region" aria-label>` supaya SR mengumumkan map area
 *   - Tile/marker tooltips Leaflet sudah keyboard-navigable via focus pada marker
 */
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
} from 'react-leaflet';
import L, {
  type LatLngBoundsExpression,
  type Layer,
  type LeafletMouseEvent,
  type PathOptions,
} from 'leaflet';
import {
  BASEMAPS,
  DEFAULT_BASEMAP,
  INDONESIA_CENTER,
  type BasemapId,
} from './basemaps';
import { colorTokens } from '../tokens';

/** Minimal shape dataset yang HfMap perlu — caller di apps boleh pass superset. */
export interface MapDataset {
  id: string;
  name: string;
  category?: string;
  /** Warna outline/marker — biasanya dari CATEGORIES table. */
  color?: string;
  /** Bounding box [minLon, minLat, maxLon, maxLat] WGS84. Optional. */
  bbox?: [number, number, number, number];
  /** Point coord (lng/lat) — dipakai kalau tidak ada bbox. */
  longitude?: number;
  latitude?: number;
}

export interface HfMapProps {
  /** Center awal map (lat, lng). Default Indonesia. */
  center?: [number, number];
  /** Zoom awal. Default 5 (cocok untuk Indonesia view). */
  zoom?: number;
  /** Min/max zoom. */
  minZoom?: number;
  maxZoom?: number;
  /** Tinggi map (CSS). Pakai '100%' untuk parent yang sudah fixed height. */
  height?: string | number;
  /** Basemap aktif. */
  basemap?: BasemapId;
  /** Datasets overlay. */
  datasets?: MapDataset[];
  /** Dataset id yang sedang highlighted (border tebal + fly-to). */
  highlightId?: string | null;
  /** Click pada dataset polygon/marker. */
  onDatasetClick?: (dataset: MapDataset) => void;
  /** Slot anak (floating panels, controls). Di-render dalam wrapper `<div>`,
   *  bukan ke dalam map — supaya overlay UI absolute positioned. */
  children?: ReactNode;
  /** A11y label. */
  ariaLabel?: string;
  /** Tambahan classes untuk wrapper. */
  className?: string;
}

/**
 * MapEffects — child of MapContainer untuk akses `useMap` instance,
 * resize observer, dan fly-to highlight target.
 */
function MapEffects({
  highlightId,
  datasets,
}: {
  highlightId?: string | null;
  datasets: MapDataset[];
}): null {
  const map = useMap();

  // ResizeObserver — re-flow tiles saat container size berubah (panel toggle dll)
  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  // Fly-to highlight bbox
  useEffect(() => {
    if (!highlightId) return;
    const target = datasets.find((d) => d.id === highlightId);
    if (!target) return;
    if (target.bbox) {
      const bounds: LatLngBoundsExpression = [
        [target.bbox[1], target.bbox[0]],
        [target.bbox[3], target.bbox[2]],
      ];
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 9, duration: 0.6 });
    } else if (typeof target.latitude === 'number' && typeof target.longitude === 'number') {
      map.flyTo([target.latitude, target.longitude], 8, { duration: 0.6 });
    }
  }, [highlightId, datasets, map]);

  return null;
}

/** Build a GeoJSON FeatureCollection dari datasets dengan bbox. */
function buildBboxFeatureCollection(
  datasets: MapDataset[],
): GeoJSON.FeatureCollection<GeoJSON.Polygon, { id: string; name: string; category?: string; color?: string }> {
  const features = datasets
    .filter((d): d is MapDataset & { bbox: [number, number, number, number] } => Array.isArray(d.bbox))
    .map((d) => {
      const [minLon, minLat, maxLon, maxLat] = d.bbox;
      return {
        type: 'Feature' as const,
        properties: {
          id: d.id,
          name: d.name,
          category: d.category,
          color: d.color,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [minLon, minLat],
            [maxLon, minLat],
            [maxLon, maxLat],
            [minLon, maxLat],
            [minLon, minLat],
          ]],
        },
      };
    });
  return { type: 'FeatureCollection', features };
}

/** Simple circle marker icon dengan warna dari token. */
function buildMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'hf-map-marker',
    html: `<span style="
      display:block;width:12px;height:12px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 1px 3px rgba(14,23,38,.35);
    "></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export function HfMap({
  center = INDONESIA_CENTER,
  zoom = 5,
  minZoom = 4,
  maxZoom = 11,
  height = '100%',
  basemap = DEFAULT_BASEMAP,
  datasets = [],
  highlightId = null,
  onDatasetClick,
  children,
  ariaLabel = 'Peta interaktif dataset',
  className = '',
}: HfMapProps): JSX.Element {
  const tile = BASEMAPS[basemap];
  const fc = useMemo(() => buildBboxFeatureCollection(datasets), [datasets]);
  const pointDatasets = useMemo(
    () =>
      datasets.filter(
        (d) =>
          !d.bbox &&
          typeof d.latitude === 'number' &&
          typeof d.longitude === 'number',
      ),
    [datasets],
  );

  const onClickRef = useRef(onDatasetClick);
  useEffect(() => {
    onClickRef.current = onDatasetClick;
  }, [onDatasetClick]);

  // Style per-feature dari property color (atau fallback brand green).
  const geoJsonStyle = (
    feature?: GeoJSON.Feature<GeoJSON.Geometry, { color?: string; id: string }>,
  ): PathOptions => {
    const color = feature?.properties?.color ?? colorTokens.green[500];
    const isHighlight = feature?.properties?.id === highlightId;
    return {
      color,
      weight: isHighlight ? 3 : 1.6,
      fillColor: color,
      fillOpacity: isHighlight ? 0.32 : 0.18,
    };
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={['relative w-full', className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={false}
        style={{ position: 'absolute', inset: 0, background: colorTokens.map.water }}
      >
        <TileLayer
          // reason: key di-derive dari basemap.id supaya saat ganti basemap, layer baru dimount.
          key={tile.id}
          url={tile.url}
          attribution={tile.attribution}
          maxZoom={tile.maxZoom}
          {...(tile.subdomains ? { subdomains: tile.subdomains } : {})}
        />

        {/* GeoJSON polygons dari bbox */}
        {fc.features.length > 0 ? (
          <GeoJSON
            // reason: key di-derive dari highlightId + count + concat ids supaya
            // re-render setiap kali highlight/list berubah (GeoJSON layer cache).
            key={`fc-${highlightId ?? 'none'}-${fc.features.length}-${fc.features
              .map(
                (f: GeoJSON.Feature<GeoJSON.Polygon, { id: string }>) =>
                  f.properties.id,
              )
              .join('|')}`}
            data={fc}
            style={(f?: GeoJSON.Feature<GeoJSON.Geometry, { color?: string; id: string }>) =>
              geoJsonStyle(f)
            }
            onEachFeature={(
              feature: GeoJSON.Feature<GeoJSON.Geometry, { id: string; name: string; category?: string }>,
              layer: Layer,
            ) => {
              const props = feature.properties as { id: string; name: string; category?: string };
              const tooltipHtml = `<b>${props.name}</b>${props.category ? `<br/><span style="color:${colorTokens.ink[4]};font-size:10.5px">${props.category}</span>` : ''}`;
              layer.bindTooltip(tooltipHtml, { sticky: true, className: 'hf-leaflet-tooltip' });
              layer.on('click', (e: LeafletMouseEvent) => {
                e.originalEvent?.stopPropagation();
                const ds = datasets.find((d) => d.id === props.id);
                if (ds && onClickRef.current) onClickRef.current(ds);
              });
            }}
          />
        ) : null}

        {/* Markers untuk datasets tanpa bbox */}
        {pointDatasets.map((d) => (
          <Marker
            key={d.id}
            position={[d.latitude as number, d.longitude as number]}
            icon={buildMarkerIcon(d.color ?? colorTokens.green[500])}
            eventHandlers={{
              click: () => {
                if (onClickRef.current) onClickRef.current(d);
              },
            }}
          >
            <LeafletTooltip sticky className="hf-leaflet-tooltip">
              <b>{d.name}</b>
              {d.category ? (
                <>
                  <br />
                  <span style={{ color: colorTokens.ink[4], fontSize: 10.5 }}>{d.category}</span>
                </>
              ) : null}
            </LeafletTooltip>
          </Marker>
        ))}

        <MapEffects highlightId={highlightId} datasets={datasets} />
      </MapContainer>

      {/* Floating overlay UI — caller-provided */}
      {children}
    </div>
  );
}
