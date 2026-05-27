import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  ResetPasswordDto,
} from './dto/create-user.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(requestingUser: JwtPayload): Promise<UserResponseDto[]> {
    // Regulators and Admins can see all users; KKKS_OPERATOR sees only their org
    const where =
      requestingUser.role === UserRole.KKKS_OPERATOR
        ? { organizationId: requestingUser.orgId }
        : {};

    const users = await this.prisma.user.findMany({
      where,
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toResponseDto(u));
  }

  async findOne(id: string, requestingUser: JwtPayload): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!user) throw new NotFoundException(`User ${id} not found`);

    // Users can view their own profile; Admins/Regulators can view any
    const canView =
      user.id === requestingUser.sub ||
      requestingUser.role === UserRole.ADMIN ||
      requestingUser.role === UserRole.REGULATOR;

    if (!canView) {
      throw new ForbiddenException('Cannot view this user profile');
    }

    return this.toResponseDto(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    if (!org) {
      throw new NotFoundException(`Organization ${dto.organizationId} not found`);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role ?? UserRole.ANALYST,
        organizationId: dto.organizationId,
        status: UserStatus.ACTIVE,
      },
      include: { organization: true },
    });

    this.logger.log(`User created: ${user.email}`);
    return this.toResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto, requestingUser: JwtPayload): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const isSelf = user.id === requestingUser.sub;
    const isAdmin = requestingUser.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('Cannot update this user');
    }

    // Non-admins cannot change role or status
    if (!isAdmin) {
      if (dto.role !== undefined) throw new ForbiddenException('Cannot change own role');
      if (dto.status !== undefined) throw new ForbiddenException('Cannot change own status');
      if (dto.organizationId !== undefined) throw new ForbiddenException('Cannot change own organization');
    }

    if (dto.organizationId) {
      const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
      if (!org) throw new NotFoundException(`Organization ${dto.organizationId} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.role && { role: dto.role }),
        ...(dto.status && { status: dto.status }),
        ...(dto.organizationId && { organizationId: dto.organizationId }),
      },
      include: { organization: true },
    });

    return this.toResponseDto(updated);
  }

  /** Soft-delete: set status to SUSPENDED */
  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.SUSPENDED },
    });

    // Revoke all active sessions
    await this.prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`User ${user.email} suspended`);
  }

  async resetPassword(id: string, dto: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Revoke all sessions to force re-login
    await this.prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: id,
        action: 'USER_PASSWORD_RESET',
        entity: 'User',
        entityId: id,
      },
    });

    this.logger.log(`Password reset for user ${user.email}`);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private toResponseDto(
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: UserStatus;
      organizationId: string;
      organization: { name: string };
      lastLoginAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
