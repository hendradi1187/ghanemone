/**
 * TaskCard — kartu task di Kanban column.
 *
 * Sprint 9.5 Phase 2: Updated to use Task from api/projects.ts.
 * Assignee is now { id, name } object (not just initials string).
 * Priority badge added (LOW/MED/HIGH/URGENT).
 *
 * dnd-kit semantics preserved; sortable via useSortable.
 *
 * A11y:
 *   - `role="button"` (action card, bukan link)
 *   - `aria-label` deskriptif berisi status + assignee
 *   - Drag handle: `aria-roledescription="sortable item"` (set oleh dnd-kit)
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@ghanem/ui';
import type { Task, TaskPriority } from '../../api/projects';
import { TASK_STATUS_META } from './KanbanBoard';

export interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  asOverlay?: boolean;
}

const PRIORITY_BADGE: Record<TaskPriority, { label: string; cls: string }> = {
  LOW: { label: 'Low', cls: 'bg-surface-3 text-ink-4' },
  MED: { label: 'Med', cls: 'bg-blue-50 text-blue-500' },
  HIGH: { label: 'High', cls: 'bg-amber-100 text-amber-700' },
  URGENT: { label: 'Urgent', cls: 'bg-red-100 text-red-600' },
};

function fmtDueShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

function assigneeInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function TaskCard({ task, onOpen, asOverlay = false }: TaskCardProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const meta = TASK_STATUS_META[task.status];
  const priorityBadge = PRIORITY_BADGE[task.priority];
  const assigneeName = task.assignee?.name ?? null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <article
      ref={asOverlay ? undefined : setNodeRef}
      style={asOverlay ? undefined : style}
      aria-label={[
        `Task: ${task.title}`,
        `Status: ${meta.label}`,
        assigneeName ? `Assignee: ${assigneeName}` : null,
        `Prioritas: ${priorityBadge.label}`,
      ]
        .filter(Boolean)
        .join('. ')}
      {...(asOverlay ? {} : attributes)}
      {...(asOverlay ? {} : listeners)}
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault();
          return;
        }
        onOpen(task);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isDragging) {
          if (!e.defaultPrevented) {
            e.preventDefault();
            onOpen(task);
          }
        }
      }}
      tabIndex={0}
      role="button"
      className={[
        'group relative flex flex-col gap-2 p-3 cursor-grab active:cursor-grabbing',
        'bg-surface border border-line rounded-2',
        'hover:border-green-200',
        'transition-shadow duration-hf',
        isDragging ? 'opacity-40' : '',
        asOverlay ? 'shadow-2 cursor-grabbing rotate-1' : '',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink m-0 leading-snug line-clamp-2">
          {task.title}
        </h4>
        <Icon name="more" size={11} className="flex-none text-ink-5 mt-1" aria-hidden />
      </div>

      {task.description ? (
        <p className="text-xs text-ink-4 m-0 line-clamp-1">{task.description}</p>
      ) : null}

      <div className="flex items-center gap-1">
        <span
          className={[
            'inline-flex items-center px-1.5 py-0.5 rounded-1 text-[10px] font-semibold',
            priorityBadge.cls,
          ].join(' ')}
        >
          {priorityBadge.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        {task.dueDate ? (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-ink-4"
            title={`Jatuh tempo ${task.dueDate}`}
          >
            <Icon name="clock" size={10} aria-hidden />
            <span className="num">{fmtDueShort(task.dueDate)}</span>
          </span>
        ) : (
          <span className="text-[11px] text-ink-5">—</span>
        )}

        {task.assignee ? (
          <span
            aria-hidden="true"
            title={task.assignee.name}
            className="inline-flex items-center justify-center w-6 h-6 rounded-pill bg-green-50 text-green-700 text-[10px] font-bold"
          >
            {assigneeInitials(task.assignee.name)}
          </span>
        ) : null}
      </div>
    </article>
  );
}
