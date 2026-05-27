import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreateWellDto } from './dto/create-well.dto';
import type { UpdateWellDto } from './dto/update-well.dto';
import type { ListWellsDto } from './dto/list-wells.dto';
import type { PaginatedWellsDto, WellDetailDto, WellListItemDto } from './dto/well-response.dto';

/**
 * WellsService — CRUD for Well records.
 *
 * GIS rules:
 * - Point geometry stored in EPSG:4326 — derived from latitude/longitude on insert
 * - Auto-sync trigger (Sprint 9.1) also populates point column from lat/lon
 * - GIST index on point column (Sprint 9.1 migration)
 *
 * RBAC:
 * - ADMIN + REGULATOR: full CRUD on all wells
 * - KKKS_OPERATOR: CRUD on wells in their organization's work areas only
 * - All authenticated: read
 */
@Injectable()
export class WellsService {
  private readonly logger = new Logger(WellsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListWellsDto): Promise<PaginatedWellsDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: Prisma.WellWhereInput = {};
    if (dto.status) where.status = dto.status;
    if (dto.type) where.type = dto.type;
    if (dto.workAreaId) where.workAreaId = dto.workAreaId;
    if (dto.operator) where.operator = { contains: dto.operator, mode: 'insensitive' };

    const [rawItems, total] = await Promise.all([
      this.prisma.well.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true, uwi: true, name: true, operator: true, workAreaId: true,
          type: true, status: true, latitude: true, longitude: true,
          totalDepthM: true, formation: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.well.count({ where }),
    ]);

    const items: WellListItemDto[] = rawItems.map((r) => ({
      id: r.id,
      uwi: r.uwi,
      name: r.name,
      operator: r.operator,
      workAreaId: r.workAreaId,
      type: r.type,
      status: r.status,
      latitude: r.latitude,
      longitude: r.longitude,
      totalDepthM: r.totalDepthM,
      formation: r.formation,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<WellDetailDto> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string; uwi: string | null; name: string; operator: string;
      work_area_id: string | null; type: string; status: string;
      latitude: number; longitude: number; total_depth_m: number | null;
      spud_date: Date | null; td_date: Date | null; kb_elevation_m: number | null;
      formation: string | null; reservoir: string | null;
      geojson: string | null;
      created_at: Date; updated_at: Date;
    }>>`
      SELECT
        id, uwi, name, operator, work_area_id, type, status,
        latitude, longitude, total_depth_m,
        spud_date, td_date, kb_elevation_m, formation, reservoir,
        ST_AsGeoJSON(point) AS geojson,
        created_at, updated_at
      FROM wells
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    const r = rows[0];
    if (!r) throw new NotFoundException(`Well ${id} not found`);

    return {
      id: r.id,
      uwi: r.uwi,
      name: r.name,
      operator: r.operator,
      workAreaId: r.work_area_id,
      type: r.type,
      status: r.status,
      latitude: r.latitude,
      longitude: r.longitude,
      totalDepthM: r.total_depth_m,
      spudDate: r.spud_date?.toISOString() ?? null,
      tdDate: r.td_date?.toISOString() ?? null,
      kbElevationM: r.kb_elevation_m,
      formation: r.formation,
      reservoir: r.reservoir,
      geometry: r.geojson ? (JSON.parse(r.geojson) as Record<string, unknown>) : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async create(dto: CreateWellDto, user: JwtPayload): Promise<WellDetailDto> {
    // UWI uniqueness check
    if (dto.uwi) {
      const existing = await this.prisma.well.findUnique({ where: { uwi: dto.uwi } });
      if (existing) throw new ConflictException(`Well with UWI '${dto.uwi}' already exists`);
    }

    const pointGeoJSON = JSON.stringify({
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    });

    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO wells (
        id, uwi, name, operator, work_area_id, type, status,
        latitude, longitude, point,
        total_depth_m, spud_date, td_date, kb_elevation_m, formation, reservoir,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${dto.uwi ?? null},
        ${dto.name},
        ${dto.operator},
        ${dto.workAreaId ?? null}::uuid,
        ${dto.type}::"WellType",
        ${dto.status ?? 'ACTIVE'}::"WellStatus",
        ${dto.latitude},
        ${dto.longitude},
        ST_GeomFromGeoJSON(${pointGeoJSON}),
        ${dto.totalDepthM ?? null},
        ${dto.spudDate ? new Date(dto.spudDate) : null},
        ${dto.tdDate ? new Date(dto.tdDate) : null},
        ${dto.kbElevationM ?? null},
        ${dto.formation ?? null},
        ${dto.reservoir ?? null},
        NOW(), NOW()
      )
      RETURNING id
    `;

    const newId = rows[0]?.id;
    if (!newId) throw new Error('Failed to insert well');

    this.auditLog('WELL_CREATE', 'Well', newId, user.sub);

    return this.findOne(newId);
  }

  async update(id: string, dto: UpdateWellDto, user: JwtPayload): Promise<WellDetailDto> {
    const existing = await this.findOne(id);
    this.assertCanMutate(user, existing.operator);

    const updates: string[] = [];
    const values: unknown[] = [];
    let p = 1;

    if (dto.name !== undefined) { updates.push(`name = $${p++}`); values.push(dto.name); }
    if (dto.operator !== undefined) { updates.push(`operator = $${p++}`); values.push(dto.operator); }
    if (dto.workAreaId !== undefined) { updates.push(`work_area_id = $${p++}::uuid`); values.push(dto.workAreaId); }
    if (dto.type !== undefined) { updates.push(`type = $${p++}::"WellType"`); values.push(dto.type); }
    if (dto.status !== undefined) { updates.push(`status = $${p++}::"WellStatus"`); values.push(dto.status); }
    if (dto.totalDepthM !== undefined) { updates.push(`total_depth_m = $${p++}`); values.push(dto.totalDepthM); }
    if (dto.formation !== undefined) { updates.push(`formation = $${p++}`); values.push(dto.formation); }
    if (dto.reservoir !== undefined) { updates.push(`reservoir = $${p++}`); values.push(dto.reservoir); }
    if (dto.kbElevationM !== undefined) { updates.push(`kb_elevation_m = $${p++}`); values.push(dto.kbElevationM); }
    if (dto.spudDate !== undefined) { updates.push(`spud_date = $${p++}`); values.push(new Date(dto.spudDate)); }
    if (dto.tdDate !== undefined) { updates.push(`td_date = $${p++}`); values.push(new Date(dto.tdDate)); }

    // If lat/lon updated, also regenerate point geometry
    const latUpdated = dto.latitude !== undefined;
    const lonUpdated = dto.longitude !== undefined;
    if (latUpdated || lonUpdated) {
      const lat = dto.latitude ?? existing.latitude;
      const lon = dto.longitude ?? existing.longitude;
      const geojsonStr = JSON.stringify({ type: 'Point', coordinates: [lon, lat] });
      if (latUpdated) { updates.push(`latitude = $${p++}`); values.push(lat); }
      if (lonUpdated) { updates.push(`longitude = $${p++}`); values.push(lon); }
      updates.push(`point = ST_GeomFromGeoJSON($${p++})`);
      values.push(geojsonStr);
    }

    if (updates.length === 0) return existing;

    updates.push(`updated_at = NOW()`);
    const sql = `UPDATE wells SET ${updates.join(', ')} WHERE id = $${p}::uuid`;
    values.push(id);

    await this.prisma.$queryRawUnsafe(sql, ...values);

    this.auditLog('WELL_UPDATE', 'Well', id, user.sub);

    return this.findOne(id);
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const existing = await this.findOne(id);
    this.assertCanMutate(user, existing.operator);

    await this.prisma.well.update({
      where: { id },
      data: { status: 'ABANDONED', updatedAt: new Date() },
    });

    this.auditLog('WELL_DELETE', 'Well', id, user.sub);
    this.logger.log(`Well ${existing.name} (${id}) soft-deleted by ${user.sub}`);
  }

  private assertCanMutate(user: JwtPayload, recordOperator: string): void {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) return;
    if (user.role === UserRole.KKKS_OPERATOR) {
      const orgName = user.orgName.toLowerCase();
      const op = recordOperator.toLowerCase();
      if (op.includes(orgName) || orgName.includes(op)) return;
      throw new ForbiddenException('KKKS_OPERATOR can only modify their own organization\'s wells');
    }
    throw new ForbiddenException('Insufficient privileges to modify Well');
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
