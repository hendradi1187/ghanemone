import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PipelineStatus, PipelineType } from '@prisma/client';

const VALID_TYPES: PipelineType[] = ['OIL', 'GAS', 'MULTIPHASE', 'WATER', 'CONDENSATE'];
const VALID_STATUSES: PipelineStatus[] = ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'PLANNED'];

export class UpdatePipelineDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) operator?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() workAreaId?: string;
  @ApiPropertyOptional({ enum: VALID_TYPES }) @IsOptional() @IsIn(VALID_TYPES) type?: PipelineType;
  @ApiPropertyOptional({ enum: VALID_STATUSES }) @IsOptional() @IsIn(VALID_STATUSES) status?: PipelineStatus;
  @ApiPropertyOptional({ description: 'Updated GeoJSON LineString geometry (EPSG:4326). Recomputes length_km.' })
  @IsOptional() @IsObject() line?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() diameterIn?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() pressureBar?: number;
}
