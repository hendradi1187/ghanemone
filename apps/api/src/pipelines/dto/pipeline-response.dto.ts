import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PipelineListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() operator!: string;
  @ApiPropertyOptional({ nullable: true }) workAreaId!: string | null;
  @ApiProperty() type!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) lengthKm!: number | null;
  @ApiPropertyOptional({ nullable: true }) diameterIn!: number | null;
  @ApiPropertyOptional({ nullable: true }) pressureBar!: number | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class PipelineDetailDto extends PipelineListItemDto {
  @ApiPropertyOptional({ nullable: true, description: 'GeoJSON LineString geometry (EPSG:4326)' })
  geometry!: Record<string, unknown> | null;
}

export class PaginatedPipelinesDto {
  @ApiProperty({ type: [PipelineListItemDto] }) items!: PipelineListItemDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
