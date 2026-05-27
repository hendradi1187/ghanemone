import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WellsService } from './wells.service';
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

const mockWellRow = {
  id: 'well-uuid-1',
  uwi: 'GID-WJ-001',
  name: 'ONWJ-A01',
  operator: 'PHE ONWJ',
  work_area_id: 'wa-uuid',
  type: 'PRODUCTION',
  status: 'ACTIVE',
  latitude: -5.85,
  longitude: 107.8,
  total_depth_m: 2800,
  spud_date: null,
  td_date: null,
  kb_elevation_m: null,
  formation: 'Cibulakan Formation',
  reservoir: null,
  geojson: '{"type":"Point","coordinates":[107.8,-5.85]}',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

describe('WellsService', () => {
  let service: WellsService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    const mockPrisma = {
      well: {
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
        WellsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WellsService>(WellsService);
    prisma = mockPrisma as unknown as jest.Mocked<Partial<PrismaService>>;
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated wells list', async () => {
      const mockItem = {
        id: 'well-uuid-1',
        uwi: 'GID-WJ-001',
        name: 'ONWJ-A01',
        operator: 'PHE ONWJ',
        workAreaId: 'wa-uuid',
        type: 'PRODUCTION',
        status: 'ACTIVE',
        latitude: -5.85,
        longitude: 107.8,
        totalDepthM: 2800,
        formation: 'Cibulakan Formation',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      (prisma.well!.findMany as jest.Mock).mockResolvedValueOnce([mockItem]);
      (prisma.well!.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.items[0]?.name).toBe('ONWJ-A01');
    });
  });

  describe('findOne', () => {
    it('returns well detail with geometry', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([mockWellRow]);

      const result = await service.findOne('well-uuid-1');
      expect(result.id).toBe('well-uuid-1');
      expect(result.geometry).toEqual({ type: 'Point', coordinates: [107.8, -5.85] });
    });

    it('throws NotFoundException for unknown well', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      await expect(service.findOne('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('throws ConflictException for duplicate UWI', async () => {
      (prisma.well!.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing' });

      await expect(
        service.create(
          {
            uwi: 'GID-WJ-001',
            name: 'ONWJ-A01',
            operator: 'PHE ONWJ',
            type: 'PRODUCTION',
            latitude: -5.85,
            longitude: 107.8,
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('inserts well via $queryRaw with point geometry', async () => {
      (prisma.well!.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ id: 'new-well-uuid' }]) // INSERT
        .mockResolvedValueOnce([mockWellRow]);              // findOne

      const result = await service.create(
        {
          name: 'ONWJ-A01',
          operator: 'PHE ONWJ',
          type: 'PRODUCTION',
          latitude: -5.85,
          longitude: 107.8,
        },
        adminUser,
      );

      expect(result.id).toBe('well-uuid-1');
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });
  });
});
