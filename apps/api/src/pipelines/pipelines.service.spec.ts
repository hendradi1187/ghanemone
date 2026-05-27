import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesService } from './pipelines.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { UserRole } from '@prisma/client';

const adminUser: JwtPayload = {
  sub: 'admin-uuid',
  email: 'admin@test.com',
  name: 'Admin',
  role: UserRole.ADMIN,
  orgId: 'org-uuid',
  orgName: 'SKK Migas',
  orgSlug: 'skk-migas',
};

const mockPipelineRow = {
  id: 'pipe-uuid-1',
  name: 'ONWJ Offshore Trunk Line',
  operator: 'PHE ONWJ',
  work_area_id: 'wa-uuid',
  type: 'MULTIPHASE',
  status: 'ACTIVE',
  length_km: 8.5,
  diameter_in: 24,
  pressure_bar: null,
  geojson: '{"type":"LineString","coordinates":[[107.9,-5.8],[108.0,-5.9]]}',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

describe('PipelinesService', () => {
  let service: PipelinesService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    const mockPrisma = {
      pipeline: {
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
    prisma = mockPrisma as unknown as jest.Mocked<Partial<PrismaService>>;
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated pipelines', async () => {
      const listItem = {
        id: 'pipe-uuid-1',
        name: 'ONWJ Offshore Trunk Line',
        operator: 'PHE ONWJ',
        workAreaId: 'wa-uuid',
        type: 'MULTIPHASE',
        status: 'ACTIVE',
        lengthKm: 8.5,
        diameterIn: 24,
        pressureBar: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      (prisma.pipeline!.findMany as jest.Mock).mockResolvedValueOnce([listItem]);
      (prisma.pipeline!.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.items[0]?.name).toBe('ONWJ Offshore Trunk Line');
    });
  });

  describe('findOne', () => {
    it('returns pipeline with GeoJSON geometry', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([mockPipelineRow]);

      const result = await service.findOne('pipe-uuid-1');
      expect(result.id).toBe('pipe-uuid-1');
      expect(result.geometry).toEqual({
        type: 'LineString',
        coordinates: [[107.9, -5.8], [108.0, -5.9]],
      });
      expect(result.lengthKm).toBe(8.5);
    });

    it('throws NotFoundException for unknown pipeline', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      await expect(service.findOne('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('rejects non-LineString geometry', async () => {
      await expect(
        service.create(
          {
            name: 'Test Pipeline',
            operator: 'PHE',
            type: 'GAS',
            line: { type: 'Polygon', coordinates: [[[107, -5], [108, -5], [108, -6], [107, -5]]] },
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('inserts pipeline and returns detail with length_km', async () => {
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ id: 'new-pipe-uuid' }])
        .mockResolvedValueOnce([{ ...mockPipelineRow, id: 'new-pipe-uuid' }]);

      const result = await service.create(
        {
          name: 'ONWJ Offshore Trunk Line',
          operator: 'PHE ONWJ',
          type: 'MULTIPHASE',
          line: {
            type: 'LineString',
            coordinates: [[107.9, -5.8], [108.0, -5.9], [108.1, -6.0]],
          },
          diameterIn: 24,
        },
        adminUser,
      );

      expect(result.id).toBe('new-pipe-uuid');
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });
  });
});
