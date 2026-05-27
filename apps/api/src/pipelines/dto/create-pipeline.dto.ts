import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PipelineStatus, PipelineType } from '@prisma/client';

const VALID_TYPES: PipelineType[] = ['OIL', 'GAS', 'MULTIPHASE', 'WATER', 'CONDENSATE'];
const VALID_STATUSES: PipelineStatus[] = ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'PLANNED'];

export class CreatePipelineDto {
  @ApiProperty({ description: 'Pipeline display name', example: 'ONWJ Offshore Trunk Line' })
  @IsString()
  @MinLength(2)
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

  @ApiProperty({ enum: VALID_TYPES })
  @IsIn(VALID_TYPES)
  type!: PipelineType;

  @ApiPropertyOptional({ enum: VALID_STATUSES, default: 'ACTIVE' })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: PipelineStatus;

  @ApiProperty({
    description: 'GeoJSON LineString geometry in EPSG:4326. Length computed server-side via ST_Length.',
    example: {
      type: 'LineString',
      coordinates: [[107.9, -5.8], [108.0, -5.9], [108.1, -6.0]],
    },
  })
  @IsObject()
  line!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Nominal pipeline diameter (inches)', example: 24 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  diameterIn?: number;

  @ApiPropertyOptional({ description: 'Max operating pressure (bar)', example: 60 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pressureBar?: number;
}
