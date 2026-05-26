/**
 * ExplorePage — `/explore` route.
 *
 * Port dari `hifi-explore.jsx` + `PageExplore` di `prototype-app.jsx`,
 * dengan modernisasi:
 *   - URL state untuk semua filter/search/page (shareable, history-friendly)
 *   - TanStack Query untuk async data + `keepPreviousData` (no flicker)
 *   - Debounced search input (300ms) — pakai existing useDebouncedValue
 *   - Toggle list/grid view + sort dropdown
 *   - Filter sidebar collapsible (left)
 *   - Pagination footer
 *   - Loading skeleton + EmptyState (no-results) + error state
 *
 * Pattern reuse target untuk Phase 8.8 (DetailPage, MapPage) dan beyond:
 *   - `useSearchParams` sebagai single-source filter state
 *   - TanStack Query key includes serialized params object
 *   - Active filter chips renderable dari URL params
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  DatasetCard,
  EmptyState,
  FilterChip,
  Icon,
  Pagination,
  Stack,
  toast,
  type DatasetStatus,
} from '@ghanem/ui';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { listDatasets, type DatasetSort } from '../api/datasets';
import {
  CATEGORIES,
  DATASET_YEAR_RANGE,
  PROVIDERS,
  type DatasetCategory,
  type DatasetRecord,
} from '../mocks/datasets';
import { ExploreFilters, type ExploreFilterValues } from './explore/ExploreFilters';

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

function parseView(raw: string | null): 'list' | 'grid' {
  return raw === 'grid' ? 'grid' : 'list';
}

function parsePage(raw: string | null): number {
  if (!raw) return 1;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/* ─── Page component ──────────────────────────────────────────────────── */

export function ExplorePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [defaultMin, defaultMax] = DATASET_YEAR_RANGE;

  // ── Read state dari URL ────────────────────────────────────────────
  const q = searchParams.get('q') ?? '';
  const view = parseView(searchParams.get('view'));
  const sort = parseSort(searchParams.get('sort'));
  const page = parsePage(searchParams.get('page'));
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

  // Sync debounced search ke URL (preserves history nicely)
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
        next.delete('page'); // reset pagination when search changes
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
        if (next.categories.length > 0) {
          p.set('category', next.categories.join(','));
        } else {
          p.delete('category');
        }
        if (next.providers.length > 0) {
          p.set('provider', next.providers.join(','));
        } else {
          p.delete('provider');
        }
        if (next.statuses.length > 0) {
          p.set('status', next.statuses.join(','));
        } else {
          p.delete('status');
        }
        if (next.yearMin !== defaultMin) {
          p.set('yearMin', String(next.yearMin));
        } else {
          p.delete('yearMin');
        }
        if (next.yearMax !== defaultMax) {
          p.set('yearMax', String(next.yearMax));
        } else {
          p.delete('yearMax');
        }
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
        if (next === 'relevance') {
          p.delete('sort');
        } else {
          p.set('sort', next);
        }
        p.delete('page');
      });
    },
    [updateSearch],
  );

  const handleViewChange = useCallback(
    (next: 'list' | 'grid') => {
      updateSearch(
        (p) => {
          if (next === 'list') {
            p.delete('view');
          } else {
            p.set('view', next);
          }
        },
        { replace: true },
      );
    },
    [updateSearch],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      updateSearch((p) => {
        if (next === 1) {
          p.delete('page');
        } else {
          p.set('page', String(next));
        }
      });
    },
    [updateSearch],
  );

  // ── Query datasets ─────────────────────────────────────────────────
  const queryParams = useMemo(
    () => ({
      q: debouncedQ,
      categories: filters.categories,
      providers: filters.providers,
      statuses: filters.statuses,
      yearMin: filters.yearMin,
      yearMax: filters.yearMax,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedQ, filters, sort, page],
  );

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['datasets', queryParams],
    queryFn: () => listDatasets(queryParams),
    placeholderData: keepPreviousData,
  });

  // ── Selection (preview panel di kanan, defer untuk Phase 8.8) ──────
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Active filter chips ────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; value: string; tone: 'green' | 'blue' | 'amber'; remove: () => void }> = [];
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

  const items: DatasetRecord[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const showSkeleton = isFetching && !data;

  return (
    <div className="flex h-full min-h-0">
      <ExploreFilters values={filters} onChange={handleFiltersChange} onReset={handleResetAll} />

      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* ── Page header ─────────────────────────────────────────── */}
        <header className="px-6 pt-6 pb-3 border-b border-line bg-surface">
          <Stack direction="col" gap="3">
            <div>
              <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
                SPEKTRUM · Trusted Data
              </p>
              <h1 className="font-display font-bold text-h1 text-ink m-0">Explore Data</h1>
              <p className="text-sm text-ink-4 mt-1 max-w-2xl">
                Telusuri dataset spasial dari KKKS dan regulator hulu migas Indonesia.
                Gunakan filter di kiri untuk mempersempit pencarian.
              </p>
            </div>

            {/* Search + sort + view */}
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
              <ViewToggle view={view} onChange={handleViewChange} />
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

        {/* ── List / Grid ──────────────────────────────────────────── */}
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
              <span className="text-xs text-ink-4" role="status">
                Memuat…
              </span>
            ) : null}
          </div>

          {showSkeleton ? <SkeletonList variant={view} /> : null}

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
              action={{
                label: 'Reset semua filter',
                onClick: handleResetAll,
                icon: 'refresh',
              }}
            />
          ) : null}

          {!showSkeleton && !isError && items.length > 0 ? (
            <div
              role="list"
              className={
                view === 'grid'
                  ? 'grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-2'
              }
            >
              {items.map((d) => (
                <div role="listitem" key={d.id}>
                  <DatasetCard
                    dataset={d}
                    variant={view === 'grid' ? 'grid-tile' : 'list-row'}
                    selected={selectedId === d.id}
                    onClick={(dataset) => {
                      // Mark selected (untuk preview rail nanti) + navigate ke detail.
                      // Phase 8.8: card click langsung navigate. Quick-preview di rail
                      // di-defer ke iterasi UX berikutnya.
                      setSelectedId(dataset.id);
                      navigate(`/datasets/${encodeURIComponent(dataset.id)}`);
                    }}
                    onOpen={(dataset) => {
                      navigate(`/datasets/${encodeURIComponent(dataset.id)}`);
                    }}
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

      {/* ── Right rail — AI assistant pill (deferred actual chat) ───── */}
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
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

interface SortDropdownProps {
  sort: DatasetSort;
  onChange: (next: DatasetSort) => void;
}

function SortDropdown({ sort, onChange }: SortDropdownProps): JSX.Element {
  const id = 'explore-sort';
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="sr-only">
        Urutkan
      </label>
      <select
        id={id}
        value={sort}
        onChange={(e) => onChange(e.target.value as DatasetSort)}
        className={[
          'h-9 pl-3 pr-8 rounded-2 border border-line bg-surface',
          'text-sm text-ink',
          'focus:outline focus:outline-2 focus:outline-green-500 focus:outline-offset-2',
        ].join(' ')}
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ViewToggleProps {
  view: 'list' | 'grid';
  onChange: (next: 'list' | 'grid') => void;
}

function ViewToggle({ view, onChange }: ViewToggleProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Pilih tampilan dataset"
      className="inline-flex items-center p-0.5 bg-surface-3 rounded-2 border border-line"
    >
      <ViewToggleButton current={view} value="list" onChange={onChange} icon="list" label="List" />
      <ViewToggleButton current={view} value="grid" onChange={onChange} icon="grid" label="Grid" />
    </div>
  );
}

interface ViewToggleButtonProps {
  current: 'list' | 'grid';
  value: 'list' | 'grid';
  onChange: (next: 'list' | 'grid') => void;
  icon: 'list' | 'grid';
  label: string;
}

function ViewToggleButton({ current, value, onChange, icon, label }: ViewToggleButtonProps): JSX.Element {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={active}
      aria-label={`Tampilan ${label}`}
      title={`Tampilan ${label}`}
      className={[
        'inline-flex items-center justify-center w-7 h-7 rounded-1',
        'transition-colors duration-hf',
        active ? 'bg-surface shadow-1 text-ink' : 'text-ink-4 hover:text-ink',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
      ].join(' ')}
    >
      <Icon name={icon} size={13} aria-hidden />
    </button>
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

export default ExplorePage;
