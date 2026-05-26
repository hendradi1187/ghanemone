/**
 * Basemap catalog — disediakan sebagai tile templates untuk HfMap.
 *
 * Semua provider gratis untuk pemakaian non-komersial / standard attribution.
 * Phase 9: opsi self-host (Maputnik + tileserver-gl) — lihat docs/infra/maps.md.
 */
export type BasemapId = 'osm' | 'carto' | 'satellite' | 'topo';

export interface BasemapDef {
  id: BasemapId;
  label: string;
  /** Leaflet tile URL template. */
  url: string;
  /** Atribusi standar (TileLayer prop `attribution`). */
  attribution: string;
  /** Subdomains string ('abc'…) — opsional. */
  subdomains?: string;
  /** Max zoom level supported. */
  maxZoom: number;
}

export const BASEMAPS: Record<BasemapId, BasemapDef> = {
  osm: {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  carto: {
    id: 'carto',
    label: 'Carto Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Imagery',
    maxZoom: 18,
  },
  topo: {
    id: 'topo',
    label: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    subdomains: 'abc',
    maxZoom: 17,
  },
};

/** Default basemap = OSM (free, ubiquitous). */
export const DEFAULT_BASEMAP: BasemapId = 'osm';

/** Indonesia bounding box — pakai untuk fit/initial center. */
export const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [-11.5, 94.5],
  [6.5, 141.5],
];

/** Center Indonesia (lat/lng) — pakai untuk MapContainer `center`. */
export const INDONESIA_CENTER: [number, number] = [-2.5, 118.0];
