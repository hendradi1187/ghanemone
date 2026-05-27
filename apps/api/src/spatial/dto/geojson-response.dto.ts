import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeoJsonFeatureDto {
  @ApiProperty({ example: 'Feature' })
  type!: 'Feature';

  @ApiPropertyOptional()
  id?: string;

  @ApiProperty({ description: 'GeoJSON geometry (any type)', nullable: true })
  geometry!: Record<string, unknown> | null;

  @ApiProperty({ description: 'Feature properties', type: Object })
  properties!: Record<string, unknown>;
}

export class GeoJsonFeatureCollectionDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type!: 'FeatureCollection';

  @ApiProperty({ type: [GeoJsonFeatureDto] })
  features!: GeoJsonFeatureDto[];

  @ApiPropertyOptional({ description: 'Total feature count', example: 8 })
  totalFeatures?: number;
}

export class BboxQueryResponseDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type!: 'FeatureCollection';

  @ApiProperty({ type: [GeoJsonFeatureDto] })
  features!: GeoJsonFeatureDto[];

  @ApiProperty({ description: 'Number of features returned', example: 42 })
  count!: number;

  @ApiPropertyOptional({ description: 'Cursor for next page (last feature ID), null if exhausted' })
  nextCursor?: string | null;
}
