/**
 * Standalone reindex script — populates Meilisearch from PostgreSQL.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json prisma/reindex-search.ts
 *   OR
 *   npm run search:reindex
 *
 * This script runs outside the NestJS DI container; it creates its own
 * PrismaClient + MeiliSearch client using env vars directly.
 */

import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MeiliSearch } = require('meilisearch') as typeof import('meilisearch');

const INDEX_NAME = 'datasets';

interface SearchDoc {
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

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const host = process.env['MEILISEARCH_HOST'] ?? 'http://localhost:7700';
  const apiKey = process.env['MEILISEARCH_KEY'] ?? '';

  const client = new MeiliSearch({ host, apiKey });

  console.log(`Connecting to Meilisearch at ${host}...`);

  try {
    await client.getIndex(INDEX_NAME);
  } catch {
    console.log(`Index "${INDEX_NAME}" not found — creating...`);
    await client.createIndex(INDEX_NAME, { primaryKey: 'id' });
  }

  const index = client.index(INDEX_NAME);

  // Configure index settings
  await index.updateSearchableAttributes([
    'title', 'description', 'category', 'categoryLabel', 'providerName', 'format',
  ]);
  await index.updateFilterableAttributes([
    'category', 'sensitivity', 'status', 'verified', 'providerId', 'workAreaId', 'year',
  ]);
  await index.updateSortableAttributes(['downloadCount', 'viewCount', 'updatedAt', 'year']);

  console.log('Fetching datasets from database...');
  const datasets = await prisma.dataset.findMany({
    include: { organization: true },
  });

  console.log(`Found ${datasets.length} datasets. Building documents...`);

  const documents: SearchDoc[] = datasets.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    category: d.category,
    categoryLabel: d.category.replace('_', ' '),
    format: d.format,
    sensitivity: d.sensitivityLevel,
    status: d.status,
    verified: d.verified,
    year: d.year,
    providerId: d.organizationId ?? '',
    providerName: (d as { organization?: { name: string } | null }).organization?.name ?? '',
    workAreaId: d.workAreaId,
    downloadCount: d.downloadCount,
    viewCount: d.viewCount,
    updatedAt: d.updatedAt.toISOString(),
  }));

  // Clear existing
  console.log('Clearing existing index...');
  await index.deleteAllDocuments();

  // Batch insert in chunks of 500
  const CHUNK = 500;
  for (let i = 0; i < documents.length; i += CHUNK) {
    const batch = documents.slice(i, i + CHUNK);
    await index.addDocuments(batch);
    console.log(`  Indexed ${Math.min(i + CHUNK, documents.length)} / ${documents.length}`);
  }

  console.log(`Reindex complete. ${documents.length} documents indexed.`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Reindex failed:', err);
  process.exit(1);
});
