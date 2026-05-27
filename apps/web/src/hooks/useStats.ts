/**
 * useStats — TanStack Query hooks for /api/v1/stats/* endpoints.
 *
 * Sprint 9.5 Phase 2. Powers Dashboard charts and Analytics page.
 *
 * Query key taxonomy:
 *   ['stats', 'overview']              — KPI overview
 *   ['stats', 'datasets-by-category'] — bar/pie chart data
 *   ['stats', 'datasets-by-month']    — line chart trend
 *   ['stats', 'uploads-by-provider']  — provider ranking
 *   ['stats', 'compliance-status']    — donut compliance
 *
 * staleTime:
 *   overview          — 60s (KPI not expected to change frequently)
 *   datasets-by-category — 60s
 *   datasets-by-month    — 5min (historical data)
 *   uploads-by-provider  — 60s
 *   compliance-status    — 30s (approvals change more often)
 */
import { useQuery } from '@tanstack/react-query';
import {
  getComplianceStatus,
  getDatasetsByCategory,
  getDatasetsByMonth,
  getStatsOverview,
  getUploadsByProvider,
} from '../api/stats';

export function useStatsOverview() {
  return useQuery({
    queryKey: ['stats', 'overview'] as const,
    queryFn: getStatsOverview,
    staleTime: 60_000,
  });
}

export function useDatasetsByCategory() {
  return useQuery({
    queryKey: ['stats', 'datasets-by-category'] as const,
    queryFn: getDatasetsByCategory,
    staleTime: 60_000,
  });
}

export function useDatasetsByMonth() {
  return useQuery({
    queryKey: ['stats', 'datasets-by-month'] as const,
    queryFn: getDatasetsByMonth,
    staleTime: 5 * 60_000,
  });
}

export function useUploadsByProvider() {
  return useQuery({
    queryKey: ['stats', 'uploads-by-provider'] as const,
    queryFn: getUploadsByProvider,
    staleTime: 60_000,
  });
}

export function useComplianceStatus() {
  return useQuery({
    queryKey: ['stats', 'compliance-status'] as const,
    queryFn: getComplianceStatus,
    staleTime: 30_000,
  });
}
