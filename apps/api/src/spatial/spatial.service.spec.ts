import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SpatialService } from './spatial.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Unit tests for SpatialService.
 * PrismaService is mocked — no real DB connection required.
 */
describe('SpatialService', () => {
  let service: SpatialService;
  let prisma: jest.Mocked<Pick<PrismaService, '$queryRaw' | '$queryRawUnsafe' | '$executeRaw'>>;

  beforeEach(async () => {
    const mockPrisma = {
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpatialService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SpatialService>(SpatialService);
    prisma = mockPrisma as unknown as jest.Mocked<
      Pick<PrismaService, '$queryRaw' | '$queryRawUnsafe' | '$executeRaw'>
    >;
  });

  afterEach(() => jest.clearAllMocks());

  // ---------------------------------------------------------------------------
  // bboxQuery
  // ---------------------------------------------------------------------------

  describe('bboxQuery', () => {
    it('throws BadRequestException for inverted bbox (minLon >= maxLon)', async () => {
      await expect(
        service.bboxQuery({
          minLon: 120, minLat: -8, maxLon: 110, maxLat: 0,
          type: 'wells', limit: 10,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException for inverted bbox (minLat >= maxLat)', async () => {
      await expect(
        service.bboxQuery({
          minLon: 110, minLat: 0, maxLon: 120, maxLat: -8,
          type: 'datasets', limit: 10,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns FeatureCollection for wells bbox query', async () => {
      // bboxQuery now uses $queryRawUnsafe internally
      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([
        {
          id: 'abc-123',
          geojson: '{"type":"Point","coordinates":[107.8,-5.85]}',
          name: 'ONWJ-A01',
          operator: 'PHE ONWJ',
          type: 'PRODUCTION',
          status: 'ACTIVE',
          latitude: -5.85,
          longitude: 107.8,
          total_depth_m: 2800,
        },
      ]);

      const result = await service.bboxQuery({
        minLon: 107, minLat: -6.5, maxLon: 109, maxLat: -5,
        type: 'wells', limit: 10,
      });

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.features[0]?.id).toBe('abc-123');
      expect(result.features[0]?.geometry).toEqual({
        type: 'Point',
        coordinates: [107.8, -5.85],
      });
      expect(result.count).toBe(1);
    });

    it('sets nextCursor when result equals limit', async () => {
      const mockRows = Array.from({ length: 5 }, (_, i) => ({
        id: `id-${i}`,
        geojson: '{"type":"Point","coordinates":[107,0]}',
        name: `Well-${i}`,
        operator: 'PHE',
        type: 'PRODUCTION',
        status: 'ACTIVE',
        latitude: 0,
        longitude: 107,
        total_depth_m: 1000,
      }));

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(mockRows);

      const result = await service.bboxQuery({
        minLon: 100, minLat: -10, maxLon: 130, maxLat: 10,
        type: 'wells', limit: 5,
      });

      expect(result.nextCursor).toBe('id-4');
    });

    it('sets nextCursor to null when result is less than limit', async () => {
      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([
        {
          id: 'only-one',
          geojson: '{"type":"Point","coordinates":[107,0]}',
          name: 'Well-1',
          operator: 'PHE',
          type: 'PRODUCTION',
          status: 'ACTIVE',
          latitude: 0,
          longitude: 107,
          total_depth_m: 1000,
        },
      ]);

      const result = await service.bboxQuery({
        minLon: 100, minLat: -10, maxLon: 130, maxLat: 10,
        type: 'wells', limit: 5,
      });

      expect(result.nextCursor).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // withinQuery
  // ---------------------------------------------------------------------------

  describe('withinQuery', () => {
    it('throws BadRequestException when neither wktPolygon nor geojson provided', async () => {
      await expect(
        service.withinQuery({ type: 'wells' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException for invalid geojson JSON string', async () => {
      await expect(
        service.withinQuery({ type: 'wells', geojson: 'not-json' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns FeatureCollection for wells using wktPolygon', async () => {
      // withinQuery uses $queryRawUnsafe with wktPolygon path
      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([
        {
          id: 'well-id-1',
          geojson: '{"type":"Point","coordinates":[107.8,-5.85]}',
          name: 'ONWJ-A01',
          status: 'ACTIVE',
        },
      ]);

      const result = await service.withinQuery({
        type: 'wells',
        wktPolygon: 'POLYGON((107 -6.5, 109 -6.5, 109 -5, 107 -5, 107 -6.5))',
        limit: 500,
      });

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // transformGeometry
  // ---------------------------------------------------------------------------

  describe('transformGeometry', () => {
    it('returns transformed geometry with correct srid fields', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { result: '{"type":"Point","coordinates":[11974974.8,-716696.2]}' },
      ]);

      const result = await service.transformGeometry({
        geometry: { type: 'Point', coordinates: [107.5, -6.3] },
        fromSrid: 4326,
        toSrid: 3857,
      });

      expect(result.srid).toBe(3857);
      expect(result.fromSrid).toBe(4326);
      expect(result.geometry).toEqual({
        type: 'Point',
        coordinates: [11974974.8, -716696.2],
      });
    });

    it('throws BadRequestException when PostGIS returns null result', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ result: null }]);

      await expect(
        service.transformGeometry({
          geometry: { type: 'Point', coordinates: [107.5, -6.3] },
          fromSrid: 4326,
          toSrid: 99999,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // exportDatasetById
  // ---------------------------------------------------------------------------

  describe('exportDatasetById', () => {
    it('throws NotFoundException for unknown ID', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      await expect(
        service.exportDatasetById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns GeoJSON Feature for known dataset', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        {
          id: 'ds-abc',
          geojson: '{"type":"Polygon","coordinates":[[[100,-5],[105,-5],[105,0],[100,0],[100,-5]]]}',
          title: 'Test Dataset',
          category: 'SEISMIC',
          status: 'APPROVED',
          sensitivity_level: 'PUBLIC',
          center_lat: -2.5,
          center_lon: 102.5,
          bbox_json: [100, -5, 105, 0],
        },
      ]);

      const result = await service.exportDatasetById('ds-abc');

      expect(result['type']).toBe('Feature');
      expect(result['id']).toBe('ds-abc');
      expect((result['properties'] as Record<string, unknown>)['title']).toBe('Test Dataset');
    });
  });

  // ---------------------------------------------------------------------------
  // exportWorkAreas
  // ---------------------------------------------------------------------------

  describe('exportWorkAreas', () => {
    it('returns FeatureCollection from DB aggregate result', async () => {
      const mockFc = {
        type: 'FeatureCollection',
        totalFeatures: 8,
        features: [{ type: 'Feature', id: 'wk-1', geometry: null, properties: {} }],
      };

      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ fc: mockFc }]);

      const result = await service.exportWorkAreas();
      expect(result['type']).toBe('FeatureCollection');
      expect(result['totalFeatures']).toBe(8);
    });

    it('returns empty FeatureCollection when no rows returned', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ fc: null }]);
      const result = await service.exportWorkAreas();
      expect(result['type']).toBe('FeatureCollection');
    });
  });
});
