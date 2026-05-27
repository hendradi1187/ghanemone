import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FacilityStatus, FacilityType } from '@prisma/client';

const VALID_TYPES: FacilityType[] = [
  'PLATFORM', 'FPSO', 'REFINERY', 'STORAGE_TANK',
  'COMPRESSOR_STATION', 'PROCESSING_PLANT', 'SUBSEA_MANIFOLD', 'METERING_STATION',
];
const VALID_STATUSES: FacilityStatus[] = ['ACTIVE', 'STANDBY', 'DECOMMISSIONED', 'UNDER_CONSTRUCTION'];

export class UpdateFacilityDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional({ enum: VALID_TYPES }) @IsOptional() @IsIn(VALID_TYPES) type?: FacilityType;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) operator?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() workAreaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) longitude?: number;
  @ApiPropertyOptional({ enum: VALID_STATUSES }) @IsOptional() @IsIn(VALID_STATUSES) status?: FacilityStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() waterDepthM?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1950) @Max(2100) installYear?: number;
}
