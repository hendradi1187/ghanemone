import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { PipelineRunsService } from './pipeline-runs.service';
import { AlertsService } from './alerts.service';
import { ListPipelineRunsDto } from './dto/list-pipeline-runs.dto';
import {
  PaginatedPipelineRunsDto,
  PipelineRunResponseDto,
} from './dto/pipeline-run-response.dto';
import { ListAlertsDto } from './dto/list-alerts.dto';
import {
  AlertResponseDto,
  MonitoringSummaryDto,
  PaginatedAlertsDto,
} from './dto/alert-response.dto';

@ApiTags('monitoring')
@ApiBearerAuth()
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly pipelineRunsService: PipelineRunsService,
    private readonly alertsService: AlertsService,
  ) {}

  /**
   * GET /api/v1/monitoring/pipelines
   * List pipeline runs with filters.
   */
  @Get('pipelines')
  @ApiOperation({
    summary: 'List pipeline runs',
    description: 'Returns a paginated list of pipeline execution runs with filtering support.',
  })
  @ApiResponse({ status: 200, type: PaginatedPipelineRunsDto })
  listPipelines(
    @Query() query: ListPipelineRunsDto,
  ): Promise<PaginatedPipelineRunsDto> {
    return this.pipelineRunsService.findAll(query);
  }

  /**
   * GET /api/v1/monitoring/pipelines/:id
   * Pipeline run detail.
   */
  @Get('pipelines/:id')
  @ApiOperation({ summary: 'Get pipeline run detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PipelineRunResponseDto })
  @ApiResponse({ status: 404, description: 'Pipeline run not found' })
  getPipeline(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PipelineRunResponseDto> {
    return this.pipelineRunsService.findOne(id);
  }

  /**
   * GET /api/v1/monitoring/alerts
   * List alerts with filters.
   */
  @Get('alerts')
  @ApiOperation({
    summary: 'List alerts',
    description: 'Returns a paginated list of system alerts. Filter by severity and acknowledged state.',
  })
  @ApiResponse({ status: 200, type: PaginatedAlertsDto })
  listAlerts(@Query() query: ListAlertsDto): Promise<PaginatedAlertsDto> {
    return this.alertsService.findAll(query);
  }

  /**
   * POST /api/v1/monitoring/alerts/:id/ack
   * Acknowledge an alert. Any authenticated user can acknowledge.
   */
  @Post('alerts/:id/ack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Acknowledge alert',
    description: 'Marks an alert as acknowledged. Any authenticated user can perform this action.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: AlertResponseDto })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  acknowledgeAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AlertResponseDto> {
    return this.alertsService.acknowledge(id, user);
  }

  /**
   * GET /api/v1/monitoring/summary
   * Aggregate counts for dashboard widgets.
   */
  @Get('summary')
  @ApiOperation({
    summary: 'Get monitoring summary counts',
    description: 'Returns run counts by status and unacknowledged alert counts by severity.',
  })
  @ApiResponse({ status: 200, type: MonitoringSummaryDto })
  getSummary(): Promise<MonitoringSummaryDto> {
    return this.alertsService.getSummary();
  }
}
