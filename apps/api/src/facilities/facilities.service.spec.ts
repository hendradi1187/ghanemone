import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
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

const mockFacilityRow = {
  id: 'fac-uuid-1',
  name: 'Platform ONWJ-Alpha',
  type: 'PLATFORM',
  operator: 'PHE ONWJ',
  work_area_id: 'wa-uuid',
  latitude: -5.8,
  longitude: 107.9,
  status: 'ACTIVE',
  water_depth_m: 45,
  install_year: 1998,
  geojson: '{"type":"Point","coordinates":[107.9,-5.8]}',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

describe('FacilitiesService', () => {
  let service: FacilitiesService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    const mockPrisma = {
      facility: {
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
        FacilitiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
    prisma = mockPrisma as unknown as jest.Mocked<Partial<PrismaService>>;
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated facilities', async () => {
      const listItem = {
        id: 'fac-uuid-1',
        name: 'Platform ONWJ-Alpha',
        type: 'PLATFORM',
        operator: 'PHE ONWJ',
        workAreaId: 'wa-uuid',
        latitude: -5.8,
        longitude: 107.9,
        status: 'ACTIVE',
        waterDepthM: 45,
        installYear: 1998,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      (prisma.facility!.findMany as jest.Mock).mockResolvedValueOnce([listItem]);
      (prisma.facility!.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.items[0]?.name).toBe('Platform ONWJ-Alpha');
    });
  });

  describe('findOne', () => {
    it('returns facility with GeoJSON point geometry', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([mockFacilityRow]);

      const result = await service.findOne('fac-uuid-1');
      expect(result.id).toBe('fac-uuid-1');
      expect(result.geometry).toEqual({ type: 'Point', coordinates: [107.9, -5.8] });
      expect(result.waterDepthM).toBe(45);
    });

    it('throws NotFoundException for unknown facility', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      await expect(service.findOne('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('inserts facility with point geometry from lat/lon', async () => {
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ id: 'new-fac-uuid' }])
        .mockResolvedValueOnce([{ ...mockFacilityRow, id: 'new-fac-uuid' }]);

      const result = await service.create(
        {
          name: 'Platform Test',
          type: 'PLATFORM',
          operator: 'PHE ONWJ',
          latitude: -5.8,
          longitude: 107.9,
          waterDepthM: 45,
          installYear: 2000,
        },
        adminUser,
      );

      expect(result.id).toBe('new-fac-uuid');
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });
  });

  describe('GET endpoint integration (mock)', () => {
    it('findAll returns proper pagination structure', async () => {
      (prisma.facility!.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.facility!.count as jest.Mock).mockResolvedValueOnce(0);

      const result = await service.findAll({ page: 2, limit: 10 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});
