import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  DatasetCategory,
  DatasetStatus,
  SensitivityLevel,
} from '@prisma/client';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListDatasetsDto {
  @ApiPropertyOptional({ enum: DatasetCategory })
  @IsEnum(DatasetCategory)
  @IsOptional()
  category?: DatasetCategory;

  @ApiPropertyOptional({ description: 'Filter by provider organization UUID' })
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Filter by file format (SHP, GeoJSON, SEG-Y, …)' })
  @IsString()
  @IsOptional()
  format?: string;

  @ApiPropertyOptional({ enum: DatasetStatus })
  @IsEnum(DatasetStatus)
  @IsOptional()
  status?: DatasetStatus;

  @ApiPropertyOptional({ enum: SensitivityLevel })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivity?: SensitivityLevel;

  @ApiPropertyOptional({ description: 'Filter verified datasets', example: 'true' })
  @IsBooleanString()
  @IsOptional()
  verified?: string;

  @ApiPropertyOptional({ description: 'Filter by WorkArea UUID' })
  @IsUUID()
  @IsOptional()
  workAreaId?: string;

  @ApiPropertyOptional({ description: 'Basic text search (title + description ILIKE)' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'title', 'downloadCount'],
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'title' | 'downloadCount';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc';
}
