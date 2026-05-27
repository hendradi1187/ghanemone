import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import type { ListProjectsDto } from './dto/list-projects.dto';
import type {
  PaginatedProjectsResponseDto,
  ProjectDetailResponseDto,
  ProjectResponseDto,
} from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // findAll — paginated list, RBAC org-scoped for non-admin
  // ---------------------------------------------------------------------------
  async findAll(
    dto: ListProjectsDto,
    user: JwtPayload,
  ): Promise<PaginatedProjectsResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(dto, user);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true, slug: true } },
          _count: { select: { tasks: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: items.map((p) => this.mapToResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------------------------------------------------------------------------
  // findOne — detail with task counts grouped by status
  // ---------------------------------------------------------------------------
  async findOne(id: string, user: JwtPayload): Promise<ProjectDetailResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    this.assertOrgAccess(project.organizationId, user);

    // Task counts grouped by status — single aggregation query
    const taskGroups = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: { status: true },
    });

    const taskCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    };
    for (const g of taskGroups) {
      taskCounts[g.status] = g._count.status;
    }

    return {
      ...this.mapToResponse(project),
      taskCounts,
    };
  }

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  async create(dto: CreateProjectDto, user: JwtPayload): Promise<ProjectDetailResponseDto> {
    const orgId = dto.organizationId ?? user.orgId;

    // Non-admin can only create in own org
    if (user.role !== UserRole.ADMIN && orgId !== user.orgId) {
      throw new ForbiddenException('Cannot create project in a different organization');
    }

    // Slug uniqueness check (friendlier error than DB constraint)
    const existing = await this.prisma.project.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Slug '${dto.slug}' is already taken`);
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        status: dto.status ?? ProjectStatus.ACTIVE,
        color: dto.color,
        ownerId: user.sub,
        organizationId: orgId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { tasks: true } },
      },
    });

    this.logger.log(`Project created: ${project.id} by user ${user.sub}`);

    return {
      ...this.mapToResponse(project),
      taskCounts: { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 },
    };
  }

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  async update(
    id: string,
    dto: UpdateProjectDto,
    user: JwtPayload,
  ): Promise<ProjectDetailResponseDto> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    this.assertOwnerOrAdmin(project.ownerId, user);

    if (dto.slug && dto.slug !== project.slug) {
      const conflict = await this.prisma.project.findUnique({ where: { slug: dto.slug } });
      if (conflict) throw new ConflictException(`Slug '${dto.slug}' is already taken`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { tasks: true } },
      },
    });

    const taskGroups = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: { status: true },
    });
    const taskCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    for (const g of taskGroups) taskCounts[g.status] = g._count.status;

    return { ...this.mapToResponse(updated), taskCounts };
  }

  // ---------------------------------------------------------------------------
  // remove — soft delete: set status=ARCHIVED
  // ---------------------------------------------------------------------------
  async remove(id: string, user: JwtPayload): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    this.assertOwnerOrAdmin(project.ownerId, user);

    await this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.ARCHIVED },
    });

    this.logger.log(`Project ${id} archived by user ${user.sub}`);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildWhere(dto: ListProjectsDto, user: JwtPayload) {
    const where: {
      status?: ProjectStatus;
      organizationId?: string;
    } = {};

    if (dto.status) where.status = dto.status;

    if (user.role === UserRole.ADMIN) {
      if (dto.organizationId) where.organizationId = dto.organizationId;
    } else {
      // Non-admin always scoped to their own org
      where.organizationId = user.orgId;
    }

    return where;
  }

  private assertOrgAccess(orgId: string, user: JwtPayload): void {
    if (user.role !== UserRole.ADMIN && orgId !== user.orgId) {
      throw new ForbiddenException('Access denied to this project');
    }
  }

  private assertOwnerOrAdmin(ownerId: string, user: JwtPayload): void {
    if (user.role === UserRole.ADMIN) return;
    if (ownerId !== user.sub) {
      throw new ForbiddenException('Only the project owner or admin can perform this action');
    }
  }

  private mapToResponse(
    p: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      status: ProjectStatus;
      color: string | null;
      owner: { id: string; name: string; email: string };
      organization: { id: string; name: string; slug: string };
      _count: { tasks: number };
      createdAt: Date;
      updatedAt: Date;
    },
  ): ProjectResponseDto {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status,
      color: p.color,
      owner: p.owner,
      organization: p.organization,
      taskCount: p._count.tasks,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}

// Re-export for use in controller return types
export type { ProjectResponseDto };
