/**
 * WorkspacePage — `/workspace` route (project list view).
 *
 * Sprint 9.5 Phase 2: Connected to real backend via useProjects().
 * Backend returns taskCounts per project — no need for seed-based count map.
 *
 * URL state: `?status=ACTIVE|ARCHIVED` + `?q=…`.
 *
 * A11y: heading hierarchy, search label, filter buttons aria-pressed.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, Icon, toast } from '@ghanem/ui';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { useProjects } from '../hooks/useWorkspace';
import type { ProjectStatus } from '../api/projects';
import { ProjectCard } from './workspace/ProjectCard';

function parseStatus(raw: string | null): ProjectStatus | undefined {
  if (raw === 'ACTIVE' || raw === 'ARCHIVED') return raw;
  // Legacy lowercase support
  if (raw === 'active') return 'ACTIVE';
  if (raw === 'archived') return 'ARCHIVED';
  return undefined;
}

export function WorkspacePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatus(searchParams.get('status'));
  const q = searchParams.get('q') ?? '';
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebouncedValue(localQ, 300);

  // Sync search ke URL
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

  const updateStatus = useCallback(
    (next: ProjectStatus | undefined) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (next) params.set('status', next);
        else params.delete('status');
        return params;
      });
    },
    [setSearchParams],
  );

  // useProjects fetches backend with optional status filter.
  const projectsQuery = useProjects(status);

  const filtered = useMemo(() => {
    const list = projectsQuery.data?.items ?? [];
    if (!debouncedQ) return list;
    const needle = debouncedQ.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.description ?? '').toLowerCase().includes(needle),
    );
  }, [projectsQuery.data, debouncedQ]);

  const handleAddProject = useCallback(() => {
    toast.info('Tambah project — segera hadir', {
      description: 'Flow create project akan tersedia di Phase 9.',
    });
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <header className="px-6 pt-6 pb-3 border-b border-line bg-surface">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
              SPEKTRUM · Workspace
            </p>
            <h1 className="font-display font-bold text-h1 text-ink m-0">Project Workspace</h1>
            <p className="text-sm text-ink-4 mt-1 max-w-2xl">
              Ruang kolaboratif untuk task tracking lintas tim. Setiap project memiliki
              Kanban board dengan drag-drop dan keyboard accessibility penuh.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProject}
            className={[
              'inline-flex items-center gap-1.5 h-10 px-4 rounded-2',
              'bg-green-500 text-white border border-green-600 font-semibold text-sm',
              'hover:bg-green-600',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              'transition-colors duration-hf',
            ].join(' ')}
          >
            <Icon name="plus" size={14} aria-hidden /> Project baru
          </button>
        </div>

        {/* Toolbar */}
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
            <label htmlFor="workspace-search" className="sr-only">
              Cari project
            </label>
            <input
              id="workspace-search"
              type="search"
              placeholder="Cari project…"
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

          <div role="group" aria-label="Filter status" className="inline-flex items-center gap-1">
            <StatusButton label="Semua" active={!status} onClick={() => updateStatus(undefined)} />
            <StatusButton
              label="Aktif"
              active={status === 'ACTIVE'}
              onClick={() => updateStatus('ACTIVE')}
            />
            <StatusButton
              label="Archived"
              active={status === 'ARCHIVED'}
              onClick={() => updateStatus('ARCHIVED')}
            />
          </div>
        </div>
      </header>

      <section aria-label="Daftar project" className="px-6 py-5">
        <div className="mb-3">
          <h2 className="font-display font-semibold text-h3 text-ink m-0">
            Project{' '}
            <span className="text-ink-4 num font-medium">
              ({filtered.length.toLocaleString('id-ID')})
            </span>
          </h2>
        </div>

        {projectsQuery.isLoading ? <GridSkeleton /> : null}

        {!projectsQuery.isLoading && projectsQuery.isError ? (
          <EmptyState
            variant="error"
            title="Gagal memuat project"
            description="Terjadi kesalahan saat mengambil daftar project."
            action={{
              label: 'Coba lagi',
              onClick: () => void projectsQuery.refetch(),
              icon: 'refresh',
            }}
          />
        ) : null}

        {!projectsQuery.isLoading && !projectsQuery.isError && filtered.length === 0 ? (
          <EmptyState
            variant="no-results"
            title="Tidak ada project yang cocok"
            description="Coba ubah kata kunci atau hapus filter status."
            action={{
              label: 'Reset filter',
              onClick: () => setSearchParams(new URLSearchParams()),
              icon: 'refresh',
            }}
          />
        ) : null}

        {!projectsQuery.isLoading && filtered.length > 0 ? (
          <div role="list" className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              // Backend returns `taskCount` (singular number total), not `taskCounts` (object per status)
              const taskCount = p.taskCount ?? 0;
              return (
                <div role="listitem" key={p.id}>
                  <ProjectCard project={p} taskCount={taskCount} />
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

interface StatusButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function StatusButton({ label, active, onClick }: StatusButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
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
      {label}
    </button>
  );
}

function GridSkeleton(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat project"
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="bg-surface border border-line rounded-3 p-4 h-48 animate-pulse"
        >
          <div className="h-4 w-2/3 bg-surface-3 rounded-1 mb-2" />
          <div className="h-3 w-full bg-surface-3 rounded-1 mb-1" />
          <div className="h-3 w-4/5 bg-surface-3 rounded-1 mb-3" />
          <div className="h-7 w-1/3 bg-surface-3 rounded-1 mt-auto" />
        </div>
      ))}
    </div>
  );
}

export default WorkspacePage;
