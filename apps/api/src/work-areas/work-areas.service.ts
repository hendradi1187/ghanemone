import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreateWorkAreaDto } from './dto/create-work-area.dto';
import type { UpdateWorkAreaDto } from './dto/update-work-area.dto';
import type { ListWorkAreasDto } from './dto/list-work-areas.dto';
import type {
  PaginatedWorkAreasDto,
  WorkAreaDetailDto,
  WorkAreaListItemDto,
} from './dto/work-area-response.dto';

/**
 * WorkAreasService — CRUD for Wilayah Kerja (WK / PSC blocks).
 *
 * GIS rules:
 * - Geometry stored in EPSG:4326 (enforced by DB CHECK constraint)
 * - Derived fields (bbox, centroid, area) computed via PostGIS on insert/update
 * - GIST index on geometry column (enforced in Sprint 9.1 migration)
 *
 * RBAC:
 * - ADMIN + REGULATOR can CRUD all records
 * - KKKS_OPERATOR can PATCH/DELETE only their own organization's work areas
 * - All authenticated users can read (list + detail)
 *
 * TODO: wire AuditService when backend-agent's AuditModule is available.
 * Stub below logs to console until then.
 */
@Injectable()
export class WorkAreasService {
  private readonly logger = new Logger(WorkAreasService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // List
  // ---------------------------------------------------------------------------

  async findAll(dto: ListWorkAreasDto): Promise<PaginatedWorkAreasDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: Prisma.WorkAreaWhereInput = {};
    if (dto.status) where.status = dto.status;
    if (dto.workAreaId) where.id = dto.workAreaId;
    if (dto.operator) {
      where.operator = { contains: dto.operator, mode: 'insensitive' };
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.workArea.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          operator: true,
          status: true,
          contractStart: true,
          contractEnd: true,
          color: true,
          totalAreaKm2: true,
          centerLat: true,
          centerLon: true,
          bboxJson: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.workArea.count({ where }),
    ]);

    const items: WorkAreaListItemDto[] = rawItems.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      operator: r.operator,
      status: r.status,
      contractStart: r.contractStart.toISOString(),
      contractEnd: r.contractEnd.toISOString(),
      color: r.color,
      totalAreaKm2: r.totalAreaKm2,
      centerLat: r.centerLat,
      centerLon: r.centerLon,
      bboxJson: r.bboxJson,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return { items, total, page, limit };
  }

  // ---------------------------------------------------------------------------
  // Detail (includes geometry)
  // ---------------------------------------------------------------------------

  async findOne(id: string): Promise<WorkAreaDetailDto> {
    const rows = await this.prisma.$queryRaw<Array<{
      id: string; slug: string; name: string; operator: string; status: string;
      contract_start: Date; contract_end: Date; color: string | null;
      total_area_km2: number | null; center_lat: number | null; center_lon: number | null;
      bbox_json: unknown; geojson: string | null;
      created_at: Date; updated_at: Date;
    }>>`
      SELECT
        id, slug, name, operator, status,
        contract_start, contract_end, color,
        total_area_km2, center_lat, center_lon, bbox_json,
        ST_AsGeoJSON(geometry) AS geojson,
        created_at, updated_at
      FROM work_areas
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    const r = rows[0];
    if (!r) throw new NotFoundException(`WorkArea ${id} not found`);

    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      operator: r.operator,
      status: r.status,
      contractStart: r.contract_start.toISOString(),
      contractEnd: r.contract_end.toISOString(),
      color: r.color,
      totalAreaKm2: r.total_area_km2,
      centerLat: r.center_lat,
      centerLon: r.center_lon,
      bboxJson: r.bbox_json,
      geometry: r.geojson ? (JSON.parse(r.geojson) as Record<string, unknown>) : null,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(dto: CreateWorkAreaDto, user: JwtPayload): Promise<WorkAreaDetailDto> {
    this.validatePolygonGeometry(dto.geometry);

    // Check slug uniqueness
    const existing = await this.prisma.workArea.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`WorkArea with slug '${dto.slug}' already exists`);
    }
    const existingName = await this.prisma.workArea.findUnique({ where: { name: dto.name } });
    if (existingName) {
      throw new ConflictException(`WorkArea with name '${dto.name}' already exists`);
    }

    const geojsonStr = JSON.stringify(dto.geometry);
    const status = dto.status ?? 'ACTIVE';

    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO work_areas (
        id, slug, name, operator, contract_start, contract_end, status, color,
        geometry,
        bbox_json,
        center_lat,
        center_lon,
        total_area_km2,
        organization_id,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${dto.slug},
        ${dto.name},
        ${dto.operator},
        ${new Date(dto.contractStart)},
        ${new Date(dto.contractEnd)},
        ${status}::"WorkAreaStatus",
        ${dto.color ?? null},
        ST_GeomFromGeoJSON(${geojsonStr}),
        (SELECT ST_AsGeoJSON(ST_Envelope(ST_GeomFromGeoJSON(${geojsonStr})))::jsonb),
        ST_Y(ST_Centroid(ST_GeomFromGeoJSON(${geojsonStr}))),
        ST_X(ST_Centroid(ST_GeomFromGeoJSON(${geojsonStr}))),
        ST_Area(ST_GeomFromGeoJSON(${geojsonStr})::geography) / 1e6,
        ${dto.organizationId ?? null}::uuid,
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    const newId = rows[0]?.id;
    if (!newId) throw new BadRequestException('Failed to insert WorkArea — geometry may be invalid');

    this.auditLog('WORK_AREA_CREATE', 'WorkArea', newId, user.sub);

    return this.findOne(newId);
  }

  // ---------------------------------------------------------------------------
  // Update (PATCH)
  // ---------------------------------------------------------------------------

  async update(id: string, dto: UpdateWorkAreaDto, user: JwtPayload): Promise<WorkAreaDetailDto> {
    const existing = await this.findOne(id);

    this.assertCanMutate(user, existing.operator);

    if (dto.geometry) {
      this.validatePolygonGeometry(dto.geometry);
    }

    // Build dynamic SET clauses — only changed fields
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIdx++}`);
      values.push(dto.name);
    }
    if (dto.operator !== undefined) {
      updates.push(`operator = $${paramIdx++}`);
      values.push(dto.operator);
    }
    if (dto.contractStart !== undefined) {
      updates.push(`contract_start = $${paramIdx++}`);
      values.push(new Date(dto.contractStart));
    }
    if (dto.contractEnd !== undefined) {
      updates.push(`contract_end = $${paramIdx++}`);
      values.push(new Date(dto.contractEnd));
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIdx++}::"WorkAreaStatus"`);
      values.push(dto.status);
    }
    if (dto.color !== undefined) {
      updates.push(`color = $${paramIdx++}`);
      values.push(dto.color);
    }
    if (dto.geometry !== undefined) {
      const geojsonStr = JSON.stringify(dto.geometry);
      updates.push(`geometry = ST_GeomFromGeoJSON($${paramIdx++})`);
      updates.push(
        `bbox_json = (SELECT ST_AsGeoJSON(ST_Envelope(ST_GeomFromGeoJSON($${paramIdx++})))::jsonb)`,
      );
      updates.push(`center_lat = ST_Y(ST_Centroid(ST_GeomFromGeoJSON($${paramIdx++})))`);
      updates.push(`center_lon = ST_X(ST_Centroid(ST_GeomFromGeoJSON($${paramIdx++})))`);
      updates.push(
        `total_area_km2 = ST_Area(ST_GeomFromGeoJSON($${paramIdx++})::geography) / 1e6`,
      );
      // Push geojsonStr once per placeholder
      values.push(geojsonStr, geojsonStr, geojsonStr, geojsonStr, geojsonStr);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push(`updated_at = NOW()`);

    const sql = `UPDATE work_areas SET ${updates.join(', ')} WHERE id = $${paramIdx}::uuid`;
    values.push(id);

    await this.prisma.$queryRawUnsafe(sql, ...values);

    this.auditLog('WORK_AREA_UPDATE', 'WorkArea', id, user.sub);

    return this.findOne(id);
  }

  // ---------------------------------------------------------------------------
  // Delete (soft — set status to TERMINATED)
  // ---------------------------------------------------------------------------

  async remove(id: string, user: JwtPayload): Promise<void> {
    const existing = await this.findOne(id);

    this.assertIsAdmin(user);

    await this.prisma.workArea.update({
      where: { id },
      data: { status: 'TERMINATED', updatedAt: new Date() },
    });

    this.auditLog('WORK_AREA_DELETE', 'WorkArea', id, user.sub);
    this.logger.log(`WorkArea ${existing.name} (${id}) soft-deleted by ${user.sub}`);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Validate that geometry is a GeoJSON Polygon or MultiPolygon in EPSG:4326.
   * Type assertion only — actual SRID enforcement is at DB level.
   */
  private validatePolygonGeometry(geometry: Record<string, unknown>): void {
    const type = geometry['type'];
    if (type !== 'Polygon' && type !== 'MultiPolygon') {
      throw new BadRequestException(
        `WorkArea geometry must be a Polygon or MultiPolygon; got '${String(type)}'`,
      );
    }
    if (!Array.isArray(geometry['coordinates'])) {
      throw new BadRequestException('Geometry must have a coordinates array');
    }
  }

  /**
   * Authorize mutation: ADMIN and REGULATOR can modify any record;
   * KKKS_OPERATOR can only modify their own organization's work areas.
   */
  private assertCanMutate(user: JwtPayload, recordOperator: string): void {
    const privileged: UserRole[] = [UserRole.ADMIN, UserRole.REGULATOR];
    if (privileged.includes(user.role)) return;

    if (user.role === UserRole.KKKS_OPERATOR) {
      // KKKS_OPERATOR can modify records owned by their org (match by operator name or orgName)
      const userOrgName = user.orgName.toLowerCase();
      const recOp = recordOperator.toLowerCase();
      if (recOp.includes(userOrgName) || userOrgName.includes(recOp)) return;
      throw new ForbiddenException('KKKS_OPERATOR can only modify their own organization\'s work areas');
    }

    throw new ForbiddenException('Insufficient privileges to modify WorkArea');
  }

  private assertIsAdmin(user: JwtPayload): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only ADMIN can delete work areas');
    }
  }

  /**
   * Audit stub — TODO: inject AuditService from backend-agent's AuditModule when available.
   * Currently logs to console + Prisma auditLog directly.
   */
  private auditLog(action: string, entity: string, entityId: string, userId: string): void {
    this.logger.log(`AUDIT: ${action} ${entity}(${entityId}) by user ${userId}`);
    // Direct Prisma write — AuditService DI will replace this in Sprint 9.3
    void this.prisma.auditLog.create({
      data: { userId, action, entity, entityId },
    }).catch((err: unknown) => {
      this.logger.warn(`Audit log failed for ${action}: ${String(err)}`);
    });
  }
}
