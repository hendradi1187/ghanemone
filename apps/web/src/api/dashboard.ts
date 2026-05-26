/**
 * Dashboard API — mock client.
 *
 * Async wrappers di atas `mocks/dashboard.ts` dengan simulated latency
 * 150-400ms supaya skeleton terlihat. Phase 9 ganti dengan call ke
 * `/v1/dashboard/*` (lihat docs/api-contract.md §dashboard).
 */
import {
  getActivityFeed as mockActivity,
  getCategoryDistribution as mockCategoryDist,
  getDatasetTrend as mockTrend,
  getKpiSummary as mockKpi,
  getProvidersTop5 as mockProviders,
  getStatusBreakdown as mockStatus,
  type ActivityEvent,
  type CategorySlice,
  type KpiItem,
  type Persona,
  type ProviderRank,
  type TrendPoint,
} from '../mocks/dashboard';

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 150, max = 400): number {
  return min + Math.floor(Math.random() * (max - min));
}

export async function fetchKpiSummary(persona: Persona): Promise<KpiItem[]> {
  await sleep(jitter());
  return mockKpi(persona);
}

export async function fetchDatasetTrend(monthRange = 12): Promise<TrendPoint[]> {
  await sleep(jitter());
  return mockTrend(monthRange);
}

export async function fetchProvidersTop5(): Promise<ProviderRank[]> {
  await sleep(jitter());
  return mockProviders();
}

export async function fetchCategoryDistribution(): Promise<CategorySlice[]> {
  await sleep(jitter());
  return mockCategoryDist();
}

export async function fetchStatusBreakdown(): Promise<CategorySlice[]> {
  await sleep(jitter());
  return mockStatus();
}

export async function fetchActivityFeed(limit = 10): Promise<ActivityEvent[]> {
  await sleep(jitter());
  return mockActivity(limit);
}

export type {
  Persona,
  KpiItem,
  TrendPoint,
  ProviderRank,
  CategorySlice,
  ActivityEvent,
};
