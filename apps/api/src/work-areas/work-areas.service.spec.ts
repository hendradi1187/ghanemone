import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkAreasService } from './work-areas.service';
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

describe('WorkAreasService', () => {
  let service: WorkAreasService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  const mockWorkArea = {
    id: 'wa-uuid-1',
    slug: 'wk-onwj',
    name: 'WK ONWJ',
    operator: 'PHE ONWJ',
    status: 'ACTIVE',
    contractStart: new Date('2018-08-09'),
    contractEnd: new Date('2048-08-08'),
    color: '#7a5cb8',
    totalAreaKm2: 12500,
    centerLat: -5.9,
    centerLon: 108.0,
    bboxJson: [107.1, -6.55, 109.1, -5.2],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockPrisma = {
      workArea: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
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
        WorkAreasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkAreasService>(WorkAreasService);
    prisma = mockPrisma as unknown as jest.Mocked<Partial<PrismaService>>;
  });

  afterEach(() => jest.clearAllMocks());

  // ---------------------------------------------------------------------------
  // findAll
  // ---------------------------------------------------------------------------

  describe('findAll', () => {
    it('returns paginated work areas', async () => {
      (prisma.workArea!.findMany as jest.Mock).mockResolvedValueOnce([mockWorkArea]);
      (prisma.workArea!.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.name).toBe('WK ONWJ');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------

  describe('findOne', () => {
    it('returns work area detail with geometry when found', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        {
          ...mockWorkArea,
          contract_start: mockWorkArea.contractStart,
          contract_end: mockWorkArea.contractEnd,
          total_area_km2: mockWorkArea.totalAreaKm2,
          center_lat: mockWorkArea.centerLat,
          center_lon: mockWorkArea.centerLon,
          bbox_json: mockWorkArea.bboxJson,
          geojson: '{"type":"Polygon","coordinates":[[[107.1,-5.55],[109.1,-5.85],[107.1,-5.55]]]}',
          created_at: mockWorkArea.createdAt,
          updated_at: mockWorkArea.updatedAt,
        },
      ]);

      const result = await service.findOne('wa-uuid-1');

      expect(result.id).toBe('wa-uuid-1');
      expect(result.name).toBe('WK ONWJ');
      expect(result.geometry).not.toBeNull();
      expect((result.geometry as Record<string, unknown>)?.['type']).toBe('Polygon');
    });

    it('throws NotFoundException for unknown ID', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      await expect(service.findOne('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------

  describe('create', () => {
    const validPolygon = {
      type: 'Polygon',
      coordinates: [[[107.1, -5.55], [108.9, -5.4], [108.8, -6.35], [107.05, -6.1], [107.1, -5.55]]],
    };

    it('rejects non-Polygon geometry', async () => {
      await expect(
        service.create(
          {
            name: 'WK Test',
            slug: 'wk-test',
            operator: 'Test Co',
            contractStart: '2020-01-01',
            contractEnd: '2040-01-01',
            geometry: { type: 'Point', coordinates: [107, -5] },
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate slug', async () => {
      (prisma.workArea!.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkArea);

      await expect(
        service.create(
          {
            name: 'WK New',
            slug: 'wk-onwj',
            operator: 'Test Co',
            contractStart: '2020-01-01',
            contractEnd: '2040-01-01',
            geometry: validPolygon,
          },
          adminUser,
        ),
      ).rejects.toThrow('already exists');
    });

    it('calls $queryRaw INSERT and returns detail on success', async () => {
      (prisma.workArea!.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ id: 'new-uuid' }]) // INSERT
        .mockResolvedValueOnce([                     // findOne SELECT
          {
            id: 'new-uuid',
            slug: 'wk-new',
            name: 'WK New',
            operator: 'Test Co',
            status: 'ACTIVE',
            contract_start: new Date('2020-01-01'),
            contract_end: new Date('2040-01-01'),
            color: null,
            total_area_km2: null,
            center_lat: null,
            center_lon: null,
            bbox_json: null,
            geojson: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);

      const result = await service.create(
        {
          name: 'WK New',
          slug: 'wk-new',
          operator: 'Test Co',
          contractStart: '2020-01-01',
          contractEnd: '2040-01-01',
          geometry: validPolygon,
        },
        adminUser,
      );

      expect(result.id).toBe('new-uuid');
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });
  });
});
