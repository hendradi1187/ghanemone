import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import {
  ComplianceStatusDto,
  DatasetsByCategoryItemDto,
  DatasetsByMonthItemDto,
  OverviewStatsDto,
  UploadsByProviderItemDto,
} from './dto/stats-response.dto';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /api/v1/stats/overview
   * Dashboard hero stats — total counts and key metrics.
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Get platform overview statistics',
    description:
      'Returns aggregate counts: datasets, providers, work areas, wells, facilities, pipelines, growth, and active alerts.',
  })
  @ApiResponse({ status: 200, type: OverviewStatsDto })
  getOverview(): Promise<OverviewStatsDto> {
    return this.statsService.getOverview();
  }

  /**
   * GET /api/v1/stats/datasets-by-category
   * Dataset counts grouped by category for pie/bar chart.
   */
  @Get('datasets-by-category')
  @ApiOperation({ summary: 'Dataset counts grouped by category' })
  @ApiResponse({ status: 200, type: [DatasetsByCategoryItemDto] })
  getDatasetsByCategory(): Promise<DatasetsByCategoryItemDto[]> {
    return this.statsService.getDatasetsByCategory();
  }

  /**
   * GET /api/v1/stats/datasets-by-month
   * Dataset counts per month for the last 12 months.
   */
  @Get('datasets-by-month')
  @ApiOperation({
    summary: 'Dataset creation counts per month (last 12 months)',
    description: 'Uses DATE_TRUNC raw SQL. Returns {month: YYYY-MM, count, label}.',
  })
  @ApiResponse({ status: 200, type: [DatasetsByMonthItemDto] })
  getDatasetsByMonth(): Promise<DatasetsByMonthItemDto[]> {
    return this.statsService.getDatasetsByMonth();
  }

  /**
   * GET /api/v1/stats/uploads-by-provider
   * Top 10 organizations by dataset count.
   */
  @Get('uploads-by-provider')
  @ApiOperation({ summary: 'Top 10 providers by uploaded dataset count' })
  @ApiResponse({ status: 200, type: [UploadsByProviderItemDto] })
  getUploadsByProvider(): Promise<UploadsByProviderItemDto[]> {
    return this.statsService.getUploadsByProvider();
  }

  /**
   * GET /api/v1/stats/compliance-status
   * Dataset counts per workflow status.
   */
  @Get('compliance-status')
  @ApiOperation({
    summary: 'Dataset counts per compliance workflow status',
    description: 'Returns counts for draft/pendingReview/approved/rejected/archived.',
  })
  @ApiResponse({ status: 200, type: ComplianceStatusDto })
  getComplianceStatus(): Promise<ComplianceStatusDto> {
    return this.statsService.getComplianceStatus();
  }
}
