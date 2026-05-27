import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppConfigModule } from '../src/config/config.module';
import { HealthModule } from '../src/health/health.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E test for /health and /readiness endpoints.
 * Uses a mock PrismaService to avoid requiring a real DB connection in CI.
 */
describe('HealthController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    isHealthy: jest.fn().mockResolvedValue(true),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    // Provide minimal env for ConfigModule validation
    process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost:5432/test_db';
    process.env['REDIS_URL'] = 'redis://localhost:6379';
    process.env['JWT_SECRET'] = 'test-secret-that-is-at-least-32-characters-long';
    process.env['MINIO_ENDPOINT'] = 'localhost';
    process.env['MINIO_ACCESS_KEY'] = 'test';
    process.env['MINIO_SECRET_KEY'] = 'test';
    process.env['MEILISEARCH_HOST'] = 'http://localhost:7700';
    process.env['MEILISEARCH_KEY'] = 'testKey';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule, HealthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String) as string,
        uptime: expect.any(Number) as number,
      });
    });
  });

  describe('GET /readiness', () => {
    it('returns 200 when DB is healthy', async () => {
      mockPrismaService.isHealthy.mockResolvedValueOnce(true);
      const response = await request(app.getHttpServer())
        .get('/readiness')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        checks: {
          database: { status: 'ok' },
        },
      });
    });

    it('returns 503 when DB is unhealthy', async () => {
      mockPrismaService.isHealthy.mockResolvedValueOnce(false);
      const response = await request(app.getHttpServer())
        .get('/readiness')
        .expect(503);

      expect(response.body.status).toBe('down');
      expect(response.body.checks.database.status).toBe('down');
    });
  });
});
