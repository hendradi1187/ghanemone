import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService, DatasetSearchDocument } from './meilisearch.service';
import type { Dataset, Organization } from '@prisma/client';

type DatasetWithOrg = Dataset & {
  organization: Organization | null;
};

@Injectable()
export class SearchIndexerService {
  private readonly logger = new Logger(SearchIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly meili: MeilisearchService,
  ) {}

  /**
   * Index (or re-index) a single dataset after create/update.
   * Called directly from DatasetsService — no event bus needed.
   * Non-throwing: errors are caught and logged.
   */
  async indexDataset(datasetId: string): Promise<void> {
    try {
      const dataset = await this.prisma.dataset.findUnique({
        where: { id: datasetId },
        include: { organization: true },
      });

      if (!dataset) {
        this.logger.warn(`indexDataset: dataset ${datasetId} not found, skipping`);
        return;
      }

      const doc = this.toSearchDocument(dataset);
      await this.meili.indexDataset(doc);
    } catch (err) {
      // DB is source of truth — Meili failure is non-fatal
      this.logger.warn(`indexDataset failed for ${datasetId}: ${String(err)}`);
    }
  }

  /**
   * Remove a dataset from the search index (on soft-delete/archive).
   */
  async removeDataset(datasetId: string): Promise<void> {
    try {
      await this.meili.removeDataset(datasetId);
    } catch (err) {
      this.logger.warn(`removeDataset failed for ${datasetId}: ${String(err)}`);
    }
  }

  /**
   * Full re-index: fetch all APPROVED datasets from DB and push to Meilisearch.
   * Used by the `search:reindex` npm script and the ReindexController endpoint.
   */
  async reindexAll(): Promise<{ indexed: number }> {
    this.logger.log('Starting full reindex...');

    const datasets = await this.prisma.dataset.findMany({
      include: { organization: true },
    });

    const documents = datasets.map((d) => this.toSearchDocument(d));
    const result = await this.meili.reindexAll(documents);

    this.logger.log(`Full reindex complete: ${result.indexed} documents`);
    return result;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private toSearchDocument(dataset: DatasetWithOrg): DatasetSearchDocument {
    return {
      id: dataset.id,
      title: dataset.title,
      description: dataset.description,
      category: dataset.category,
      categoryLabel: dataset.category.replace('_', ' '),
      format: dataset.format,
      sensitivity: dataset.sensitivityLevel,
      status: dataset.status,
      verified: dataset.verified,
      year: dataset.year,
      providerId: dataset.organizationId ?? '',
      providerName: dataset.organization?.name ?? '',
      workAreaId: dataset.workAreaId,
      downloadCount: dataset.downloadCount,
      viewCount: dataset.viewCount,
      updatedAt: dataset.updatedAt.toISOString(),
    };
  }
}
