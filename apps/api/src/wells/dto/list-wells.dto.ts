import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { WellStatus, WellType } from '@prisma/client';

const VALID_TYPES: WellType[] = ['EXPLORATION', 'APPRAISAL', 'DEVELOPMENT', 'PRODUCTION', 'INJECTION'];
const VALID_STATUSES: WellStatus[] = ['ACTIVE', 'ABANDONED', 'SUSPENDED', 'PLANNED'];

export class ListWellsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() operator?: string;
  @ApiPropertyOptional({ enum: VALID_STATUSES }) @IsOptional() @IsIn(VALID_STATUSES) status?: WellStatus;
  @ApiPropertyOptional({ enum: VALID_TYPES }) @IsOptional() @IsIn(VALID_TYPES) type?: WellType;
  @ApiPropertyOptional() @IsOptional() @IsUUID() workAreaId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(500)
  limit?: number;
}
