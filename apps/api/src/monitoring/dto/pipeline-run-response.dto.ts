import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonitoringPipelineType, PipelineRunStatus } from '@prisma/client';

export class PipelineRunDatasetDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
}

export class PipelineRunResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: MonitoringPipelineType }) type!: MonitoringPipelineType;
  @ApiProperty({ enum: PipelineRunStatus }) status!: PipelineRunStatus;
  @ApiProperty() startedAt!: Date;
  @ApiPropertyOptional() finishedAt?: Date | null;
  @ApiPropertyOptional({ description: 'Execution duration in milliseconds' }) durationMs?: number | null;
  @ApiPropertyOptional() recordCount?: number | null;
  @ApiPropertyOptional() errorMessage?: string | null;
  @ApiPropertyOptional({ type: PipelineRunDatasetDto }) dataset?: PipelineRunDatasetDto | null;
  @ApiProperty() organizationId!: string;
  @ApiPropertyOptional({ type: Object }) metadata?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
}

export class PaginatedPipelineRunsDto {
  @ApiProperty({ type: [PipelineRunResponseDto] }) items!: PipelineRunResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}
