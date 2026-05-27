import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DatasetCategory,
  DatasetStatus,
  Prisma,
  SensitivityLevel,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit.constants';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreateDatasetDto } from './dto/create-dataset.dto';
import type { UpdateDatasetDto } from './dto/update-dataset.dto';
import type { ListDatasetsDto } from './dto/list-datasets.dto';
import type { ApproveDatasetDto, RejectDatasetDto } from './dto/approve-dataset.dto';
import type {
  CompactDatasetResponseDto,
  DetailDatasetResponseDto,
  DownloadResponseDto,
  PaginatedDatasetsResponseDto,
} from './dto/dataset-response.dto';

// ---------------------------------------------------------------------------
// Category visual map — derived constants (not stored in DB)
// ---------------------------------------------------------------------------
const CATEGORY_META: Record<
  DatasetCategory,
  { label: string; color: string }
> = {
  [DatasetCategory.SEISMIC]: { label: 'Seismic 2D/3D', color: '#2a5fb8' },
  [DatasetCategory.WELL_LOG]: { label: 'Well Log', color: '#1f8a4a' },
  [DatasetCategory.PRODUCTION]: { label: 'Production', color: '#c2840d' },
  [DatasetCategory.CONCESSION]: { label: 'Concession & WK', color: '#7a5cb8' },
  [DatasetCategory.GEOLOGY]: { label: 'Geology & Geochemistry', color: '#cf3a2a' },
  [DatasetCategory.DOCUMENT]: { label: 'Document', color: '#5b667e' },
  [DatasetCategory.INFRASTRUCTURE]: { label: 'Infrastructure', color: '#4b7a8a' },
};

// Organization color palette — cycle deterministically by org name initial
const ORG_COLORS = [
  '#2a5fb8',
  '#1f8a4a',
  '#c2840d',
  '#7a5cb8',
  '#cf3a2a',
  '#5b667e',
  '#4b7a8a',
  '#a04a1a',
];

function orgColor(name: string): string {
  const index = name.charCodeAt(0) % ORG_COLORS.length;
  return ORG_COLORS[index] ?? '#5b667e';
}

function orgInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Full dataset include — used for both list + detail queries
// ---------------------------------------------------------------------------
const DATASET_INCLUDE_COMPACT = {
  organization: { select: { id: true, name: true, slug: true } },
  uploader: { select: { id: true, name: true, email: true } },
  workArea: { select: { id: true, name: true } },
} satisfies Prisma.DatasetInclude;

@Injectable()
export class DatasetsService {
  private readonly logger = new Logger(DatasetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // LIST
  // ---------------------------------------------------------------------------

  async findAll(
    query: ListDatasetsDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedDatasetsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const order = query.order ?? 'desc';

    const where: Prisma.DatasetWhereInput = {
      ...this.buildSensitivityFilter(currentUser),
      ...(query.category ? { category: query.category } : {}),
      ...(query.providerId ? { organizationId: query.providerId } : {}),
      ...(query.format ? { format: { equals: query.format, mode: 'insensitive' } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.sensitivity ? { sensitivityLevel: query.sensitivity } : {}),
      ...(query.verified !== undefined
        ? { verified: query.verified === 'true' }
        : {}),
      ...(query.workAreaId ? { workAreaId: query.workAreaId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [datasets, total] = await this.prisma.$transaction([
      this.prisma.dataset.findMany({
        where,
        include: DATASET_INCLUDE_COMPACT,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      this.prisma.dataset.count({ where }),
    ]);

    return {
      items: datasets.map((d) => this.toCompactDto(d)),
      total,
      page,
      limit,
    };
  }

  // ---------------------------------------------------------------------------
  // GET ONE
  // ---------------------------------------------------------------------------

  async findOne(id: string, currentUser: JwtPayload): Promise<DetailDatasetResponseDto> {
    const dataset = await this.prisma.dataset.findUnique({
      where: { id },
      include: DATASET_INCLUDE_COMPACT,
    });

    if (!dataset) {
      throw new NotFoundException(`Dataset ${id} not found`);
    }

    this.assertCanRead(dataset, currentUser);

    // Increment view count (fire-and-forget, no await to keep p99 low)
    void this.prisma.dataset
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => {
        this.logger.warn(`Failed to increment viewCount for ${id}: ${String(err)}`);
      });

    return this.toDetailDto(dataset);
  }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  async create(
    dto: CreateDatasetDto,
    currentUser: JwtPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DetailDatasetResponseDto> {
    // Validate workArea if provided
    if (dto.workAreaId) {
      const wa = await this.prisma.workArea.findUnique({ where: { id: dto.workAreaId } });
      if (!wa) throw new NotFoundException(`WorkArea ${dto.workAreaId} not found`);
    }

    const dataset = await this.prisma.dataset.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category,
        format: dto.format,
        sensitivityLevel: dto.sensitivityLevel ?? SensitivityLevel.INTERNAL,
        status: DatasetStatus.DRAFT,
        workAreaId: dto.workAreaId ?? null,
        uploaderId: currentUser.sub,
        organizationId: currentUser.orgId,
        year: dto.year ?? null,
        surveyYear: dto.surveyYear ?? null,
        bboxJson: dto.bboxJson
          ? (dto.bboxJson as unknown as Prisma.InputJsonValue)
          : undefined,
        centerLat: dto.centerLat ?? null,
        centerLon: dto.centerLon ?? null,
        metadata: dto.metadata
          ? (dto.metadata as Prisma.InputJsonValue)
          : undefined,
        dataQuality: dto.dataQuality
          ? (dto.dataQuality as Prisma.InputJsonValue)
          : undefined,
      },
      include: DATASET_INCLUDE_COMPACT,
    });

    void this.audit.log({
      userId: currentUser.sub,
      action: AuditAction.DATASET_CREATE,
      entity: 'Dataset',
      entityId: dataset.id,
      metadata: { title: dataset.title, category: dataset.category },
      ipAddress,
      userAgent,
    });

    this.logger.log(`Dataset created: ${dataset.id} by ${currentUser.email}`);
    return this.toDetailDto(dataset);
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  async update(
    id: string,
    dto: UpdateDatasetDto,
    currentUser: JwtPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DetailDatasetResponseDto> {
    const dataset = await this.prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new NotFoundException(`Dataset ${id} not found`);

    this.assertCanModify(dataset, currentUser);

    if (dto.workAreaId) {
      const wa = await this.prisma.workArea.findUnique({ where: { id: dto.workAreaId } });
      if (!wa) throw new NotFoundException(`WorkArea ${dto.workAreaId} not found`);
    }

    const updated = await this.prisma.dataset.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.format !== undefined ? { format: dto.format } : {}),
        ...(dto.sensitivityLevel !== undefined
          ? { sensitivityLevel: dto.sensitivityLevel }
          : {}),
        ...(dto.workAreaId !== undefined ? { workAreaId: dto.workAreaId } : {}),
        ...(dto.year !== undefined ? { year: dto.year } : {}),
        ...(dto.surveyYear !== undefined ? { surveyYear: dto.surveyYear } : {}),
        ...(dto.bboxJson !== undefined
          ? { bboxJson: dto.bboxJson as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.centerLat !== undefined ? { centerLat: dto.centerLat } : {}),
        ...(dto.centerLon !== undefined ? { centerLon: dto.centerLon } : {}),
        ...(dto.metadata !== undefined
          ? { metadata: dto.metadata as Prisma.InputJsonValue }
          : {}),
        ...(dto.dataQuality !== undefined
          ? { dataQuality: dto.dataQuality as Prisma.InputJsonValue }
          : {}),
      },
      include: DATASET_INCLUDE_COMPACT,
    });

    void this.audit.log({
      userId: currentUser.sub,
      action: AuditAction.DATASET_UPDATE,
      entity: 'Dataset',
      entityId: id,
      metadata: { updatedFields: Object.keys(dto) },
      ipAddress,
      userAgent,
    });

    return this.toDetailDto(updated);
  }

  // ---------------------------------------------------------------------------
  // DELETE (soft — status → ARCHIVED)
  // ---------------------------------------------------------------------------

  async remove(
    id: string,
    currentUser: JwtPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const dataset = await this.prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new NotFoundException(`Dataset ${id} not found`);

    this.assertCanModify(dataset, currentUser);

    await this.prisma.dataset.update({
      where: { id },
      data: { status: DatasetStatus.ARCHIVED },
    });

    void this.audit.log({
      userId: currentUser.sub,
      action: AuditAction.DATASET_DELETE,
      entity: 'Dataset',
      entityId: id,
      metadata: { title: dataset.title },
      ipAddress,
      userAgent,
    });

    this.logger.log(`Dataset ${id} archived by ${currentUser.email}`);
  }

  // ---------------------------------------------------------------------------
  // APPROVE
  // ---------------------------------------------------------------------------

  async approve(
    id: string,
    dto: ApproveDatasetDto,
    currentUser: JwtPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DetailDatasetResponseDto> {
    const dataset = await this.prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new NotFoundException(`Dataset ${id} not found`);

    if (
      dataset.status !== DatasetStatus.PENDING_REVIEW &&
      dataset.status !== DatasetStatus.DRAFT
    ) {
      throw new ForbiddenException(
        `Cannot approve dataset in status ${dataset.status}`,
      );
    }

    const updated = await this.prisma.dataset.update({
      where: { id },
      data: {
        status: DatasetStatus.APPROVED,
        verified: true,
        publishedAt: new Date(),
      },
      include: DATASET_INCLUDE_COMPACT,
    });

    void this.audit.log({
      userId: currentUser.sub,
      action: AuditAction.DATASET_APPROVE,
      entity: 'Dataset',
      entityId: id,
      metadata: { notes: dto.notes },
      ipAddress,
      userAgent,
    });

    this.logger.log(`Dataset ${id} approved by ${currentUser.email}`);
    return this.toDetailDto(updated);
  }

  // ---------------------------------------------------------------------------
  // REJECT
  // ---------------------------------------------------------------------------

  async reject(
    id: string,
    dto: RejectDatasetDto,
    currentUser: JwtPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DetailDatasetResponseDto> {
    const dataset = await this.prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new NotFoundException(`Dataset ${id} not found`);

    const updated = await this.prisma.dataset.update({
      where: { id },
      data: { status: DatasetStatus.REJECTED },
      include: DATASET_INCLUDE_COMPACT,
    });

    void this.audit.log({
      userId: currentUser.sub,
      action: AuditAction.DATASET_REJECT,
      entity: 'Dataset',
      entityId: id,
      metadata: { reason: dto.reason },
      ipAddress,
      userAgent,
    });

    this.logger.log(`Dataset ${id} rejected by ${currentUser.email}`);
    return this.toDetailDto(updated);
  }

  // ---------------------------------------------------------------------------
  // DOWNLOAD — returns signed URL (stub; real implementation via UploadModule)
  // ---------------------------------------------------------------------------

  async download(
    id: string,
    currentUser: JwtPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DownloadResponseDto> {
    const dataset = await this.prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new NotFoundException(`Dataset ${id} not found`);

    this.assertCanRead(dataset, currentUser);

    // Increment download count (fire-and-forget)
    void this.prisma.dataset
      .update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      })
      .catch((err) =>
        this.logger.warn(`Failed to increment downloadCount: ${String(err)}`),
      );

    void this.audit.log({
      userId: currentUser.sub,
      action: AuditAction.DATASET_DOWNLOAD,
      entity: 'Dataset',
      entityId: id,
      metadata: { fileUrl: dataset.fileUrl },
      ipAddress,
      userAgent,
    });

    // TODO Sprint 9.3 (UploadModule): generate real MinIO pre-signed URL
    // For now return the stored fileUrl directly if available
    return {
      url: dataset.fileUrl ?? null,
      expiresAt: dataset.fileUrl
        ? new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h stub
        : null,
    };
  }

  // ---------------------------------------------------------------------------
  // Spatial stub — gis-agent will extend this in Sprint 9.3
  // ---------------------------------------------------------------------------

  /**
   * @reserved for gis-agent (Sprint 9.3)
   * Returns datasets whose bbox intersects the provided bounding box.
   * Currently falls back to findMany without spatial filter.
   * gis-agent will replace this with:
   *   SELECT * FROM datasets WHERE ST_Intersects(bbox, ST_MakeEnvelope(..., 4326))
   */
  protected async findInBoundingBox(
    _minLon: number,
    _minLat: number,
    _maxLon: number,
    _maxLat: number,
    _currentUser: JwtPayload,
  ): Promise<CompactDatasetResponseDto[]> {
    this.logger.warn('findInBoundingBox: spatial filter not yet implemented — returning empty');
    return [];
  }

  // ---------------------------------------------------------------------------
  // RBAC helpers
  // ---------------------------------------------------------------------------

  /**
   * Build a Prisma WHERE clause that scopes sensitivity based on the requesting user's role.
   *
   * PUBLIC sensitivity → all authenticated users
   * INTERNAL → user's org OR REGULATOR OR ADMIN
   * CONFIDENTIAL → uploader's org OR REGULATOR OR ADMIN
   * RESTRICTED → uploader only OR ADMIN
   */
  private buildSensitivityFilter(user: JwtPayload): Prisma.DatasetWhereInput {
    const { role, sub: userId, orgId } = user;

    if (role === UserRole.ADMIN) {
      // Admin sees everything
      return {};
    }

    if (role === UserRole.REGULATOR) {
      // Regulator sees all except RESTRICTED (only Admin and uploader)
      return {
        sensitivityLevel: {
          not: SensitivityLevel.RESTRICTED,
        },
      };
    }

    if (role === UserRole.KKKS_OPERATOR || role === UserRole.ANALYST) {
      // Can see:
      //   - PUBLIC always
      //   - INTERNAL if same org
      //   - CONFIDENTIAL if same org
      //   - RESTRICTED if own upload
      return {
        OR: [
          { sensitivityLevel: SensitivityLevel.PUBLIC },
          {
            sensitivityLevel: SensitivityLevel.INTERNAL,
            organizationId: orgId,
          },
          {
            sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
            organizationId: orgId,
          },
          {
            sensitivityLevel: SensitivityLevel.RESTRICTED,
            uploaderId: userId,
          },
        ],
      };
    }

    // PUBLIC role — can only see PUBLIC datasets
    return { sensitivityLevel: SensitivityLevel.PUBLIC };
  }

  /**
   * Throw ForbiddenException if the user cannot read this specific dataset.
   */
  private assertCanRead(
    dataset: { sensitivityLevel: SensitivityLevel; organizationId: string | null; uploaderId: string | null },
    user: JwtPayload,
  ): void {
    const { role, sub: userId, orgId } = user;

    if (role === UserRole.ADMIN) return;
    if (role === UserRole.REGULATOR && dataset.sensitivityLevel !== SensitivityLevel.RESTRICTED) return;

    switch (dataset.sensitivityLevel) {
      case SensitivityLevel.PUBLIC:
        return; // All authenticated users

      case SensitivityLevel.INTERNAL:
        if (dataset.organizationId === orgId || role === UserRole.REGULATOR) return;
        break;

      case SensitivityLevel.CONFIDENTIAL:
        if (dataset.organizationId === orgId) return;
        break;

      case SensitivityLevel.RESTRICTED:
        if (dataset.uploaderId === userId) return;
        break;
    }

    throw new ForbiddenException('Insufficient access level to view this dataset');
  }

  /**
   * Throw ForbiddenException if the user cannot modify this dataset.
   * Uploader (own) or ADMIN can modify.
   */
  private assertCanModify(
    dataset: { uploaderId: string | null },
    user: JwtPayload,
  ): void {
    if (user.role === UserRole.ADMIN) return;
    if (dataset.uploaderId === user.sub) return;
    throw new ForbiddenException('Only the uploader or an Admin can modify this dataset');
  }

  // ---------------------------------------------------------------------------
  // DTO mappers
  // ---------------------------------------------------------------------------

  private toCompactDto(dataset: {
    id: string;
    title: string;
    description: string | null;
    category: DatasetCategory;
    format: string;
    sensitivityLevel: SensitivityLevel;
    status: DatasetStatus;
    verified: boolean;
    year: number | null;
    updatedAt: Date;
    downloadCount: number;
    viewCount: number;
    centerLat: number | null;
    centerLon: number | null;
    bboxJson: Prisma.JsonValue | null;
    organization: { id: string; name: string; slug: string } | null;
  }): CompactDatasetResponseDto {
    const catMeta = CATEGORY_META[dataset.category] ?? {
      label: dataset.category,
      color: '#5b667e',
    };

    const org = dataset.organization;
    const provider = org
      ? {
          id: org.id,
          name: org.name,
          initials: orgInitials(org.name),
          color: orgColor(org.name),
        }
      : { id: 'unknown', name: 'Unknown', initials: '?', color: '#5b667e' };

    let bbox: [number, number, number, number] | null = null;
    if (Array.isArray(dataset.bboxJson) && dataset.bboxJson.length === 4) {
      bbox = dataset.bboxJson as [number, number, number, number];
    }

    return {
      id: dataset.id,
      title: dataset.title,
      description: dataset.description,
      category: {
        id: dataset.category,
        label: catMeta.label,
        color: catMeta.color,
      },
      provider,
      format: dataset.format,
      sensitivity: dataset.sensitivityLevel,
      status: dataset.status,
      verified: dataset.verified,
      year: dataset.year,
      updatedAt: dataset.updatedAt.toISOString(),
      downloadCount: dataset.downloadCount,
      viewCount: dataset.viewCount,
      longitude: dataset.centerLon,
      latitude: dataset.centerLat,
      bbox,
    };
  }

  private toDetailDto(dataset: {
    id: string;
    title: string;
    description: string | null;
    category: DatasetCategory;
    format: string;
    sensitivityLevel: SensitivityLevel;
    status: DatasetStatus;
    verified: boolean;
    year: number | null;
    surveyYear: number | null;
    updatedAt: Date;
    publishedAt: Date | null;
    downloadCount: number;
    viewCount: number;
    centerLat: number | null;
    centerLon: number | null;
    bboxJson: Prisma.JsonValue | null;
    fileUrl: string | null;
    fileSizeBytes: bigint | null;
    metadata: Prisma.JsonValue | null;
    dataQuality: Prisma.JsonValue | null;
    organization: { id: string; name: string; slug: string } | null;
    uploader: { id: string; name: string; email: string } | null;
    workArea: { id: string; name: string } | null;
  }): DetailDatasetResponseDto {
    const compact = this.toCompactDto(dataset);

    return {
      ...compact,
      metadata: dataset.metadata as Record<string, unknown> | null,
      dataQuality: dataset.dataQuality as Record<string, unknown> | null,
      fileUrl: dataset.fileUrl,
      fileSizeBytes: dataset.fileSizeBytes?.toString() ?? null,
      workArea: dataset.workArea ?? null,
      uploader: dataset.uploader ?? null,
      organization: dataset.organization
        ? {
            id: dataset.organization.id,
            name: dataset.organization.name,
            slug: dataset.organization.slug,
          }
        : null,
      surveyYear: dataset.surveyYear,
      publishedAt: dataset.publishedAt?.toISOString() ?? null,
    };
  }
}
