import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreatePipelineDto } from './dto/create-pipeline.dto';
import type { UpdatePipelineDto } from './dto/update-pipeline.dto';
import type { ListPipelinesDto } from './dto/list-pipelines.dto';
import type {
  PaginatedPipelinesDto,
  PipelineDetailDto,
  PipelineListItemDto,
} from './dto/pipeline-response.dto';

/**
 * PipelinesService — CRUD for Pipeline records.
 *
 * GIS rules:
 * - LineString geometry stored in EPSG:4326
 * - length_km computed via ST_Length(line::geography)/1000 on insert/update
 * - GIST index on line column (Sprint 9.1 migration)
 */
@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListPipelinesDto): Promise<PaginatedPipelinesDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: Prisma.PipelineWhereInput = {};
    if (dto.status) where.status = dto.status;
    if (dto.type) where.type = dto.type;
    if (dto.workAreaId) where.workAreaId = dto.workAreaId;
    if (dto.operator) where.operator = { contains: dto.operator, mode: 'insensitive' };

    const [rawItems, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true, name: true, operator: true, workAreaId: true,
          type: true, status: true, lengthKm: true, diameterIn: true,
          pressureBar: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.pipeline.count({ where }),
    ]);

    const items: PipelineListItemDto[] = rawItems.map((r) => ({
      id: r.id,
      name: r.name,
      operator: r.operator,
      workAreaId: r.workAreaId,
      type: r.type,
      status: r.status,
      lengthKm: r.lengthKm,
      diameterIn: r.diameterIn,
      pressureBar: r.pressureBar,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<PipelineDetailDto> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string; name: string; operator: string; work_area_id: string | null;
      type: string; status: string; length_km: number | null;
      diameter_in: number | null; pressure_bar: number | null;
      geojson: string | null;
      created_at: Date; updated_at: Date;
    }>>`
      SELECT
        id, name, operator, work_area_id, type, status,
        length_km, diameter_in, pressure_bar,
        ST_AsGeoJSON(line) AS geojson,
        created_at, updated_at
      FROM pipelines
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    const r = rows[0];
    if (!r) throw new NotFoundException(`Pipeline ${id} not found`);

    return {
      id: r.id,
      name: r.name,
      operator: r.operator,
      workAreaId: r.work_area_id,
      type: r.type,
      status: r.status,
      lengthKm: r.length_km,
      diameterIn: r.diameter_in,
      pressureBar: r.pressure_bar,
      geometry: r.geojson ? (JSON.parse(r.geojson) as Record<string, unknown>) : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async create(dto: CreatePipelineDto, user: JwtPayload): Promise<PipelineDetailDto> {
    this.validateLineGeometry(dto.line);

    const lineGeoJSON = JSON.stringify(dto.line);

    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO pipelines (
        id, name, operator, work_area_id, type, status,
        line,
        length_km,
        diameter_in, pressure_bar,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${dto.name},
        ${dto.operator},
        ${dto.workAreaId ?? null}::uuid,
        ${dto.type}::"PipelineType",
        ${dto.status ?? 'ACTIVE'}::"PipelineStatus",
        ST_GeomFromGeoJSON(${lineGeoJSON}),
        ST_Length(ST_GeomFromGeoJSON(${lineGeoJSON})::geography) / 1000,
        ${dto.diameterIn ?? null},
        ${dto.pressureBar ?? null},
        NOW(), NOW()
      )
      RETURNING id
    `;

    const newId = rows[0]?.id;
    if (!newId) throw new BadRequestException('Failed to insert pipeline — geometry may be invalid');

    this.auditLog('PIPELINE_CREATE', 'Pipeline', newId, user.sub);

    return this.findOne(newId);
  }

  async update(id: string, dto: UpdatePipelineDto, user: JwtPayload): Promise<PipelineDetailDto> {
    const existing = await this.findOne(id);
    this.assertCanMutate(user, existing.operator);

    if (dto.line) this.validateLineGeometry(dto.line);

    const updates: string[] = [];
    const values: unknown[] = [];
    let p = 1;

    if (dto.name !== undefined) { updates.push(`name = $${p++}`); values.push(dto.name); }
    if (dto.operator !== undefined) { updates.push(`operator = $${p++}`); values.push(dto.operator); }
    if (dto.workAreaId !== undefined) { updates.push(`work_area_id = $${p++}::uuid`); values.push(dto.workAreaId); }
    if (dto.type !== undefined) { updates.push(`type = $${p++}::"PipelineType"`); values.push(dto.type); }
    if (dto.status !== undefined) { updates.push(`status = $${p++}::"PipelineStatus"`); values.push(dto.status); }
    if (dto.diameterIn !== undefined) { updates.push(`diameter_in = $${p++}`); values.push(dto.diameterIn); }
    if (dto.pressureBar !== undefined) { updates.push(`pressure_bar = $${p++}`); values.push(dto.pressureBar); }
    if (dto.line !== undefined) {
      const lineStr = JSON.stringify(dto.line);
      updates.push(`line = ST_GeomFromGeoJSON($${p++})`);
      updates.push(`length_km = ST_Length(ST_GeomFromGeoJSON($${p++})::geography) / 1000`);
      values.push(lineStr, lineStr);
    }

    if (updates.length === 0) return existing;

    updates.push(`updated_at = NOW()`);
    const sql = `UPDATE pipelines SET ${updates.join(', ')} WHERE id = $${p}::uuid`;
    values.push(id);

    await this.prisma.$queryRawUnsafe(sql, ...values);

    this.auditLog('PIPELINE_UPDATE', 'Pipeline', id, user.sub);

    return this.findOne(id);
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const existing = await this.findOne(id);
    this.assertCanMutate(user, existing.operator);

    await this.prisma.pipeline.update({
      where: { id },
      data: { status: 'DECOMMISSIONED', updatedAt: new Date() },
    });

    this.auditLog('PIPELINE_DELETE', 'Pipeline', id, user.sub);
    this.logger.log(`Pipeline ${existing.name} (${id}) soft-deleted by ${user.sub}`);
  }

  private validateLineGeometry(geometry: Record<string, unknown>): void {
    const type = geometry['type'];
    if (type !== 'LineString' && type !== 'MultiLineString') {
      throw new BadRequestException(
        `Pipeline geometry must be a LineString or MultiLineString; got '${String(type)}'`,
      );
    }
    if (!Array.isArray(geometry['coordinates'])) {
      throw new BadRequestException('Geometry must have a coordinates array');
    }
  }

  private assertCanMutate(user: JwtPayload, recordOperator: string): void {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) return;
    if (user.role === UserRole.KKKS_OPERATOR) {
      const orgName = user.orgName.toLowerCase();
      const op = recordOperator.toLowerCase();
      if (op.includes(orgName) || orgName.includes(op)) return;
      throw new ForbiddenException('KKKS_OPERATOR can only modify their own organization\'s pipelines');
    }
    throw new ForbiddenException('Insufficient privileges to modify Pipeline');
  }

  private auditLog(action: string, entity: string, entityId: string, userId: string): void {
    this.logger.log(`AUDIT: ${action} ${entity}(${entityId}) by user ${userId}`);
    void this.prisma.auditLog.create({
      data: { userId, action, entity, entityId },
    }).catch((err: unknown) => {
      this.logger.warn(`Audit log failed for ${action}: ${String(err)}`);
    });
  }
}
