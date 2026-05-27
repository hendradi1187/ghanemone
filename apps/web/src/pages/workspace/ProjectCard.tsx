/**
 * ProjectCard — kartu project di Workspace landing.
 *
 * Sprint 9.5 Phase 2: Updated to use real Project type from api/projects.ts.
 * Backend returns taskCounts (Record<TaskStatus, number>) and owner/organization
 * instead of members array. Members display replaced by owner + org name.
 *
 * Klik card → navigasi ke `/workspace/:projectId` (Kanban). Color accent
 * border-left dari project.color (3 px) untuk visual identity.
 *
 * A11y:
 *   - Card adalah `<button>` overlay (full-area clickable, keyboard-friendly)
 *   - Owner label rendered with semantic text, not just initials
 */
import { useNavigate } from 'react-router-dom';
import { Icon } from '@ghanem/ui';
import type { Project } from '../../api/projects';

export interface ProjectCardProps {
  project: Project;
  /** Total task count (sum of all status counts from taskCounts). */
  taskCount: number;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ownerInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Strip status counts to only include non-zero values for badge display. */
function taskCountBadges(counts: Project['taskCounts']): Array<{ label: string; n: number }> {
  if (!counts) return [];
  const map: Record<string, string> = {
    TODO: 'Todo',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    DONE: 'Done',
  };
  return Object.entries(counts)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([k, n]) => ({ label: map[k] ?? k, n: n ?? 0 }));
}

export function ProjectCard({ project, taskCount }: ProjectCardProps): JSX.Element {
  const navigate = useNavigate();
  // taskCounts (per-status) hanya tersedia dari detail endpoint; list endpoint
  // hanya kasih taskCount total. Badge per-status hanya tampil di detail page.
  const badges = taskCountBadges(project.taskCounts);

  return (
    <article
      className={[
        'group relative flex flex-col gap-3 p-4',
        'bg-surface border border-line rounded-3',
        'hover:border-green-200 hover:shadow-1',
        'transition-all duration-hf',
        'focus-within:border-green-500 focus-within:shadow-focus',
        project.status === 'ARCHIVED' ? 'opacity-70' : '',
      ].join(' ')}
    >
      {/* Color accent strip */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3"
        style={{ background: project.color ?? '#2a5fb8' }}
      />

      <button
        type="button"
        onClick={() => navigate(`/workspace/${project.id}`)}
        aria-label={`Buka project ${project.name}`}
        className={[
          'absolute inset-0 rounded-3',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
        ].join(' ')}
      />

      <div className="relative pointer-events-none">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-h3 text-ink m-0">{project.name}</h3>
            <p className="text-xs text-ink-4 mt-0.5">
              {project.organization.name} · Dibuat {fmtDate(project.createdAt)}
            </p>
          </div>
          {project.status === 'ARCHIVED' ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10.5px] font-semibold uppercase tracking-cap">
              Archived
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-1 bg-green-50 text-green-700 text-[10.5px] font-semibold uppercase tracking-cap">
              <span aria-hidden className="w-1.5 h-1.5 rounded-pill bg-green-500" />
              Aktif
            </span>
          )}
        </div>
        <p className="text-sm text-ink-3 mt-2 line-clamp-2 m-0">
          {project.description ?? 'Tidak ada deskripsi.'}
        </p>
      </div>

      {/* Task count badges */}
      {badges.length > 0 ? (
        <div className="relative pointer-events-none flex items-center gap-1 flex-wrap">
          {badges.map(({ label, n }) => (
            <span
              key={label}
              className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10px] font-medium"
            >
              {label}: <span className="num ml-0.5 font-semibold">{n}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative pointer-events-none flex items-center justify-between gap-3 mt-auto">
        {/* Owner avatar */}
        <div
          className="flex items-center gap-2"
          aria-label={`Owner: ${project.owner.name}`}
        >
          <span
            aria-hidden="true"
            title={project.owner.name}
            className={[
              'inline-flex items-center justify-center',
              'w-7 h-7 rounded-pill bg-green-50 border-2 border-surface',
              'text-[10.5px] font-semibold text-green-700',
            ].join(' ')}
          >
            {ownerInitials(project.owner.name)}
          </span>
          <span className="text-xs text-ink-4 truncate max-w-[120px]">{project.owner.name}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-ink-4">
          <Icon name="list" size={11} aria-hidden />
          <span className="num font-semibold">{taskCount}</span> task
        </span>
      </div>

      {/* "Buka" button — visual hint, redundant with card overlay click. */}
      <div className="relative">
        <button
          type="button"
          onClick={() => navigate(`/workspace/${project.id}`)}
          className={[
            'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-2 w-full',
            'bg-surface border border-line text-ink-2 font-semibold text-sm',
            'hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            'transition-colors duration-hf',
          ].join(' ')}
        >
          Buka <Icon name="chevR" size={11} aria-hidden />
        </button>
      </div>
    </article>
  );
}
