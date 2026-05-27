/**
 * useWorkspace — TanStack Query hooks for Workspace (projects + tasks).
 *
 * Sprint 9.5 Phase 2. All hooks connect to real backend endpoints via
 * api/projects.ts. Optimistic update for task move (drag-drop).
 *
 * Query key taxonomy:
 *   ['workspace', 'projects', { status }]      — project list (paginated)
 *   ['workspace', 'project', id]               — single project detail
 *   ['workspace', 'tasks', projectId]          — KanbanBoardData (all 4 columns)
 *
 * Move task optimistic update strategy:
 *   1. Snapshot current KanbanBoardData from cache
 *   2. Apply move locally (remove from old column, insert at new position)
 *   3. Call API
 *   4. On error: rollback to snapshot + show toast
 *   5. On settle: always invalidate to sync with server truth
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@ghanem/ui';
import {
  createTask,
  deleteTask,
  getProject,
  getProjectTasks,
  listProjects,
  moveTask,
  updateTask,
  type CreateTaskInput,
  type KanbanBoardData,
  type ProjectStatus,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
} from '../api/projects';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const KANBAN_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

/* ─── Project hooks ─────────────────────────────────────────────────────── */

/**
 * List all projects, optionally filtered by status.
 * Returns paginated response; defaults to limit=50 for workspace list view.
 */
export function useProjects(status?: ProjectStatus) {
  return useQuery({
    queryKey: ['workspace', 'projects', { status }] as const,
    queryFn: () => listProjects({ status, limit: 50 }),
    staleTime: 60_000,
  });
}

/**
 * Single project detail with taskCounts grouped by status.
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['workspace', 'project', id] as const,
    queryFn: () => getProject(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/* ─── Task hooks ─────────────────────────────────────────────────────────── */

/**
 * Kanban board data — 4 columns keyed by TaskStatus.
 */
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'tasks', projectId] as const,
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Create a task in the given project.
 * Invalidates the tasks cache on success.
 */
export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(projectId, input),
    onSuccess: (task) => {
      toast.success('Task ditambahkan', { description: task.title });
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'project', projectId] });
    },
    onError: () => {
      toast.error('Gagal membuat task');
    },
  });
}

/**
 * Update task fields (title, description, status, priority, assignee, dueDate).
 */
export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onSuccess: (task) => {
      toast.success('Task diperbarui', { description: task.title });
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
    },
    onError: () => {
      toast.error('Gagal menyimpan perubahan');
    },
  });
}

/**
 * Hard-delete a task.
 */
export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success('Task dihapus');
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'project', projectId] });
    },
    onError: () => {
      toast.error('Gagal menghapus task');
    },
  });
}

/* ─── Optimistic task move ──────────────────────────────────────────────── */

/**
 * Move task between columns (drag-drop) with optimistic update.
 *
 * Optimistic strategy:
 *   - Snapshot existing KanbanBoardData before mutation.
 *   - Immediately update cache: remove task from old column, insert at
 *     computed position in new column.
 *   - If API call fails, rollback to snapshot.
 *   - Always invalidate on settle to sync any server-side order changes.
 */
export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  const cacheKey = ['workspace', 'tasks', projectId] as const;

  return useMutation({
    mutationFn: ({ id, status, order }: { id: string; status: TaskStatus; order: number }) =>
      moveTask(id, status, order),

    onMutate: async ({ id, status, order }) => {
      // Cancel any in-flight refetch so it doesn't overwrite optimistic state.
      await queryClient.cancelQueries({ queryKey: cacheKey });

      // Snapshot for rollback.
      const snapshot = queryClient.getQueryData<KanbanBoardData>(cacheKey);

      queryClient.setQueryData<KanbanBoardData>(cacheKey, (prev) => {
        if (!prev) return prev;

        // Find the task in its current column.
        let movedTask: Task | undefined;
        const next: KanbanBoardData = {} as KanbanBoardData;

        for (const col of KANBAN_STATUSES) {
          const tasks = prev[col] ?? [];
          const filtered = tasks.filter((t) => {
            if (t.id === id) {
              movedTask = t;
              return false;
            }
            return true;
          });
          next[col] = filtered;
        }

        if (!movedTask) return prev;

        // Update the task's status for the new column.
        const updatedTask: Task = { ...movedTask, status, order };

        // Insert at the target order position (clamp to array bounds).
        const targetCol = [...(next[status] ?? [])];
        const insertAt = Math.max(0, Math.min(order, targetCol.length));
        targetCol.splice(insertAt, 0, updatedTask);
        next[status] = targetCol;

        return next;
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      // Rollback to snapshot.
      if (context?.snapshot) {
        queryClient.setQueryData<KanbanBoardData>(cacheKey, context.snapshot);
      }
      toast.error('Gagal memindahkan task — perubahan dibatalkan');
    },

    onSettled: () => {
      // Always re-sync with server to pick up any server-side ordering changes.
      void queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}
