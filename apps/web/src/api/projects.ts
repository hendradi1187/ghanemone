/**
 * Projects API — real HTTP client for /api/v1/projects + /api/v1/tasks.
 *
 * Sprint 9.5 Phase 2. Replaces mock localStorage client in api/workspace.ts.
 *
 * Endpoints:
 *   GET    /projects                   paginated list
 *   GET    /projects/:id               detail with taskCounts
 *   POST   /projects                   create (KKKS_OPERATOR+)
 *   PATCH  /projects/:id               update
 *   DELETE /projects/:id               soft delete → ARCHIVED
 *
 *   GET    /projects/:projectId/tasks  KanbanBoardDto (4 columns grouped)
 *   POST   /projects/:projectId/tasks  create task
 *   PATCH  /tasks/:id                  update task fields
 *   DELETE /tasks/:id                  hard delete
 *   PATCH  /tasks/:id/move             drag-drop reorder {status, order}
 */
import { apiClient } from './client';

/* ─── Shared types ─────────────────────────────────────────────────────── */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MED' | 'HIGH' | 'URGENT';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface ProjectOwner {
  id: string;
  name: string;
  email: string;
}

export interface ProjectOrganization {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  color: string | null;
  owner: ProjectOwner;
  organization: ProjectOrganization;
  /** Total task count across all statuses (from list endpoint). */
  taskCount: number;
  /** Per-status task counts (only from detail endpoint `/projects/:id`). */
  taskCounts?: Partial<Record<TaskStatus, number>>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TaskAssignee | null;
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type KanbanBoardData = Record<TaskStatus, Task[]>;

/* ─── Paginated list response ──────────────────────────────────────────── */

export interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ─── Query param shapes ───────────────────────────────────────────────── */

export interface ListProjectsParams {
  status?: ProjectStatus;
  organizationId?: string;
  page?: number;
  limit?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

/* ─── Project API functions ────────────────────────────────────────────── */

export async function listProjects(params?: ListProjectsParams): Promise<PaginatedProjects> {
  return apiClient.get<PaginatedProjects>('/projects', {
    ...(params?.status && { status: params.status }),
    ...(params?.organizationId && { organizationId: params.organizationId }),
    ...(params?.page !== undefined && { page: params.page }),
    ...(params?.limit !== undefined && { limit: params.limit }),
  });
}

export async function getProject(id: string): Promise<Project> {
  return apiClient.get<Project>(`/projects/${id}`);
}

export async function createProject(input: {
  name: string;
  description?: string;
  organizationId: string;
  color?: string;
}): Promise<Project> {
  return apiClient.post<Project>('/projects', input);
}

export async function updateProject(id: string, input: {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}): Promise<Project> {
  return apiClient.patch<Project>(`/projects/${id}`, input);
}

export async function deleteProject(id: string): Promise<void> {
  return apiClient.delete<void>(`/projects/${id}`);
}

/* ─── Task API functions ───────────────────────────────────────────────── */

export async function getProjectTasks(projectId: string): Promise<KanbanBoardData> {
  return apiClient.get<KanbanBoardData>(`/projects/${projectId}/tasks`);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
  return apiClient.post<Task>(`/projects/${projectId}/tasks`, input);
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return apiClient.patch<Task>(`/tasks/${id}`, input);
}

export async function deleteTask(id: string): Promise<void> {
  return apiClient.delete<void>(`/tasks/${id}`);
}

/**
 * Move task to a new column (status) and reorder position.
 * Called from optimistic drag-drop handler in KanbanBoard.
 */
export async function moveTask(id: string, status: TaskStatus, order: number): Promise<Task> {
  return apiClient.patch<Task>(`/tasks/${id}/move`, { status, order });
}
