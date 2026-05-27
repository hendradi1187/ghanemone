import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import {
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Q1 2026 Compliance Audit' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 'q1-2026-compliance-audit',
    description: 'URL-safe slug (lowercase, hyphens only)',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({ example: 'Quarterly compliance audit for all KKKS operators.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: '#2a5fb8', description: 'Hex color for visual identifier' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Organization UUID (defaults to calling user org)' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;
}
