import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import type { SearchQueryDto } from './dto/search-query.dto';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { SensitivityLevel, UserRole } from '@prisma/client';

// We import dynamically to avoid hard crash if meilisearch is not installed yet
// (will be replaced with static import after `npm install`)
let MeiliSearch: typeof import('meilisearch').MeiliSearch;

const INDEX_NAME = 'datasets';

export interface DatasetSearchDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  categoryLabel: string;
  format: string;
  sensitivity: string;
  status: string;
  verified: boolean;
  year: number | null;
  providerId: string;
  providerName: string;
  workAreaId: string | null;
  downloadCount: number;
  viewCount: number;
  updatedAt: string;
}

export interface SearchResult {
  hits: DatasetSearchDocument[];
  total: number;
  page: number;
  limit: number;
  facetDistribution: Record<string, Record<string, number>> | null;
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: InstanceType<typeof import('meilisearch').MeiliSearch> | null = null;

  constructor(private readonly config: AppConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      // Dynamic import — graceful degradation if package not installed
      const mod = await import('meilisearch');
      MeiliSearch = mod.MeiliSearch;

      const { host, key } = this.config.getMeilisearchConfig();
      this.client = new MeiliSearch({ host, apiKey: key });

      await this.ensureIndex();
      this.logger.log(`Meilisearch connected to ${host}, index "${INDEX_NAME}" ready`);
    } catch (err) {
      // Search degradation — never crash the API
      this.logger.warn(
        `Meilisearch unavailable — search will be degraded: ${String(err)}`,
      );
    }
  }

  private async ensureIndex(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.getIndex(INDEX_NAME);
    } catch {
      // Index does not exist — create it
      await this.client.createIndex(INDEX_NAME, { primaryKey: 'id' });
    }

    const index = this.client.index(INDEX_NAME);

    await index.updateSearchableAttributes([
      'title',
      'description',
      'category',
      'categoryLabel',
      'providerName',
      'format',
    ]);

    await index.updateFilterableAttributes([
      'category',
      'sensitivity',
      'status',
      'verified',
      'providerId',
      'workAreaId',
      'year',
    ]);

    await index.updateSortableAttributes(['downloadCount', 'viewCount', 'updatedAt', 'year']);

    await index.updateDisplayedAttributes(['*']);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  async indexDataset(doc: DatasetSearchDocument): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.index(INDEX_NAME).addDocuments([doc]);
    } catch (err) {
      this.logger.warn(`Failed to index dataset ${doc.id}: ${String(err)}`);
    }
  }

  async removeDataset(id: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.index(INDEX_NAME).deleteDocument(id);
    } catch (err) {
      this.logger.warn(`Failed to remove dataset ${id} from index: ${String(err)}`);
    }
  }

  async search(
    query: SearchQueryDto,
    currentUser: JwtPayload,
  ): Promise<SearchResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    if (!this.client) {
      this.logger.warn('Meilisearch not available — returning empty results');
      return { hits: [], total: 0, page, limit, facetDistribution: null };
    }

    const filters = this.buildFilters(query, currentUser);

    try {
      const result = await this.client.index(INDEX_NAME).search(
        query.q ?? '',
        {
          filter: filters.length > 0 ? filters.join(' AND ') : undefined,
          facets: ['category', 'sensitivity', 'status', 'verified'],
          limit,
          offset: (page - 1) * limit,
        },
      );

      return {
        hits: result.hits as DatasetSearchDocument[],
        total: result.estimatedTotalHits ?? result.hits.length,
        page,
        limit,
        facetDistribution:
          (result.facetDistribution as Record<string, Record<string, number>>) ?? null,
      };
    } catch (err) {
      this.logger.warn(`Meilisearch query failed: ${String(err)}`);
      return { hits: [], total: 0, page, limit, facetDistribution: null };
    }
  }

  async reindexAll(
    documents: DatasetSearchDocument[],
  ): Promise<{ indexed: number }> {
    if (!this.client) {
      this.logger.warn('Meilisearch not available — reindex skipped');
      return { indexed: 0 };
    }

    try {
      // Clear existing index
      await this.client.index(INDEX_NAME).deleteAllDocuments();

      if (documents.length === 0) {
        return { indexed: 0 };
      }

      // Batch in chunks of 500
      const CHUNK = 500;
      for (let i = 0; i < documents.length; i += CHUNK) {
        const batch = documents.slice(i, i + CHUNK);
        await this.client.index(INDEX_NAME).addDocuments(batch);
      }

      this.logger.log(`Reindex complete: ${documents.length} documents indexed`);
      return { indexed: documents.length };
    } catch (err) {
      this.logger.error(`Reindex failed: ${String(err)}`);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Build Meilisearch filter array based on query params + RBAC sensitivity rules.
   * Sensitivity scoping is ALWAYS enforced — client cannot override this.
   */
  private buildFilters(query: SearchQueryDto, user: JwtPayload): string[] {
    const filters: string[] = [];

    // RBAC sensitivity gate
    const sensitivityFilter = this.buildSensitivityFilter(user);
    if (sensitivityFilter) {
      filters.push(sensitivityFilter);
    }

    if (query.category) {
      filters.push(`category = "${query.category}"`);
    }
    if (query.sensitivity) {
      // If user requested specific sensitivity, AND it with their access gate
      filters.push(`sensitivity = "${query.sensitivity}"`);
    }
    if (query.status) {
      filters.push(`status = "${query.status}"`);
    }
    if (query.providerId) {
      filters.push(`providerId = "${query.providerId}"`);
    }
    if (query.workAreaId) {
      filters.push(`workAreaId = "${query.workAreaId}"`);
    }
    if (query.verified !== undefined) {
      filters.push(`verified = ${query.verified === 'true' ? 'true' : 'false'}`);
    }

    return filters;
  }

  private buildSensitivityFilter(user: JwtPayload): string | null {
    const { role } = user;

    if (role === UserRole.ADMIN) return null; // No restriction

    if (role === UserRole.REGULATOR) {
      return `sensitivity != "${SensitivityLevel.RESTRICTED}"`;
    }

    if (
      role === UserRole.KKKS_OPERATOR ||
      role === UserRole.ANALYST
    ) {
      // Same org can see INTERNAL + CONFIDENTIAL; only uploader can see RESTRICTED
      // Meilisearch doesn't support user-per-doc dynamic filtering well,
      // so we apply conservative: INTERNAL org filter is not possible at Meili level.
      // Fall back to: PUBLIC | INTERNAL (rely on DB for org-level gate on detail)
      return `(sensitivity = "${SensitivityLevel.PUBLIC}" OR sensitivity = "${SensitivityLevel.INTERNAL}" OR sensitivity = "${SensitivityLevel.CONFIDENTIAL}")`;
    }

    // PUBLIC role
    return `sensitivity = "${SensitivityLevel.PUBLIC}"`;
  }
}
