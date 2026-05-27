/**
 * ProjectKanbanPage — `/workspace/:projectId` route.
 *
 * Layout:
 *   - Breadcrumb back ke /workspace
 *   - Header: project name, members avatar stack, "Tambah task" button
 *   - KanbanBoard (4 columns dengan dnd-kit)
 *   - TaskDetailDialog (create + edit)
 *
 * Drag-drop semantics handled di KanbanBoard. Halaman ini:
 *   - Fetch project + tasks via TanStack Query (cache key per projectId)
 *   - Persist task mutations via api/workspace.ts → localStorage
 *   - Optimistic update di KanbanBoard supaya drag terasa instant
 *
 * a11y: breadcrumb, heading hierarchy, status feedback via toast.
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EmptyState, Icon, toast } from '@ghanem/ui';
import {
  createTask,
  deleteTask,
  getProjectById,
  getTasksByProject,
  patchTaskStatus,
  updateTask,
} from '../../api/workspace';
import { TASK_STATUS_META, type Task, type TaskStatus } from '../../mocks/workspace';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailDialog } from './TaskDetailDialog';

export function ProjectKanbanPage(): JSX.Element {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ['workspace', 'project', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const tasksQuery = useQuery({
    queryKey: ['workspace', 'tasks', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
  });

  // Dialog state
  type DialogState =
    | { open: false }
    | { open: true; mode: 'create'; status: TaskStatus }
    | { open: true; mode: 'edit'; task: Task };
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const closeDialog = useCallback(() => setDialog({ open: false }), []);

  /* ── Mutations ─────────────────────────────────────────────────────── */

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      patchTaskStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
    },
    onError: () => {
      toast.error('Gagal memindahkan task');
    },
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      toast.success('Task ditambahkan', { description: task.title });
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
      closeDialog();
    },
    onError: () => {
      toast.error('Gagal membuat task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (task) => {
      toast.success('Task diperbarui', { description: task.title });
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
      closeDialog();
    },
    onError: () => {
      toast.error('Gagal menyimpan perubahan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success('Task dihapus');
        void queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] });
        closeDialog();
      } else {
        toast.error('Task tidak ditemukan');
      }
    },
    onError: () => {
      toast.error('Gagal menghapus task');
    },
  });

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleTaskOpen = useCallback((task: Task) => {
    setDialog({ open: true, mode: 'edit', task });
  }, []);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setDialog({ open: true, mode: 'create', status });
  }, []);

  const handleStatusChange = useCallback(
    (taskId: string, nextStatus: TaskStatus) => {
      statusMutation.mutate({ id: taskId, status: nextStatus });
      const meta = TASK_STATUS_META[nextStatus];
      toast.info(`Task dipindahkan ke ${meta.label}`);
    },
    [statusMutation],
  );

  const handleDialogSubmit = useCallback(
    async (values: {
      title: string;
      description: string;
      status: TaskStatus;
      assigneeId: string;
      assigneeInitials: string;
      labels: string[];
      dueDate: string;
    }) => {
      if (dialog.open && dialog.mode === 'create') {
        await createMutation.mutateAsync({
          projectId,
          title: values.title,
          description: values.description,
          status: values.status,
          assigneeId: values.assigneeId,
          assigneeInitials: values.assigneeInitials,
          labels: values.labels,
          dueDate: values.dueDate,
        });
      } else if (dialog.open && dialog.mode === 'edit') {
        await updateMutation.mutateAsync({
          ...dialog.task,
          title: values.title,
          description: values.description,
          status: values.status,
          assigneeId: values.assigneeId,
          assigneeInitials: values.assigneeInitials,
          labels: values.labels,
          dueDate: values.dueDate,
        });
      }
    },
    [createMutation, dialog, projectId, updateMutation],
  );

  /* ── Render ────────────────────────────────────────────────────────── */

  const project = projectQuery.data;
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  // Loading / error / not-found states.
  if (projectQuery.isLoading || tasksQuery.isLoading) {
    return <KanbanSkeleton />;
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
          description={`Project dengan ID "${projectId}" tidak tersedia.`}
          action={{
            label: 'Kembali ke Workspace',
            onClick: () => navigate('/workspace'),
            icon: 'chevL',
          }}
        />
      </div>
    );
  }

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
                style={{ background: project.color }}
              />
              {project.status === 'archived' ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10.5px] font-semibold uppercase tracking-cap">
                  Archived
                </span>
              ) : null}
            </div>
            <h1 className="font-display font-bold text-h1 text-ink m-0">{project.name}</h1>
            <p className="text-sm text-ink-3 mt-1 m-0 max-w-3xl">{project.description}</p>
            <div
              className="flex items-center gap-2 mt-3"
              aria-label={`${project.members.length} anggota tim`}
            >
              {project.members.slice(0, 6).map((m, i) => (
                <span
                  key={m.id}
                  aria-hidden="true"
                  title={m.fullName}
                  className={[
                    'inline-flex items-center justify-center',
                    'w-7 h-7 rounded-pill bg-green-50 text-green-700',
                    'border-2 border-surface',
                    'text-[10.5px] font-semibold',
                    i > 0 ? '-ml-2' : '',
                  ].join(' ')}
                >
                  {m.initials}
                </span>
              ))}
              <span className="text-xs text-ink-4 ml-2">
                {project.members.length} anggota
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDialog({ open: true, mode: 'create', status: 'todo' })}
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
          onTaskStatusChange={handleStatusChange}
        />
      </div>

      <TaskDetailDialog
        open={dialog.open}
        onClose={closeDialog}
        mode={dialog.open ? dialog.mode : 'create'}
        task={dialog.open && dialog.mode === 'edit' ? dialog.task : undefined}
        defaults={
          dialog.open && dialog.mode === 'create'
            ? { status: dialog.status, projectId }
            : { projectId }
        }
        onSubmit={handleDialogSubmit}
        onDelete={(task) => deleteMutation.mutate(task.id)}
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
