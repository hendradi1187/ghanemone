import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateOrganizationDto,
  OrganizationResponseDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<OrganizationResponseDto[]> {
    const orgs = await this.prisma.organization.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });

    return orgs.map((org) => this.toResponseDto(org));
  }

  async findBySlug(slug: string): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: { _count: { select: { users: true } } },
    });

    if (!org) throw new NotFoundException(`Organization with slug '${slug}' not found`);

    return this.toResponseDto(org);
  }

  async findById(id: string): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!org) throw new NotFoundException(`Organization ${id} not found`);

    return this.toResponseDto(org);
  }

  async create(dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    const existing = await this.prisma.organization.findFirst({
      where: { OR: [{ name: dto.name }, { slug: dto.slug }] },
    });

    if (existing) {
      if (existing.name === dto.name) {
        throw new ConflictException(`Organization with name '${dto.name}' already exists`);
      }
      throw new ConflictException(`Organization with slug '${dto.slug}' already exists`);
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        logoUrl: dto.logoUrl,
      },
      include: { _count: { select: { users: true } } },
    });

    this.logger.log(`Organization created: ${org.name} (${org.slug})`);
    return this.toResponseDto(org);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);

    if (dto.name && dto.name !== org.name) {
      const nameTaken = await this.prisma.organization.findUnique({ where: { name: dto.name } });
      if (nameTaken) throw new ConflictException(`Organization name '${dto.name}' already taken`);
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      },
      include: { _count: { select: { users: true } } },
    });

    return this.toResponseDto(updated);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private toResponseDto(
    org: {
      id: string;
      name: string;
      slug: string;
      type: import('@prisma/client').OrganizationType;
      logoUrl: string | null;
      _count: { users: number };
      createdAt: Date;
      updatedAt: Date;
    },
  ): OrganizationResponseDto {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.type,
      logoUrl: org.logoUrl,
      userCount: org._count.users,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
    };
  }
}
