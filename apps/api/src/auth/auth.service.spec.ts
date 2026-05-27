import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/config.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
  };

  const mockConfig = {
    getJwtConfig: jest.fn().mockReturnValue({ secret: 'test-secret', expiresIn: '1h' }),
  };

  const mockOrg = {
    id: 'org-uuid',
    name: 'Ghanem Tech',
    slug: 'ghanemtech',
  };

  const mockUser = {
    id: 'user-uuid',
    email: 'admin@ghanemtech.co.id',
    name: 'Admin Ghanem',
    role: UserRole.ADMIN,
    organizationId: 'org-uuid',
    organization: mockOrg,
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    passwordHash: '',
  };

  beforeEach(async () => {
    // Generate a real bcrypt hash for 'Demo123!'
    mockUser.passwordHash = await bcrypt.hash('Demo123!', 10);

    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser });
    mockPrisma.user.update.mockResolvedValue({ ...mockUser, lastLoginAt: new Date() });
    mockPrisma.session.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: AppConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCredentials()', () => {
    it('returns tokens + user on valid credentials', async () => {
      const result = await service.validateCredentials({
        email: 'admin@ghanemtech.co.id',
        password: 'Demo123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('admin@ghanemtech.co.id');
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      await expect(
        service.validateCredentials({
          email: 'admin@ghanemtech.co.id',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.validateCredentials({
          email: 'nonexistent@test.com',
          password: 'Demo123!',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws UnauthorizedException for SUSPENDED user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        status: UserStatus.SUSPENDED,
      });

      await expect(
        service.validateCredentials({
          email: 'admin@ghanemtech.co.id',
          password: 'Demo123!',
        }),
      ).rejects.toThrow('suspended');
    });
  });

  describe('getProfile()', () => {
    it('returns user profile', async () => {
      const profile = await service.getProfile('user-uuid');
      expect(profile.email).toBe('admin@ghanemtech.co.id');
      expect(profile).not.toHaveProperty('passwordHash');
    });

    it('throws NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.getProfile('nonexistent-uuid')).rejects.toThrow('User not found');
    });
  });
});
