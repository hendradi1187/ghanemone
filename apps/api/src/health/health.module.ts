import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * HealthModule — exposes /health and /readiness endpoints.
 * PrismaService is available globally (PrismaModule is @Global), no need to import PrismaModule here.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
