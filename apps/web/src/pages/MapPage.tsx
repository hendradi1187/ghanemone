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
 * Sprint Mini Task #18: DatasetSlideOver dihubungkan ke MapPage via URL state
 * `?selected=<dataset-id>`. Klik marker/polygon → panel detail muncul dari kanan.
 * Deep-link `/map?selected=<id>` juga supported.
 *
 * URL state (shareable view):
 *   ?lat=...&lng=...&zoom=...&dataset=...&basemap=osm&selected=...
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
  type DatasetCategory,
  type DatasetRecord,
} from '../mocks/datasets';
import { SeismicCrossSection, SeismicWellDetails } from '../features/seismic';
import { LayerPanel, type CategoryToggle } from './map/LayerPanel';
import { DatasetSidebar } from './map/DatasetSidebar';
import { DatasetSlideOver } from '../components/explore/DatasetSlideOver';
import { ResetMapButton } from './map/ResetMapButton';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { useDatasets, useDataset } from '../hooks/useDatasets';

const VALID_BASEMAPS: readonly BasemapId[] = ['osm', 'carto', 'satellite', 'topo'];

function isBasemapId(v: string | null): v is BasemapId {
  return v !== null && (VALID_BASEMAPS as readonly string[]).includes(v);
}

/**
 * Kategori yang di-render sebagai polygon (concession + seismic punya area WK/survey).
 * Kategori lain di-render sebagai marker titik.
 */
const POLYGON_CATEGORIES = new Set<DatasetCategory>(['concession', 'seismic']);

/** Convert DatasetRecord → MapDataset (Leaflet overlay shape). */
function toMapDataset(record: DatasetRecord): MapDataset {
  const category = CATEGORIES.find((c) => c.id === record.categoryId);
  return {
    id: record.id,
    name: record.title,
    category: category?.label,
    color: category?.color,
    // Task #19: initial dari provider.initials[0] — prioritas utama, fallback ke nama[0]
    initial: record.provider.initials.charAt(0) || record.title.charAt(0),
    // Task #21: geometry organik dari WK_BOUNDARIES (jika ada di DatasetRecord)
    geometry: record.geometry,
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
  // Task #13: LayerPanel default collapsed supaya tidak memblok area peta
  const [layerPanelCollapsed, setLayerPanelCollapsed] = useState<boolean>(true);

  // Task #18: selectedId dari URL param ?selected — untuk DatasetSlideOver deep-link
  const selectedId = searchParams.get('selected');
  const { data: selectedDataset = null } = useDataset(selectedId ?? undefined);

  /**
   * Task #22 — Fly-back UX.
   *
   * flyToDefaultSignal: counter yang di-increment untuk trigger MapResetEffect di HfMap.
   * Pakai counter (bukan boolean) supaya bisa trigger berulang kali.
   *
   * hasMapInteracted: true saat user sudah pan/zoom manual → Reset button visible (Goal C).
   * Di-reset ke false saat fly-back dipicu (user sudah di Indonesia view lagi).
   */
  const [flyToDefaultSignal, setFlyToDefaultSignal] = useState<number>(0);
  const [hasMapInteracted, setHasMapInteracted] = useState<boolean>(false);

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

  /* ─── Real API datasets (Sprint 9.3) ──────────────────────────────── */
  // Determine active category filter from first active toggle.
  // Full multi-category support deferred to Sprint 9.4.
  const activeCategoryForApi = useMemo(() => {
    const enabledCategories = [...activeCategories];
    if (enabledCategories.length === CATEGORIES.length) return undefined; // all active = no filter
    return enabledCategories[0];
  }, [activeCategories]);

  const { data: datasetsData } = useDatasets({
    search: search.trim() || undefined,
    category: activeCategoryForApi,
    limit: 100, // load up to 100 for map view
    page: 1,
  });

  /* ─── Derived data ─────────────────────────────────────────────────── */
  const visibleDatasets = useMemo<DatasetRecord[]>(() => {
    if (!datasetsData?.items) return [];
    // Client-side category filter for multi-category toggles.
    return datasetsData.items.filter((d) => activeCategories.has(d.categoryId));
  }, [datasetsData, activeCategories]);

  // Task #20: Split datasets jadi polygon (concession + seismic) vs marker (semua lain)
  const polygonDatasets = useMemo(
    () => visibleDatasets.filter((d) => POLYGON_CATEGORIES.has(d.categoryId)).map(toMapDataset),
    [visibleDatasets],
  );

  const markerDatasets = useMemo(
    () => visibleDatasets.filter((d) => !POLYGON_CATEGORIES.has(d.categoryId)).map(toMapDataset),
    [visibleDatasets],
  );

  // Tetap expose semua untuk fly-to di MapEffects + backward-compat DatasetSidebar
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
        count: visibleDatasets.filter((d) => d.categoryId === c.id).length,
        enabled: activeCategories.has(c.id),
      })),
    [activeCategories, visibleDatasets],
  );

  const legendEntries = useMemo(
    () =>
      CATEGORIES.filter((c) => activeCategories.has(c.id)).map((c) => ({
        label: c.label,
        color: c.color,
        count: visibleDatasets.filter((d) => d.categoryId === c.id).length,
      })),
    [activeCategories, visibleDatasets],
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

  /**
   * Task #18: Klik dataset → set ?selected= di URL (untuk DatasetSlideOver)
   * + set highlightId untuk fly-to animasi di peta.
   */
  const handleSelectDataset = useCallback((dataset: DatasetRecord | MapDataset): void => {
    setHighlightId(dataset.id);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('selected', dataset.id);
        return next;
      },
      { replace: false },
    );
  }, [setSearchParams]);

  /**
   * Task #22: Trigger fly-back ke Indonesia default view.
   * Juga reset hasMapInteracted supaya Reset button hilang lagi (sudah di default view).
   */
  const triggerFlyBack = useCallback((): void => {
    setFlyToDefaultSignal((prev) => prev + 1);
    setHighlightId(null);
    setHasMapInteracted(false);
  }, []);

  /**
   * Task #18 + #22: Tutup SlideOver → hapus ?selected dari URL + fly-back ke overview.
   *
   * Fly-back hanya dipicu kalau ada dataset yang sedang selected (user EXPLICITLY tutup).
   * Kalau panel sudah closed (selectedId = null), tidak ada efek fly-back.
   *
   * Edge case deep-link: kalau user langsung navigasi ke /map?selected=id dan langsung
   * tutup tanpa pan sama sekali, fly-back tetap dipicu — ini intentional karena
   * user mungkin ingin lihat konteks sekitar setelah tutup panel.
   */
  const handleCloseSlideOver = useCallback((): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('selected');
        return next;
      },
      { replace: true },
    );
    // Fly-back ke Indonesia overview saat panel ditutup (UX pattern Koordinates.com)
    triggerFlyBack();
  }, [setSearchParams, triggerFlyBack]);

  /**
   * Task #22 Goal B: Handler untuk Reset Map button.
   * Trigger fly-back tanpa menutup SlideOver (user bisa reset view sambil panel terbuka).
   */
  const handleResetMap = useCallback((): void => {
    triggerFlyBack();
  }, [triggerFlyBack]);

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
              polygonDatasets={polygonDatasets}
              markerDatasets={markerDatasets}
              highlightId={highlightId}
              onDatasetClick={handleSelectDataset}
              ariaLabel="Peta dataset SPEKTRUM"
              height="100%"
              flyToDefaultSignal={flyToDefaultSignal}
              onInteractionChange={setHasMapInteracted}
            >
              {/* ── Floating top-center: search ────────────────────────── */}
              {/* Task #14: w-[280px] di mobile → md:w-[360px] di desktop.
                  max-w-[calc(100%-180px)] reserve ruang untuk View Mode Toggle kanan + padding. */}
              <div
                className={[
                  'absolute top-3 left-1/2 -translate-x-1/2 z-floating-overlay',
                  'w-[280px] md:w-[360px] max-w-[calc(100%-180px)]',
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
              {/* Task #17: z-floating-overlay (55) — selalu di atas panels */}
              <div
                role="group"
                aria-label="Mode peta"
                className={[
                  'absolute top-3 right-4 z-floating-overlay',
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
              {/* Task #13: default collapsed=true, Task #17: z-floating-panel (51) */}
              <div className="absolute top-20 left-4 z-floating-panel">
                <LayerPanel
                  basemap={basemap}
                  onBasemapChange={setBasemap}
                  categories={categoryToggles}
                  onCategoryToggle={toggleCategory}
                  subsurface={{ seismicOn, showHorizons, showFaults }}
                  onSeismicToggle={() => setSeismicOn((v) => !v)}
                  onHorizonsToggle={() => setShowHorizons((v) => !v)}
                  onFaultsToggle={() => setShowFaults((v) => !v)}
                  collapsed={layerPanelCollapsed}
                  onToggleCollapse={() => setLayerPanelCollapsed((v) => !v)}
                />
              </div>

              {/* ── Floating right: dataset sidebar ────────────────────── */}
              {/* Task #17: z-floating-panel (51) */}
              <div className="absolute top-20 right-4 z-floating-panel">
                <DatasetSidebar
                  visible={visibleDatasets}
                  total={datasetsData?.total ?? visibleDatasets.length}
                  highlightId={highlightId}
                  onSelect={handleSelectDataset}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
                />
              </div>

              {/* ── Floating bottom-center: legend ─────────────────────── */}
              {/* Task #15: pindah ke bottom-center supaya tidak overlap DatasetSidebar.
                  Task #17: z-floating-base (50) — status elemen statis. */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-floating-base max-w-md">
                <MapLegend entries={legendEntries} />
              </div>

              {/* ── Floating bottom-left: scale + CRS ──────────────────── */}
              {/* Task #16: copyright hidden di mobile (xs–sm), muncul md+.
                  Task #17: z-floating-base (50) */}
              <div
                className={[
                  'absolute bottom-4 left-4 z-floating-base',
                  'inline-flex items-center gap-2 px-2.5 py-1 rounded-2',
                  'bg-surface/95 border border-line shadow-1',
                  'text-[10.5px] font-mono text-ink-3',
                ].join(' ')}
                aria-label="Indikator CRS dan sumber peta"
              >
                <span>−2.5°S, 118.0°E</span>
                <span className="text-ink-5">|</span>
                <span>EPSG:4326</span>
                <span className="text-ink-5 hidden md:inline">|</span>
                <span className="hidden md:inline">© OSM / Carto / Esri</span>
              </div>

              {/* ── Floating bottom-right: Reset Map button ─────────────── */}
              {/* Task #22 Goal B: Fly-back ke Indonesia default view.
                  Task #22 Goal C: Hanya visible kalau hasMapInteracted = true.
                  z-floating-overlay (55) — di atas panels, sama level dgn search/view-toggle. */}
              <div className="absolute bottom-4 right-4 z-floating-overlay">
                <ResetMapButton
                  visible={hasMapInteracted}
                  onClick={handleResetMap}
                />
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

      {/* Task #18: DatasetSlideOver — trigger via klik marker/polygon atau deep-link ?selected= */}
      <DatasetSlideOver
        open={!!selectedDataset}
        dataset={selectedDataset}
        onClose={handleCloseSlideOver}
      />
    </div>
  );
}

export default MapPage;
