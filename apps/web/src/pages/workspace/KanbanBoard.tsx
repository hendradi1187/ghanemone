/**
 * KanbanBoard — orchestrator dnd-kit untuk 4 kolom Kanban.
 *
 * dnd-kit setup:
 *   - DndContext dengan 2 sensor: PointerSensor (mouse/touch) + KeyboardSensor
 *     (a11y) — keyboard sensor coordinateGetter `sortableKeyboardCoordinates`
 *     supaya arrow keys traverse sortable list.
 *   - onDragStart: simpan id ke state untuk render DragOverlay (preview saat drag).
 *   - onDragOver: detect cross-column move, update local state optimistically
 *     supaya placeholder muncul di target kolom.
 *   - onDragEnd: commit status change via parent `onTaskStatusChange`.
 *
 * State strategy:
 *   - `tasks` adalah controlled props dari parent (server state via TanStack
 *     Query). Untuk smooth drag UX, kita maintain local `optimisticTasks`
 *     yang di-sync ke props dan di-update saat onDragOver/onDragEnd.
 *   - On unmount / props update, optimistic state reset ke props.
 *
 * A11y:
 *   - KeyboardSensor dengan custom announcements (id-ID translations) supaya
 *     screen reader user mendengar feedback drag action dalam Bahasa Indonesia.
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
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Announcements,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../mocks/workspace';
import { TASK_STATUSES, TASK_STATUS_META } from '../../mocks/workspace';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

export interface KanbanBoardProps {
  tasks: Task[];
  /** Klik task → buka detail dialog. */
  onTaskOpen: (task: Task) => void;
  /** Klik "+" di column → buka create-dialog dengan status pre-filled. */
  onAddTask: (status: TaskStatus) => void;
  /** Commit status change setelah drag-drop selesai. */
  onTaskStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
}

/** Group tasks by status, urut sesuai TASK_STATUSES. */
function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const out: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };
  for (const t of tasks) {
    out[t.status].push(t);
  }
  return out;
}

/** Find task by id di flat list. */
function findTask(tasks: Task[], id: string | null): Task | undefined {
  if (!id) return undefined;
  return tasks.find((t) => t.id === id);
}

export function KanbanBoard({
  tasks,
  onTaskOpen,
  onAddTask,
  onTaskStatusChange,
}: KanbanBoardProps): JSX.Element {
  // Optimistic local copy untuk smooth drag UX.
  const [items, setItems] = useState<Task[]>(tasks);
  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = useMemo(() => findTask(items, activeId), [items, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
        if (!over) {
          return 'Drag dibatalkan. Task kembali ke posisi semula.';
        }
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

  /**
   * Cross-column reorder: saat over berbeda status, update items optimistically
   * supaya placeholder muncul di kolom target. Tidak commit ke parent — itu
   * dilakukan di onDragEnd.
   */
  const handleDragOver = useCallback(
    (e: DragOverEvent) => {
      const { active, over } = e;
      if (!over) return;
      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      if (activeIdStr === overIdStr) return;

      setItems((current) => {
        const activeIdx = current.findIndex((t) => t.id === activeIdStr);
        if (activeIdx < 0) return current;
        const activeTaskNow = current[activeIdx]!;
        const targetStatus = resolveTargetStatus(overIdStr, current);
        if (!targetStatus) return current;
        if (activeTaskNow.status === targetStatus) return current;
        // Update status optimistically — komponen sortable akan reposisi.
        const next = [...current];
        next[activeIdx] = { ...activeTaskNow, status: targetStatus };
        return next;
      });
    },
    [],
  );

  /**
   * Commit final reorder + status. Kalau drop di task lain di kolom yang sama,
   * apply arrayMove. Kalau drop ke kolom (id `col-*`) atau task di kolom lain,
   * status sudah di-update di onDragOver — di sini tinggal call parent commit.
   */
  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      setActiveId(null);
      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      const activeIdx = items.findIndex((t) => t.id === activeIdStr);
      if (activeIdx < 0) return;
      const activeTaskNow = items[activeIdx]!;

      // Drop di task lain di kolom yang sama → reorder within column.
      const overTask = items.find((t) => t.id === overIdStr);
      if (overTask && overTask.status === activeTaskNow.status && overTask.id !== activeTaskNow.id) {
        const overIdx = items.findIndex((t) => t.id === overIdStr);
        if (overIdx >= 0) {
          setItems((curr) => arrayMove(curr, activeIdx, overIdx));
        }
      }

      // Commit status change kalau berubah dari original (drag cross-column).
      const originalTask = tasks.find((t) => t.id === activeIdStr);
      if (originalTask && originalTask.status !== activeTaskNow.status) {
        onTaskStatusChange(activeIdStr, activeTaskNow.status);
      }
    },
    [items, onTaskStatusChange, tasks],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    // Reset items ke props (rollback optimistic update).
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
      <div
        role="region"
        aria-label="Kanban board"
        className="flex gap-3 overflow-x-auto pb-2"
      >
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

/* ─── Helpers ────────────────────────────────────────────────────────── */

/**
 * Resolve target status dari `over.id`. `over` bisa berupa:
 *   - Column droppable (id `col-<status>`)
 *   - Task sortable (id `task-<...>`) → lookup task.status
 */
function resolveTargetStatus(overId: string, items: Task[]): TaskStatus | null {
  if (overId.startsWith('col-')) {
    const status = overId.replace('col-', '') as TaskStatus;
    return TASK_STATUSES.includes(status) ? status : null;
  }
  const overTask = items.find((t) => t.id === overId);
  return overTask?.status ?? null;
}
