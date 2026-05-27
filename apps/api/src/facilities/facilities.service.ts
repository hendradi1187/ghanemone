import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreateFacilityDto } from './dto/create-facility.dto';
import type { UpdateFacilityDto } from './dto/update-facility.dto';
import type { ListFacilitiesDto } from './dto/list-facilities.dto';
import type {
  PaginatedFacilitiesDto,
  FacilityDetailDto,
  FacilityListItemDto,
} from './dto/facility-response.dto';

/**
 * FacilitiesService — CRUD for Facility records (platforms, FPSOs, plants, etc.)
 *
 * GIS rules:
 * - Point geometry in EPSG:4326, derived from latitude/longitude
 * - Auto-sync trigger (Sprint 9.1) also populates point from lat/lon
 * - GIST index on point column (Sprint 9.1 migration)
 */
@Injectable()
export class FacilitiesService {
  private readonly logger = new Logger(FacilitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListFacilitiesDto): Promise<PaginatedFacilitiesDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (dto.status) where['status'] = dto.status;
    if (dto.type) where['type'] = dto.type;
    if (dto.workAreaId) where['workAreaId'] = dto.workAreaId;
    if (dto.operator) where['operator'] = { contains: dto.operator, mode: 'insensitive' };

    const whereClause = where as Prisma.FacilityWhereInput;

    const [rawItems, total] = await Promise.all([
      this.prisma.facility.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true, name: true, type: true, operator: true, workAreaId: true,
          latitude: true, longitude: true, status: true,
          waterDepthM: true, installYear: true,
          createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.facility.count({ where: whereClause }),
    ]);

    const items: FacilityListItemDto[] = rawItems.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      operator: r.operator,
      workAreaId: r.workAreaId,
      latitude: r.latitude,
      longitude: r.longitude,
      status: r.status,
      waterDepthM: r.waterDepthM,
      installYear: r.installYear,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<FacilityDetailDto> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string; name: string; type: string; operator: string;
      work_area_id: string | null; latitude: number; longitude: number;
      status: string; water_depth_m: number | null; install_year: number | null;
      geojson: string | null;
      created_at: Date; updated_at: Date;
    }>>`
      SELECT
        id, name, type, operator, work_area_id,
        latitude, longitude, status, water_depth_m, install_year,
        ST_AsGeoJSON(point) AS geojson,
        created_at, updated_at
      FROM facilities
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    const r = rows[0];
    if (!r) throw new NotFoundException(`Facility ${id} not found`);

    return {
      id: r.id,
      name: r.name,
      type: r.type,
      operator: r.operator,
      workAreaId: r.work_area_id,
      latitude: r.latitude,
      longitude: r.longitude,
      status: r.status,
      waterDepthM: r.water_depth_m,
      installYear: r.install_year,
      geometry: r.geojson ? (JSON.parse(r.geojson) as Record<string, unknown>) : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  async create(dto: CreateFacilityDto, user: JwtPayload): Promise<FacilityDetailDto> {
    const pointGeoJSON = JSON.stringify({
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    });

    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO facilities (
        id, name, type, operator, work_area_id,
        latitude, longitude, point,
        status, water_depth_m, install_year,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${dto.name},
        ${dto.type}::"FacilityType",
        ${dto.operator},
        ${dto.workAreaId ?? null}::uuid,
        ${dto.latitude},
        ${dto.longitude},
        ST_GeomFromGeoJSON(${pointGeoJSON}),
        ${dto.status ?? 'ACTIVE'}::"FacilityStatus",
        ${dto.waterDepthM ?? null},
        ${dto.installYear ?? null},
        NOW(), NOW()
      )
      RETURNING id
    `;

    const newId = rows[0]?.id;
    if (!newId) throw new Error('Failed to insert facility');

    this.auditLog('FACILITY_CREATE', 'Facility', newId, user.sub);

    return this.findOne(newId);
  }

  async update(id: string, dto: UpdateFacilityDto, user: JwtPayload): Promise<FacilityDetailDto> {
    const existing = await this.findOne(id);
    this.assertCanMutate(user, existing.operator);

    const updates: string[] = [];
    const values: unknown[] = [];
    let p = 1;

    if (dto.name !== undefined) { updates.push(`name = $${p++}`); values.push(dto.name); }
    if (dto.type !== undefined) { updates.push(`type = $${p++}::"FacilityType"`); values.push(dto.type); }
    if (dto.operator !== undefined) { updates.push(`operator = $${p++}`); values.push(dto.operator); }
    if (dto.workAreaId !== undefined) { updates.push(`work_area_id = $${p++}::uuid`); values.push(dto.workAreaId); }
    if (dto.status !== undefined) { updates.push(`status = $${p++}::"FacilityStatus"`); values.push(dto.status); }
    if (dto.waterDepthM !== undefined) { updates.push(`water_depth_m = $${p++}`); values.push(dto.waterDepthM); }
    if (dto.installYear !== undefined) { updates.push(`install_year = $${p++}`); values.push(dto.installYear); }

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
    const sql = `UPDATE facilities SET ${updates.join(', ')} WHERE id = $${p}::uuid`;
    values.push(id);

    await this.prisma.$queryRawUnsafe(sql, ...values);

    this.auditLog('FACILITY_UPDATE', 'Facility', id, user.sub);

    return this.findOne(id);
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const existing = await this.findOne(id);
    this.assertCanMutate(user, existing.operator);

    await this.prisma.facility.update({
      where: { id },
      data: { status: 'DECOMMISSIONED', updatedAt: new Date() },
    });

    this.auditLog('FACILITY_DELETE', 'Facility', id, user.sub);
    this.logger.log(`Facility ${existing.name} (${id}) soft-deleted by ${user.sub}`);
  }

  private assertCanMutate(user: JwtPayload, recordOperator: string): void {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) return;
    if (user.role === UserRole.KKKS_OPERATOR) {
      const orgName = user.orgName.toLowerCase();
      const op = recordOperator.toLowerCase();
      if (op.includes(orgName) || orgName.includes(op)) return;
      throw new ForbiddenException('KKKS_OPERATOR can only modify their own organization\'s facilities');
    }
    throw new ForbiddenException('Insufficient privileges to modify Facility');
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
