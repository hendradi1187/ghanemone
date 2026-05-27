/**
 * useDashboard — TanStack Query hook for Dashboard KPI widgets.
 *
 * Sprint 9.5 Phase 1: Replaces mock KPI values with real counts derived from
 * existing backend endpoints. Uses useQueries for parallel fetching.
 *
 * KPI sources:
 *   - totalDatasets     → GET /datasets?limit=1        (pagination.total)
 *   - pendingApprovals  → GET /datasets?status=PENDING_REVIEW&limit=1  (pagination.total)
 *   - totalProviders    → GET /organizations            (array.length or pagination.total)
 *   - totalWells        → GET /wells?limit=1            (pagination.total)
 *   - recentUploads     → GET /datasets?sortBy=createdAt&order=desc&limit=5 (items array)
 *
 * Charts (Recharts) remain on mock data until backend /stats endpoints are ready.
 * TODO: Replace trend/category/status data when backend exposes /api/v1/stats/*
 *
 * Type safety: Each query result is typed individually via the `queries` array.
 * No `any` — unknown responses are narrowed via type guards.
 */
import { useQueries } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { listDatasets, type ApiDatasetListItem } from '../api/datasets';

/* ─── Response shapes from backend ──────────────────────────────────────── */

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
}

interface OrganizationListResponse extends PaginatedResponse {
  items: Array<{ id: string; name: string }>;
}

interface WellsListResponse extends PaginatedResponse {
  items: Array<{ id: string; name: string }>;
}

/* ─── Public contract ────────────────────────────────────────────────────── */

export interface RecentUpload {
  id: string;
  title: string;
  category: string;
  provider: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDatasets: number;
  pendingApprovals: number;
  totalProviders: number;
  totalWells: number;
  recentUploads: RecentUpload[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/* ─── Hook ──────────────────────────────────────────────────────────────── */

export function useDashboardStats(): DashboardStats {
  const [
    datasetsCountQuery,
    pendingApprovalsQuery,
    orgsQuery,
    wellsQuery,
    recentUploadsQuery,
  ] = useQueries({
    queries: [
      // [0] Total dataset count
      {
        queryKey: ['dashboard', 'datasets-count'] as const,
        queryFn: () => listDatasets({ limit: 1, page: 1 }),
        staleTime: 60_000,
      },
      // [1] Pending approvals count
      {
        queryKey: ['dashboard', 'pending-approvals'] as const,
        queryFn: () => listDatasets({ status: 'PENDING_REVIEW', limit: 1, page: 1 }),
        staleTime: 30_000,
      },
      // [2] Organizations count
      {
        queryKey: ['dashboard', 'orgs-count'] as const,
        queryFn: () => apiClient.get<OrganizationListResponse | Array<{ id: string }>>('/organizations'),
        staleTime: 60_000,
      },
      // [3] Wells count
      {
        queryKey: ['dashboard', 'wells-count'] as const,
        queryFn: () => apiClient.get<WellsListResponse>('/wells', { limit: 1 }),
        staleTime: 60_000,
      },
      // [4] Recent uploads — last 5 by createdAt desc
      {
        queryKey: ['dashboard', 'recent-uploads'] as const,
        queryFn: () =>
          apiClient.get<{ items: ApiDatasetListItem[] }>('/datasets', {
            sortBy: 'createdAt',
            order: 'desc',
            limit: 5,
          }),
        staleTime: 30_000,
      },
    ],
  });

  // Derive provider count — backend may return paginated object or plain array
  const rawOrgs = orgsQuery.data;
  let totalProviders = 0;
  if (rawOrgs) {
    if (Array.isArray(rawOrgs)) {
      totalProviders = rawOrgs.length;
    } else if ('total' in rawOrgs && typeof rawOrgs.total === 'number') {
      totalProviders = rawOrgs.total;
    } else if ('items' in rawOrgs && Array.isArray(rawOrgs.items)) {
      totalProviders = rawOrgs.items.length;
    }
  }

  // Derive wells count — same pattern
  const rawWells = wellsQuery.data;
  let totalWells = 0;
  if (rawWells) {
    if ('total' in rawWells && typeof rawWells.total === 'number') {
      totalWells = rawWells.total;
    }
  }

  // Derive recent uploads — map ApiDatasetListItem → compact RecentUpload shape
  const rawUploads = recentUploadsQuery.data?.items ?? [];
  const recentUploads: RecentUpload[] = rawUploads.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category.label,
    provider: item.provider.name,
    updatedAt: item.updatedAt,
  }));

  const allQueries = [
    datasetsCountQuery,
    pendingApprovalsQuery,
    orgsQuery,
    wellsQuery,
    recentUploadsQuery,
  ];

  const isLoading = allQueries.some((q) => q.isLoading);
  const isError = allQueries.some((q) => q.isError);
  const firstError = allQueries.find((q) => q.error)?.error ?? null;

  return {
    totalDatasets: datasetsCountQuery.data?.total ?? 0,
    pendingApprovals: pendingApprovalsQuery.data?.total ?? 0,
    totalProviders,
    totalWells,
    recentUploads,
    isLoading,
    isError,
    error: firstError as Error | null,
  };
}
