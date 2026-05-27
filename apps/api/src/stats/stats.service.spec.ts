import { Test, TestingModule } from '@nestjs/testing';
import { DatasetStatus } from '@prisma/client';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let prisma: {
    dataset: {
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    organization: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    workArea: { count: jest.Mock };
    well: { count: jest.Mock };
    facility: { count: jest.Mock };
    pipeline: { count: jest.Mock };
    alert: {
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      dataset: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      organization: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      workArea: { count: jest.fn() },
      well: { count: jest.fn() },
      facility: { count: jest.fn() },
      pipeline: { count: jest.fn() },
      alert: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  describe('getOverview', () => {
    it('returns aggregate platform counts', async () => {
      // $transaction returns array of results in order
      prisma.$transaction.mockResolvedValue([45, 10, 8, 25, 12, 4, 3, 5, 2]);
      prisma.dataset.count.mockResolvedValue(28); // approved count for dataAvailability

      const result = await service.getOverview();

      expect(result.totalDatasets).toBe(45);
      expect(result.totalProviders).toBe(10);
      expect(result.totalWorkAreas).toBe(8);
      expect(result.totalWells).toBe(25);
      expect(result.totalFacilities).toBe(12);
      expect(result.totalPipelines).toBe(4);
      expect(result.growthLastMonth).toBe(3);
      expect(result.pendingApprovals).toBe(5);
      expect(result.activeAlerts).toBe(2);
      // dataAvailability = round(28/45 * 100) = 62
      expect(result.dataAvailability).toBe(62);
    });
  });

  describe('getDatasetsByCategory', () => {
    it('returns datasets grouped by category', async () => {
      prisma.dataset.groupBy.mockResolvedValue([
        { category: 'SEISMIC', _count: { category: 8 } },
        { category: 'WELL_LOG', _count: { category: 7 } },
      ]);

      const result = await service.getDatasetsByCategory();

      expect(result).toHaveLength(2);
      expect(result[0]?.category).toBe('SEISMIC');
      expect(result[0]?.label).toBe('Seismic');
      expect(result[0]?.count).toBe(8);
    });
  });

  describe('getDatasetsByMonth', () => {
    it('returns monthly dataset counts', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { month: '2026-04', count: '5' },
        { month: '2026-05', count: '3' },
      ]);

      const result = await service.getDatasetsByMonth();

      expect(result).toHaveLength(2);
      expect(result[0]?.month).toBe('2026-04');
      expect(result[0]?.count).toBe(5);
      expect(result[0]?.label).toMatch(/Apr 2026/);
    });
  });

  describe('getUploadsByProvider', () => {
    it('returns top providers with names resolved', async () => {
      prisma.dataset.groupBy.mockResolvedValue([
        { organizationId: 'org-1', _count: { organizationId: 10 } },
        { organizationId: 'org-2', _count: { organizationId: 6 } },
      ]);
      prisma.organization.findMany.mockResolvedValue([
        { id: 'org-1', name: 'PHE ONWJ' },
        { id: 'org-2', name: 'Pertamina Hulu Mahakam' },
      ]);

      const result = await service.getUploadsByProvider();

      expect(result).toHaveLength(2);
      expect(result[0]?.providerName).toBe('PHE ONWJ');
      expect(result[0]?.count).toBe(10);
    });
  });

  describe('getComplianceStatus', () => {
    it('returns dataset counts per status', async () => {
      prisma.dataset.groupBy.mockResolvedValue([
        { status: DatasetStatus.DRAFT, _count: { status: 8 } },
        { status: DatasetStatus.APPROVED, _count: { status: 28 } },
        { status: DatasetStatus.PENDING_REVIEW, _count: { status: 5 } },
        { status: DatasetStatus.REJECTED, _count: { status: 2 } },
        { status: DatasetStatus.ARCHIVED, _count: { status: 2 } },
      ]);

      const result = await service.getComplianceStatus();

      expect(result.draft).toBe(8);
      expect(result.approved).toBe(28);
      expect(result.pendingReview).toBe(5);
      expect(result.total).toBe(45);
    });
  });
});
