import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/config.service';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './dto/jwt-payload.interface';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    sub: string;
    email: string;
    name: string;
    role: string;
    organization: string;
    orgSlug: string;
    status: string;
    lastLoginAt: string | null;
    createdAt: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  /**
   * Validate email + password credentials.
   * Returns the user record (without passwordHash) or throws UnauthorizedException.
   */
  async validateCredentials(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { organization: true },
    });

    if (!user) {
      // Use same error message to prevent email enumeration
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended. Contact your administrator.');
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('Account is pending approval.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Issue tokens
    const tokens = await this.issueTokens(user.id, {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.organizationId,
      orgName: user.organization.name,
      orgSlug: user.organization.slug,
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        metadata: { email: user.email },
      },
    });

    this.logger.log(`User ${user.email} logged in`);

    return {
      ...tokens,
      user: {
        id: user.id,
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization.name,
        orgSlug: user.organization.slug,
        status: user.status,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  /**
   * Refresh access token using a valid, non-revoked refresh token.
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { include: { organization: true } } },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const payload: JwtPayload = {
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      orgId: session.user.organizationId,
      orgName: session.user.organization.name,
      orgSlug: session.user.organization.slug,
    };

    // Issue new access token (refresh token stays the same to reduce DB churn)
    const jwtConfig = this.config.getJwtConfig();
    // reason: jsonwebtoken types narrow expiresIn to StringValue, but env gives plain string
    const accessToken = this.jwt.sign(payload, { expiresIn: jwtConfig.expiresIn as never });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(jwtConfig.expiresIn),
    };
  }

  /**
   * Revoke a session (logout).
   */
  async logout(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_LOGOUT',
        entity: 'Session',
        entityId: sessionId,
      },
    });
  }

  /**
   * Get authenticated user profile.
   */
  async getProfile(userId: string): Promise<LoginResponse['user']> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization.name,
      orgSlug: user.organization.slug,
      status: user.status,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async issueTokens(userId: string, payload: JwtPayload): Promise<AuthTokens> {
    const jwtConfig = this.config.getJwtConfig();
    // reason: jsonwebtoken types narrow expiresIn to StringValue, but env gives plain string
    const accessToken = this.jwt.sign(payload, { expiresIn: jwtConfig.expiresIn as never });

    // Generate a cryptographically random refresh token
    const { randomBytes } = await import('crypto');
    const refreshToken = randomBytes(64).toString('hex');

    // 7 days refresh window
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(jwtConfig.expiresIn),
    };
  }

  /** Convert JWT expiresIn string (e.g. "1h", "24h") to seconds. */
  private parseExpiry(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) return 3600;
    const value = parseInt(match[1] ?? '1', 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit ?? 'h'] ?? 3600);
  }
}
