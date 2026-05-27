import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  checks?: Record<string, { status: 'ok' | 'down'; latencyMs?: number }>;
}

/**
 * Health endpoints for Kubernetes liveness + readiness probes.
 * These routes are NOT under the global `api/v1` prefix (configured in main.ts).
 * They are excluded from global prefix via app.setGlobalPrefix(..., { exclude: ['health', 'readiness'] }).
 */
@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness probe — is the process alive?
   * K8s: if this returns non-2xx, the pod is restarted.
   */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe', description: 'Returns 200 if the process is running.' })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  liveness(): HealthResponse {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe — is the service ready to accept traffic?
   * K8s: if this returns non-2xx, traffic is not routed to this pod.
   * Returns 503 if DB is unavailable.
   * TODO(Sprint 9.2): add Redis check when RedisModule is integrated.
   */
  @Public()
  @Get('readiness')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Checks DB connectivity. Returns 503 if any critical check fails.',
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready — DB unavailable' })
  async readiness(@Res() res: Response): Promise<void> {
    const start = Date.now();
    const dbHealthy = await this.prisma.isHealthy();
    const dbLatency = Date.now() - start;

    const checks: HealthResponse['checks'] = {
      database: {
        status: dbHealthy ? 'ok' : 'down',
        latencyMs: dbLatency,
      },
      // TODO(Sprint 9.2): redis: { status: redisHealthy ? 'ok' : 'down', latencyMs: redisLatency }
    };

    const allHealthy = dbHealthy;
    const body: HealthResponse = {
      status: allHealthy ? 'ok' : 'down',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    };

    res.status(allHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json(body);
  }
}
