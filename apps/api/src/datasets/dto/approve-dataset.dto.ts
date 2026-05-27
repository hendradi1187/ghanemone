import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveDatasetDto {
  @ApiPropertyOptional({ description: 'Optional approval notes from the regulator' })
  @IsString()
  @MaxLength(1024)
  @IsOptional()
  notes?: string;
}

export class RejectDatasetDto {
  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsString()
  @MaxLength(1024)
  @IsOptional()
  reason?: string;
}
