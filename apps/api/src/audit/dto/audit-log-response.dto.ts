import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  userId!: string | null;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional({ nullable: true })
  entity!: string | null;

  @ApiPropertyOptional({ nullable: true })
  entityId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Object })
  metadata!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  ipAddress!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class PaginatedAuditLogsDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  items!: AuditLogResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
