/**
 * Monitoring API — real HTTP client for /api/v1/monitoring/*.
 *
 * Sprint 9.5 Phase 2. Replaces mock client in api/monitoring.ts.
 *
 * Endpoints:
 *   GET  /monitoring/pipelines          paginated list with filters
 *   GET  /monitoring/pipelines/:id      detail with metadata
 *   GET  /monitoring/alerts             paginated list with filters
 *   POST /monitoring/alerts/:id/ack     acknowledge alert
 *   GET  /monitoring/summary            {runs, alerts} counts
 *
 * Note: This file is named monitoring-api.ts to avoid shadowing the existing
 * api/monitoring.ts mock client which is still used for the live subscription
 * (subscribeToPipelineUpdates). The hooks will bridge both.
 */
import { apiClient } from './client';

/* ─── Pipeline types ─────────────────────────────────────────────────────── */

export type PipelineRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export type PipelineRunType =
  | 'INGESTION'
  | 'VALIDATION'
  | 'TRANSFORM'
  | 'EXPORT'
  | 'INDEXING';

export interface PipelineRun {
  id: string;
  name: string;
  type: PipelineRunType;
  status: PipelineRunStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  recordCount: number | null;
  errorMessage: string | null;
  dataset: { id: string; title: string } | null;
  organizationId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface PipelineRunDetail extends PipelineRun {
  metadata: Record<string, unknown> | null;
}

/* ─── Alert types ────────────────────────────────────────────────────────── */

export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  sourceId: string | null;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: { id: string; name: string } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/* ─── Summary types ──────────────────────────────────────────────────────── */

export interface MonitoringSummary {
  runs: {
    success: number;
    failed: number;
    running: number;
    queued: number;
    cancelled: number;
  };
  alerts: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
}

/* ─── Paginated responses ────────────────────────────────────────────────── */

export interface PaginatedPipelineRuns {
  items: PipelineRun[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAlerts {
  items: Alert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ─── Query param shapes ─────────────────────────────────────────────────── */

export interface ListPipelineRunsParams {
  status?: PipelineRunStatus;
  type?: PipelineRunType;
  datasetId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ListAlertsParams {
  severity?: AlertSeverity;
  acknowledged?: boolean;
  page?: number;
  limit?: number;
}

/* ─── API functions ──────────────────────────────────────────────────────── */

export async function listPipelineRuns(
  params?: ListPipelineRunsParams,
): Promise<PaginatedPipelineRuns> {
  return apiClient.get<PaginatedPipelineRuns>('/monitoring/pipelines', {
    ...(params?.status && { status: params.status }),
    ...(params?.type && { type: params.type }),
    ...(params?.datasetId && { datasetId: params.datasetId }),
    ...(params?.dateFrom && { dateFrom: params.dateFrom }),
    ...(params?.dateTo && { dateTo: params.dateTo }),
    ...(params?.page !== undefined && { page: params.page }),
    ...(params?.limit !== undefined && { limit: params.limit }),
  });
}

export async function getPipelineRun(id: string): Promise<PipelineRunDetail> {
  return apiClient.get<PipelineRunDetail>(`/monitoring/pipelines/${id}`);
}

export async function listAlerts(params?: ListAlertsParams): Promise<PaginatedAlerts> {
  return apiClient.get<PaginatedAlerts>('/monitoring/alerts', {
    ...(params?.severity && { severity: params.severity }),
    ...(params?.acknowledged !== undefined && { acknowledged: params.acknowledged }),
    ...(params?.page !== undefined && { page: params.page }),
    ...(params?.limit !== undefined && { limit: params.limit }),
  });
}

export async function acknowledgeAlert(id: string): Promise<void> {
  return apiClient.post<void>(`/monitoring/alerts/${id}/ack`);
}

export async function getMonitoringSummary(): Promise<MonitoringSummary> {
  return apiClient.get<MonitoringSummary>('/monitoring/summary');
}
