/**
 * AppsPage — `/apps` route (marketplace).
 *
 * Phase 8.13. Grid 3-4 col desktop / 2 col tablet / 1 col mobile. Search +
 * category filter + installed-only toggle. Klik card → AppDetailDialog.
 *
 * State strategy:
 *   - Search, category, installedOnly di URL params (shareable).
 *   - Debounce search 300ms (sama pattern dengan ExplorePage).
 *   - Selected app id di local state (transient — tidak perlu shareable).
 *
 * a11y:
 *   - Grid: `role="list"` + `role="listitem"` (cards adalah articles)
 *   - Category filter chips: `role="group"` (toggle-able buttons)
 *   - Search: `<label htmlFor>` + clear button dengan aria-label
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EmptyState, Icon, toast } from '@ghanem/ui';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { getApps, installApp, uninstallApp, type AppFilters, type AppInstalled } from '../api/apps';
import { APP_CATEGORIES, type AppCategory } from '../mocks/apps';
import { AppCard } from './apps/AppCard';
import { AppDetailDialog } from './apps/AppDetailDialog';

function parseCategory(raw: string | null): AppCategory | undefined {
  if (!raw) return undefined;
  const found = APP_CATEGORIES.find((c) => c.id === raw);
  return found?.id;
}

export function AppsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // URL state
  const q = searchParams.get('q') ?? '';
  const category = parseCategory(searchParams.get('cat'));
  const installedOnly = searchParams.get('installed') === '1';

  // Local input + debounce
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebouncedValue(localQ, 300);

  // Sync debounced search ke URL
  useEffect(() => {
    if (debouncedQ === q) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedQ) next.set('q', debouncedQ);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }, [debouncedQ, q, setSearchParams]);

  const updateSearch = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        mutator(next);
        return next;
      });
    },
    [setSearchParams],
  );

  const handleCategoryToggle = useCallback(
    (cat: AppCategory) => {
      updateSearch((p) => {
        if (p.get('cat') === cat) p.delete('cat');
        else p.set('cat', cat);
      });
    },
    [updateSearch],
  );

  const handleInstalledToggle = useCallback(() => {
    updateSearch((p) => {
      if (installedOnly) p.delete('installed');
      else p.set('installed', '1');
    });
  }, [installedOnly, updateSearch]);

  const filters: AppFilters = useMemo(
    () => ({
      search: debouncedQ,
      category,
      installedOnly,
    }),
    [debouncedQ, category, installedOnly],
  );

  const appsQuery = useQuery({
    queryKey: ['apps', filters],
    queryFn: () => getApps(filters),
    staleTime: 30_000,
  });

  // Detail dialog state
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const activeApp = useMemo(
    () => (activeAppId ? appsQuery.data?.find((a) => a.id === activeAppId) ?? null : null),
    [activeAppId, appsQuery.data],
  );

  // Install / uninstall mutations
  const [pendingId, setPendingId] = useState<string | null>(null);
  const installMutation = useMutation({
    mutationFn: async (app: AppInstalled): Promise<{ ok: true; installed: boolean; name: string }> => {
      setPendingId(app.id);
      if (app.installed) {
        await uninstallApp(app.id);
        return { ok: true, installed: false, name: app.name };
      }
      await installApp(app.id);
      return { ok: true, installed: true, name: app.name };
    },
    onSuccess: (result) => {
      if (result.installed) {
        toast.success(`${result.name} terpasang`, {
          description: 'App siap digunakan dari menu Apps Anda.',
        });
      } else {
        toast.info(`${result.name} dilepas`, {
          description: 'Akses app dicabut dari workspace Anda.',
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
    onError: () => {
      toast.error('Gagal mengubah status instalasi');
    },
    onSettled: () => {
      setPendingId(null);
    },
  });

  const items = appsQuery.data ?? [];
  const total = items.length;
  const showSkeleton = appsQuery.isLoading;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <header className="px-6 pt-6 pb-3 border-b border-line bg-surface">
        <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
          SPEKTRUM · Apps Marketplace
        </p>
        <h1 className="font-display font-bold text-h1 text-ink m-0">Apps & Services</h1>
        <p className="text-sm text-ink-4 mt-1 max-w-2xl">
          Aplikasi siap-pakai untuk memperkaya analisis data E&P Anda — dari seismic
          viewer, decline curve, hingga compliance auditor.
        </p>

        {/* Toolbar: search + category + installed toggle */}
        <div className="flex items-center gap-2 flex-wrap mt-4">
          <div
            className={[
              'flex-1 min-w-[200px] max-w-md flex items-center gap-2',
              'px-3 py-2 bg-surface border border-line-2 rounded-2',
              'transition-colors duration-hf',
              'focus-within:border-green-500 focus-within:shadow-focus',
            ].join(' ')}
          >
            <Icon name="search" size={14} className="text-ink-4" aria-hidden />
            <label htmlFor="apps-search" className="sr-only">
              Cari app, vendor, atau deskripsi
            </label>
            <input
              id="apps-search"
              type="search"
              placeholder="Cari app, vendor…"
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

          <div
            role="group"
            aria-label="Filter kategori"
            className="inline-flex items-center gap-1 flex-wrap"
          >
            {APP_CATEGORIES.map((c) => {
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryToggle(c.id)}
                  aria-pressed={active}
                  className={[
                    'inline-flex items-center px-3 h-8 rounded-pill text-xs font-semibold',
                    'border transition-colors duration-hf',
                    active
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-surface text-ink-3 border-line hover:bg-surface-2',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                  ].join(' ')}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleInstalledToggle}
            aria-pressed={installedOnly}
            className={[
              'inline-flex items-center gap-1.5 px-3 h-8 rounded-pill text-xs font-semibold',
              'border transition-colors duration-hf',
              installedOnly
                ? 'bg-amber-100 text-amber-700 border-amber-100'
                : 'bg-surface text-ink-3 border-line hover:bg-surface-2',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
          >
            <Icon name="check" size={11} aria-hidden />
            Installed saja
          </button>
        </div>
      </header>

      <section aria-label="Daftar app" aria-busy={appsQuery.isFetching} className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-h3 text-ink m-0">
            Apps{' '}
            <span className="text-ink-4 num font-medium">
              ({total.toLocaleString('id-ID')})
            </span>
          </h2>
          {appsQuery.isFetching && !showSkeleton ? (
            <span role="status" className="text-xs text-ink-4">
              Memuat…
            </span>
          ) : null}
        </div>

        {showSkeleton ? <AppGridSkeleton /> : null}

        {!showSkeleton && appsQuery.isError ? (
          <EmptyState
            variant="error"
            title="Gagal memuat apps"
            description="Terjadi kesalahan saat mengambil katalog apps. Coba lagi."
            action={{ label: 'Coba lagi', onClick: () => void appsQuery.refetch(), icon: 'refresh' }}
          />
        ) : null}

        {!showSkeleton && !appsQuery.isError && items.length === 0 ? (
          <EmptyState
            variant="no-results"
            title="Tidak ada app yang cocok"
            description="Coba ubah kata kunci atau hapus filter kategori."
            action={{
              label: 'Reset filter',
              onClick: () => setSearchParams(new URLSearchParams()),
              icon: 'refresh',
            }}
          />
        ) : null}

        {!showSkeleton && !appsQuery.isError && items.length > 0 ? (
          <div
            role="list"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {items.map((app) => (
              <div role="listitem" key={app.id}>
                <AppCard
                  app={app}
                  onOpen={(a) => setActiveAppId(a.id)}
                  onInstallToggle={(a) => installMutation.mutate(a)}
                  installPending={pendingId === app.id}
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <AppDetailDialog
        app={activeApp}
        onClose={() => setActiveAppId(null)}
        onInstallToggle={(a) => installMutation.mutate(a)}
        installPending={activeApp !== null && pendingId === activeApp.id}
      />
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────── */

function AppGridSkeleton(): JSX.Element {
  const count = 8;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat apps"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="bg-surface border border-line rounded-3 p-4 h-56 animate-pulse"
        >
          <div className="w-12 h-12 bg-surface-3 rounded-2 mb-3" />
          <div className="h-4 w-2/3 bg-surface-3 rounded-1 mb-1" />
          <div className="h-3 w-1/3 bg-surface-3 rounded-1 mb-3" />
          <div className="h-3 w-full bg-surface-3 rounded-1 mb-1" />
          <div className="h-3 w-5/6 bg-surface-3 rounded-1" />
        </div>
      ))}
    </div>
  );
}

export default AppsPage;
