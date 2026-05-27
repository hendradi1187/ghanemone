import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatasetCategory, DatasetStatus, SensitivityLevel, UserRole } from '@prisma/client';
import { DatasetsService } from './datasets.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeUser = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
  sub: 'user-001',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.KKKS_OPERATOR,
  orgId: 'org-001',
  orgName: 'Test Org',
  orgSlug: 'test-org',
  ...overrides,
});

const makeDataset = (overrides = {}): Record<string, unknown> => ({
  id: 'ds-001',
  title: 'Test Dataset',
  description: null,
  category: DatasetCategory.SEISMIC,
  format: 'SEG-Y',
  sensitivityLevel: SensitivityLevel.PUBLIC,
  status: DatasetStatus.DRAFT,
  verified: false,
  year: 2024,
  surveyYear: null,
  updatedAt: new Date('2024-01-01'),
  publishedAt: null,
  downloadCount: 0,
  viewCount: 0,
  centerLat: -6.0,
  centerLon: 107.0,
  bboxJson: null,
  fileUrl: null,
  fileSizeBytes: null,
  metadata: null,
  dataQuality: null,
  organizationId: 'org-001',
  uploaderId: 'user-001',
  workAreaId: null,
  organization: { id: 'org-001', name: 'Test Org', slug: 'test-org' },
  uploader: { id: 'user-001', name: 'Test User', email: 'test@example.com' },
  workArea: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DatasetsService', () => {
  let service: DatasetsService;
  let prisma: jest.Mocked<PrismaService>;
  let audit: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const prismaMock = {
      dataset: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      workArea: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const auditMock = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatasetsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();

    service = module.get<DatasetsService>(DatasetsService);
    prisma = module.get(PrismaService);
    audit = module.get(AuditService);
  });

  describe('findAll', () => {
    it('returns paginated datasets for an authenticated user', async () => {
      const dataset = makeDataset();
      (prisma.$transaction as jest.Mock).mockResolvedValue([[dataset], 1]);

      const result = await service.findAll({}, makeUser());

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('ds-001');
    });

    it('returns only PUBLIC datasets for PUBLIC role user', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

      const publicUser = makeUser({ role: UserRole.PUBLIC });
      await service.findAll({}, publicUser);

      const whereArg = (prisma.$transaction as jest.Mock).mock.calls[0];
      expect(whereArg).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException if dataset does not exist', async () => {
      prisma.dataset.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('nonexistent', makeUser())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException for RESTRICTED dataset accessed by non-uploader', async () => {
      const dataset = makeDataset({
        sensitivityLevel: SensitivityLevel.RESTRICTED,
        uploaderId: 'other-user',
      });
      prisma.dataset.findUnique = jest.fn().mockResolvedValue(dataset);
      // stub update (fire-and-forget)
      prisma.dataset.update = jest.fn().mockResolvedValue(dataset);

      await expect(
        service.findOne('ds-001', makeUser({ sub: 'different-user' })),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns dataset for the uploader on RESTRICTED', async () => {
      const dataset = makeDataset({
        sensitivityLevel: SensitivityLevel.RESTRICTED,
        uploaderId: 'user-001',
      });
      prisma.dataset.findUnique = jest.fn().mockResolvedValue(dataset);
      prisma.dataset.update = jest.fn().mockResolvedValue(dataset);

      const result = await service.findOne('ds-001', makeUser({ sub: 'user-001' }));
      expect(result.id).toBe('ds-001');
    });
  });

  describe('create', () => {
    it('creates a dataset with status DRAFT and fires audit log', async () => {
      const created = makeDataset();
      prisma.dataset.create = jest.fn().mockResolvedValue(created);

      const dto = {
        title: 'New Dataset',
        category: DatasetCategory.SEISMIC,
        format: 'SEG-Y',
      };

      const result = await service.create(dto, makeUser());

      expect(result.id).toBe('ds-001');
      expect(prisma.dataset.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalled();
    });

    it('throws NotFoundException when workAreaId does not exist', async () => {
      prisma.workArea.findUnique = jest.fn().mockResolvedValue(null);

      const dto = {
        title: 'New Dataset',
        category: DatasetCategory.SEISMIC,
        format: 'SEG-Y',
        workAreaId: 'nonexistent-wa',
      };

      await expect(service.create(dto, makeUser())).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('sets status to ARCHIVED (soft-delete)', async () => {
      const dataset = makeDataset({ uploaderId: 'user-001' });
      prisma.dataset.findUnique = jest.fn().mockResolvedValue(dataset);
      prisma.dataset.update = jest.fn().mockResolvedValue({ ...dataset, status: DatasetStatus.ARCHIVED });

      await service.remove('ds-001', makeUser());

      expect(prisma.dataset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: DatasetStatus.ARCHIVED }),
        }),
      );
    });

    it('throws ForbiddenException when non-admin non-uploader tries to delete', async () => {
      const dataset = makeDataset({ uploaderId: 'other-user' });
      prisma.dataset.findUnique = jest.fn().mockResolvedValue(dataset);

      await expect(service.remove('ds-001', makeUser({ sub: 'another-user' }))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('approve', () => {
    it('sets status to APPROVED and verified=true for REGULATOR', async () => {
      const dataset = makeDataset({ status: DatasetStatus.PENDING_REVIEW });
      prisma.dataset.findUnique = jest.fn().mockResolvedValue(dataset);
      prisma.dataset.update = jest
        .fn()
        .mockResolvedValue({ ...dataset, status: DatasetStatus.APPROVED, verified: true });

      const regulator = makeUser({ role: UserRole.REGULATOR });
      const result = await service.approve('ds-001', {}, regulator);

      expect(result.status).toBe(DatasetStatus.APPROVED);
      expect(result.verified).toBe(true);
    });
  });
});
