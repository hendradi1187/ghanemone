import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityStatus, FacilityType } from '@prisma/client';

const VALID_TYPES: FacilityType[] = [
  'PLATFORM', 'FPSO', 'REFINERY', 'STORAGE_TANK',
  'COMPRESSOR_STATION', 'PROCESSING_PLANT', 'SUBSEA_MANIFOLD', 'METERING_STATION',
];
const VALID_STATUSES: FacilityStatus[] = ['ACTIVE', 'STANDBY', 'DECOMMISSIONED', 'UNDER_CONSTRUCTION'];

export class ListFacilitiesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() operator?: string;
  @ApiPropertyOptional({ enum: VALID_TYPES }) @IsOptional() @IsIn(VALID_TYPES) type?: FacilityType;
  @ApiPropertyOptional({ enum: VALID_STATUSES }) @IsOptional() @IsIn(VALID_STATUSES) status?: FacilityStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() workAreaId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @Type(() => Number) @IsPositive() @Max(200) limit?: number;
}
