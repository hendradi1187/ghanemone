import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './common/logging/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';

// ── Sprint 9.2 — backend-agent modules ───────────────────────────────────────
import { AuditModule } from './audit/audit.module';
import { DatasetsModule } from './datasets/datasets.module';
import { SearchModule } from './search/search.module';
import { THROTTLER_CONFIG } from './common/throttler/throttler.config';

// ── Sprint 9.2 — gis-agent modules ───────────────────────────────────────────
import { SpatialModule } from './spatial/spatial.module';
import { WorkAreasModule } from './work-areas/work-areas.module';
import { WellsModule } from './wells/wells.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { FacilitiesModule } from './facilities/facilities.module';

// ── Sprint 9.5 — workspace + monitoring + analytics ──────────────────────────
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { StatsModule } from './stats/stats.module';

/**
 * Root application module.
 *
 * Module load order:
 * 1. AppConfigModule (global) — env validation, typed config
 * 2. LoggerModule (global) — Pino structured logging
 * 3. PrismaModule (global) — DB access layer
 * 4. ThrottlerModule (global) — rate limiting (100 req/min default)
 * 5. HealthModule — /health and /readiness probes
 * 6. AuthModule — JWT auth + RBAC guards
 * 7. UsersModule — user CRUD
 * 8. OrganizationsModule — org CRUD
 * 9. AuditModule — immutable audit log writer + reader
 * 10. DatasetsModule — dataset CRUD + sensitivity RBAC
 * 11. SearchModule — Meilisearch integration
 *
 * Sprint 9.3+ will add: SpatialModule, WorkAreasModule, WellsModule,
 * PipelinesModule, FacilitiesModule, UploadModule, AiProxyModule,
 * ConnectorModule, NotificationsModule, RealtimeModule
 */
@Module({
  imports: [
    // Infrastructure
    AppConfigModule,
    LoggerModule,
    PrismaModule,

    // ── Sprint 9.2 ThrottlerModule (global) ──────────────────────────────────
    // Memory storage for dev. Production: use @nestjs/throttler-storage-redis.
    ThrottlerModule.forRoot(THROTTLER_CONFIG),

    // Feature modules (Sprint 9.1)
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,

    // ── Sprint 9.2 — backend-agent additions ─────────────────────────────────
    AuditModule,
    DatasetsModule,
    SearchModule,
    // ── Sprint 9.2 — gis-agent additions ─────────────────────────────────────
    SpatialModule,      // /api/v1/spatial — bbox, within, transform, GeoJSON export
    WorkAreasModule,    // /api/v1/work-areas — WK CRUD
    WellsModule,        // /api/v1/wells — Well CRUD
    PipelinesModule,    // /api/v1/pipelines — Pipeline CRUD
    FacilitiesModule,   // /api/v1/facilities — Facility CRUD
    // ── END gis-agent ─────────────────────────────────────────────────────────

    // ── Sprint 9.5 — workspace + monitoring + analytics ──────────────────────
    ProjectsModule,     // /api/v1/projects — project CRUD
    TasksModule,        // /api/v1/projects/:id/tasks + /api/v1/tasks/:id — Kanban tasks
    MonitoringModule,   // /api/v1/monitoring — pipeline runs + alerts
    StatsModule,        // /api/v1/stats — aggregation endpoints
    // ── END Sprint 9.5 ───────────────────────────────────────────────────────
  ],
  controllers: [],
  providers: [
    // ThrottlerGuard applied globally (after JwtAuthGuard, before RolesGuard)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
