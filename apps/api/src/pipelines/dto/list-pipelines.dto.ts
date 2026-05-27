import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PipelineStatus, PipelineType } from '@prisma/client';

const VALID_TYPES: PipelineType[] = ['OIL', 'GAS', 'MULTIPHASE', 'WATER', 'CONDENSATE'];
const VALID_STATUSES: PipelineStatus[] = ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'PLANNED'];

export class ListPipelinesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() operator?: string;
  @ApiPropertyOptional({ enum: VALID_STATUSES }) @IsOptional() @IsIn(VALID_STATUSES) status?: PipelineStatus;
  @ApiPropertyOptional({ enum: VALID_TYPES }) @IsOptional() @IsIn(VALID_TYPES) type?: PipelineType;
  @ApiPropertyOptional() @IsOptional() @IsUUID() workAreaId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @Type(() => Number) @IsPositive() @Max(200) limit?: number;
}
