import { ApiPropertyOptional } from '@nestjs/swagger';
import { MonitoringPipelineType, PipelineRunStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListPipelineRunsDto {
  @ApiPropertyOptional({ enum: PipelineRunStatus })
  @IsEnum(PipelineRunStatus)
  @IsOptional()
  status?: PipelineRunStatus;

  @ApiPropertyOptional({ enum: MonitoringPipelineType })
  @IsEnum(MonitoringPipelineType)
  @IsOptional()
  type?: MonitoringPipelineType;

  @ApiPropertyOptional({ description: 'Filter by dataset UUID' })
  @IsUUID()
  @IsOptional()
  datasetId?: string;

  @ApiPropertyOptional({ description: 'Filter runs starting on or after this date (ISO 8601)' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Filter runs starting on or before this date (ISO 8601)' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateTo?: Date;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
