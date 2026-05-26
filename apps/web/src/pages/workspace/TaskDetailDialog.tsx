/**
 * TaskDetailDialog — modal create/edit task.
 *
 * Mode:
 *   - `mode='create'`: form kosong, defaultValues di-build dari `defaults`
 *     (mis. status pre-filled dari kolom yang user klik "+")
 *   - `mode='edit'`: form ter-populate dari `task`
 *
 * Validation via Zod.
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
import {
  TASK_STATUSES,
  TASK_STATUS_META,
  WORKSPACE_MEMBERS,
  type Task,
  type TaskStatus,
} from '../../mocks/workspace';

const taskSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  assigneeId: z.string().min(1, 'Pilih assignee'),
  labels: z.string().optional(),
  dueDate: z
    .string()
    .min(1, 'Pilih tanggal due')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export interface TaskDetailDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  /** Untuk mode='edit'. */
  task?: Task | null;
  /** Untuk mode='create' — default values (mis. status pre-filled). */
  defaults?: { status?: TaskStatus; projectId: string };
  /** Submit handler. Returns Promise yang resolve setelah persist. */
  onSubmit: (values: {
    title: string;
    description: string;
    status: TaskStatus;
    assigneeId: string;
    assigneeInitials: string;
    labels: string[];
    dueDate: string;
  }) => Promise<void>;
  /** Untuk mode='edit' — delete handler. */
  onDelete?: (task: Task) => void;
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
  defaults,
  onSubmit,
  onDelete,
}: TaskDetailDialogProps): JSX.Element {
  const defaultValues: TaskFormValues = useMemo(() => {
    if (mode === 'edit' && task) {
      return {
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assigneeId,
        labels: task.labels.join(', '),
        dueDate: task.dueDate,
      };
    }
    return {
      title: '',
      description: '',
      status: defaults?.status ?? 'todo',
      assigneeId: WORKSPACE_MEMBERS[0]?.id ?? '',
      labels: '',
      dueDate: todayIso(),
    };
  }, [mode, task, defaults]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const member = WORKSPACE_MEMBERS.find((m) => m.id === values.assigneeId);
    const labels = (values.labels ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    await onSubmit({
      title: values.title,
      description: values.description ?? '',
      status: values.status,
      assigneeId: values.assigneeId,
      assigneeInitials: member?.initials ?? '??',
      labels,
      dueDate: values.dueDate,
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
              ? 'Update detail task. Perubahan akan tersimpan ke browser ini.'
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

              <FormField<TaskFormValues> name="assigneeId" label="Assignee" required>
                {(field) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="md">
                      <SelectValue placeholder="Pilih assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSPACE_MEMBERS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.fullName} ({m.initials})
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
                required
                hint="Format: YYYY-MM-DD."
              >
                <Input type="date" />
              </FormField>

              <FormField<TaskFormValues>
                name="labels"
                label="Labels"
                hint="Pisahkan dengan koma. Mis. 'analysis, gis'."
              >
                <Input placeholder="analysis, gis" />
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
              <Button variant="primary" type="submit" loading={form.formState.isSubmitting}>
                {submitLabel}
              </Button>
            </Dialog.Footer>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog.Root>
  );
}
