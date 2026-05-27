import { ApiProperty } from '@nestjs/swagger';

export class OverviewStatsDto {
  @ApiProperty({ description: 'Total dataset count' }) totalDatasets!: number;
  @ApiProperty({ description: 'Total organization count' }) totalProviders!: number;
  @ApiProperty({ description: 'Total work area (WK) count' }) totalWorkAreas!: number;
  @ApiProperty({ description: 'Total well count' }) totalWells!: number;
  @ApiProperty({ description: 'Total facility count' }) totalFacilities!: number;
  @ApiProperty({ description: 'Total pipeline count' }) totalPipelines!: number;
  @ApiProperty({ description: 'Data availability percentage (0-100)' }) dataAvailability!: number;
  @ApiProperty({ description: 'Datasets created in last 30 days' }) growthLastMonth!: number;
  @ApiProperty({ description: 'Datasets with status=PENDING_REVIEW' }) pendingApprovals!: number;
  @ApiProperty({ description: 'Active alerts with severity WARNING or above' }) activeAlerts!: number;
}

export class DatasetsByCategoryItemDto {
  @ApiProperty() category!: string;
  @ApiProperty() count!: number;
  @ApiProperty({ description: 'Human-readable label' }) label!: string;
}

export class DatasetsByMonthItemDto {
  @ApiProperty({ description: 'Month key in YYYY-MM format' }) month!: string;
  @ApiProperty() count!: number;
  @ApiProperty({ description: 'Human-readable label e.g. Jan 2026' }) label!: string;
}

export class UploadsByProviderItemDto {
  @ApiProperty() providerId!: string;
  @ApiProperty() providerName!: string;
  @ApiProperty() count!: number;
}

export class ComplianceStatusDto {
  @ApiProperty() draft!: number;
  @ApiProperty() pendingReview!: number;
  @ApiProperty() approved!: number;
  @ApiProperty() rejected!: number;
  @ApiProperty() archived!: number;
  @ApiProperty() total!: number;
}
