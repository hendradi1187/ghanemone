/**
 * MapPage — full-bleed Leaflet map dengan layer panel, dataset sidebar,
 * search, basemap controls, dan seismic 3D mode.
 *
 * Phase 8.10 rewrite (Task #18) — port dari prototype `prototype-app.jsx:859-1052`
 * (`PageMap`) + `hifi-pages-2.jsx` (`HfMapView`) ke Leaflet via @ghanem/ui HfMap.
 *
 * Fix bug #1 (prototype): Declared all state (`seismicOn`, `showHorizons`,
 * `showFaults`) yang originally direference di prototype tanpa
 * `useState`/`setShow*` declaration — bekerja di HTML harness karena prototype
 * memakai hoisted hot-reload pattern, tapi crash di bundler.
 *
 * Fix bug #2 (prototype): Proper module imports for `SeismicCrossSection` +
 * `SeismicWellDetails` (lewat `../features/seismic` barrel) — was cross-file
 * globals in HTML harness.
 *
 * URL state (shareable view):
 *   ?lat=...&lng=...&zoom=...&dataset=...&basemap=osm
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HfMap,
  Icon,
  MapLegend,
  type BasemapId,
  type MapDataset,
} from '@ghanem/ui';
import {
  CATEGORIES,
  MOCK_CATALOG,
  type DatasetCategory,
  type DatasetRecord,
} from '../mocks/datasets';
import { SeismicCrossSection, SeismicWellDetails } from '../features/seismic';
import { LayerPanel, type CategoryToggle } from './map/LayerPanel';
import { DatasetSidebar } from './map/DatasetSidebar';
import { useDebouncedValue } from '../hooks/use-debounced-value';

const VALID_BASEMAPS: ReadonlyArray<BasemapId> = ['osm', 'carto', 'satellite', 'topo'];

function isBasemapId(v: string | null): v is BasemapId {
  return v !== null && (VALID_BASEMAPS as ReadonlyArray<string>).includes(v);
}

/** Convert DatasetRecord → MapDataset (Leaflet overlay shape). */
function toMapDataset(record: DatasetRecord): MapDataset {
  const category = CATEGORIES.find((c) => c.id === record.categoryId);
  return {
    id: record.id,
    name: record.title,
    category: category?.label,
    color: category?.color,
    bbox: record.metadata.bbox,
    longitude: record.longitude,
    latitude: record.latitude,
  };
}

export function MapPage(): ReactElement {
  // Fix bug #1: explicit state declarations.
  // Original prototype-app.jsx:859-1052 referenced seismicOn, showHorizons,
  // showFaults, setShowHorizons, setShowFaults without ever declaring them
  // — TypeScript strict surfaces ini sebagai compile error sekarang.
  const [seismicOn, setSeismicOn] = useState<boolean>(false);
  const [showHorizons, setShowHorizons] = useState<boolean>(true);
  const [showFaults, setShowFaults] = useState<boolean>(true);

  /* ─── URL state ────────────────────────────────────────────────────── */
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBasemap: BasemapId = isBasemapId(searchParams.get('basemap'))
    ? (searchParams.get('basemap') as BasemapId)
    : 'osm';
  const initialDatasetId = searchParams.get('dataset');

  const [basemap, setBasemap] = useState<BasemapId>(initialBasemap);
  const [highlightId, setHighlightId] = useState<string | null>(initialDatasetId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Search query (debounced).
  const [searchInput, setSearchInput] = useState<string>('');
  const search = useDebouncedValue(searchInput, 200);

  // Category visibility toggles — default: semua aktif.
  const [activeCategories, setActiveCategories] = useState<Set<DatasetCategory>>(
    () => new Set(CATEGORIES.map((c) => c.id)),
  );

  /* ─── Sync URL state ────────────────────────────────────────────────── */
  // reason: kita debounce highlight + basemap → URL supaya share-link akurat
  // tanpa thrash di setiap pan/zoom (Phase 8.10 only set on highlight/basemap change).
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('basemap', basemap);
    if (highlightId) {
      params.set('dataset', highlightId);
    } else {
      params.delete('dataset');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap, highlightId]);

  /* ─── Derived data ─────────────────────────────────────────────────── */
  const visibleDatasets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_CATALOG.filter((d) => activeCategories.has(d.categoryId)).filter((d) => {
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.provider.name.toLowerCase().includes(q) ||
        (d.category?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [activeCategories, search]);

  const mapDatasets = useMemo(
    () => visibleDatasets.map(toMapDataset),
    [visibleDatasets],
  );

  const categoryToggles: CategoryToggle[] = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        color: c.color,
        count: MOCK_CATALOG.filter((d) => d.categoryId === c.id).length,
        enabled: activeCategories.has(c.id),
      })),
    [activeCategories],
  );

  const legendEntries = useMemo(
    () =>
      CATEGORIES.filter((c) => activeCategories.has(c.id)).map((c) => ({
        label: c.label,
        color: c.color,
        count: MOCK_CATALOG.filter((d) => d.categoryId === c.id).length,
      })),
    [activeCategories],
  );

  /* ─── Handlers ─────────────────────────────────────────────────────── */
  const toggleCategory = useCallback((id: DatasetCategory): void => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectDataset = useCallback((dataset: DatasetRecord | MapDataset): void => {
    setHighlightId(dataset.id);
  }, []);

  /* ─── Search input ref — focus on "/" key ──────────────────────────── */
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === '/' && e.target instanceof Element && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {/* MAP surface — shrinks to ~50% when seismic mode is on */}
          <div
            className="relative min-h-0 transition-all duration-hf ease-hf"
            style={{
              flex: seismicOn ? '1 1 50%' : '1 1 100%',
              background: '#e4ecf4',
            }}
          >
            <HfMap
              basemap={basemap}
              datasets={mapDatasets}
              highlightId={highlightId}
              onDatasetClick={handleSelectDataset}
              ariaLabel="Peta dataset SPEKTRUM"
              height="100%"
            >
              {/* ── Floating top-center: search ────────────────────────── */}
              <div
                className={[
                  'absolute top-4 left-1/2 -translate-x-1/2 z-floating',
                  'w-[360px] max-w-[calc(100%-32px)]',
                  'bg-surface border border-line rounded-3 shadow-3',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 px-3.5 py-2.5">
                  <Icon name="search" size={15} aria-hidden className="text-ink-4" />
                  <input
                    ref={searchInputRef}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cari area, WK, sumur, seismic…"
                    aria-label="Cari dataset di peta"
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-5"
                  />
                  <span className="text-[10.5px] px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-4 font-mono">
                    /
                  </span>
                </div>
              </div>

              {/* ── Floating top-right: view mode toggle ───────────────── */}
              <div
                role="group"
                aria-label="Mode peta"
                className={[
                  'absolute top-4 right-4 z-floating',
                  'inline-flex bg-surface border border-line rounded-2 p-0.5 shadow-2',
                ].join(' ')}
              >
                <button
                  type="button"
                  aria-pressed={!seismicOn}
                  onClick={() => setSeismicOn(false)}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-1 text-xs font-semibold',
                    !seismicOn ? 'bg-green-500 text-white' : 'text-ink-3 hover:bg-surface-2',
                  ].join(' ')}
                >
                  <Icon name="map" size={11} aria-hidden /> 2D Map
                </button>
                <button
                  type="button"
                  aria-pressed={seismicOn}
                  onClick={() => setSeismicOn(true)}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-1 text-xs font-semibold',
                    seismicOn ? 'bg-green-500 text-white' : 'text-ink-3 hover:bg-surface-2',
                  ].join(' ')}
                >
                  <Icon name="layers" size={11} aria-hidden /> 3D Scene
                </button>
              </div>

              {/* ── Floating left: LayerPanel ──────────────────────────── */}
              <div className="absolute top-20 left-4 z-floating">
                <LayerPanel
                  basemap={basemap}
                  onBasemapChange={setBasemap}
                  categories={categoryToggles}
                  onCategoryToggle={toggleCategory}
                  subsurface={{ seismicOn, showHorizons, showFaults }}
                  onSeismicToggle={() => setSeismicOn((v) => !v)}
                  onHorizonsToggle={() => setShowHorizons((v) => !v)}
                  onFaultsToggle={() => setShowFaults((v) => !v)}
                />
              </div>

              {/* ── Floating right: dataset sidebar ────────────────────── */}
              <div className="absolute top-20 right-4 z-floating">
                <DatasetSidebar
                  visible={visibleDatasets}
                  total={MOCK_CATALOG.length}
                  highlightId={highlightId}
                  onSelect={handleSelectDataset}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
                />
              </div>

              {/* ── Floating bottom-right: legend ──────────────────────── */}
              <div className="absolute bottom-4 right-4 z-floating">
                <MapLegend entries={legendEntries} />
              </div>

              {/* ── Floating bottom-left: scale + CRS ──────────────────── */}
              <div
                className={[
                  'absolute bottom-4 left-4 z-floating',
                  'inline-flex items-center gap-2 px-2.5 py-1 rounded-2',
                  'bg-surface/95 border border-line shadow-1',
                  'text-[10.5px] font-mono text-ink-3',
                ].join(' ')}
                aria-label="Indikator CRS dan sumber peta"
              >
                <span>−2.5°S, 118.0°E</span>
                <span className="text-ink-5">|</span>
                <span>EPSG:4326</span>
                <span className="text-ink-5">|</span>
                <span>© OSM / Carto / Esri</span>
              </div>
            </HfMap>
          </div>

          {/* Seismic cross-section bottom panel — Fix bug #2: imported from features/seismic */}
          {seismicOn ? (
            <SeismicCrossSection showHorizons={showHorizons} showFaults={showFaults} />
          ) : null}
        </div>

        {/* Right Well Details panel — Fix bug #2: imported from features/seismic */}
        {seismicOn ? <SeismicWellDetails onClose={() => setSeismicOn(false)} /> : null}
      </div>
    </div>
  );
}

export default MapPage;
