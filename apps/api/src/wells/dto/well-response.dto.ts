import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WellListItemDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) uwi!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty() operator!: string;
  @ApiPropertyOptional({ nullable: true }) workAreaId!: string | null;
  @ApiProperty() type!: string;
  @ApiProperty() status!: string;
  @ApiProperty() latitude!: number;
  @ApiProperty() longitude!: number;
  @ApiPropertyOptional({ nullable: true }) totalDepthM!: number | null;
  @ApiPropertyOptional({ nullable: true }) formation!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class WellDetailDto extends WellListItemDto {
  @ApiPropertyOptional({ nullable: true, description: 'GeoJSON Point geometry (EPSG:4326)' })
  geometry!: Record<string, unknown> | null;
  @ApiPropertyOptional({ nullable: true }) spudDate!: string | null;
  @ApiPropertyOptional({ nullable: true }) tdDate!: string | null;
  @ApiPropertyOptional({ nullable: true }) kbElevationM!: number | null;
  @ApiPropertyOptional({ nullable: true }) reservoir!: string | null;
}

export class PaginatedWellsDto {
  @ApiProperty({ type: [WellListItemDto] }) items!: WellListItemDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
