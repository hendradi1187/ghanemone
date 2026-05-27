import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  MinLength,
} from 'class-validator';
import { FacilityStatus, FacilityType } from '@prisma/client';

const VALID_TYPES: FacilityType[] = [
  'PLATFORM', 'FPSO', 'REFINERY', 'STORAGE_TANK',
  'COMPRESSOR_STATION', 'PROCESSING_PLANT', 'SUBSEA_MANIFOLD', 'METERING_STATION',
];
const VALID_STATUSES: FacilityStatus[] = ['ACTIVE', 'STANDBY', 'DECOMMISSIONED', 'UNDER_CONSTRUCTION'];

export class CreateFacilityDto {
  @ApiProperty({ description: 'Facility display name', example: 'Platform ONWJ-Alpha' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: VALID_TYPES })
  @IsIn(VALID_TYPES)
  type!: FacilityType;

  @ApiProperty({ description: 'Operating company', example: 'PHE ONWJ' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  operator!: string;

  @ApiPropertyOptional({ description: 'Parent WorkArea UUID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  workAreaId?: string;

  @ApiProperty({ description: 'Facility latitude (WGS84 decimal degrees)', example: -5.8 })
  @IsNumber()
  @Min(-90)
  latitude!: number;

  @ApiProperty({ description: 'Facility longitude (WGS84 decimal degrees)', example: 107.9 })
  @IsNumber()
  @Min(-180)
  longitude!: number;

  @ApiPropertyOptional({ enum: VALID_STATUSES, default: 'ACTIVE' })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: FacilityStatus;

  @ApiPropertyOptional({ description: 'Water depth in meters (offshore facilities)', example: 45 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  waterDepthM?: number;

  @ApiPropertyOptional({ description: 'Installation year', example: 1998 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  installYear?: number;
}
