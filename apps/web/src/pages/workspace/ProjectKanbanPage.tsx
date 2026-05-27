/**
 * ProjectKanbanPage — `/workspace/:projectId` route.
 *
 * Sprint 9.5 Phase 2: Connected to real backend via useProject/useProjectTasks/
 * useCreateTask/useUpdateTask/useDeleteTask/useMoveTask from hooks/useWorkspace.ts.
 *
 * Layout:
 *   - Breadcrumb back ke /workspace
 *   - Header: project name, owner, organization, "Tambah task" button
 *   - KanbanBoard (4 columns dengan dnd-kit)
 *   - TaskDetailDialog (create + edit)
 *
 * Drag-drop semantics handled in KanbanBoard. This page:
 *   - Fetches project + tasks via TanStack Query
 *   - Passes useMoveTask to KanbanBoard for optimistic drag-drop
 *   - Handles create/update/delete via mutations with toast feedback
 *
 * A11y: breadcrumb, heading hierarchy, status feedback via toast.
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState, Icon, toast } from '@ghanem/ui';
import {
  useProject,
  useProjectTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask,
} from '../../hooks/useWorkspace';
import type { Task, TaskStatus } from '../../api/projects';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailDialog } from './TaskDetailDialog';

export function ProjectKanbanPage(): JSX.Element {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const projectQuery = useProject(projectId);
  const tasksQuery = useProjectTasks(projectId);

  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const moveTask = useMoveTask(projectId);

  // Dialog state
  type DialogState =
    | { open: false }
    | { open: true; mode: 'create'; status: TaskStatus }
    | { open: true; mode: 'edit'; task: Task };
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const closeDialog = useCallback(() => setDialog({ open: false }), []);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleTaskOpen = useCallback((task: Task) => {
    setDialog({ open: true, mode: 'edit', task });
  }, []);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setDialog({ open: true, mode: 'create', status });
  }, []);

  const handleMove = useCallback(
    (taskId: string, nextStatus: TaskStatus, order: number) => {
      moveTask.mutate({ id: taskId, status: nextStatus, order });
    },
    [moveTask],
  );

  const handleDialogSubmit = useCallback(
    async (values: {
      title: string;
      description: string;
      status: TaskStatus;
      priority: import('../../api/projects').TaskPriority;
      assigneeId?: string;
      dueDate?: string;
    }) => {
      if (dialog.open && dialog.mode === 'create') {
        await createTask.mutateAsync({
          title: values.title,
          description: values.description || undefined,
          status: values.status,
          priority: values.priority,
          assigneeId: values.assigneeId || undefined,
          dueDate: values.dueDate || undefined,
        });
        closeDialog();
      } else if (dialog.open && dialog.mode === 'edit') {
        await updateTask.mutateAsync({
          id: dialog.task.id,
          input: {
            title: values.title,
            description: values.description || undefined,
            status: values.status,
            priority: values.priority,
            assigneeId: values.assigneeId || undefined,
            dueDate: values.dueDate || undefined,
          },
        });
        closeDialog();
      }
    },
    [createTask, updateTask, dialog, closeDialog],
  );

  const handleDeleteTask = useCallback(
    (task: Task) => {
      deleteTask.mutate(task.id);
      closeDialog();
    },
    [deleteTask, closeDialog],
  );

  /* ── Render ────────────────────────────────────────────────────────── */

  const project = projectQuery.data;

  // Flatten KanbanBoardData into a single array for KanbanBoard.
  const tasks = useMemo((): Task[] => {
    const board = tasksQuery.data;
    if (!board) return [];
    return [
      ...(board.TODO ?? []),
      ...(board.IN_PROGRESS ?? []),
      ...(board.REVIEW ?? []),
      ...(board.DONE ?? []),
    ];
  }, [tasksQuery.data]);

  if (projectQuery.isLoading || tasksQuery.isLoading) {
    return <KanbanSkeleton />;
  }

  if (projectQuery.isError) {
    toast.error('Gagal memuat project');
  }

  if (!project) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <Link
          to="/workspace"
          className={[
            'inline-flex items-center gap-1 text-sm font-semibold text-green-700 mb-4',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1 py-0.5',
          ].join(' ')}
        >
          <Icon name="chevL" size={12} aria-hidden /> Kembali ke Workspace
        </Link>
        <EmptyState
          variant="error"
          title="Project tidak ditemukan"
          description={`Project dengan ID "${projectId}" tidak tersedia atau akses ditolak.`}
          action={{
            label: 'Kembali ke Workspace',
            onClick: () => navigate('/workspace'),
            icon: 'chevL',
          }}
        />
      </div>
    );
  }

  // Detail endpoint exposes both `taskCount` (total) and `taskCounts` (per-status).
  // Prefer `taskCount` from server; fall back to summing `taskCounts` if missing.
  const taskCount =
    project.taskCount ??
    Object.values(project.taskCounts ?? {}).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <div className="flex flex-col h-full min-h-0">
      <nav
        aria-label="Breadcrumb"
        className="px-6 pt-4 pb-2 bg-surface border-b border-line flex items-center gap-2"
      >
        <Link
          to="/workspace"
          className={[
            'inline-flex items-center gap-1 text-sm font-semibold text-green-700',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1 py-0.5',
          ].join(' ')}
        >
          <Icon name="chevL" size={12} aria-hidden /> Workspace
        </Link>
        <span aria-hidden className="text-ink-5 text-xs">
          /
        </span>
        <span className="text-xs text-ink-4 truncate">{project.name}</span>
      </nav>

      <header className="px-6 py-4 bg-surface border-b border-line">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                aria-hidden="true"
                className="inline-block w-3 h-3 rounded-1"
                style={{ background: project.color ?? '#2a5fb8' }}
              />
              {project.status === 'ARCHIVED' ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10.5px] font-semibold uppercase tracking-cap">
                  Archived
                </span>
              ) : null}
            </div>
            <h1 className="font-display font-bold text-h1 text-ink m-0">{project.name}</h1>
            <p className="text-sm text-ink-3 mt-1 m-0 max-w-3xl">
              {project.description ?? 'Tidak ada deskripsi.'}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-ink-4">
              <span>{project.organization.name}</span>
              <span aria-hidden>·</span>
              <span>Owner: {project.owner.name}</span>
              <span aria-hidden>·</span>
              <span className="num font-semibold text-ink">{taskCount}</span> task
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDialog({ open: true, mode: 'create', status: 'TODO' })}
            className={[
              'inline-flex items-center gap-1.5 h-10 px-4 rounded-2',
              'bg-green-500 text-white border border-green-600 font-semibold text-sm',
              'hover:bg-green-600',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              'transition-colors duration-hf',
            ].join(' ')}
          >
            <Icon name="plus" size={14} aria-hidden /> Tambah task
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
        <KanbanBoard
          tasks={tasks}
          onTaskOpen={handleTaskOpen}
          onAddTask={handleAddTask}
          onTaskMove={handleMove}
        />
      </div>

      <TaskDetailDialog
        open={dialog.open}
        onClose={closeDialog}
        mode={dialog.open ? dialog.mode : 'create'}
        task={dialog.open && dialog.mode === 'edit' ? dialog.task : undefined}
        defaultStatus={dialog.open && dialog.mode === 'create' ? dialog.status : 'TODO'}
        onSubmit={handleDialogSubmit}
        onDelete={handleDeleteTask}
        isSubmitting={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}

function KanbanSkeleton(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat Kanban board"
      className="px-6 py-6"
    >
      <div className="h-6 w-1/3 bg-surface-3 rounded-1 mb-2 animate-pulse" />
      <div className="h-3 w-2/3 bg-surface-3 rounded-1 mb-4 animate-pulse" />
      <div className="flex gap-3 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="w-72 flex-none bg-surface-2 border border-line rounded-3 p-3 h-96 animate-pulse"
          >
            <div className="h-4 w-1/2 bg-surface-3 rounded-1 mb-3" />
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="bg-surface border border-line rounded-2 p-3 mb-2">
                <div className="h-3 w-3/4 bg-surface-3 rounded-1 mb-2" />
                <div className="h-3 w-1/2 bg-surface-3 rounded-1" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectKanbanPage;
