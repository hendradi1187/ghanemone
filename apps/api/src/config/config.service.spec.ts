import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let nestConfig: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockNestConfig = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        { provide: ConfigService, useValue: mockNestConfig },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
    nestConfig = mockNestConfig;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isProduction()', () => {
    it('returns true when NODE_ENV=production', () => {
      nestConfig.get.mockReturnValueOnce('production'); // nodeEnv
      expect(service.isProduction()).toBe(true);
    });

    it('returns false when NODE_ENV=development', () => {
      nestConfig.get.mockReturnValueOnce('development');
      expect(service.isProduction()).toBe(false);
    });
  });

  describe('isDevelopment()', () => {
    it('returns true when NODE_ENV=development', () => {
      nestConfig.get.mockReturnValueOnce('development');
      expect(service.isDevelopment()).toBe(true);
    });
  });

  describe('getJwtConfig()', () => {
    it('returns jwt secret and expiresIn', () => {
      nestConfig.get
        .mockReturnValueOnce('super-secret-key-at-least-32-chars-long') // JWT_SECRET
        .mockReturnValueOnce('1h'); // JWT_EXPIRES_IN
      const jwtConfig = service.getJwtConfig();
      expect(jwtConfig.secret).toBe('super-secret-key-at-least-32-chars-long');
      expect(jwtConfig.expiresIn).toBe('1h');
    });

    it('throws when JWT_SECRET is missing', () => {
      nestConfig.get.mockReturnValueOnce(undefined); // JWT_SECRET missing
      expect(() => service.getJwtConfig()).toThrow('JWT_SECRET is not configured');
    });
  });

  describe('getCorsOrigins()', () => {
    it('splits comma-separated origins', () => {
      nestConfig.get.mockReturnValueOnce('http://localhost:5173,http://localhost:5174');
      const origins = service.getCorsOrigins();
      expect(origins).toEqual(['http://localhost:5173', 'http://localhost:5174']);
    });

    it('trims whitespace around origins', () => {
      nestConfig.get.mockReturnValueOnce(' http://localhost:5173 , http://localhost:5174 ');
      const origins = service.getCorsOrigins();
      expect(origins).toEqual(['http://localhost:5173', 'http://localhost:5174']);
    });
  });

  describe('getDatabaseUrl()', () => {
    it('returns database url', () => {
      nestConfig.get.mockReturnValueOnce('postgresql://user:pass@localhost:5432/db');
      expect(service.getDatabaseUrl()).toBe('postgresql://user:pass@localhost:5432/db');
    });

    it('throws when DATABASE_URL is missing', () => {
      nestConfig.get.mockReturnValueOnce(undefined);
      expect(() => service.getDatabaseUrl()).toThrow('DATABASE_URL is not configured');
    });
  });
});
