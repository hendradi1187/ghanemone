import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AlertSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { ListAlertsDto } from './dto/list-alerts.dto';
import type {
  AlertResponseDto,
  MonitoringSummaryDto,
  PaginatedAlertsDto,
} from './dto/alert-response.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListAlertsDto): Promise<PaginatedAlertsDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AlertWhereInput = {
      ...(dto.severity && { severity: dto.severity }),
      ...(dto.acknowledged !== undefined && { acknowledged: dto.acknowledged }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          acknowledgedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      items: items.map((a) => this.mapToResponse(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async acknowledge(alertId: string, user: JwtPayload): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);

    const updated = await this.prisma.alert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedById: user.sub,
      },
      include: {
        acknowledgedBy: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Alert ${alertId} acknowledged by user ${user.sub}`);
    return this.mapToResponse(updated);
  }

  async getSummary(): Promise<MonitoringSummaryDto> {
    type RunRow = { status: string; count: string };
    type AlertRow = { severity: string; count: string };

    const [runRows, alertRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<RunRow[]>(Prisma.sql`
        SELECT status::text, COUNT(*)::text AS count
        FROM pipeline_runs
        GROUP BY status
      `),
      this.prisma.$queryRaw<AlertRow[]>(Prisma.sql`
        SELECT severity::text, COUNT(*)::text AS count
        FROM alerts
        WHERE acknowledged = false
        GROUP BY severity
      `),
    ]);

    const runs = { success: 0, failed: 0, running: 0, queued: 0, cancelled: 0 };
    for (const row of runRows) {
      const n = parseInt(row.count, 10);
      switch (row.status) {
        case 'SUCCESS':   runs.success   = n; break;
        case 'FAILED':    runs.failed    = n; break;
        case 'RUNNING':   runs.running   = n; break;
        case 'QUEUED':    runs.queued    = n; break;
        case 'CANCELLED': runs.cancelled = n; break;
      }
    }

    const alerts = { critical: 0, error: 0, warning: 0, info: 0 };
    for (const row of alertRows) {
      const n = parseInt(row.count, 10);
      switch (row.severity) {
        case 'CRITICAL': alerts.critical = n; break;
        case 'ERROR':    alerts.error    = n; break;
        case 'WARNING':  alerts.warning  = n; break;
        case 'INFO':     alerts.info     = n; break;
      }
    }

    return { runs, alerts };
  }

  private mapToResponse(a: {
    id: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    source: string;
    sourceId: string | null;
    acknowledged: boolean;
    acknowledgedAt: Date | null;
    acknowledgedBy?: { id: string; name: string } | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
  }): AlertResponseDto {
    return {
      id: a.id,
      severity: a.severity,
      title: a.title,
      message: a.message,
      source: a.source,
      sourceId: a.sourceId,
      acknowledged: a.acknowledged,
      acknowledgedAt: a.acknowledgedAt,
      acknowledgedBy: a.acknowledgedBy ?? null,
      metadata: a.metadata as Record<string, unknown> | null,
      createdAt: a.createdAt,
    };
  }
}
