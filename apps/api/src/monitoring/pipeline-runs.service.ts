import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ListPipelineRunsDto } from './dto/list-pipeline-runs.dto';
import type {
  PaginatedPipelineRunsDto,
  PipelineRunResponseDto,
} from './dto/pipeline-run-response.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PipelineRunsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListPipelineRunsDto): Promise<PaginatedPipelineRunsDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PipelineRunWhereInput = {
      ...(dto.status && { status: dto.status }),
      ...(dto.type && { type: dto.type }),
      ...(dto.datasetId && { datasetId: dto.datasetId }),
      ...(dto.dateFrom || dto.dateTo
        ? {
            startedAt: {
              ...(dto.dateFrom && { gte: dto.dateFrom }),
              ...(dto.dateTo && { lte: dto.dateTo }),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.pipelineRun.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          dataset: { select: { id: true, title: true } },
        },
      }),
      this.prisma.pipelineRun.count({ where }),
    ]);

    return {
      items: items.map((r) => this.mapToResponse(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PipelineRunResponseDto> {
    const run = await this.prisma.pipelineRun.findUnique({
      where: { id },
      include: { dataset: { select: { id: true, title: true } } },
    });
    if (!run) throw new NotFoundException(`PipelineRun ${id} not found`);
    return this.mapToResponse(run);
  }

  private mapToResponse(r: {
    id: string;
    name: string;
    type: PipelineRunResponseDto['type'];
    status: PipelineRunResponseDto['status'];
    startedAt: Date;
    finishedAt: Date | null;
    durationMs: number | null;
    recordCount: number | null;
    errorMessage: string | null;
    dataset?: { id: string; title: string } | null;
    organizationId: string;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
  }): PipelineRunResponseDto {
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      status: r.status,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
      durationMs: r.durationMs,
      recordCount: r.recordCount,
      errorMessage: r.errorMessage,
      dataset: r.dataset ?? null,
      organizationId: r.organizationId,
      metadata: r.metadata as Record<string, unknown> | null,
      createdAt: r.createdAt,
    };
  }
}
