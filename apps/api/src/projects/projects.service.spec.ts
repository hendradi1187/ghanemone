import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectStatus, UserRole } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';

const ADMIN_USER: JwtPayload = {
  sub: 'admin-uuid',
  email: 'admin@test.com',
  name: 'Admin',
  role: UserRole.ADMIN,
  orgId: 'org-1',
  orgName: 'Ghanem Tech',
  orgSlug: 'ghanemtech',
};

const OPERATOR_USER: JwtPayload = {
  sub: 'op-uuid',
  email: 'op@test.com',
  name: 'Operator',
  role: UserRole.KKKS_OPERATOR,
  orgId: 'org-2',
  orgName: 'PHE ONWJ',
  orgSlug: 'phe-onwj',
};

const MOCK_PROJECT = {
  id: 'proj-uuid',
  name: 'Test Project',
  slug: 'test-project',
  description: null,
  status: ProjectStatus.ACTIVE,
  color: null,
  ownerId: 'op-uuid',
  organizationId: 'org-2',
  owner: { id: 'op-uuid', name: 'Operator', email: 'op@test.com' },
  organization: { id: 'org-2', name: 'PHE ONWJ', slug: 'phe-onwj' },
  _count: { tasks: 3 },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    project: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    task: {
      groupBy: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      task: {
        groupBy: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('findAll', () => {
    it('returns paginated projects for org-scoped user', async () => {
      prisma.$transaction.mockResolvedValue([[MOCK_PROJECT], 1]);

      const result = await service.findAll({ page: 1, limit: 20 }, OPERATOR_USER);

      expect(result.total).toBe(1);
      expect(result.items[0]?.id).toBe('proj-uuid');
    });

    it('admin can query across all orgs', async () => {
      prisma.$transaction.mockResolvedValue([[MOCK_PROJECT], 1]);

      const result = await service.findAll(
        { page: 1, limit: 20, organizationId: 'org-2' },
        ADMIN_USER,
      );

      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns project detail with task counts', async () => {
      prisma.project.findUnique.mockResolvedValue(MOCK_PROJECT);
      prisma.task.groupBy.mockResolvedValue([
        { status: 'TODO', _count: { status: 2 } },
        { status: 'DONE', _count: { status: 1 } },
      ]);

      const result = await service.findOne('proj-uuid', OPERATOR_USER);

      expect(result.id).toBe('proj-uuid');
      expect(result.taskCounts.TODO).toBe(2);
      expect(result.taskCounts.DONE).toBe(1);
    });

    it('throws 404 when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-uuid', ADMIN_USER)).rejects.toThrow(NotFoundException);
    });

    it('throws 403 when user is in wrong org', async () => {
      prisma.project.findUnique.mockResolvedValue({
        ...MOCK_PROJECT,
        organizationId: 'other-org',
      });

      await expect(service.findOne('proj-uuid', OPERATOR_USER)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('creates a project', async () => {
      prisma.project.findUnique.mockResolvedValue(null); // slug not taken
      prisma.project.create.mockResolvedValue({ ...MOCK_PROJECT, _count: { tasks: 0 } });

      const result = await service.create(
        { name: 'Test', slug: 'test-project' },
        OPERATOR_USER,
      );

      expect(result.name).toBe('Test Project');
      expect(result.taskCounts.TODO).toBe(0);
    });

    it('throws 409 on duplicate slug', async () => {
      prisma.project.findUnique.mockResolvedValue(MOCK_PROJECT);

      await expect(
        service.create({ name: 'Test', slug: 'test-project' }, OPERATOR_USER),
      ).rejects.toThrow(ConflictException);
    });

    it('throws 403 when operator tries to create in different org', async () => {
      await expect(
        service.create(
          { name: 'Test', slug: 'test', organizationId: 'different-org' },
          OPERATOR_USER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('archives the project', async () => {
      prisma.project.findUnique.mockResolvedValue(MOCK_PROJECT);
      prisma.project.update.mockResolvedValue({ ...MOCK_PROJECT, status: ProjectStatus.ARCHIVED });

      await expect(service.remove('proj-uuid', OPERATOR_USER)).resolves.toBeUndefined();
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: ProjectStatus.ARCHIVED } }),
      );
    });

    it('throws 403 when non-owner tries to archive', async () => {
      prisma.project.findUnique.mockResolvedValue({ ...MOCK_PROJECT, ownerId: 'other-user' });

      await expect(service.remove('proj-uuid', OPERATOR_USER)).rejects.toThrow(ForbiddenException);
    });
  });
});
