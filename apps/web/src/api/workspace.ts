/**
 * Workspace API — mock client untuk projects + tasks dengan localStorage persist.
 *
 * Phase 8.12. Tasks bisa di-CRUD; state di-mirror ke localStorage supaya
 * refresh tetap preserve. Projects read-only di Phase 8.
 *
 * localStorage key: `ghanem.workspace.tasks`.
 * Initial seed: lazy-read sekali; jika belum ada di localStorage, write
 * `WORKSPACE_TASKS_SEED` ke storage agar consumer berikutnya consistent.
 */
import {
  TASK_STATUSES,
  WORKSPACE_PROJECTS,
  WORKSPACE_TASKS_SEED,
  type Project,
  type Task,
  type TaskStatus,
} from '../mocks/workspace';

const STORAGE_KEY = 'ghanem.workspace.tasks';

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 80, max = 220): number {
  return min + Math.floor(Math.random() * (max - min));
}

/* ─── localStorage helpers ─────────────────────────────────────────────── */

function isValidTask(v: unknown): v is Task {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['id'] === 'string' &&
    typeof o['projectId'] === 'string' &&
    typeof o['title'] === 'string' &&
    typeof o['status'] === 'string' &&
    TASK_STATUSES.includes(o['status'] as TaskStatus)
  );
}

function readTasks(): Task[] {
  if (typeof window === 'undefined') return [...WORKSPACE_TASKS_SEED];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit — seed storage dengan baseline.
      const seed = [...WORKSPACE_TASKS_SEED];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...WORKSPACE_TASKS_SEED];
    return parsed.filter(isValidTask);
  } catch (err) {
    void err;
    return [...WORKSPACE_TASKS_SEED];
  }
}

function writeTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    // reason: quota/Safari Private — silent.
    void err;
  }
}

/* ─── Public API ───────────────────────────────────────────────────────── */

export async function getProjects(): Promise<Project[]> {
  await sleep(jitter());
  return [...WORKSPACE_PROJECTS];
}

export async function getProjectById(id: string): Promise<Project | null> {
  await sleep(jitter(60, 140));
  return WORKSPACE_PROJECTS.find((p) => p.id === id) ?? null;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  await sleep(jitter());
  return readTasks().filter((t) => t.projectId === projectId);
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  assigneeInitials: string;
  labels: string[];
  dueDate: string;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await sleep(jitter(100, 200));
  const task: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    status: input.status,
    assigneeId: input.assigneeId,
    assigneeInitials: input.assigneeInitials,
    labels: input.labels,
    dueDate: input.dueDate,
    createdAt: new Date().toISOString(),
  };
  const current = readTasks();
  writeTasks([task, ...current]);
  return task;
}

export async function updateTask(task: Task): Promise<Task> {
  await sleep(jitter(80, 160));
  const current = readTasks();
  const next = current.map((t) => (t.id === task.id ? task : t));
  writeTasks(next);
  return task;
}

/**
 * Patch status (dipanggil dari Kanban onDragEnd). Faster path — tanpa
 * round-trip read-modify-write di consumer; tetap async untuk consistency.
 */
export async function patchTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  // Tidak sleep — drag-drop harus feel instant.
  const current = readTasks();
  const idx = current.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const existing = current[idx]!;
  const updated: Task = { ...existing, status };
  const next = [...current];
  next[idx] = updated;
  writeTasks(next);
  return updated;
}

export async function deleteTask(id: string): Promise<{ ok: boolean }> {
  await sleep(jitter(60, 120));
  const current = readTasks();
  const next = current.filter((t) => t.id !== id);
  if (next.length === current.length) return { ok: false };
  writeTasks(next);
  return { ok: true };
}
