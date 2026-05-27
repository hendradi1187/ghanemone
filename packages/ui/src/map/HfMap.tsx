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
 *
 * Task #22: Fly-back UX
 *   - `flyToDefaultSignal` prop (counter) — increment dari parent untuk trigger fly-back
 *   - `onInteractionChange` callback — memberitahu parent apakah user sudah interaksi manual
 *   - Default view = INDONESIA_CENTER + zoom 5, durasi 1.2 detik (smooth)
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
  /**
   * Task #19: Huruf yang ditampilkan di tengah circular marker.
   * Biasanya provider.initials[0] atau name[0].
   */
  initial?: string;
  /** Bounding box [minLon, minLat, maxLon, maxLat] WGS84. Optional. */
  bbox?: [number, number, number, number];
  /**
   * Task #21: GeoJSON geometry organik (polygon WK hasil handcrafted).
   * Jika ada, di-prioritaskan over bbox untuk render polygon.
   */
  geometry?: GeoJSON.Geometry;
  /** Point coord (lng/lat) — dipakai kalau tidak ada bbox/geometry. */
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
  /**
   * Semua datasets — dipakai untuk fly-to + DatasetSidebar backward-compat.
   * Task #20: polygonDatasets/markerDatasets mengambil alih untuk rendering.
   * Jika hanya `datasets` yang di-pass, logic lama (bbox → polygon, lainnya → marker) berlaku.
   */
  datasets?: MapDataset[];
  /**
   * Task #20: Datasets yang di-render sebagai polygon (concession + seismic).
   * Akan use geometry (Task #21) atau bbox untuk bentuk polygon.
   */
  polygonDatasets?: MapDataset[];
  /**
   * Task #20: Datasets yang di-render sebagai circular marker dengan initial letter.
   * Dipakai untuk well-log, production, geology, document.
   */
  markerDatasets?: MapDataset[];
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
  /**
   * Task #22: Fly-back signal — counter yang di-increment oleh parent saat ingin
   * trigger fly-back ke default view Indonesia. Setiap increment = satu animasi flyTo.
   * Pakai counter (bukan boolean) supaya trigger bisa diulang berkali-kali.
   */
  flyToDefaultSignal?: number;
  /**
   * Task #22: Callback ketika user mulai interaksi manual (pan/zoom).
   * Parent bisa pakai ini untuk show/hide Reset button (Goal C smart detection).
   */
  onInteractionChange?: (hasInteracted: boolean) => void;
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

  // Fly-to highlight: prioritaskan geometry bbox, lalu bbox field, lalu lat/lng
  useEffect(() => {
    if (!highlightId) return;
    const target = datasets.find((d) => d.id === highlightId);
    if (!target) return;

    // Task #21: GeoJSON geometry punya bounding box implicit — cek coordinates
    if (target.geometry && target.geometry.type === 'Polygon') {
      const coords = target.geometry.coordinates[0];
      if (coords && coords.length > 0) {
        const lngs = coords.map((c) => c[0] as number);
        const lats = coords.map((c) => c[1] as number);
        const bounds: LatLngBoundsExpression = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ];
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 9, duration: 0.6 });
        return;
      }
    }

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

/**
 * Task #22 — MapResetEffect: fly-back ke default view Indonesia.
 *
 * Pattern: counter sebagai signal. Setiap kali `signal` berubah (increment),
 * effect ini memicu `map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM)`.
 * Inisialisasi counter = 0 tidak memicu fly (effect skip pada mount).
 */
const DEFAULT_CENTER: [number, number] = INDONESIA_CENTER;
const DEFAULT_ZOOM = 5;
/** Durasi animasi fly-back (detik) — cukup smooth untuk enterprise GIS UX. */
const FLY_BACK_DURATION = 1.2;

function MapResetEffect({
  signal,
}: {
  signal: number;
}): null {
  const map = useMap();
  // Simpan nilai signal saat mount supaya kita bisa skip initial render
  const initialSignalRef = useRef(signal);

  useEffect(() => {
    // Skip saat pertama mount — hanya react ke perubahan setelah mount
    if (signal === initialSignalRef.current) return;
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: FLY_BACK_DURATION });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal, map]);

  return null;
}

/**
 * Task #22 — MapInteractionTracker: deteksi interaksi manual user.
 *
 * Dengarkan event 'movestart' dari Leaflet map. Kalau movement berasal dari
 * user (bukan programmatic flyTo), set hasInteracted = true via callback.
 * Ini memungkinkan parent show Reset button hanya saat user sudah pan/zoom.
 */
function MapInteractionTracker({
  onInteractionChange,
}: {
  onInteractionChange?: (hasInteracted: boolean) => void;
}): null {
  const map = useMap();
  const callbackRef = useRef(onInteractionChange);
  useEffect(() => {
    callbackRef.current = onInteractionChange;
  }, [onInteractionChange]);

  useEffect(() => {
    const handleMoveStart = (): void => {
      // Leaflet tidak expose apakah movestart dipicu oleh user atau programmatic.
      // Workaround: tandai interacted setiap kali ada movestart; parent Reset button
      // akan di-clear (hasInteracted = false) saat user klik Reset / panel close.
      callbackRef.current?.(true);
    };
    map.on('movestart', handleMoveStart);
    return () => {
      map.off('movestart', handleMoveStart);
    };
  }, [map]);

  return null;
}

/**
 * Build a GeoJSON FeatureCollection dari datasets.
 * Task #21: Prioritaskan `geometry` (organik WK polygon) over `bbox` (rectangle fallback).
 */
function buildPolygonFeatureCollection(
  datasets: MapDataset[],
): GeoJSON.FeatureCollection<GeoJSON.Geometry, { id: string; name: string; category?: string; color?: string }> {
  const features: GeoJSON.Feature<GeoJSON.Geometry, { id: string; name: string; category?: string; color?: string }>[] = [];

  for (const d of datasets) {
    // Task #21: prioritaskan geometry organik jika tersedia
    if (d.geometry) {
      features.push({
        type: 'Feature',
        properties: { id: d.id, name: d.name, category: d.category, color: d.color },
        geometry: d.geometry,
      });
    } else if (Array.isArray(d.bbox)) {
      const [minLon, minLat, maxLon, maxLat] = d.bbox;
      features.push({
        type: 'Feature',
        properties: { id: d.id, name: d.name, category: d.category, color: d.color },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [minLon, minLat],
            [maxLon, minLat],
            [maxLon, maxLat],
            [minLon, maxLat],
            [minLon, minLat],
          ]],
        },
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Task #19: Circular marker dengan letter di tengah (28px normal, 36px highlight).
 * Letter = initial parameter (provider initial atau nama[0]).
 */
function buildMarkerIcon(color: string, initial?: string, isHighlighted = false): L.DivIcon {
  const size = isHighlighted ? 36 : 28;
  const fontSize = isHighlighted ? 14 : 11;
  const letter = (initial ?? '').charAt(0).toUpperCase();

  return L.divIcon({
    className: 'hf-map-marker',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${color};
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      font-weight:700;
      font-size:${fontSize}px;
      font-family:'Inter','system-ui',sans-serif;
      line-height:1;
    ">${letter}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
  polygonDatasets,
  markerDatasets,
  highlightId = null,
  onDatasetClick,
  children,
  ariaLabel = 'Peta interaktif dataset',
  className = '',
  flyToDefaultSignal = 0,
  onInteractionChange,
}: HfMapProps): JSX.Element {
  const tile = BASEMAPS[basemap];

  /**
   * Task #20: Jika polygonDatasets/markerDatasets di-pass, pakai itu.
   * Fallback ke logika lama: datasets dengan bbox → polygon, tanpa bbox → marker.
   */
  const resolvedPolygonDatasets = useMemo(() => {
    if (polygonDatasets !== undefined) return polygonDatasets;
    // Legacy: semua dataset yang punya bbox
    return datasets.filter((d) => Array.isArray(d.bbox));
  }, [polygonDatasets, datasets]);

  const resolvedMarkerDatasets = useMemo(() => {
    if (markerDatasets !== undefined) return markerDatasets;
    // Legacy: semua dataset tanpa bbox yang punya koordinat
    return datasets.filter(
      (d) => !d.bbox && typeof d.latitude === 'number' && typeof d.longitude === 'number',
    );
  }, [markerDatasets, datasets]);

  // Task #21: FeatureCollection — pakai geometry organik jika ada, fallback ke bbox
  const fc = useMemo(
    () => buildPolygonFeatureCollection(resolvedPolygonDatasets),
    [resolvedPolygonDatasets],
  );

  // All datasets gabungan untuk fly-to di MapEffects
  const allDatasetsForFlyTo = useMemo(
    () => (datasets.length > 0 ? datasets : [...resolvedPolygonDatasets, ...resolvedMarkerDatasets]),
    [datasets, resolvedPolygonDatasets, resolvedMarkerDatasets],
  );

  const onClickRef = useRef(onDatasetClick);
  useEffect(() => {
    onClickRef.current = onDatasetClick;
  }, [onDatasetClick]);

  /**
   * Task #19: Style per-feature dari property color.
   * Opacity bump: 0.18→0.30 (normal), 0.30→0.45 (highlight). Weight: 1.6→2 / 2→3.
   */
  const geoJsonStyle = (
    feature?: GeoJSON.Feature<GeoJSON.Geometry, { color?: string; id: string }>,
  ): PathOptions => {
    const color = feature?.properties?.color ?? colorTokens.green[500];
    const isHighlight = feature?.properties?.id === highlightId;
    return {
      color,
      weight: isHighlight ? 3 : 2,
      fillColor: color,
      fillOpacity: isHighlight ? 0.45 : 0.30,
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

        {/* Task #20/#21: GeoJSON polygons — concession + seismic, pakai geometry organik atau bbox */}
        {fc.features.length > 0 ? (
          <GeoJSON
            // reason: key di-derive dari highlightId + count + concat ids supaya
            // re-render setiap kali highlight/list berubah (GeoJSON layer cache).
            key={`fc-${highlightId ?? 'none'}-${fc.features.length}-${fc.features
              .map(
                (f: GeoJSON.Feature<GeoJSON.Geometry, { id: string }>) =>
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
                // Cari di resolvedPolygonDatasets dulu, lalu fallback ke datasets
                const ds =
                  resolvedPolygonDatasets.find((d) => d.id === props.id) ??
                  datasets.find((d) => d.id === props.id);
                if (ds && onClickRef.current) onClickRef.current(ds);
              });
            }}
          />
        ) : null}

        {/* Task #19/#20: Circular markers dengan initial letter — well-log, production, geology, document */}
        {resolvedMarkerDatasets.map((d) => (
          <Marker
            key={d.id}
            position={[d.latitude as number, d.longitude as number]}
            icon={buildMarkerIcon(
              d.color ?? colorTokens.green[500],
              d.initial,
              d.id === highlightId,
            )}
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

        <MapEffects highlightId={highlightId} datasets={allDatasetsForFlyTo} />
        {/* Task #22: Fly-back ke default view ketika signal berubah */}
        <MapResetEffect signal={flyToDefaultSignal} />
        {/* Task #22: Track interaksi manual untuk smart Reset button */}
        <MapInteractionTracker onInteractionChange={onInteractionChange} />
      </MapContainer>

      {/* Floating overlay UI — caller-provided */}
      {children}
    </div>
  );
}
