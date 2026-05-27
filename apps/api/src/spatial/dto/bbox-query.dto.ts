import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type SpatialLayerType =
  | 'datasets'
  | 'work_areas'
  | 'wells'
  | 'pipelines'
  | 'facilities'
  | 'seismic_coverages';

const VALID_TYPES: SpatialLayerType[] = [
  'datasets',
  'work_areas',
  'wells',
  'pipelines',
  'facilities',
  'seismic_coverages',
];

/**
 * Query parameters for bounding-box spatial query.
 * All coordinates must be EPSG:4326 (WGS84 decimal degrees).
 */
export class BboxQueryDto {
  @ApiProperty({ description: 'Minimum longitude (west edge), EPSG:4326', example: 110 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  minLon!: number;

  @ApiProperty({ description: 'Minimum latitude (south edge), EPSG:4326', example: -8 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  minLat!: number;

  @ApiProperty({ description: 'Maximum longitude (east edge), EPSG:4326', example: 120 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  maxLon!: number;

  @ApiProperty({ description: 'Maximum latitude (north edge), EPSG:4326', example: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  maxLat!: number;

  @ApiProperty({
    description: 'Layer type to query',
    enum: VALID_TYPES,
    example: 'datasets',
  })
  @IsIn(VALID_TYPES)
  type!: SpatialLayerType;

  @ApiPropertyOptional({ description: 'Max results to return (cursor-based), default 100', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({ description: 'Cursor: last ID from previous page (UUID)', example: null })
  @IsOptional()
  cursor?: string;
}
