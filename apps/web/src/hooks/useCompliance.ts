/**
 * useCompliance — TanStack Query hooks for Compliance Approval Queue + Audit Log.
 *
 * Sprint 9.5 Phase 1: Replaces mock-based api/compliance.ts calls with real
 * backend endpoints:
 *   - GET  /api/v1/datasets?status=PENDING_REVIEW  → usePendingApprovals
 *   - POST /api/v1/datasets/:id/approve            → useApproveDataset
 *   - POST /api/v1/datasets/:id/reject             → useRejectDataset
 *   - GET  /api/v1/audit-logs                      → useAuditLogs
 *
 * QueryKey hierarchy:
 *   ['compliance', 'pending', page, limit]   — paginated pending list
 *   ['audit-logs', params]                   — audit log (server-filtered)
 *
 * Mutations invalidate all ['compliance'] + ['datasets'] + ['audit-logs'] + ['dashboard']
 * keys so every consumer refetches after an approve/reject action.
 *
 * Adapter layer:
 *   adaptApiItemToPendingDataset() bridges ApiDatasetListItem → PendingDataset
 *   so existing ReviewDialog / BulkActionDialog components receive the shape
 *   they already understand without modification.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiClient } from '../api/client';
import { listDatasets, type ApiDatasetListItem, type ApiListDatasetsResponse } from '../api/datasets';
import type { PendingDataset } from '../mocks/compliance';

/* ─── Adapter: ApiDatasetListItem → PendingDataset ──────────────────────── */

/**
 * Map an API dataset list item (status=PENDING_REVIEW) to the PendingDataset
 * shape consumed by ApprovalQueue, ReviewDialog, and BulkActionDialog.
 *
 * Fields not present in the API response are derived from available data:
 *   - kkks           → provider.name (KKKS organisation that submitted)
 *   - category       → mapped from category.id to PendingDataset['category'] union
 *   - kind           → derived from category.id
 *   - sizeMb         → 0 (not in list response; detail endpoint would have fileSizeBytes)
 *   - fileCount      → 0 (same reason)
 *   - submittedAt    → updatedAt (best proxy; backend sets this on status change)
 *   - submittedBy    → synthetic User built from provider fields
 *   - riskFlags      → [] (server does not send risk classification in list response)
 *   - validationStatus → derived from sensitivity (CONFIDENTIAL = warning proxy)
 *   - submitterNotes → description or empty string
 */
function mapCategoryToUnion(categoryId: string): PendingDataset['category'] {
  const upper = categoryId.toUpperCase();
  const mapping: Record<string, PendingDataset['category']> = {
    SEISMIC: 'seismic',
    WELL_LOG: 'well-log',
    PRODUCTION: 'production',
    CONCESSION: 'concession',
    GEOLOGY: 'geology',
    DOCUMENT: 'document',
  };
  return mapping[upper] ?? 'document';
}

function mapKindFromCategory(categoryId: string): PendingDataset['kind'] {
  const upper = categoryId.toUpperCase();
  if (upper === 'SEISMIC') return 'VOLUME';
  if (upper === 'DOCUMENT') return 'DOC';
  return 'LAYER';
}

export function adaptApiItemToPendingDataset(item: ApiDatasetListItem): PendingDataset {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? '',
    kkks: item.provider.name,
    category: mapCategoryToUnion(item.category.id),
    kind: mapKindFromCategory(item.category.id),
    sizeMb: 0,
    fileCount: 0,
    submittedAt: item.updatedAt,
    submittedBy: {
      id: item.provider.id,
      sub: item.provider.id,
      email: `data@${item.provider.name.toLowerCase().replace(/\s+/g, '')}.co.id`,
      fullName: item.provider.name,
      organization: item.provider.name,
      role: 'kkks_operator',
      provisioningStatus: 'active',
      createdAt: item.updatedAt,
      updatedAt: item.updatedAt,
    },
    submitterNotes: item.description ?? '',
    riskFlags: [],
    validationStatus: item.sensitivity === 'CONFIDENTIAL' ? 'warning' : 'pass',
  };
}

/* ─── Pending Approvals ─────────────────────────────────────────────────── */

export interface PendingApprovalsResult {
  items: PendingDataset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchPendingApprovals(page: number, limit: number): Promise<PendingApprovalsResult> {
  const data = await apiFetch<ApiListDatasetsResponse>('/datasets', {
    params: { status: 'PENDING_REVIEW', page, limit },
  });
  return {
    items: data.items.map(adaptApiItemToPendingDataset),
    total: data.total,
    page: data.page,
    limit,
    totalPages: Math.ceil(data.total / limit),
  };
}

export function usePendingApprovals(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['compliance', 'pending', page, limit] as const,
    queryFn: () => fetchPendingApprovals(page, limit),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/* ─── Approve Dataset ───────────────────────────────────────────────────── */

export interface ApproveDatasetVars {
  datasetId: string;
  notes?: string;
}

export interface ApprovalMutationResult {
  id: string;
  status: string;
}

export function useApproveDataset() {
  const qc = useQueryClient();
  return useMutation<ApprovalMutationResult, Error, ApproveDatasetVars>({
    mutationFn: async ({ datasetId, notes }) => {
      const body = notes ? { notes } : undefined;
      return apiClient.post<ApprovalMutationResult>(`/datasets/${datasetId}/approve`, body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['compliance'] });
      void qc.invalidateQueries({ queryKey: ['datasets'] });
      void qc.invalidateQueries({ queryKey: ['audit-logs'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/* ─── Reject Dataset ────────────────────────────────────────────────────── */

export interface RejectDatasetVars {
  datasetId: string;
  reason: string;
}

export function useRejectDataset() {
  const qc = useQueryClient();
  return useMutation<ApprovalMutationResult, Error, RejectDatasetVars>({
    mutationFn: async ({ datasetId, reason }) => {
      return apiClient.post<ApprovalMutationResult>(`/datasets/${datasetId}/reject`, { reason });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['compliance'] });
      void qc.invalidateQueries({ queryKey: ['datasets'] });
      void qc.invalidateQueries({ queryKey: ['audit-logs'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/* ─── Audit Logs ────────────────────────────────────────────────────────── */

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogsResult {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogParams {
  entity?: string;
  action?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export function useAuditLogs(params: AuditLogParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params] as const,
    queryFn: async (): Promise<AuditLogsResult> => {
      const queryParams: Record<string, string | number> = {};
      if (params.entity) queryParams.entity = params.entity;
      if (params.action) queryParams.action = params.action;
      if (params.userId) queryParams.userId = params.userId;
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 50;

      const data = await apiClient.get<{
        items: AuditLogEntry[];
        total: number;
        page: number;
        limit: number;
      }>('/audit-logs', queryParams);

      return {
        items: data.items,
        total: data.total,
        page: data.page,
        limit: params.limit ?? 50,
        totalPages: Math.ceil(data.total / (params.limit ?? 50)),
      };
    },
    staleTime: 30_000,
  });
}

/* ─── Pending count only (for CompliancePage header badge) ─────────────── */

/**
 * Lightweight query to get just the total count of pending datasets.
 * Uses limit=1 to minimise payload — only the total field matters.
 */
export function usePendingCount(enabled = true) {
  return useQuery({
    queryKey: ['compliance', 'pending-count'] as const,
    queryFn: () => listDatasets({ status: 'PENDING_REVIEW', page: 1, limit: 1 }),
    staleTime: 30_000,
    enabled,
    select: (data) => data.total,
  });
}
