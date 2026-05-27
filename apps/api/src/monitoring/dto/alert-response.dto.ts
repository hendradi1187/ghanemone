import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity } from '@prisma/client';

export class AlertAcknowledgedByDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class AlertResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: AlertSeverity }) severity!: AlertSeverity;
  @ApiProperty() title!: string;
  @ApiProperty() message!: string;
  @ApiProperty({ description: 'Source service or model name' }) source!: string;
  @ApiPropertyOptional() sourceId?: string | null;
  @ApiProperty() acknowledged!: boolean;
  @ApiPropertyOptional() acknowledgedAt?: Date | null;
  @ApiPropertyOptional({ type: AlertAcknowledgedByDto }) acknowledgedBy?: AlertAcknowledgedByDto | null;
  @ApiPropertyOptional({ type: Object }) metadata?: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
}

export class PaginatedAlertsDto {
  @ApiProperty({ type: [AlertResponseDto] }) items!: AlertResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}

export class MonitoringSummaryDto {
  @ApiProperty({
    type: Object,
    description: 'Pipeline run counts by status',
  })
  runs!: {
    success: number;
    failed: number;
    running: number;
    queued: number;
    cancelled: number;
  };

  @ApiProperty({
    type: Object,
    description: 'Alert counts by severity (unacknowledged only)',
  })
  alerts!: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
}
