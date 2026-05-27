/**
 * Stats API — real HTTP client for /api/v1/stats/*.
 *
 * Sprint 9.5 Phase 2. Powers Dashboard charts and Analytics page.
 *
 * Endpoints:
 *   GET /stats/overview              KPI overview (totalDatasets, etc.)
 *   GET /stats/datasets-by-category  [{category, count, label}]
 *   GET /stats/datasets-by-month     [{month, count, label}] last 12 months
 *   GET /stats/uploads-by-provider   [{providerId, providerName, count}]
 *   GET /stats/compliance-status     {draft, pendingReview, approved, rejected, archived, total}
 */
import { apiClient } from './client';

/* ─── Response types ─────────────────────────────────────────────────────── */

export interface StatsOverview {
  totalDatasets: number;
  totalProviders: number;
  totalWorkAreas: number;
  totalWells: number;
  totalFacilities: number;
  totalPipelines: number;
  dataAvailability: number;
  growthLastMonth: number;
  pendingApprovals: number;
  activeAlerts: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  label: string;
}

export interface MonthlyStat {
  month: string;
  count: number;
  label: string;
}

export interface ProviderStat {
  providerId: string;
  providerName: string;
  count: number;
}

export interface ComplianceStat {
  draft: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  archived: number;
  total: number;
}

/* ─── API functions ──────────────────────────────────────────────────────── */

export async function getStatsOverview(): Promise<StatsOverview> {
  return apiClient.get<StatsOverview>('/stats/overview');
}

export async function getDatasetsByCategory(): Promise<CategoryStat[]> {
  return apiClient.get<CategoryStat[]>('/stats/datasets-by-category');
}

export async function getDatasetsByMonth(): Promise<MonthlyStat[]> {
  return apiClient.get<MonthlyStat[]>('/stats/datasets-by-month');
}

export async function getUploadsByProvider(): Promise<ProviderStat[]> {
  return apiClient.get<ProviderStat[]>('/stats/uploads-by-provider');
}

export async function getComplianceStatus(): Promise<ComplianceStat> {
  return apiClient.get<ComplianceStat>('/stats/compliance-status');
}
