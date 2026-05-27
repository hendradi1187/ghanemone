import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';

describe('UsersService', () => {
  let service: UsersService;

  const mockOrg = { id: 'org-uuid', name: 'Ghanem Tech' };
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
    passwordHash: 'hashed',
  };

  const adminPayload: JwtPayload = {
    sub: 'user-uuid',
    email: 'admin@ghanemtech.co.id',
    name: 'Admin',
    role: UserRole.ADMIN,
    orgId: 'org-uuid',
    orgName: 'Ghanem Tech',
    orgSlug: 'ghanemtech',
  };

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
    session: {
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('returns all users for ADMIN', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([{ ...mockUser }]);
      const users = await service.findAll(adminPayload);
      expect(users).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filters by orgId for KKKS_OPERATOR', async () => {
      const kkksPayload: JwtPayload = {
        ...adminPayload,
        role: UserRole.KKKS_OPERATOR,
        orgId: 'org-uuid',
      };
      mockPrisma.user.findMany.mockResolvedValueOnce([{ ...mockUser }]);
      await service.findAll(kkksPayload);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-uuid' },
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('returns user for ADMIN', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser });
      const user = await service.findOne('user-uuid', adminPayload);
      expect(user.email).toBe('admin@ghanemtech.co.id');
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent', adminPayload)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for non-admin viewing other user', async () => {
      const analystPayload: JwtPayload = {
        ...adminPayload,
        sub: 'different-user-uuid',
        role: UserRole.ANALYST,
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser });
      await expect(service.findOne('user-uuid', analystPayload)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create()', () => {
    it('creates a user and returns DTO', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // no existing user
      mockPrisma.organization.findUnique.mockResolvedValueOnce(mockOrg);
      mockPrisma.user.create.mockResolvedValueOnce({ ...mockUser });

      const dto = {
        email: 'new@ghanemtech.co.id',
        name: 'New User',
        password: 'Demo123!',
        organizationId: 'org-uuid',
      };

      const result = await service.create(dto);
      expect(result.email).toBe('admin@ghanemtech.co.id'); // mocked return
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('throws ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser });
      await expect(
        service.create({
          email: 'admin@ghanemtech.co.id',
          name: 'Dup',
          password: 'Demo123!',
          organizationId: 'org-uuid',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove()', () => {
    it('sets status to SUSPENDED', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser });
      mockPrisma.user.update.mockResolvedValueOnce({ ...mockUser, status: UserStatus.SUSPENDED });
      mockPrisma.session.updateMany.mockResolvedValueOnce({});
      await service.remove('user-uuid');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: UserStatus.SUSPENDED } }),
      );
    });
  });
});
