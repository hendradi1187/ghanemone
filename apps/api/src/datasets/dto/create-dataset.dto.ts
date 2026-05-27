import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DatasetCategory,
  SensitivityLevel,
} from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDatasetDto {
  @ApiProperty({ example: 'Seismic 3D — Offshore Northwest Java 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(512)
  title!: string;

  @ApiPropertyOptional({ example: 'High-quality seismic dataset acquired by PHE ONWJ.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DatasetCategory, example: DatasetCategory.SEISMIC })
  @IsEnum(DatasetCategory)
  category!: DatasetCategory;

  @ApiProperty({ example: 'SEG-Y', description: 'File format string: SHP, GeoJSON, SEG-Y, LAS, PDF, GeoPackage, etc.' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  format!: string;

  @ApiPropertyOptional({
    enum: SensitivityLevel,
    default: SensitivityLevel.INTERNAL,
    description: 'Access sensitivity level',
  })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivityLevel?: SensitivityLevel;

  @ApiPropertyOptional({ description: 'UUID of the WorkArea this dataset covers' })
  @IsUUID()
  @IsOptional()
  workAreaId?: string;

  @ApiPropertyOptional({ description: 'Year of the dataset survey/publication' })
  @IsInt()
  @Min(1900)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ description: 'Survey year (may differ from publication year)' })
  @IsInt()
  @Min(1900)
  @IsOptional()
  surveyYear?: number;

  @ApiPropertyOptional({
    description: 'Bounding box as JSON [minLon, minLat, maxLon, maxLat]',
    example: '[106.5, -6.5, 108.0, -5.0]',
  })
  @IsArray()
  @IsOptional()
  bboxJson?: [number, number, number, number];

  @ApiPropertyOptional({ description: 'Center latitude (WGS84)' })
  @IsOptional()
  centerLat?: number;

  @ApiPropertyOptional({ description: 'Center longitude (WGS84)' })
  @IsOptional()
  centerLon?: number;

  @ApiPropertyOptional({
    description: 'Dataset metadata JSON (crs, record_count, file_format, license, etc.)',
    type: Object,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Data quality JSON { completeness, positionalAccuracy, currency }',
    type: Object,
  })
  @IsOptional()
  dataQuality?: Record<string, unknown>;
}
