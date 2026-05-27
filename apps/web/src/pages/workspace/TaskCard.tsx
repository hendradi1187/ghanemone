/**
 * TaskCard — kartu task di Kanban column.
 *
 * Sortable via dnd-kit `useSortable`. Drag-handle ada di seluruh card
 * (pakai `{...attributes} {...listeners}`). Klik (tanpa drag) → buka detail
 * dialog via `onOpen`.
 *
 * dnd-kit semantics:
 *   - `transform` + `transition` di-apply via inline style untuk smooth animation
 *   - `isDragging`: opacity rendah supaya origin-card terlihat sebagai placeholder
 *   - Keyboard: dnd-kit Sensor sudah handle (Space = grab, Arrow = move, Enter = drop)
 *
 * A11y:
 *   - `role="button"` (action card, bukan link)
 *   - `aria-label` deskriptif berisi status + assignee
 *   - Drag handle: `aria-roledescription="sortable item"` (set oleh dnd-kit)
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@ghanem/ui';
import { TASK_STATUS_META, type Task } from '../../mocks/workspace';

export interface TaskCardProps {
  task: Task;
  /** Klik card (tanpa drag) → buka task detail dialog. */
  onOpen: (task: Task) => void;
  /** Saat true, render visual minimal sebagai overlay (DragOverlay). */
  asOverlay?: boolean;
}

function fmtDueShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <article
      ref={asOverlay ? undefined : setNodeRef}
      style={asOverlay ? undefined : style}
      aria-label={`Task: ${task.title}. Status: ${meta.label}. Assignee: ${task.assigneeInitials}.`}
      {...(asOverlay ? {} : attributes)}
      {...(asOverlay ? {} : listeners)}
      onClick={(e) => {
        // Skip kalau lagi dragging (mouseup setelah pointer move).
        if (isDragging) {
          e.preventDefault();
          return;
        }
        onOpen(task);
      }}
      onKeyDown={(e) => {
        // Enter/Space saat focus & bukan drag → open dialog.
        // (Drag-grab Space ditangani sensor sebelum sampai ke handler ini ketika fokus drag-aktif.)
        if ((e.key === 'Enter' || e.key === ' ') && !isDragging) {
          // Hanya hijack jika belum di-prevent oleh dnd-kit sensor handler upstream.
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
        <Icon
          name="more"
          size={11}
          className="flex-none text-ink-5 mt-1"
          aria-hidden
        />
      </div>

      {task.labels.length > 0 ? (
        <div className="flex items-center gap-1 flex-wrap">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10px] font-medium"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 ? (
            <span className="text-[10px] text-ink-4">+{task.labels.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 mt-1">
        <span
          className="inline-flex items-center gap-1 text-[11px] text-ink-4"
          title={`Jatuh tempo ${task.dueDate}`}
        >
          <Icon name="clock" size={10} aria-hidden />
          <span className="num">{fmtDueShort(task.dueDate)}</span>
        </span>
        <span
          aria-hidden="true"
          title={task.assigneeInitials}
          className="inline-flex items-center justify-center w-6 h-6 rounded-pill bg-green-50 text-green-700 text-[10px] font-bold"
        >
          {task.assigneeInitials}
        </span>
      </div>
    </article>
  );
}
