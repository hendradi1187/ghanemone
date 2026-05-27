import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsHexColor,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { WorkAreaStatus } from '@prisma/client';

const VALID_STATUSES: WorkAreaStatus[] = ['ACTIVE', 'EXPIRED', 'PENDING', 'TERMINATED'];

/**
 * DTO for creating a new WorkArea (Wilayah Kerja).
 * Geometry must be a GeoJSON Polygon in EPSG:4326 (WGS84).
 * Derived fields (bbox, centroid, area) are computed server-side via PostGIS.
 */
export class CreateWorkAreaDto {
  @ApiProperty({ description: 'WK display name, must be unique', example: 'WK ONWJ' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: 'URL-friendly slug, must be unique', example: 'wk-onwj' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug!: string;

  @ApiProperty({ description: 'Operator company name', example: 'PHE ONWJ' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  operator!: string;

  @ApiProperty({ description: 'PSC contract start date (ISO 8601)', example: '2018-08-09' })
  @IsDateString()
  contractStart!: string;

  @ApiProperty({ description: 'PSC contract end date (ISO 8601)', example: '2048-08-08' })
  @IsDateString()
  contractEnd!: string;

  @ApiPropertyOptional({ enum: VALID_STATUSES, default: 'ACTIVE' })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: WorkAreaStatus;

  @ApiPropertyOptional({ description: 'Map display color (hex)', example: '#7a5cb8' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({
    description: 'GeoJSON Polygon geometry in EPSG:4326. Coordinates are [lon, lat] pairs.',
    example: {
      type: 'Polygon',
      coordinates: [[[107.1, -5.55], [108.9, -5.4], [108.8, -6.35], [107.05, -6.1], [107.1, -5.55]]],
    },
  })
  @IsObject()
  geometry!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Organization UUID (KKKS operator org)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
