/**
 * Throttler configuration for ghanem.one API.
 *
 * Default: 100 requests / 60 seconds per user+IP (memory-backed in dev).
 * Auth endpoints: 10 requests / 60 seconds (brute-force protection).
 *
 * Production note:
 *   Swap ThrottlerStorageRedis for distributed rate-limiting across nodes:
 *   npm install @nestjs/throttler-storage-redis
 *   storage: new ThrottlerStorageRedis(redisClient)
 *
 * The global APP_GUARD for ThrottlerGuard is registered in AppModule.
 */
export const THROTTLER_CONFIG = {
  throttlers: [
    {
      name: 'short',
      ttl: 60_000,   // 1 minute window (ms)
      limit: 100,    // 100 requests per window — default for all routes
    },
  ],
};

/** Stricter limits for auth endpoints (brute-force protection) */
export const AUTH_THROTTLE: Record<string, { limit: number; ttl: number }> = {
  short: { limit: 10, ttl: 60_000 },
};
