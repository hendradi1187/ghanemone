/**
 * Map module — react-leaflet wrapper untuk Map page.
 *
 * Consumer wajib `import 'leaflet/dist/leaflet.css'` di entry app supaya
 * tiles + markers tampil benar.
 */
export {
  HfMap,
  type HfMapProps,
  type MapDataset,
} from './HfMap';

export {
  MapLegend,
  type MapLegendProps,
  type LegendEntry,
} from './MapLegend';

export {
  BASEMAPS,
  DEFAULT_BASEMAP,
  INDONESIA_BOUNDS,
  INDONESIA_CENTER,
  type BasemapId,
  type BasemapDef,
} from './basemaps';
