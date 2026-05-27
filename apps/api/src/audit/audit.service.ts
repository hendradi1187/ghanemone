import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditAction } from './audit.constants';
import type { ListAuditLogsDto } from './dto/list-audit-logs.dto';
import type {
  AuditLogResponseDto,
  PaginatedAuditLogsDto,
} from './dto/audit-log-response.dto';
import type { Prisma } from '@prisma/client';

export interface LogAuditArgs {
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Write an immutable audit log entry.
   * Fire-and-forget pattern — callers should NOT await this if latency matters.
   * All DB errors are caught and logged; never thrown to the caller.
   */
  async log(args: LogAuditArgs): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: args.userId ?? null,
          action: args.action,
          entity: args.entity ?? null,
          entityId: args.entityId ?? null,
          metadata: (args.metadata as Prisma.InputJsonValue) ?? undefined,
          ipAddress: args.ipAddress ?? null,
          userAgent: args.userAgent ?? null,
        },
      });
    } catch (err) {
      // Audit failures must never crash the main request path
      this.logger.warn(
        `Failed to write audit log [action=${args.action}]: ${String(err)}`,
      );
    }
  }

  /**
   * Paginated query for audit log entries.
   * Access restricted to ADMIN and REGULATOR at controller layer.
   */
  async findMany(query: ListAuditLogsDto): Promise<PaginatedAuditLogsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.entity ? { entity: query.entity } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((log) => this.toResponseDto(log)),
      total,
      page,
      limit,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private toResponseDto(log: {
    id: string;
    userId: string | null;
    action: string;
    entity: string | null;
    entityId: string | null;
    metadata: Prisma.JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }): AuditLogResponseDto {
    return {
      id: log.id,
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      metadata: log.metadata as Record<string, unknown> | null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
    };
  }
}
