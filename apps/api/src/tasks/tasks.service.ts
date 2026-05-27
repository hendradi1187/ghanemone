import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import type { MoveTaskDto } from './dto/move-task.dto';
import type { ListTasksDto } from './dto/list-tasks.dto';
import type { KanbanBoardDto, TaskResponseDto } from './dto/task-response.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // listByProject — grouped by status for Kanban board
  // ---------------------------------------------------------------------------
  async listByProject(
    projectId: string,
    dto: ListTasksDto,
    user: JwtPayload,
  ): Promise<KanbanBoardDto> {
    await this.assertProjectAccess(projectId, user);

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    const board: KanbanBoardDto = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };

    for (const t of tasks) {
      board[t.status].push(this.mapToResponse(t));
    }

    return board;
  }

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  async create(
    projectId: string,
    dto: CreateTaskDto,
    user: JwtPayload,
  ): Promise<TaskResponseDto> {
    await this.assertProjectAccess(projectId, user);

    const task = await this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? 'MED',
        assigneeId: dto.assigneeId ?? null,
        dueDate: dto.dueDate ?? null,
        order: dto.order ?? 0,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    this.logger.log(`Task ${task.id} created in project ${projectId} by user ${user.sub}`);
    return this.mapToResponse(task);
  }

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  async update(
    taskId: string,
    dto: UpdateTaskDto,
    user: JwtPayload,
  ): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    await this.assertProjectAccess(task.projectId, user);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return this.mapToResponse(updated);
  }

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------
  async remove(taskId: string, user: JwtPayload): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    await this.assertProjectAccess(task.projectId, user);

    await this.prisma.task.delete({ where: { id: taskId } });
    this.logger.log(`Task ${taskId} deleted by user ${user.sub}`);
  }

  // ---------------------------------------------------------------------------
  // move — drag-drop reorder (transaction-safe status + order update)
  // ---------------------------------------------------------------------------
  async move(
    taskId: string,
    dto: MoveTaskDto,
    user: JwtPayload,
  ): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    await this.assertProjectAccess(task.projectId, user);

    const newStatus = dto.status ?? task.status;
    const newOrder = dto.order;

    // Transaction: shift existing tasks to make room, then update moved task
    const updated = await this.prisma.$transaction(async (tx) => {
      // Shift tasks at or after the target order in the target status column
      await tx.task.updateMany({
        where: {
          projectId: task.projectId,
          status: newStatus,
          order: { gte: newOrder },
          id: { not: taskId },
        },
        data: { order: { increment: 1 } },
      });

      return tx.task.update({
        where: { id: taskId },
        data: { status: newStatus, order: newOrder },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    this.logger.log(
      `Task ${taskId} moved to status=${newStatus} order=${newOrder} by user ${user.sub}`,
    );
    return this.mapToResponse(updated);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async assertProjectAccess(projectId: string, user: JwtPayload): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    if (user.role !== UserRole.ADMIN && project.organizationId !== user.orgId) {
      throw new ForbiddenException('Access denied to this project');
    }
  }

  private mapToResponse(t: {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: string;
    assignee?: { id: string; name: string; email: string } | null;
    dueDate: Date | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }): TaskResponseDto {
    return {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority as TaskResponseDto['priority'],
      assignee: t.assignee ?? null,
      dueDate: t.dueDate,
      order: t.order,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }
}
