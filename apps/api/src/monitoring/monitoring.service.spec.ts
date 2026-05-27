import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertSeverity, MonitoringPipelineType, PipelineRunStatus, UserRole } from '@prisma/client';
import { PipelineRunsService } from './pipeline-runs.service';
import { AlertsService } from './alerts.service';
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

const MOCK_RUN = {
  id: 'run-uuid',
  name: 'Daily Ingestion — PHE ONWJ',
  type: MonitoringPipelineType.INGESTION,
  status: PipelineRunStatus.SUCCESS,
  startedAt: new Date('2026-05-01T08:00:00Z'),
  finishedAt: new Date('2026-05-01T08:05:00Z'),
  durationMs: 300000,
  recordCount: 1250,
  errorMessage: null,
  dataset: null,
  organizationId: 'org-2',
  metadata: null,
  createdAt: new Date('2026-05-01'),
};

const MOCK_ALERT = {
  id: 'alert-uuid',
  severity: AlertSeverity.CRITICAL,
  title: 'Pipeline FAILED',
  message: 'Ingestion pipeline for PHE ONWJ failed with error: connection timeout',
  source: 'PipelineRun',
  sourceId: 'run-uuid',
  acknowledged: false,
  acknowledgedAt: null,
  acknowledgedBy: null,
  acknowledgedById: null,
  metadata: null,
  createdAt: new Date('2026-05-01'),
};

describe('PipelineRunsService', () => {
  let service: PipelineRunsService;
  let prisma: {
    pipelineRun: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      groupBy: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      pipelineRun: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        groupBy: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineRunsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelineRunsService>(PipelineRunsService);
  });

  it('returns paginated pipeline runs', async () => {
    prisma.$transaction.mockResolvedValue([[MOCK_RUN], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.items[0]?.name).toBe('Daily Ingestion — PHE ONWJ');
  });

  it('returns pipeline run detail', async () => {
    prisma.pipelineRun.findUnique.mockResolvedValue(MOCK_RUN);

    const result = await service.findOne('run-uuid');
    expect(result.status).toBe(PipelineRunStatus.SUCCESS);
  });

  it('throws 404 for missing pipeline run', async () => {
    prisma.pipelineRun.findUnique.mockResolvedValue(null);

    await expect(service.findOne('bad-uuid')).rejects.toThrow(NotFoundException);
  });
});

describe('AlertsService', () => {
  let service: AlertsService;
  let prisma: {
    alert: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      groupBy: jest.Mock;
    };
    pipelineRun: {
      groupBy: jest.Mock;
    };
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      alert: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
      pipelineRun: {
        groupBy: jest.fn(),
      },
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('returns paginated alerts', async () => {
    prisma.$transaction.mockResolvedValue([[MOCK_ALERT], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.total).toBe(1);
    expect(result.items[0]?.severity).toBe(AlertSeverity.CRITICAL);
  });

  it('acknowledges an alert', async () => {
    prisma.alert.findUnique.mockResolvedValue(MOCK_ALERT);
    prisma.alert.update.mockResolvedValue({
      ...MOCK_ALERT,
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: { id: 'admin-uuid', name: 'Admin' },
    });

    const result = await service.acknowledge('alert-uuid', ADMIN_USER);
    expect(result.acknowledged).toBe(true);
  });

  it('throws 404 when acknowledging missing alert', async () => {
    prisma.alert.findUnique.mockResolvedValue(null);

    await expect(service.acknowledge('bad-uuid', ADMIN_USER)).rejects.toThrow(NotFoundException);
  });

  it('returns monitoring summary', async () => {
    // getSummary uses $transaction with $queryRaw calls returning raw rows
    prisma.$transaction.mockImplementation(
      async (fns: Array<Promise<unknown>>) => Promise.all(fns),
    );
    prisma.$queryRaw
      .mockResolvedValueOnce([
        { status: 'SUCCESS', count: '10' },
        { status: 'FAILED',  count: '2'  },
      ])
      .mockResolvedValueOnce([
        { severity: 'CRITICAL', count: '1' },
      ]);

    const result = await service.getSummary();
    expect(result.runs.success).toBe(10);
    expect(result.runs.failed).toBe(2);
    expect(result.alerts.critical).toBe(1);
  });
});
