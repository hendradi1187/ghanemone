/**
 * ProjectCard — kartu project di Workspace landing.
 *
 * Klik card → navigasi ke `/workspace/:projectId` (Kanban). Color accent
 * border-left dari project.color (3 px) untuk visual identity.
 *
 * A11y:
 *   - Card adalah `<button>` overlay (full-area clickable, keyboard-friendly)
 *   - Member avatars: `aria-label` jumlah anggota
 */
import { useNavigate } from 'react-router-dom';
import { Icon } from '@ghanem/ui';
import type { Project } from '../../mocks/workspace';

export interface ProjectCardProps {
  project: Project;
  /** Jumlah task — di-resolve di parent (count by projectId). */
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

export function ProjectCard({ project, taskCount }: ProjectCardProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <article
      className={[
        'group relative flex flex-col gap-3 p-4',
        'bg-surface border border-line rounded-3',
        'hover:border-green-200 hover:shadow-1',
        'transition-all duration-hf',
        'focus-within:border-green-500 focus-within:shadow-focus',
        project.status === 'archived' ? 'opacity-70' : '',
      ].join(' ')}
    >
      {/* Color accent strip */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3"
        style={{ background: project.color }}
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
              Dibuat {fmtDate(project.createdAt)}
            </p>
          </div>
          {project.status === 'archived' ? (
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
        <p className="text-sm text-ink-3 mt-2 line-clamp-2 m-0">{project.description}</p>
      </div>

      <div className="relative pointer-events-none flex items-center justify-between gap-3 mt-auto">
        <div
          className="flex items-center"
          aria-label={`${project.members.length} anggota tim`}
        >
          {project.members.slice(0, 4).map((m, i) => (
            <span
              key={m.id}
              aria-hidden="true"
              title={m.fullName}
              className={[
                'inline-flex items-center justify-center',
                'w-7 h-7 rounded-pill bg-surface-2 border-2 border-surface',
                'text-[10.5px] font-semibold text-ink-2',
                i > 0 ? '-ml-2' : '',
              ].join(' ')}
            >
              {m.initials}
            </span>
          ))}
          {project.members.length > 4 ? (
            <span
              aria-hidden="true"
              className={[
                'inline-flex items-center justify-center',
                'w-7 h-7 rounded-pill bg-surface-3 border-2 border-surface',
                'text-[10.5px] font-semibold text-ink-4 -ml-2',
              ].join(' ')}
            >
              +{project.members.length - 4}
            </span>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-ink-4">
          <Icon name="list" size={11} aria-hidden />
          <span className="num font-semibold">{taskCount}</span> task
        </span>
      </div>

      {/* "Buka" button — visual hint, redundant dengan card overlay click. Tetap tampil supaya affordance jelas. */}
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
