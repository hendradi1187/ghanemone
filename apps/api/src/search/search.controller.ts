import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { MeilisearchService, SearchResult } from './meilisearch.service';
import { SearchIndexerService } from './search-indexer.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(
    private readonly meili: MeilisearchService,
    private readonly indexer: SearchIndexerService,
  ) {}

  /**
   * GET /api/v1/search/datasets
   * Full-text + faceted search over the datasets index.
   * Sensitivity RBAC scoping applied server-side.
   */
  @Get('datasets')
  @ApiOperation({
    summary: 'Search datasets (full-text + faceted)',
    description:
      'Queries the Meilisearch index with full-text + facets. RBAC sensitivity scoping is applied server-side — user cannot override access level.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results with facet distribution',
    schema: {
      properties: {
        hits: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        facetDistribution: { type: 'object' },
      },
    },
  })
  search(
    @Query() query: SearchQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SearchResult> {
    return this.meili.search(query, user);
  }

  /**
   * POST /api/v1/search/reindex
   * Trigger a full re-index from the DB → Meilisearch. ADMIN only.
   */
  @Post('reindex')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger full search reindex (ADMIN only)',
    description: 'Clears the Meilisearch index and repopulates from PostgreSQL. May take a few seconds for large catalogs.',
  })
  @ApiResponse({ status: 200, description: 'Reindex completed', schema: { properties: { indexed: { type: 'number' } } } })
  reindex(): Promise<{ indexed: number }> {
    return this.indexer.reindexAll();
  }
}
