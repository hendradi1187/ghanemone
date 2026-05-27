import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { type SpatialLayerType } from './bbox-query.dto';

const VALID_TYPES: SpatialLayerType[] = [
  'datasets',
  'work_areas',
  'wells',
  'pipelines',
  'facilities',
  'seismic_coverages',
];

/**
 * Query parameters for within-polygon spatial query.
 * Supply either wktPolygon (WKT) or geojson (serialized GeoJSON Polygon/MultiPolygon string).
 * CRS: EPSG:4326 assumed.
 */
export class WithinQueryDto {
  @ApiPropertyOptional({
    description: 'WKT polygon for containment check, EPSG:4326',
    example: 'POLYGON((107 -6, 109 -6, 109 -5, 107 -5, 107 -6))',
  })
  @IsOptional()
  @IsString()
  wktPolygon?: string;

  @ApiPropertyOptional({
    description: 'GeoJSON Polygon/MultiPolygon serialized as JSON string',
  })
  @IsOptional()
  @IsString()
  geojson?: string;

  @ApiProperty({ description: 'Layer type to query', enum: VALID_TYPES })
  @IsIn(VALID_TYPES)
  type!: SpatialLayerType;

  @ApiPropertyOptional({ description: 'Max results, default 500', example: 500 })
  @IsOptional()
  limit?: number;
}
