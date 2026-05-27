import { ApiPropertyOptional } from '@nestjs/swagger';
import { DatasetCategory, SensitivityLevel } from '@prisma/client';
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

export class UpdateDatasetDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(512)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: DatasetCategory })
  @IsEnum(DatasetCategory)
  @IsOptional()
  category?: DatasetCategory;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @IsOptional()
  format?: string;

  @ApiPropertyOptional({ enum: SensitivityLevel })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivityLevel?: SensitivityLevel;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  workAreaId?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1900)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1900)
  @IsOptional()
  surveyYear?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  bboxJson?: [number, number, number, number];

  @ApiPropertyOptional()
  @IsOptional()
  centerLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  centerLon?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  dataQuality?: Record<string, unknown>;
}
