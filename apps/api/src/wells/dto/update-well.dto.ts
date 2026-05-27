import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { WellStatus, WellType } from '@prisma/client';

const VALID_TYPES: WellType[] = ['EXPLORATION', 'APPRAISAL', 'DEVELOPMENT', 'PRODUCTION', 'INJECTION'];
const VALID_STATUSES: WellStatus[] = ['ACTIVE', 'ABANDONED', 'SUSPENDED', 'PLANNED'];

export class UpdateWellDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) operator?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() workAreaId?: string;
  @ApiPropertyOptional({ enum: VALID_TYPES }) @IsOptional() @IsIn(VALID_TYPES) type?: WellType;
  @ApiPropertyOptional({ enum: VALID_STATUSES }) @IsOptional() @IsIn(VALID_STATUSES) status?: WellStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() totalDepthM?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() spudDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() tdDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kbElevationM?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) formation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) reservoir?: string;
}
