import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from './audit.constants';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: jest.Mocked<PrismaService>;

  const mockLog = {
    id: 'log-001',
    userId: 'user-001',
    action: AuditAction.USER_LOGIN,
    entity: 'User',
    entityId: 'user-001',
    metadata: null,
    ipAddress: null,
    userAgent: null,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const prismaMock = {
      auditLog: {
        create: jest.fn().mockResolvedValue(mockLog),
        findMany: jest.fn().mockResolvedValue([mockLog]),
        count: jest.fn().mockResolvedValue(1),
      },
      $transaction: jest.fn().mockResolvedValue([[mockLog], 1]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get(PrismaService);
  });

  describe('log', () => {
    it('creates an audit log entry', async () => {
      await service.log({
        userId: 'user-001',
        action: AuditAction.USER_LOGIN,
        entity: 'User',
        entityId: 'user-001',
        metadata: { email: 'test@example.com' },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: AuditAction.USER_LOGIN,
            entity: 'User',
          }),
        }),
      );
    });

    it('does NOT throw when Prisma fails (fire-and-forget safety)', async () => {
      prisma.auditLog.create = jest.fn().mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(
        service.log({ action: AuditAction.USER_LOGIN }),
      ).resolves.toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('returns paginated audit logs', async () => {
      const result = await service.findMany({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('maps DB model to response DTO correctly', async () => {
      const result = await service.findMany({});
      const item = result.items[0]!;

      expect(item.id).toBe('log-001');
      expect(item.action).toBe(AuditAction.USER_LOGIN);
      expect(item.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});
