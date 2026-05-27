import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TaskStatus, UserRole } from '@prisma/client';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';

const OPERATOR_USER: JwtPayload = {
  sub: 'op-uuid',
  email: 'op@test.com',
  name: 'Operator',
  role: UserRole.KKKS_OPERATOR,
  orgId: 'org-2',
  orgName: 'PHE ONWJ',
  orgSlug: 'phe-onwj',
};

const MOCK_TASK = {
  id: 'task-uuid',
  projectId: 'proj-uuid',
  title: 'Review documents',
  description: null,
  status: TaskStatus.TODO,
  priority: 'MED',
  assignee: null,
  assigneeId: null,
  dueDate: null,
  order: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
    project: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      task: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('listByProject', () => {
    it('returns kanban board grouped by status', async () => {
      prisma.project.findUnique.mockResolvedValue({ organizationId: 'org-2' });
      prisma.task.findMany.mockResolvedValue([
        { ...MOCK_TASK, status: TaskStatus.TODO },
        { ...MOCK_TASK, id: 'task-2', status: TaskStatus.DONE },
      ]);

      const result = await service.listByProject('proj-uuid', {}, OPERATOR_USER);

      expect(result.TODO).toHaveLength(1);
      expect(result.DONE).toHaveLength(1);
      expect(result.IN_PROGRESS).toHaveLength(0);
    });

    it('throws 403 for wrong org', async () => {
      prisma.project.findUnique.mockResolvedValue({ organizationId: 'other-org' });

      await expect(
        service.listByProject('proj-uuid', {}, OPERATOR_USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('creates a task', async () => {
      prisma.project.findUnique.mockResolvedValue({ organizationId: 'org-2' });
      prisma.task.create.mockResolvedValue(MOCK_TASK);

      const result = await service.create(
        'proj-uuid',
        { title: 'Review documents' },
        OPERATOR_USER,
      );

      expect(result.title).toBe('Review documents');
    });
  });

  describe('remove', () => {
    it('deletes a task', async () => {
      prisma.task.findUnique.mockResolvedValue(MOCK_TASK);
      prisma.project.findUnique.mockResolvedValue({ organizationId: 'org-2' });
      prisma.task.delete.mockResolvedValue(MOCK_TASK);

      await expect(service.remove('task-uuid', OPERATOR_USER)).resolves.toBeUndefined();
    });

    it('throws 404 for non-existent task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-uuid', OPERATOR_USER)).rejects.toThrow(NotFoundException);
    });
  });

  describe('move', () => {
    it('moves task atomically via transaction', async () => {
      prisma.task.findUnique.mockResolvedValue(MOCK_TASK);
      prisma.project.findUnique.mockResolvedValue({ organizationId: 'org-2' });
      const movedTask = { ...MOCK_TASK, status: TaskStatus.IN_PROGRESS, order: 1 };
      prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) =>
        fn(prisma),
      );
      prisma.task.updateMany.mockResolvedValue({ count: 0 });
      prisma.task.update.mockResolvedValue(movedTask);

      const result = await service.move(
        'task-uuid',
        { status: TaskStatus.IN_PROGRESS, order: 1 },
        OPERATOR_USER,
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.order).toBe(1);
    });
  });
});
