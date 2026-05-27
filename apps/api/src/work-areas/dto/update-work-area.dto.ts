import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsHexColor,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { WorkAreaStatus } from '@prisma/client';

const VALID_STATUSES: WorkAreaStatus[] = ['ACTIVE', 'EXPIRED', 'PENDING', 'TERMINATED'];

/** Partial update — all fields optional. */
export class UpdateWorkAreaDto {
  @ApiPropertyOptional({ example: 'WK ONWJ Updated' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'PHE ONWJ' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  operator?: string;

  @ApiPropertyOptional({ example: '2018-08-09' })
  @IsOptional()
  @IsDateString()
  contractStart?: string;

  @ApiPropertyOptional({ example: '2048-08-08' })
  @IsOptional()
  @IsDateString()
  contractEnd?: string;

  @ApiPropertyOptional({ enum: VALID_STATUSES })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: WorkAreaStatus;

  @ApiPropertyOptional({ example: '#7a5cb8' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Updated GeoJSON Polygon geometry in EPSG:4326. Recomputes bbox/centroid/area.',
  })
  @IsOptional()
  @IsObject()
  geometry?: Record<string, unknown>;
}
