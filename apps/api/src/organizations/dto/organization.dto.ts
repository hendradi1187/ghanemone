import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'PHE ONWJ', description: 'Full organization name (must be unique)' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'phe-onwj',
    description: 'URL-safe slug, lowercase alphanumeric + hyphens',
  })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens only' })
  @MinLength(2)
  slug!: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.KKKS })
  @IsEnum(OrganizationType)
  type!: OrganizationType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/phe.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'PHE ONWJ (Updated)' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: OrganizationType })
  @IsEnum(OrganizationType)
  @IsOptional()
  type?: OrganizationType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/phe.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class OrganizationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: OrganizationType })
  type!: OrganizationType;

  @ApiProperty({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty()
  userCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
