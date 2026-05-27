import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DatasetStatus, SensitivityLevel } from '@prisma/client';

/** Category visual metadata — derived server-side, never stored in DB */
export class CategoryMetaDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty() color!: string;
}

/** Provider visual metadata — derived from Organization */
export class ProviderMetaDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() initials!: string;
  @ApiProperty() color!: string;
}

/**
 * CompactDatasetResponse — used in list view and map view.
 * Matches the shape expected by `apps/web/src/mocks/datasets.ts`.
 */
export class CompactDatasetResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ type: CategoryMetaDto }) category!: CategoryMetaDto;
  @ApiProperty({ type: ProviderMetaDto }) provider!: ProviderMetaDto;
  @ApiProperty() format!: string;
  @ApiProperty({ enum: SensitivityLevel }) sensitivity!: SensitivityLevel;
  @ApiProperty({ enum: DatasetStatus }) status!: DatasetStatus;
  @ApiProperty() verified!: boolean;
  @ApiPropertyOptional({ nullable: true }) year!: number | null;
  @ApiProperty() updatedAt!: string;
  @ApiProperty() downloadCount!: number;
  @ApiProperty() viewCount!: number;
  /** Approximate center longitude (WGS84) */
  @ApiPropertyOptional({ nullable: true }) longitude!: number | null;
  /** Approximate center latitude (WGS84) */
  @ApiPropertyOptional({ nullable: true }) latitude!: number | null;
  /** Bounding box [minLon, minLat, maxLon, maxLat] */
  @ApiPropertyOptional({ type: [Number], nullable: true })
  bbox!: [number, number, number, number] | null;
}

/** Data quality object */
export class DataQualityDto {
  @ApiPropertyOptional() completeness?: number;
  @ApiPropertyOptional() positionalAccuracy?: string;
  @ApiPropertyOptional() currency?: string;
}

/** Lineage item */
export class LineageItemDto {
  @ApiProperty() stage!: string;
  @ApiProperty() timestamp!: string;
  @ApiProperty() actor!: string;
  @ApiPropertyOptional() notes?: string;
}

/**
 * DetailDatasetResponse — extends Compact with full metadata.
 * Used by DatasetDetailPage.
 */
export class DetailDatasetResponseDto extends CompactDatasetResponseDto {
  @ApiPropertyOptional({ type: Object, nullable: true })
  metadata!: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: DataQualityDto, nullable: true })
  dataQuality!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  fileUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  fileSizeBytes!: string | null; // BigInt serialized as string

  @ApiPropertyOptional({
    nullable: true,
    type: Object,
    description: '{ id, name } of the associated WorkArea',
  })
  workArea!: { id: string; name: string } | null;

  @ApiPropertyOptional({
    nullable: true,
    type: Object,
    description: '{ id, name, email } of the dataset uploader',
  })
  uploader!: { id: string; name: string; email: string } | null;

  @ApiPropertyOptional({
    nullable: true,
    type: Object,
    description: '{ id, name, slug } of the organization',
  })
  organization!: { id: string; name: string; slug: string } | null;

  @ApiPropertyOptional({ nullable: true })
  surveyYear!: number | null;

  @ApiPropertyOptional({ nullable: true })
  publishedAt!: string | null;
}

export class PaginatedDatasetsResponseDto {
  @ApiProperty({ type: [CompactDatasetResponseDto] })
  items!: CompactDatasetResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class DownloadResponseDto {
  @ApiProperty({ description: 'Signed URL for file download (or null if no file attached)' })
  url!: string | null;

  @ApiProperty({ description: 'ISO 8601 expiry of the signed URL' })
  expiresAt!: string | null;
}
