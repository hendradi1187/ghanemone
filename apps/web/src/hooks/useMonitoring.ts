/**
 * useMonitoring — TanStack Query hooks for Monitoring page.
 *
 * Sprint 9.5 Phase 2. Connects to real backend via api/monitoring-api.ts.
 *
 * Query key taxonomy:
 *   ['monitoring', 'summary']                     — run + alert counts
 *   ['monitoring', 'pipelines', filters]          — paginated pipeline runs
 *   ['monitoring', 'alerts', filters]             — paginated alerts
 *
 * staleTime:
 *   summary   — 10s (refresh frequently for live feel)
 *   pipelines — 15s
 *   alerts    — 20s
 *
 * Acknowledge alert: optimistic update, rollback on error.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@ghanem/ui';
import {
  acknowledgeAlert,
  getMonitoringSummary,
  listAlerts,
  listPipelineRuns,
  type Alert,
  type AlertSeverity,
  type ListAlertsParams,
  type ListPipelineRunsParams,
  type PaginatedAlerts,
  type PipelineRunStatus,
  type PipelineRunType,
} from '../api/monitoring-api';

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

/**
 * Monitoring summary — run stats (5 statuses) + alert severity counts (4).
 * Short staleTime for near-real-time dashboard cards.
 */
export function useMonitoringSummary() {
  return useQuery({
    queryKey: ['monitoring', 'summary'] as const,
    queryFn: getMonitoringSummary,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

/**
 * Paginated pipeline runs with optional filters.
 */
export function usePipelineRuns(filters?: {
  status?: PipelineRunStatus;
  type?: PipelineRunType;
  datasetId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['monitoring', 'pipelines', filters ?? {}] as const,
    queryFn: () => listPipelineRuns(filters as ListPipelineRunsParams | undefined),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/**
 * Paginated alerts with optional filters.
 */
export function useAlerts(filters?: {
  severity?: AlertSeverity;
  acknowledged?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['monitoring', 'alerts', filters ?? {}] as const,
    queryFn: () => listAlerts(filters as ListAlertsParams | undefined),
    staleTime: 20_000,
  });
}

/**
 * Acknowledge alert with optimistic update.
 *
 * Optimistic strategy:
 *   - Immediately mark alert as acknowledged in all active alert caches.
 *   - If API fails, rollback each cache entry.
 *   - Always invalidate on settle.
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acknowledgeAlert(id),

    onMutate: async (id) => {
      // Cancel in-flight alert queries.
      await queryClient.cancelQueries({ queryKey: ['monitoring', 'alerts'] });

      // Snapshot all matching caches for rollback.
      const snapshots = new Map<string, PaginatedAlerts>();
      const queries = queryClient.getQueriesData<PaginatedAlerts>({
        queryKey: ['monitoring', 'alerts'],
      });
      for (const [key, data] of queries) {
        if (data) snapshots.set(JSON.stringify(key), data);
      }

      // Optimistically mark acknowledged in all caches.
      queryClient.setQueriesData<PaginatedAlerts>(
        { queryKey: ['monitoring', 'alerts'] },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((a): Alert =>
              a.id === id
                ? {
                    ...a,
                    acknowledged: true,
                    acknowledgedAt: new Date().toISOString(),
                  }
                : a,
            ),
          };
        },
      );

      return { snapshots, queries };
    },

    onError: (_err, _id, context) => {
      // Rollback each snapshot.
      if (context?.queries) {
        for (const [key, data] of context.queries) {
          if (data) {
            queryClient.setQueryData<PaginatedAlerts>(key, data);
          }
        }
      }
      toast.error('Gagal acknowledge alert — perubahan dibatalkan');
    },

    onSuccess: () => {
      toast.success('Alert di-acknowledge');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['monitoring', 'alerts'] });
      void queryClient.invalidateQueries({ queryKey: ['monitoring', 'summary'] });
    },
  });
}
