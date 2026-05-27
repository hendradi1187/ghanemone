import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkAreaStatus } from '@prisma/client';

const VALID_STATUSES: WorkAreaStatus[] = ['ACTIVE', 'EXPIRED', 'PENDING', 'TERMINATED'];

export class ListWorkAreasDto {
  @ApiPropertyOptional({ description: 'Filter by operator name (partial match)', example: 'PHE' })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ enum: VALID_STATUSES, description: 'Filter by status' })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: WorkAreaStatus;

  @ApiPropertyOptional({ description: 'Filter by work area ID (UUID)', format: 'uuid' })
  @IsOptional()
  @IsString()
  workAreaId?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(200)
  limit?: number;
}
