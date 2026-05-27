import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { WellType, WellStatus } from '@prisma/client';

const VALID_TYPES: WellType[] = ['EXPLORATION', 'APPRAISAL', 'DEVELOPMENT', 'PRODUCTION', 'INJECTION'];
const VALID_STATUSES: WellStatus[] = ['ACTIVE', 'ABANDONED', 'SUSPENDED', 'PLANNED'];

export class CreateWellDto {
  @ApiPropertyOptional({ description: 'Unique Well Identifier (UWI)', example: 'GID-WJ-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  uwi?: string;

  @ApiProperty({ description: 'Well display name', example: 'ONWJ-A01' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: 'Operating company', example: 'PHE ONWJ' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  operator!: string;

  @ApiPropertyOptional({ description: 'Parent WorkArea UUID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  workAreaId?: string;

  @ApiProperty({ enum: VALID_TYPES, description: 'Well type' })
  @IsIn(VALID_TYPES)
  type!: WellType;

  @ApiPropertyOptional({ enum: VALID_STATUSES, default: 'ACTIVE' })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: WellStatus;

  @ApiProperty({ description: 'Well-head latitude (WGS84 decimal degrees)', example: -5.85 })
  @IsNumber()
  @Min(-90)
  latitude!: number;

  @ApiProperty({ description: 'Well-head longitude (WGS84 decimal degrees)', example: 107.8 })
  @IsNumber()
  @Min(-180)
  longitude!: number;

  @ApiPropertyOptional({ description: 'Total depth in meters (MD)', example: 2800 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalDepthM?: number;

  @ApiPropertyOptional({ description: 'Spud date (ISO 8601)', example: '2005-03-15' })
  @IsOptional()
  @IsDateString()
  spudDate?: string;

  @ApiPropertyOptional({ description: 'TD reached date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  tdDate?: string;

  @ApiPropertyOptional({ description: 'Kelly Bushing elevation in meters' })
  @IsOptional()
  @IsNumber()
  kbElevationM?: number;

  @ApiPropertyOptional({ description: 'Primary target formation', example: 'Cibulakan Formation' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  formation?: string;

  @ApiPropertyOptional({ description: 'Reservoir lithology' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reservoir?: string;
}
