/**
 * KanbanBoard — orchestrator dnd-kit untuk 4 kolom Kanban.
 *
 * Sprint 9.5 Phase 2: Updated to use Task/TaskStatus from api/projects.ts.
 * Column statuses are now uppercase (TODO, IN_PROGRESS, REVIEW, DONE).
 *
 * dnd-kit setup:
 *   - DndContext dengan 2 sensor: PointerSensor (mouse/touch) + KeyboardSensor
 *     (a11y) — keyboard sensor coordinateGetter `sortableKeyboardCoordinates`
 *     supaya arrow keys traverse sortable list.
 *   - onDragStart: simpan id ke state untuk render DragOverlay (preview saat drag).
 *   - onDragOver: detect cross-column move, update local state optimistically
 *     supaya placeholder muncul di target kolom.
 *   - onDragEnd: commit via onTaskMove(taskId, newStatus, newOrder).
 *
 * State strategy:
 *   - `tasks` adalah controlled props dari parent (server state via TanStack Query).
 *   - `optimisticTasks` cloned locally for smooth drag UX.
 *   - On drag cancel / props update, local state resets.
 *
 * A11y:
 *   - KeyboardSensor dengan custom announcements (id-ID) untuk screen readers.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../api/projects';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

/* ─── Constants ──────────────────────────────────────────────────────────── */

export const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const TASK_STATUS_META: Record<TaskStatus, { label: string; color: string; accent: string }> = {
  TODO: { label: 'To Do', color: 'bg-surface-3 text-ink-3', accent: 'border-line' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-600', accent: 'border-blue-500' },
  REVIEW: { label: 'Review', color: 'bg-amber-100 text-amber-700', accent: 'border-amber-500' },
  DONE: { label: 'Done', color: 'bg-green-50 text-green-700', accent: 'border-green-500' },
};

/* ─── Props ──────────────────────────────────────────────────────────────── */

export interface KanbanBoardProps {
  tasks: Task[];
  onTaskOpen: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  /** Commit move: taskId, newStatus, newOrder (0-based index in column). */
  onTaskMove: (taskId: string, nextStatus: TaskStatus, order: number) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const out: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };
  for (const t of tasks) {
    out[t.status].push(t);
  }
  // Preserve order from server (sorted by .order field).
  for (const col of TASK_STATUSES) {
    out[col].sort((a, b) => a.order - b.order);
  }
  return out;
}

function findTask(tasks: Task[], id: string | null): Task | undefined {
  if (!id) return undefined;
  return tasks.find((t) => t.id === id);
}

/**
 * Resolve target TaskStatus from over.id.
 * over can be a column droppable (id `col-TODO`) or a task sortable (task UUID).
 */
function resolveTargetStatus(overId: string, items: Task[]): TaskStatus | null {
  if (overId.startsWith('col-')) {
    const status = overId.replace('col-', '') as TaskStatus;
    return TASK_STATUSES.includes(status) ? status : null;
  }
  const overTask = items.find((t) => t.id === overId);
  return overTask?.status ?? null;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function KanbanBoard({
  tasks,
  onTaskOpen,
  onAddTask,
  onTaskMove,
}: KanbanBoardProps): JSX.Element {
  const [items, setItems] = useState<Task[]>(tasks);
  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = useMemo(() => findTask(items, activeId), [items, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = useMemo(
    () => ({
      onDragStart({ active }) {
        const task = findTask(items, String(active.id));
        return task
          ? `Mengambil task: ${task.title}. Status saat ini: ${TASK_STATUS_META[task.status].label}.`
          : 'Mengambil item.';
      },
      onDragOver({ active, over }) {
        if (!over) return 'Item dipindahkan keluar dari area drop.';
        const task = findTask(items, String(active.id));
        const targetStatus = resolveTargetStatus(String(over.id), items);
        if (task && targetStatus) {
          return `${task.title} dipindahkan ke kolom ${TASK_STATUS_META[targetStatus].label}.`;
        }
        return '';
      },
      onDragEnd({ active, over }) {
        if (!over) return 'Drag dibatalkan. Task kembali ke posisi semula.';
        const task = findTask(items, String(active.id));
        const targetStatus = resolveTargetStatus(String(over.id), items);
        if (task && targetStatus) {
          return `${task.title} dipindahkan ke kolom ${TASK_STATUS_META[targetStatus].label}.`;
        }
        return 'Drag selesai.';
      },
      onDragCancel({ active }) {
        const task = findTask(items, String(active.id));
        return task ? `Drag dibatalkan untuk task ${task.title}.` : 'Drag dibatalkan.';
      },
    }),
    [items],
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    setItems((current) => {
      const activeIdx = current.findIndex((t) => t.id === activeIdStr);
      if (activeIdx < 0) return current;
      const activeTaskNow = current[activeIdx];
      if (!activeTaskNow) return current;
      const targetStatus = resolveTargetStatus(overIdStr, current);
      if (!targetStatus || activeTaskNow.status === targetStatus) return current;
      const next = [...current];
      next[activeIdx] = { ...activeTaskNow, status: targetStatus };
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      setActiveId(null);
      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      const activeIdx = items.findIndex((t) => t.id === activeIdStr);
      if (activeIdx < 0) return;
      const activeTaskNow = items[activeIdx];
      if (!activeTaskNow) return;

      // Same-column reorder
      const overTask = items.find((t) => t.id === overIdStr);
      if (overTask && overTask.status === activeTaskNow.status && overTask.id !== activeTaskNow.id) {
        const overIdx = items.findIndex((t) => t.id === overIdStr);
        if (overIdx >= 0) {
          setItems((curr) => arrayMove(curr, activeIdx, overIdx));
        }
      }

      // Compute the task's new 0-based order within its (potentially new) column.
      const colItems = items.filter((t) => t.status === activeTaskNow.status && t.id !== activeTaskNow.id);
      const order = colItems.length; // append to end if cross-column; parent resolves final position

      // Commit if status changed or reordered.
      const originalTask = tasks.find((t) => t.id === activeIdStr);
      if (originalTask && originalTask.status !== activeTaskNow.status) {
        onTaskMove(activeIdStr, activeTaskNow.status, order);
      }
    },
    [items, onTaskMove, tasks],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setItems(tasks);
  }, [tasks]);

  const grouped = useMemo(() => groupByStatus(items), [items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div role="region" aria-label="Kanban board" className="flex gap-3 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={grouped[status]}
            onTaskOpen={onTaskOpen}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onOpen={() => undefined} asOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
