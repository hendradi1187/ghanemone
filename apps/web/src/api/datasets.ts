/**
 * Datasets API — real HTTP client replacing Phase 8 mock.
 *
 * Sprint 9.3: All functions now call backend at /api/v1/datasets and
 * /api/v1/search/datasets. The old mock-based functions have been replaced.
 *
 * Sprint 9.4: adaptApiDataset() now consumes real values for attributes,
 * lineage, files, tags, and contact returned by the backend instead of
 * filling empty defaults.
 *
 * Adapter layer: the backend returns a flatter shape than the rich DatasetRecord
 * used by existing UI components. ApiDataset (list/detail) is mapped via
 * adaptApiDataset() to a DatasetRecord-compatible shape so ExplorePage,
 * DatasetDetailPage, and DatasetSlideOver require minimal changes.
 */
import { apiClient } from './client';
import type {
  DatasetAttribute,
  DatasetContact,
  DatasetFile,
  DatasetLineage,
} from '../mocks/datasets';
import type { DatasetRecord } from '../mocks/datasets';

/* ─── Backend response shapes ─────────────────────────────────────────── */

/** Category object returned by list/detail endpoints. */
interface ApiCategory {
  id: string;
  label: string;
  color: string;
}

/** Provider object returned by list/detail endpoints. */
interface ApiProvider {
  id: string;
  name: string;
  initials: string;
  color: string;
}

/** Dataset item as returned by GET /datasets and GET /datasets/:id (list shape) */
export interface ApiDatasetListItem {
  id: string;
  title: string;
  description?: string;
  category: ApiCategory;
  provider: ApiProvider;
  format?: string;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified: boolean;
  year?: number;
  updatedAt: string;
  downloadCount: number;
  viewCount: number;
  longitude?: number;
  latitude?: number;
  bbox?: [number, number, number, number];
}

/** Detail shape adds metadata + dataQuality + Sprint 9.4 rich fields. */
export interface ApiDatasetDetail extends ApiDatasetListItem {
  metadata?: {
    crs?: string;
    license?: string;
    file_format?: string[];
    record_count?: number;
  };
  dataQuality?: {
    completeness: number;
    positionalAccuracy: 'high' | 'medium' | 'low';
    currency: string;
  };
  fileUrl?: string | null;
  fileSizeBytes?: number | null;
  workArea?: { id: string; name: string } | null;
  uploader?: { id: string; email: string; fullName?: string } | null;
  organization?: { id: string; name: string } | null;
  surveyYear?: number | null;
  publishedAt?: string | null;
  // Sprint 9.4: rich fields from backend metadata JSON
  attributes?: DatasetAttribute[];
  lineage?: DatasetLineage;
  files?: DatasetFile[];
  tags?: string[];
  contact?: DatasetContact;
}

export interface ApiListDatasetsResponse {
  items: ApiDatasetListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiSearchResponse {
  hits: ApiSearchHit[];
  total: number;
  page: number;
  limit: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

export interface ApiSearchHit {
  id: string;
  title: string;
  description?: string;
  category: string;
  categoryLabel?: string;
  providerName?: string;
  format?: string;
  sensitivity: string;
  status: string;
  verified: boolean;
  year?: number;
  providerId?: string;
  workAreaId?: string | null;
  downloadCount: number;
  viewCount: number;
  updatedAt: string;
}

/* ─── Query param types (public API for hooks) ─────────────────────────── */

export interface ListDatasetsParams {
  category?: string;
  providerId?: string;
  format?: string;
  status?: string;
  sensitivity?: string;
  verified?: boolean;
  workAreaId?: string;
  /** Full-text search (ILIKE on title, description, provider). */
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title' | 'downloadCount';
  order?: 'asc' | 'desc';
}

export interface ListDatasetsResponse {
  items: DatasetRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DatasetSort = 'relevance' | 'updated' | 'downloads' | 'title';

/* ─── Adapter: backend shape → frontend DatasetRecord ─────────────────── */

/** Map API sensitivity → DatasetStatus used by UI. */
function mapSensitivity(sensitivity: string): 'public' | 'internal' | 'confidential' {
  switch (sensitivity.toUpperCase()) {
    case 'PUBLIC': return 'public';
    case 'CONFIDENTIAL': return 'confidential';
    default: return 'internal';
  }
}

/** Map API category id → DatasetCategory used by mocks. */
function mapCategoryId(apiCategoryId: string): DatasetRecord['categoryId'] {
  const map: Record<string, DatasetRecord['categoryId']> = {
    SEISMIC: 'seismic',
    WELL_LOG: 'well-log',
    PRODUCTION: 'production',
    CONCESSION: 'concession',
    GEOLOGY: 'geology',
    DOCUMENT: 'document',
  };
  return map[apiCategoryId.toUpperCase()] ?? 'document';
}

/** Map API category id → DatasetKind. */
function mapKind(apiCategoryId: string): DatasetRecord['kind'] {
  switch (apiCategoryId.toUpperCase()) {
    case 'SEISMIC': return 'VOLUME';
    case 'DOCUMENT': return 'DOC';
    default: return 'LAYER';
  }
}

/** Derive human-readable relative time from ISO date string. */
function toRelativeLabel(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'hari ini';
    if (diffDays === 1) return '1 hari lalu';
    if (diffDays < 30) return `${diffDays} hari lalu`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 bulan lalu';
    if (diffMonths < 12) return `${diffMonths} bulan lalu`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} tahun lalu`;
  } catch {
    return '';
  }
}

/**
 * Adapt a list item from the backend into the DatasetRecord shape consumed
 * by existing UI components. Missing detail fields are filled with defaults.
 */
function adaptApiDataset(api: ApiDatasetListItem | ApiDatasetDetail): DatasetRecord {
  const detail = api as ApiDatasetDetail;
  const categoryId = mapCategoryId(api.category.id);

  return {
    // ── DatasetCardData base fields ──
    id: api.id,
    title: api.title,
    description: api.description,
    kind: mapKind(api.category.id),
    category: api.category.label,
    format: api.format,
    provider: {
      name: api.provider.name,
      initials: api.provider.initials,
      color: api.provider.color,
    },
    verified: api.verified,
    status: mapSensitivity(api.sensitivity),
    year: api.year,
    updatedLabel: toRelativeLabel(api.updatedAt),
    stats: {
      downloads: api.downloadCount,
      views: api.viewCount,
    },

    // ── DatasetRecord extended fields ──
    categoryId,
    providerId: api.provider.id,
    longitude: api.longitude ?? 118.0,
    latitude: api.latitude ?? -2.5,
    fileCount: detail.fileUrl ? 1 : 0,
    sizeMb: detail.fileSizeBytes ? Math.round(detail.fileSizeBytes / (1024 * 1024)) : 0,

    metadata: {
      crs: detail.metadata?.crs ?? 'EPSG:4326',
      bbox: api.bbox ?? [95.0, -11.0, 141.0, 6.0],
      record_count: detail.metadata?.record_count ?? 0,
      file_format: detail.metadata?.file_format ?? (api.format ? [(api.format.split('·')[0] ?? 'Unknown').trim()] : ['Unknown']),
      last_updated: api.updatedAt,
      created_at: detail.publishedAt ?? api.updatedAt,
      license: detail.metadata?.license ?? 'CC-BY-4.0',
    },

    dataQuality: detail.dataQuality ?? {
      completeness: 80,
      positionalAccuracy: 'medium',
      currency: toRelativeLabel(api.updatedAt),
    },

    // ── Detail-only fields — Sprint 9.4: consume real values from backend ──
    attributes: detail.attributes ?? [],
    lineage: detail.lineage ?? { upstream: [], downstream: [] },
    files: detail.files ?? [],
    tags: detail.tags ?? [],
    contact: detail.contact ?? {
      name: detail.uploader?.fullName ?? detail.organization?.name ?? api.provider.name,
      email: detail.uploader?.email ?? `data@${api.provider.name.toLowerCase().replace(/\s+/g, '')}.co.id`,
      organization: detail.organization?.name ?? api.provider.name,
    },
    usage_stats: {
      downloads_30d: api.downloadCount,
      api_calls_30d: api.viewCount,
      unique_users_30d: Math.floor(api.viewCount / 4),
    },
  };
}

/* ─── API functions ────────────────────────────────────────────────────── */

export async function listDatasets(params: ListDatasetsParams): Promise<ListDatasetsResponse> {
  // Map frontend sort/filter params to backend query params.
  const queryParams: Record<string, string | number | boolean | undefined | null> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };

  if (params.search) queryParams.search = params.search;
  if (params.category) queryParams.category = params.category.toUpperCase();
  if (params.providerId) queryParams.providerId = params.providerId;
  if (params.format) queryParams.format = params.format;
  if (params.status) queryParams.status = params.status.toUpperCase();
  if (params.sensitivity) queryParams.sensitivity = params.sensitivity.toUpperCase();
  if (params.verified !== undefined) queryParams.verified = params.verified;
  if (params.workAreaId) queryParams.workAreaId = params.workAreaId;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.order) queryParams.order = params.order;

  const response = await apiClient.get<ApiListDatasetsResponse>('/datasets', queryParams);

  const items = response.items.map(adaptApiDataset);
  const limit = params.limit ?? 20;

  return {
    items,
    total: response.total,
    page: response.page,
    limit,
    totalPages: Math.ceil(response.total / limit),
  };
}

export async function getDataset(id: string): Promise<DatasetRecord | null> {
  try {
    const response = await apiClient.get<ApiDatasetDetail>(`/datasets/${id}`);
    return adaptApiDataset(response);
  } catch (err) {
    if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
      return null;
    }
    throw err;
  }
}

/** Alias used by DatasetDetailPage. */
export async function getDatasetById(id: string): Promise<DatasetRecord | null> {
  return getDataset(id);
}

/**
 * Get related datasets — same category, exclude self.
 * Uses listDatasets with category filter until backend has a /related endpoint.
 */
export async function getRelatedDatasets(id: string, limit = 4): Promise<DatasetRecord[]> {
  try {
    const target = await getDataset(id);
    if (!target) return [];
    const response = await listDatasets({
      category: target.categoryId,
      limit: limit + 1,
      page: 1,
    });
    return response.items.filter((d) => d.id !== id).slice(0, limit);
  } catch {
    return [];
  }
}

export interface SearchDatasetsParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function searchDatasets(params: SearchDatasetsParams): Promise<ApiSearchResponse> {
  const queryParams: Record<string, string | number | undefined | null> = {};
  if (params.q) queryParams.q = params.q;
  if (params.category) queryParams.category = params.category;
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;

  return apiClient.get<ApiSearchResponse>('/search/datasets', queryParams);
}

/** Convert Meilisearch hit → DatasetRecord for components that need full shape. */
export function adaptSearchHit(hit: ApiSearchHit): DatasetRecord {
  const categoryId = mapCategoryId(hit.category);
  return {
    id: hit.id,
    title: hit.title,
    description: hit.description,
    kind: mapKind(hit.category),
    category: hit.categoryLabel ?? hit.category,
    format: hit.format,
    provider: {
      name: hit.providerName ?? 'Unknown',
      initials: (hit.providerName ?? 'UN').slice(0, 2).toUpperCase(),
      color: 'var(--hf-green-500, #1f8a4a)',
    },
    verified: hit.verified,
    status: mapSensitivity(hit.sensitivity),
    year: hit.year,
    updatedLabel: toRelativeLabel(hit.updatedAt),
    stats: {
      downloads: hit.downloadCount,
      views: hit.viewCount,
    },
    categoryId,
    providerId: hit.providerId ?? '',
    longitude: 118.0,
    latitude: -2.5,
    fileCount: 0,
    sizeMb: 0,
    metadata: {
      crs: 'EPSG:4326',
      bbox: [95.0, -11.0, 141.0, 6.0],
      record_count: 0,
      file_format: [],
      last_updated: hit.updatedAt,
      created_at: hit.updatedAt,
      license: 'CC-BY-4.0',
    },
    dataQuality: {
      completeness: 80,
      positionalAccuracy: 'medium',
      currency: toRelativeLabel(hit.updatedAt),
    },
    attributes: [],
    lineage: { upstream: [], downstream: [] },
    files: [],
    tags: [],
    contact: {
      name: hit.providerName ?? 'Unknown',
      email: 'data@unknown.co.id',
      organization: hit.providerName ?? 'Unknown',
    },
    usage_stats: {
      downloads_30d: hit.downloadCount,
      api_calls_30d: hit.viewCount,
      unique_users_30d: Math.floor(hit.viewCount / 4),
    },
  };
}
