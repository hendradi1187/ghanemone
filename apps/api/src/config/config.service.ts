import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface MinioConfig {
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
  useSsl: boolean;
}

/**
 * Typed wrapper around NestJS ConfigService.
 * All env access goes through here — no direct process.env calls in business logic.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: NestConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT') ?? 3000;
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV') ?? 'development';
  }

  get logLevel(): string {
    return this.config.get<string>('LOG_LEVEL') ?? 'info';
  }

  isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  getDatabaseUrl(): string {
    const url = this.config.get<string>('DATABASE_URL');
    if (!url) throw new Error('DATABASE_URL is not configured');
    return url;
  }

  getRedisUrl(): string {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) throw new Error('REDIS_URL is not configured');
    return url;
  }

  getJwtConfig(): JwtConfig {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not configured');
    return {
      secret,
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '1h',
    };
  }

  getOidcConfig(): { issuer: string; clientId: string; clientSecret: string; redirectUri: string } | null {
    const issuer = this.config.get<string>('OIDC_ISSUER');
    const clientId = this.config.get<string>('OIDC_CLIENT_ID');
    const clientSecret = this.config.get<string>('OIDC_CLIENT_SECRET') ?? '';
    const redirectUri = this.config.get<string>('OIDC_REDIRECT_URI') ?? '';
    if (!issuer || !clientId) return null;
    return { issuer, clientId, clientSecret, redirectUri };
  }

  getMinioConfig(): MinioConfig {
    return {
      endpoint: this.config.get<string>('MINIO_ENDPOINT') ?? 'localhost',
      port: this.config.get<number>('MINIO_PORT') ?? 9000,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY') ?? '',
      secretKey: this.config.get<string>('MINIO_SECRET_KEY') ?? '',
      bucket: this.config.get<string>('MINIO_BUCKET') ?? 'ghanem-uploads',
      useSsl: this.config.get<boolean>('MINIO_USE_SSL') ?? false,
    };
  }

  getMeilisearchConfig(): { host: string; key: string } {
    return {
      host: this.config.get<string>('MEILISEARCH_HOST') ?? 'http://localhost:7700',
      key: this.config.get<string>('MEILISEARCH_KEY') ?? '',
    };
  }

  getClaudeConfig(): { apiKey: string; model: string; rateLimitPerMin: number } {
    return {
      apiKey: this.config.get<string>('CLAUDE_API_KEY') ?? '',
      model: this.config.get<string>('CLAUDE_MODEL') ?? 'claude-sonnet-4-5',
      rateLimitPerMin: this.config.get<number>('CLAUDE_RATE_LIMIT_PER_MIN') ?? 60,
    };
  }

  getCorsOrigins(): string[] {
    const raw = this.config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173';
    return raw.split(',').map((o) => o.trim()).filter(Boolean);
  }
}
