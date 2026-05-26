/**
 * Datasets API — mock client untuk Phase 8.
 *
 * Phase 9 replace dengan `fetch('/v1/datasets?…')` ke API gateway. Signature
 * dijaga supaya consumer (ExplorePage) tidak perlu berubah.
 *
 * Pola TanStack Query:
 *   const { data, isFetching } = useQuery({
 *     queryKey: ['datasets', params],
 *     queryFn: () => listDatasets(params),
 *     placeholderData: keepPreviousData,
 *   });
 *
 * Lihat docs/api-contract.md §3 untuk query param contract.
 */
import {
  MOCK_CATALOG,
  type DatasetCategory,
  type DatasetRecord,
} from '../mocks/datasets';
import type { DatasetKind, DatasetStatus } from '@ghanem/ui';

export type DatasetSort = 'relevance' | 'updated' | 'downloads' | 'title';

export interface ListDatasetsParams {
  /** Free-text search (title + description + provider). */
  q?: string;
  /** Filter categories (intersect — any of). */
  categories?: DatasetCategory[];
  /** Filter providers (intersect — any of). */
  providers?: string[];
  /** Filter status (intersect — any of). */
  statuses?: DatasetStatus[];
  /** Filter kind. */
  kinds?: DatasetKind[];
  /** Year inclusive. */
  yearMin?: number;
  /** Year inclusive. */
  yearMax?: number;
  /** Sort key. Default `relevance`. */
  sort?: DatasetSort;
  /** Page (1-indexed). Default 1. */
  page?: number;
  /** Items per page. Default 12. */
  pageSize?: number;
}

export interface ListDatasetsResponse {
  items: DatasetRecord[];
  total: number;
  page: number;
  pageSize: number;
}

/** Async sleep dengan jitter — simulate network. */
function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function matchesQuery(record: DatasetRecord, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  return (
    record.title.toLowerCase().includes(needle) ||
    (record.description?.toLowerCase().includes(needle) ?? false) ||
    record.provider.name.toLowerCase().includes(needle) ||
    (record.category?.toLowerCase().includes(needle) ?? false)
  );
}

function applySort(records: DatasetRecord[], sort: DatasetSort): DatasetRecord[] {
  const sorted = [...records];
  switch (sort) {
    case 'updated':
      // Mock: pakai posisi di catalog (yang lebih dulu di-build = lebih baru).
      return sorted;
    case 'downloads':
      return sorted.sort((a, b) => (b.stats?.downloads ?? 0) - (a.stats?.downloads ?? 0));
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'id-ID'));
    case 'relevance':
    default:
      return sorted;
  }
}

export async function listDatasets(params: ListDatasetsParams): Promise<ListDatasetsResponse> {
  // Simulate network latency 150-400ms.
  const delayMs = 150 + Math.floor(Math.random() * 250);
  await sleep(delayMs);

  const {
    q = '',
    categories = [],
    providers = [],
    statuses = [],
    kinds = [],
    yearMin,
    yearMax,
    sort = 'relevance',
    page = 1,
    pageSize = 12,
  } = params;

  let filtered = MOCK_CATALOG.filter((d) => matchesQuery(d, q));

  if (categories.length > 0) {
    filtered = filtered.filter((d) => categories.includes(d.categoryId));
  }
  if (providers.length > 0) {
    filtered = filtered.filter((d) => providers.includes(d.providerId));
  }
  if (statuses.length > 0) {
    filtered = filtered.filter((d) => d.status !== undefined && statuses.includes(d.status));
  }
  if (kinds.length > 0) {
    filtered = filtered.filter((d) => kinds.includes(d.kind));
  }
  if (typeof yearMin === 'number') {
    filtered = filtered.filter((d) => (d.year ?? 0) >= yearMin);
  }
  if (typeof yearMax === 'number') {
    filtered = filtered.filter((d) => (d.year ?? Infinity) <= yearMax);
  }

  const sorted = applySort(filtered, sort);
  const total = sorted.length;
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);

  return { items, total, page, pageSize };
}

/** Single-dataset lookup (untuk DetailPage di Phase 8.8). */
export async function getDataset(id: string): Promise<DatasetRecord | null> {
  await sleep(120);
  return MOCK_CATALOG.find((d) => d.id === id) ?? null;
}

/**
 * Lookup by id — canonical signature dipakai oleh DatasetDetailPage.
 *
 * Returns `null` jika tidak ditemukan (404 di real backend → RFC 7807 problem).
 * Phase 9: ganti dengan `fetch('/v1/datasets/{id}')` + handle 404 → null.
 *
 * Network jitter: 200-450ms supaya skeleton terlihat saat dev.
 */
export async function getDatasetById(id: string): Promise<DatasetRecord | null> {
  const delayMs = 200 + Math.floor(Math.random() * 250);
  await sleep(delayMs);
  return MOCK_CATALOG.find((d) => d.id === id) ?? null;
}

/**
 * Related datasets — same category, exclude self, limit N.
 *
 * Used by detail page right rail ("Dataset terkait").
 */
export async function getRelatedDatasets(id: string, limit = 4): Promise<DatasetRecord[]> {
  await sleep(120);
  const target = MOCK_CATALOG.find((d) => d.id === id);
  if (!target) return [];
  return MOCK_CATALOG.filter((d) => d.id !== id && d.categoryId === target.categoryId).slice(0, limit);
}
