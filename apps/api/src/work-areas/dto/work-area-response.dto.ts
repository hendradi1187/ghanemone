import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response shape for WorkArea list items.
 * Geometry is omitted — use GET /spatial/work-areas.geojson for that.
 */
export class WorkAreaListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiProperty() operator!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) contractStart!: string;
  @ApiPropertyOptional({ nullable: true }) contractEnd!: string;
  @ApiPropertyOptional({ nullable: true }) color!: string | null;
  @ApiPropertyOptional({ nullable: true }) totalAreaKm2!: number | null;
  @ApiPropertyOptional({ nullable: true }) centerLat!: number | null;
  @ApiPropertyOptional({ nullable: true }) centerLon!: number | null;
  @ApiPropertyOptional({ nullable: true }) bboxJson!: unknown;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class WorkAreaDetailDto extends WorkAreaListItemDto {
  @ApiPropertyOptional({ nullable: true, description: 'GeoJSON Polygon geometry in EPSG:4326' })
  geometry!: Record<string, unknown> | null;
}

export class PaginatedWorkAreasDto {
  @ApiProperty({ type: [WorkAreaListItemDto] })
  items!: WorkAreaListItemDto[];

  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
