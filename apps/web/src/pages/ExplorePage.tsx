/**
 * ExplorePage — `/explore` route.
 *
 * Sprint 2B — Hybrid Layout:
 *   - Task #9: Split View Toggle (MAP VIEW / TABLE VIEW) + embedded map
 *   - Task #10: MAP LAYERS checkbox panel floating di atas map
 *   - Task #11: Slide-Over Detail panel saat klik card
 *   - Task #12: Data Quality section di slide-over
 *
 * URL state (single source of truth):
 *   ?q=...           — search query
 *   ?view=map|table  — layout mode (default: table)
 *   ?sort=...        — sort key
 *   ?page=...        — pagination
 *   ?category=...    — category filter
 *   ?provider=...    — provider filter
 *   ?status=...      — status filter
 *   ?yearMin/Max=... — year range
 *   ?type/theme/domain/format=... — pill filters
 *   ?selected=id     — slide-over open untuk dataset ini
 *   ?layers=...      — aktif map layers (comma-separated)
 *
 * Pola URL state: established dari FilterPillBar + sprint sebelumnya.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DatasetCard,
  EmptyState,
  FilterChip,
  Icon,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  StatCard,
  toast,
  type DatasetStatus,
  type MapDataset,
} from '@ghanem/ui';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { type DatasetSort } from '../api/datasets';
import { useDatasets, useDataset } from '../hooks/useDatasets';
import {
  CATEGORIES,
  DATASET_YEAR_RANGE,
  PROVIDERS,
  type DatasetCategory,
  type DatasetRecord,
} from '../mocks/datasets';
import { ExploreFilters, type ExploreFilterValues } from './explore/ExploreFilters';
import { FilterPillBar, type FilterPillBarValues } from '../components/explore/FilterPillBar';
import { CompactDatasetCard } from '../components/explore/CompactDatasetCard';
import { ExploreMapPane } from '../components/explore/ExploreMapPane';
import { MapLayersPanel, parseLayersParam, serializeLayersParam, type LayerId } from '../components/explore/MapLayersPanel';
import { DatasetSlideOver } from '../components/explore/DatasetSlideOver';

const PAGE_SIZE = 12;
const SORT_LABELS: Record<DatasetSort, string> = {
  relevance: 'Relevansi',
  updated: 'Terbaru',
  downloads: 'Paling diunduh',
  title: 'Abjad (A–Z)',
};

const VALID_STATUSES: readonly DatasetStatus[] = ['public', 'internal', 'confidential'];
const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.id));
const VALID_PROVIDERS = new Set(PROVIDERS.map((p) => p.id));

/* ─── URL state helpers ───────────────────────────────────────────────── */

function parseListParam(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function parseYear(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseSort(raw: string | null): DatasetSort {
  if (raw === 'updated' || raw === 'downloads' || raw === 'title') return raw;
  return 'relevance';
}

function parseViewMode(raw: string | null): 'list' | 'grid' | 'map' {
  if (raw === 'grid') return 'grid';
  if (raw === 'map') return 'map';
  return 'list';
}

function parsePage(raw: string | null): number {
  if (!raw) return 1;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/** Pemetaan layer panel → categoryId — konstan, tidak perlu di dalam komponen. */
const LAYER_TO_CATEGORY_MAP: Record<LayerId, DatasetCategory[]> = {
  wk: ['concession'],
  blocks: ['concession'],
  field: ['concession'],
  well: ['well-log'],
  pipeline: ['production'],
  facility: ['production'],
  seismic: ['seismic'],
};

/** Convert DatasetRecord → MapDataset untuk HfMap. */
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

/* ─── Page component ──────────────────────────────────────────────────── */

export function ExplorePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [defaultMin, defaultMax] = DATASET_YEAR_RANGE;

  // ── Read state dari URL ────────────────────────────────────────────
  const q = searchParams.get('q') ?? '';
  const viewMode = parseViewMode(searchParams.get('view'));
  const sort = parseSort(searchParams.get('sort'));
  const page = parsePage(searchParams.get('page'));
  const selectedId = searchParams.get('selected');
  const activeLayers = parseLayersParam(searchParams.get('layers'));

  // viewMode 'map' = split view aktif (list kiri + map kanan)
  // viewMode 'list' / 'grid' = table view (list saja)
  const isMapView = viewMode === 'map';

  const filters: ExploreFilterValues = useMemo(
    () => ({
      categories: parseListParam(searchParams.get('category')).filter((id): id is DatasetCategory =>
        VALID_CATEGORIES.has(id as DatasetCategory),
      ),
      providers: parseListParam(searchParams.get('provider')).filter((id) =>
        VALID_PROVIDERS.has(id),
      ),
      statuses: parseListParam(searchParams.get('status')).filter((s): s is DatasetStatus =>
        (VALID_STATUSES as readonly string[]).includes(s),
      ),
      yearMin: parseYear(searchParams.get('yearMin'), defaultMin),
      yearMax: parseYear(searchParams.get('yearMax'), defaultMax),
    }),
    [searchParams, defaultMin, defaultMax],
  );

  // ── Local search input + debounce ──────────────────────────────────
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebouncedValue(localQ, 300);

  // Sync debounced search ke URL
  useEffect(() => {
    if (debouncedQ === q) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedQ) {
          next.set('q', debouncedQ);
        } else {
          next.delete('q');
        }
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  }, [debouncedQ, q, setSearchParams]);

  // ── State setters yang nulis URL ───────────────────────────────────
  const updateSearch = useCallback(
    (mutator: (params: URLSearchParams) => void, options?: { replace?: boolean }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutator(next);
          return next;
        },
        options ?? {},
      );
    },
    [setSearchParams],
  );

  const handleFiltersChange = useCallback(
    (next: ExploreFilterValues) => {
      updateSearch((p) => {
        if (next.categories.length > 0) p.set('category', next.categories.join(','));
        else p.delete('category');
        if (next.providers.length > 0) p.set('provider', next.providers.join(','));
        else p.delete('provider');
        if (next.statuses.length > 0) p.set('status', next.statuses.join(','));
        else p.delete('status');
        if (next.yearMin !== defaultMin) p.set('yearMin', String(next.yearMin));
        else p.delete('yearMin');
        if (next.yearMax !== defaultMax) p.set('yearMax', String(next.yearMax));
        else p.delete('yearMax');
        p.delete('page');
      });
    },
    [defaultMin, defaultMax, updateSearch],
  );

  const handleResetAll = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setLocalQ('');
  }, [setSearchParams]);

  const handleSortChange = useCallback(
    (next: DatasetSort) => {
      updateSearch((p) => {
        if (next === 'relevance') p.delete('sort');
        else p.set('sort', next);
        p.delete('page');
      });
    },
    [updateSearch],
  );

  // View mode handler — unify list/grid/map dalam satu param `view`
  const handleViewModeChange = useCallback(
    (next: 'list' | 'grid' | 'map') => {
      updateSearch(
        (p) => {
          if (next === 'list') p.delete('view');
          else p.set('view', next);
        },
        { replace: true },
      );
    },
    [updateSearch],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      updateSearch((p) => {
        if (next === 1) p.delete('page');
        else p.set('page', String(next));
      });
    },
    [updateSearch],
  );

  // Slide-over: set ?selected=id saat klik card
  // reason: DatasetCard callback menerima DatasetCardData (base type), DatasetRecord adalah superset
  const handleCardClick = useCallback(
    (dataset: { id: string }) => {
      updateSearch(
        (p) => {
          p.set('selected', dataset.id);
        },
        { replace: true },
      );
    },
    [updateSearch],
  );

  // Shift+click tetap navigate ke full page
  const handleCardOpen = useCallback(
    (dataset: { id: string }) => {
      navigate(`/datasets/${encodeURIComponent(dataset.id)}`);
    },
    [navigate],
  );

  const handleSlideOverClose = useCallback(() => {
    updateSearch(
      (p) => {
        p.delete('selected');
      },
      { replace: true },
    );
  }, [updateSearch]);

  // Map highlight sync — saat klik marker di map, open slide-over
  const handleMapDatasetClick = useCallback(
    (mapDataset: MapDataset) => {
      updateSearch(
        (p) => {
          p.set('selected', mapDataset.id);
        },
        { replace: true },
      );
    },
    [updateSearch],
  );

  // Layer toggles
  const handleLayersChange = useCallback(
    (next: LayerId[]) => {
      updateSearch(
        (p) => {
          if (next.length > 0) {
            p.set('layers', serializeLayersParam(next));
          } else {
            p.delete('layers');
          }
        },
        { replace: true },
      );
    },
    [updateSearch],
  );

  // ── Query datasets — mapped to backend API params ──────────────────
  // Map old mock-style filter arrays to API single-value params.
  // Sprint 9.3: take first selected value for category/provider/status
  // (backend supports single-value per param; multi-value is Sprint 9.4).
  const sortToApiParams = (s: DatasetSort): { sortBy?: 'createdAt' | 'title' | 'downloadCount'; order?: 'asc' | 'desc' } => {
    switch (s) {
      case 'updated': return { sortBy: 'createdAt', order: 'desc' };
      case 'downloads': return { sortBy: 'downloadCount', order: 'desc' };
      case 'title': return { sortBy: 'title', order: 'asc' };
      default: return {};
    }
  };

  const apiQueryParams = useMemo(() => {
    const { sortBy, order } = sortToApiParams(sort);
    return {
      search: debouncedQ || undefined,
      category: filters.categories[0] ?? undefined,
      providerId: filters.providers[0] ?? undefined,
      sensitivity: filters.statuses[0] ?? undefined,
      page,
      limit: PAGE_SIZE,
      sortBy,
      order,
    };
  }, [debouncedQ, filters, sort, page]);

  const { data, isFetching, isError, refetch } = useDatasets(apiQueryParams);

  // ── More Filters sidebar visibility ────────────────────────────────
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // ── FilterPillBar values ────────────────────────────────────────────
  const pillValues: FilterPillBarValues = useMemo(
    () => ({
      types: parseListParam(searchParams.get('type')),
      themes: parseListParam(searchParams.get('theme')),
      providers: filters.providers,
      domains: parseListParam(searchParams.get('domain')),
      formats: parseListParam(searchParams.get('format')),
    }),
    [searchParams, filters.providers],
  );

  const handlePillChange = useCallback(
    (next: FilterPillBarValues) => {
      updateSearch((p) => {
        if (next.types.length > 0) p.set('type', next.types.join(','));
        else p.delete('type');
        if (next.themes.length > 0) p.set('theme', next.themes.join(','));
        else p.delete('theme');
        if (next.providers.length > 0) p.set('provider', next.providers.join(','));
        else p.delete('provider');
        if (next.domains.length > 0) p.set('domain', next.domains.join(','));
        else p.delete('domain');
        if (next.formats.length > 0) p.set('format', next.formats.join(','));
        else p.delete('format');
        p.delete('page');
      });
    },
    [updateSearch],
  );

  // ── Active filter chips ────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips: { key: string; value: string; tone: 'green' | 'blue' | 'amber'; remove: () => void }[] = [];
    for (const id of filters.categories) {
      const cat = CATEGORIES.find((c) => c.id === id);
      chips.push({
        key: 'Kategori',
        value: cat?.label ?? id,
        tone: 'green',
        remove: () =>
          handleFiltersChange({
            ...filters,
            categories: filters.categories.filter((c) => c !== id),
          }),
      });
    }
    for (const id of filters.providers) {
      const prov = PROVIDERS.find((p) => p.id === id);
      chips.push({
        key: 'Provider',
        value: prov?.name ?? id,
        tone: 'blue',
        remove: () =>
          handleFiltersChange({
            ...filters,
            providers: filters.providers.filter((p) => p !== id),
          }),
      });
    }
    for (const s of filters.statuses) {
      chips.push({
        key: 'Status',
        value: s.charAt(0).toUpperCase() + s.slice(1),
        tone: 'amber',
        remove: () =>
          handleFiltersChange({
            ...filters,
            statuses: filters.statuses.filter((x) => x !== s),
          }),
      });
    }
    if (filters.yearMin > defaultMin || filters.yearMax < defaultMax) {
      chips.push({
        key: 'Tahun',
        value: `${filters.yearMin}–${filters.yearMax}`,
        tone: 'green',
        remove: () =>
          handleFiltersChange({ ...filters, yearMin: defaultMin, yearMax: defaultMax }),
      });
    }
    return chips;
  }, [filters, defaultMin, defaultMax, handleFiltersChange]);

  const items = useMemo<DatasetRecord[]>(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const showSkeleton = isFetching && !data;

  // ── Stat card values — use live API total ──────────────────────────
  // Providers/Domains/Availability remain hardcoded pending /stats endpoint (Sprint 9.4).
  const catalogStats = useMemo(() => ({
    totalDatasets: total,
    uniqueProviders: PROVIDERS.length,
    uniqueDomains: 38,
  }), [total]);

  // ── Selected dataset — fetch from API via useDataset hook ──────────
  const { data: selectedDataset = null } = useDataset(selectedId ?? undefined);

  // ── Map datasets (filtered per aktif layer → derive dari categoryId) ─
  const activeCategories = useMemo<Set<DatasetCategory>>(() => {
    const cats = new Set<DatasetCategory>();
    for (const layerId of activeLayers) {
      const mapped = LAYER_TO_CATEGORY_MAP[layerId] ?? [];
      for (const cat of mapped) cats.add(cat);
    }
    return cats;
  }, [activeLayers]);

  const mapDatasets = useMemo<MapDataset[]>(() => {
    // Di map view: filter datasets berdasarkan active layers
    // Di non-map view: tidak perlu map datasets
    if (!isMapView) return [];
    return items
      .filter((d) => activeCategories.has(d.categoryId))
      .map(toMapDataset);
  }, [isMapView, items, activeCategories]);

  // ── Card refs untuk scroll-into-view saat marker di-klik ──────────
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll ke card saat selectedId berubah dari map click
  useEffect(() => {
    if (!selectedId || !isMapView) return;
    const el = cardRefs.current.get(selectedId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId, isMapView]);

  return (
    <>
      {/* ── Slide-Over panel ───────────────────────────────────────── */}
      <DatasetSlideOver
        dataset={selectedDataset}
        open={!!selectedId}
        onClose={handleSlideOverClose}
        onAddToMap={(dataset) => {
          toast.success('Ditambahkan ke peta', {
            description: `${dataset.title} — layer aktif.`,
          });
        }}
      />

      <div className="flex h-full min-h-0">
        {/* ExploreFilters sidebar — toggle via "More Filters" */}
        {showMoreFilters ? (
          <ExploreFilters values={filters} onChange={handleFiltersChange} onReset={handleResetAll} />
        ) : null}

        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* ── Page header ─────────────────────────────────────────── */}
          <header className="flex-none px-6 pt-6 pb-3 border-b border-line bg-surface">
            <Stack direction="col" gap="3">
              <div>
                <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
                  SPEKTRUM · Trusted Data
                </p>
                <h1 className="font-display font-bold text-h1 text-ink m-0">Explore Data</h1>
                <p className="text-sm text-ink-4 mt-1 max-w-2xl">
                  Telusuri dataset spasial dari KKKS dan regulator hulu migas Indonesia.
                </p>
              </div>

              {/* ── 4 Stat Cards ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Datasets"
                  value={catalogStats.totalDatasets}
                  icon="database"
                  tone="green"
                  size="sm"
                />
                <StatCard
                  label="Providers"
                  value={PROVIDERS.length}
                  icon="globe"
                  tone="blue"
                  size="sm"
                />
                <StatCard
                  label="Domains / WK"
                  value={catalogStats.uniqueDomains}
                  icon="layers"
                  tone="amber"
                  size="sm"
                />
                <StatCard
                  label="Data Availability"
                  value="98"
                  unit="%"
                  icon="shield"
                  tone="green"
                  size="sm"
                />
              </div>

              {/* ── Filter Pills ──────────────────────────────────────── */}
              <FilterPillBar
                values={pillValues}
                onChange={handlePillChange}
                onMoreFilters={() => setShowMoreFilters((v) => !v)}
                onClear={handleResetAll}
              />

              {/* ── Search + sort + view toggles ──────────────────────── */}
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={[
                    'flex-1 min-w-[200px] max-w-xl flex items-center gap-2',
                    'px-3 py-2 bg-surface border border-line-2 rounded-2',
                    'transition-colors duration-hf',
                    'focus-within:border-green-500 focus-within:shadow-focus',
                  ].join(' ')}
                >
                  <Icon name="search" size={14} className="text-ink-4" aria-hidden />
                  <label htmlFor="explore-search" className="sr-only">
                    Cari dataset, provider, atau dokumen
                  </label>
                  <input
                    id="explore-search"
                    type="search"
                    placeholder="Cari dataset, provider, atau dokumen…"
                    value={localQ}
                    onChange={(e) => setLocalQ(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent outline-0 border-0 text-sm placeholder:text-ink-5"
                  />
                  {localQ ? (
                    <button
                      type="button"
                      onClick={() => setLocalQ('')}
                      aria-label="Hapus pencarian"
                      className={[
                        'inline-flex items-center justify-center w-5 h-5 rounded-pill',
                        'hover:bg-surface-2 text-ink-4',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
                      ].join(' ')}
                    >
                      <Icon name="x" size={10} aria-hidden />
                    </button>
                  ) : null}
                </div>

                <SortDropdown sort={sort} onChange={handleSortChange} />

                {/* MAP VIEW / TABLE VIEW segmented control */}
                <MapTableToggle viewMode={viewMode} onChange={handleViewModeChange} />

                {/* List/Grid toggle — hanya tampil saat table view */}
                {!isMapView ? (
                  <ListGridToggle
                    view={viewMode === 'grid' ? 'grid' : 'list'}
                    onChange={(v) => handleViewModeChange(v)}
                  />
                ) : null}
              </div>

              {/* Active filter chips */}
              {activeChips.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10.5px] uppercase tracking-cap font-semibold text-ink-4">
                    Filter aktif:
                  </span>
                  {activeChips.map((c, idx) => (
                    <FilterChip
                      key={`${c.key}-${c.value}-${idx}`}
                      label={c.key}
                      value={c.value}
                      tone={c.tone}
                      onRemove={c.remove}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className={[
                      'ml-auto text-xs font-semibold text-green-700',
                      'hover:text-green-500',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                      'rounded-1 px-1.5 py-0.5',
                    ].join(' ')}
                  >
                    Hapus semua filter
                  </button>
                </div>
              ) : null}
            </Stack>
          </header>

          {/* ── Content area — list atau split view ─────────────────── */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {isMapView ? (
              /* ── SPLIT VIEW: list kiri + map kanan ──────────────────── */
              /* Mobile (<768px): list di atas, map di bawah (flex-col) */
              /* Desktop (>=768px): list kiri, map kanan (flex-row) */
              <div className="flex flex-col md:flex-row h-full min-h-0">
                {/* List panel — full width mobile, 42% desktop */}
                <div
                  className={[
                    'flex flex-col min-w-0',
                    // Mobile: batas tinggi supaya map masih keliatan di bawah
                    'max-h-[55vh]',
                    // Desktop: lebar tetap, tinggi 100%
                    'md:flex-none md:w-[42%] md:max-h-none md:h-full',
                    'border-b md:border-b-0 md:border-r border-line',
                  ].join(' ')}
                >
                  {/* List header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-surface flex-none">
                    <h2 className="font-display font-semibold text-h3 text-ink m-0">
                      Dataset{' '}
                      <span className="text-ink-4 num font-medium">({total.toLocaleString('id-ID')})</span>
                    </h2>
                    {isFetching ? (
                      <span className="text-xs text-ink-4" role="status">Memuat…</span>
                    ) : null}
                  </div>

                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto px-3 py-2" role="list" aria-label="Dataset list">
                    {showSkeleton ? <SkeletonCompactList /> : null}

                    {!showSkeleton && isError ? (
                      <EmptyState
                        variant="error"
                        title="Gagal memuat"
                        description="Terjadi kesalahan. Coba lagi."
                        action={{ label: 'Coba lagi', onClick: () => void refetch(), icon: 'refresh' }}
                      />
                    ) : null}

                    {!showSkeleton && !isError && items.length === 0 ? (
                      <EmptyState
                        variant="no-results"
                        title="Tidak ada dataset"
                        description="Coba kurangi filter."
                        action={{ label: 'Reset filter', onClick: handleResetAll, icon: 'refresh' }}
                      />
                    ) : null}

                    {!showSkeleton && !isError && items.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {items.map((d) => (
                          <div
                            key={d.id}
                            role="listitem"
                            ref={(el) => {
                              if (el) cardRefs.current.set(d.id, el);
                              else cardRefs.current.delete(d.id);
                            }}
                          >
                            <CompactDatasetCard
                              dataset={d}
                              selected={selectedId === d.id}
                              highlighted={selectedId === d.id}
                              onClick={handleCardClick}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {!showSkeleton && total > PAGE_SIZE ? (
                      <div className="mt-4 pb-2">
                        <Pagination
                          page={page}
                          pageSize={PAGE_SIZE}
                          total={total}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Map panel — flex-1 untuk ambil sisa ruang, min-h untuk mobile */}
                <div className="flex flex-1 min-w-0 min-h-[260px] md:min-h-0 relative p-2">
                  <ExploreMapPane
                    datasets={mapDatasets}
                    highlightId={selectedId}
                    onDatasetClick={handleMapDatasetClick}
                    className="flex-1"
                  >
                    {/* MAP LAYERS panel floating di atas map */}
                    <MapLayersPanel
                      activeLayers={activeLayers}
                      onChange={handleLayersChange}
                    />
                  </ExploreMapPane>
                </div>
              </div>
            ) : (
              /* ── TABLE VIEW: list/grid normal ───────────────────────── */
              <div className="overflow-y-auto h-full">
                <section
                  aria-label="Daftar dataset"
                  aria-busy={isFetching}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display font-semibold text-h3 text-ink m-0">
                      Dataset{' '}
                      <span className="text-ink-4 num font-medium">({total.toLocaleString('id-ID')})</span>
                    </h2>
                    {isFetching ? (
                      <span className="text-xs text-ink-4" role="status">Memuat…</span>
                    ) : null}
                  </div>

                  {showSkeleton ? <SkeletonList variant={viewMode === 'grid' ? 'grid' : 'list'} /> : null}

                  {!showSkeleton && isError ? (
                    <EmptyState
                      variant="error"
                      title="Gagal memuat dataset"
                      description="Terjadi kesalahan saat mengambil data. Coba lagi atau periksa koneksi."
                      action={{ label: 'Coba lagi', onClick: () => void refetch(), icon: 'refresh' }}
                    />
                  ) : null}

                  {!showSkeleton && !isError && items.length === 0 ? (
                    <EmptyState
                      variant="no-results"
                      title="Tidak ada dataset yang cocok"
                      description="Coba kurangi filter atau ubah kata kunci pencarian."
                      action={{ label: 'Reset semua filter', onClick: handleResetAll, icon: 'refresh' }}
                    />
                  ) : null}

                  {!showSkeleton && !isError && items.length > 0 ? (
                    <div
                      role="list"
                      className={
                        viewMode === 'grid'
                          ? 'grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                          : 'flex flex-col gap-2'
                      }
                    >
                      {items.map((d) => (
                        <div role="listitem" key={d.id}>
                          <DatasetCard
                            dataset={d}
                            variant={viewMode === 'grid' ? 'grid-tile' : 'list-row'}
                            selected={selectedId === d.id}
                            onClick={handleCardClick}
                            onOpen={handleCardOpen}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {!showSkeleton && total > PAGE_SIZE ? (
                    <div className="mt-6">
                      <Pagination
                        page={page}
                        pageSize={PAGE_SIZE}
                        total={total}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  ) : null}
                </section>
              </div>
            )}
          </div>
        </div>

        {/* ── Right rail — AI assistant pill ──────────────────────────── */}
        <div className="hidden xl:flex flex-col w-12 flex-none border-l border-line bg-surface items-center pt-4">
          <button
            type="button"
            aria-label="Buka asisten AI (Phase berikutnya)"
            title="AI Assistant — coming soon"
            className={[
              'inline-flex items-center justify-center',
              'w-9 h-9 rounded-pill',
              'bg-green-500 text-white shadow-2',
              'hover:bg-green-600',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
            onClick={() => toast.info('AI Assistant — coming Phase 8.10')}
          >
            <Icon name="sparkle" size={16} aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

interface SortDropdownProps {
  sort: DatasetSort;
  onChange: (next: DatasetSort) => void;
}

function SortDropdown({ sort, onChange }: SortDropdownProps): JSX.Element {
  return (
    <Select value={sort} onValueChange={(v) => onChange(v as DatasetSort)}>
      <SelectTrigger size="sm" aria-label="Urutkan dataset" className="w-auto min-w-[9rem]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ─── MAP VIEW / TABLE VIEW segmented control ─────────────────────────── */

interface MapTableToggleProps {
  viewMode: 'list' | 'grid' | 'map';
  onChange: (next: 'list' | 'grid' | 'map') => void;
}

function MapTableToggle({ viewMode, onChange }: MapTableToggleProps): JSX.Element {
  const isMap = viewMode === 'map';
  const isTable = !isMap;

  return (
    <div
      role="group"
      aria-label="Mode tampilan — Map View atau Table View"
      className="inline-flex items-center p-0.5 bg-surface-3 rounded-2 border border-line"
    >
      <button
        type="button"
        aria-pressed={isMap}
        onClick={() => onChange('map')}
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-1',
          'text-xs font-semibold transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
          isMap
            ? 'bg-green-500 text-white shadow-1'
            : 'text-ink-4 hover:text-ink hover:bg-surface-2',
        ].join(' ')}
      >
        <Icon name="map" size={12} aria-hidden />
        <span>Map View</span>
      </button>
      <button
        type="button"
        aria-pressed={isTable}
        onClick={() => onChange('list')}
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-1',
          'text-xs font-semibold transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
          isTable
            ? 'bg-green-500 text-white shadow-1'
            : 'text-ink-4 hover:text-ink hover:bg-surface-2',
        ].join(' ')}
      >
        <Icon name="list" size={12} aria-hidden />
        <span>Table View</span>
      </button>
    </div>
  );
}

/* ─── List/Grid toggle — hanya visible saat table view ─────────────────── */

interface ListGridToggleProps {
  view: 'list' | 'grid';
  onChange: (next: 'list' | 'grid') => void;
}

function ListGridToggle({ view, onChange }: ListGridToggleProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Pilih tampilan list atau grid"
      className="inline-flex items-center p-0.5 bg-surface-3 rounded-2 border border-line"
    >
      <button
        type="button"
        aria-pressed={view === 'list'}
        aria-label="Tampilan list"
        title="Tampilan List"
        onClick={() => onChange('list')}
        className={[
          'inline-flex items-center justify-center w-7 h-7 rounded-1',
          'transition-colors duration-hf',
          view === 'list' ? 'bg-surface shadow-1 text-ink' : 'text-ink-4 hover:text-ink',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
        ].join(' ')}
      >
        <Icon name="list" size={13} aria-hidden />
      </button>
      <button
        type="button"
        aria-pressed={view === 'grid'}
        aria-label="Tampilan grid"
        title="Tampilan Grid"
        onClick={() => onChange('grid')}
        className={[
          'inline-flex items-center justify-center w-7 h-7 rounded-1',
          'transition-colors duration-hf',
          view === 'grid' ? 'bg-surface shadow-1 text-ink' : 'text-ink-4 hover:text-ink',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
        ].join(' ')}
      >
        <Icon name="grid" size={13} aria-hidden />
      </button>
    </div>
  );
}

function SkeletonList({ variant }: { variant: 'list' | 'grid' }): JSX.Element {
  const count = 6;
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat dataset"
      className={
        variant === 'grid'
          ? 'grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'flex flex-col gap-2'
      }
    >
      {items.map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className={[
            'bg-surface border border-line rounded-3 p-4',
            'animate-pulse',
            variant === 'grid' ? 'h-44' : 'h-24',
          ].join(' ')}
        >
          <div className="h-3 w-1/3 bg-surface-3 rounded-1 mb-2" />
          <div className="h-4 w-2/3 bg-surface-3 rounded-1 mb-2" />
          <div className="h-3 w-1/2 bg-surface-3 rounded-1" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCompactList(): JSX.Element {
  const count = 8;
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat dataset"
      className="flex flex-col gap-1.5"
    >
      {items.map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="bg-surface border border-line rounded-2 p-2.5 h-16 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-1 bg-surface-3 flex-none" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-2.5 w-3/4 bg-surface-3 rounded-1" />
              <div className="h-2 w-1/2 bg-surface-3 rounded-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExplorePage;
