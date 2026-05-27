/**
 * KanbanColumn — satu kolom dalam KanbanBoard (TODO/IN_PROGRESS/REVIEW/DONE).
 *
 * Sprint 9.5 Phase 2: Updated to use Task/TaskStatus from api/projects.ts.
 *
 * A11y:
 *   - `<section aria-labelledby>` untuk landmark per-kolom
 *   - `role="list"` di task container
 */
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Icon } from '@ghanem/ui';
import type { Task, TaskStatus } from '../../api/projects';
import { TASK_STATUS_META } from './KanbanBoard';
import { TaskCard } from './TaskCard';

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskOpen: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({
  status,
  tasks,
  onTaskOpen,
  onAddTask,
}: KanbanColumnProps): JSX.Element {
  const meta = TASK_STATUS_META[status];
  const headingId = `kanban-col-${status}-heading`;

  const { setNodeRef, isOver } = useDroppable({
    id: `col-${status}`,
    data: { type: 'column', status },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <section
      aria-labelledby={headingId}
      className={[
        'flex flex-col min-w-[260px] w-72 flex-none',
        'bg-surface-2 border rounded-3',
        isOver ? 'border-green-500 bg-green-50' : 'border-line',
        'transition-colors duration-hf',
      ].join(' ')}
    >
      <header
        className={[
          'flex items-center justify-between gap-2',
          'px-3 py-2.5 border-b border-line',
          'border-t-4 rounded-t-3',
          meta.accent,
        ].join(' ')}
      >
        <div className="flex items-center gap-2 min-w-0">
          <h3
            id={headingId}
            className="font-display font-semibold text-sm text-ink m-0 truncate"
          >
            {meta.label}
          </h3>
          <span
            className={[
              'inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-pill',
              'text-[10.5px] font-semibold',
              meta.color,
            ].join(' ')}
          >
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddTask(status)}
          aria-label={`Tambah task di kolom ${meta.label}`}
          title={`Tambah task di ${meta.label}`}
          className={[
            'inline-flex items-center justify-center w-6 h-6 rounded-1',
            'text-ink-4 hover:bg-surface hover:text-ink',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
            'transition-colors duration-hf',
          ].join(' ')}
        >
          <Icon name="plus" size={12} aria-hidden />
        </button>
      </header>

      <div ref={setNodeRef} className="flex-1 min-h-0 p-2 flex flex-col gap-2 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div role="list" className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              <p className="text-xs text-ink-4 italic text-center py-6">
                Belum ada task. Tarik dari kolom lain atau tekan "+".
              </p>
            ) : (
              tasks.map((t) => (
                <div role="listitem" key={t.id}>
                  <TaskCard task={t} onOpen={onTaskOpen} />
                </div>
              ))
            )}
          </div>
        </SortableContext>

        <button
          type="button"
          onClick={() => onAddTask(status)}
          className={[
            'mt-1 inline-flex items-center justify-center gap-1.5',
            'h-8 px-3 rounded-2',
            'bg-transparent text-ink-4 text-xs font-medium',
            'hover:bg-surface hover:text-ink',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            'transition-colors duration-hf',
            'border border-dashed border-line',
          ].join(' ')}
        >
          <Icon name="plus" size={11} aria-hidden /> Tambah task
        </button>
      </div>
    </section>
  );
}
