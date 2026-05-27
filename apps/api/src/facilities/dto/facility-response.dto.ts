import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FacilityListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() type!: string;
  @ApiProperty() operator!: string;
  @ApiPropertyOptional({ nullable: true }) workAreaId!: string | null;
  @ApiProperty() latitude!: number;
  @ApiProperty() longitude!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) waterDepthM!: number | null;
  @ApiPropertyOptional({ nullable: true }) installYear!: number | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class FacilityDetailDto extends FacilityListItemDto {
  @ApiPropertyOptional({ nullable: true, description: 'GeoJSON Point geometry (EPSG:4326)' })
  geometry!: Record<string, unknown> | null;
}

export class PaginatedFacilitiesDto {
  @ApiProperty({ type: [FacilityListItemDto] }) items!: FacilityListItemDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
