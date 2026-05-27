import * as Joi from 'joi';

/**
 * Joi schema untuk validasi environment variables saat aplikasi start.
 * Aplikasi akan crash-on-startup kalau required var tidak set — fail-fast.
 */
export const envValidationSchema = Joi.object({
  // Server
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),

  // Database
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),

  // Redis
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),

  // Auth — JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  // Auth — OIDC (optional in dev, required in production)
  OIDC_ISSUER: Joi.string().uri().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  OIDC_CLIENT_ID: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  OIDC_CLIENT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  OIDC_REDIRECT_URI: Joi.string().uri().optional(),

  // MinIO / S3
  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_PORT: Joi.number().integer().default(9000),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().default('ghanem-uploads'),
  MINIO_USE_SSL: Joi.boolean().default(false),

  // Meilisearch
  MEILISEARCH_HOST: Joi.string().uri().required(),
  MEILISEARCH_KEY: Joi.string().required(),

  // Claude AI Proxy
  CLAUDE_API_KEY: Joi.string().optional().allow(''),
  CLAUDE_MODEL: Joi.string().default('claude-sonnet-4-5'),
  CLAUDE_RATE_LIMIT_PER_MIN: Joi.number().integer().default(60),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
});
