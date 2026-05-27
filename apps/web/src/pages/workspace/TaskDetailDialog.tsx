/**
 * TaskDetailDialog — modal create/edit task.
 *
 * Sprint 9.5 Phase 2: Updated to use Task/TaskStatus/TaskPriority from api/projects.ts.
 * Backend task shape: assignee is { id, name } | null, priority is LOW/MED/HIGH/URGENT.
 * Assignee field simplified to text input (no member catalog from backend yet).
 *
 * Mode:
 *   - `mode='create'`: form kosong, defaultStatus pre-filled
 *   - `mode='edit'`: form populated from task
 *
 * A11y:
 *   - Dialog dari @ghanem/ui handle focus trap + ESC
 *   - FormField wires label + error + aria-describedby otomatis
 */
import { useEffect, useMemo } from 'react';
import {
  Button,
  Dialog,
  FormField,
  FormProvider,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useForm,
  zodResolver,
} from '@ghanem/ui';
import { z } from 'zod';
import type { Task, TaskPriority, TaskStatus } from '../../api/projects';
import { TASK_STATUS_META, TASK_STATUSES } from './KanbanBoard';

const PRIORITIES: readonly TaskPriority[] = ['LOW', 'MED', 'HIGH', 'URGENT'];
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Rendah',
  MED: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Urgen',
};

const taskSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MED', 'HIGH', 'URGENT']),
  assigneeId: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: 'Format tanggal tidak valid' }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export interface TaskDetailDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSubmit: (values: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
  }) => Promise<void>;
  onDelete?: (task: Task) => void;
  isSubmitting?: boolean;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TaskDetailDialog({
  open,
  onClose,
  mode,
  task,
  defaultStatus = 'TODO',
  onSubmit,
  onDelete,
  isSubmitting = false,
}: TaskDetailDialogProps): JSX.Element {
  const defaultValues: TaskFormValues = useMemo(() => {
    if (mode === 'edit' && task) {
      return {
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id ?? '',
        dueDate: task.dueDate ?? todayIso(),
      };
    }
    return {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'MED' as TaskPriority,
      assigneeId: '',
      dueDate: todayIso(),
    };
  }, [mode, task, defaultStatus]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      description: values.description ?? '',
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
    });
  });

  const title = mode === 'edit' ? 'Edit task' : 'Task baru';
  const submitLabel = mode === 'edit' ? 'Simpan perubahan' : 'Buat task';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Dialog.Content size="lg">
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>
            {mode === 'edit'
              ? 'Update detail task. Perubahan akan tersimpan ke server.'
              : 'Buat task baru di project ini. Status default dari kolom yang Anda pilih.'}
          </Dialog.Description>
        </Dialog.Header>

        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <FormField<TaskFormValues>
              name="title"
              label="Judul"
              required
              hint="Maksimal 120 karakter."
            >
              <Input placeholder="Mis. Compile production data Mei 2026" autoFocus />
            </FormField>

            <FormField<TaskFormValues>
              name="description"
              label="Deskripsi"
              hint="Tambahkan detail / acceptance criteria."
            >
              <Textarea placeholder="Deskripsi task…" rows={3} />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField<TaskFormValues> name="status" label="Status" required>
                {(field) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="md">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {TASK_STATUS_META[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField<TaskFormValues> name="priority" label="Prioritas" required>
                {(field) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="md">
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField<TaskFormValues>
                name="dueDate"
                label="Jatuh tempo"
                hint="Format: YYYY-MM-DD."
              >
                <Input type="date" />
              </FormField>

              <FormField<TaskFormValues>
                name="assigneeId"
                label="Assignee ID"
                hint="User ID dari anggota tim (opsional)."
              >
                <Input placeholder="usr-uuid" />
              </FormField>
            </div>

            <Dialog.Footer>
              {mode === 'edit' && task && onDelete ? (
                <Button
                  variant="danger"
                  type="button"
                  onClick={() => onDelete(task)}
                  className="mr-auto"
                >
                  Hapus
                </Button>
              ) : null}
              <Dialog.Close asChild>
                <Button variant="secondary" type="button">
                  Batal
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                loading={form.formState.isSubmitting || isSubmitting}
              >
                {submitLabel}
              </Button>
            </Dialog.Footer>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog.Root>
  );
}
