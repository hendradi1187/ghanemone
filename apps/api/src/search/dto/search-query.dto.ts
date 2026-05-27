import { ApiPropertyOptional } from '@nestjs/swagger';
import { DatasetCategory, DatasetStatus, SensitivityLevel } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search query', example: 'seismic ONWJ' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ enum: DatasetCategory, description: 'Filter by category' })
  @IsEnum(DatasetCategory)
  @IsOptional()
  category?: DatasetCategory;

  @ApiPropertyOptional({ enum: SensitivityLevel })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivity?: SensitivityLevel;

  @ApiPropertyOptional({ enum: DatasetStatus })
  @IsEnum(DatasetStatus)
  @IsOptional()
  status?: DatasetStatus;

  @ApiPropertyOptional({ description: 'Filter by provider (organization) ID' })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Filter by WorkArea ID' })
  @IsString()
  @IsOptional()
  workAreaId?: string;

  @ApiPropertyOptional({ description: 'Verified flag (true/false as string)' })
  @IsString()
  @IsOptional()
  verified?: string;

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
}
