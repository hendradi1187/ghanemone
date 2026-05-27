/**
 * TanStack Query hooks for dataset operations.
 *
 * Sprint 9.3: All hooks call real backend via api/datasets.ts.
 * staleTime and gcTime tuned to balance freshness vs. request volume.
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  listDatasets,
  getDataset,
  searchDatasets,
  type ListDatasetsParams,
  type SearchDatasetsParams,
} from '../api/datasets';

export function useDatasets(params: ListDatasetsParams) {
  return useQuery({
    queryKey: ['datasets', params],
    queryFn: () => listDatasets(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: ['datasets', id],
    queryFn: () => getDataset(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useDatasetsSearch(params: SearchDatasetsParams & { enabled?: boolean }) {
  const { enabled = true, ...searchParams } = params;
  return useQuery({
    queryKey: ['search', 'datasets', searchParams],
    queryFn: () => searchDatasets(searchParams),
    enabled: enabled && typeof searchParams.q === 'string' && searchParams.q.length > 1,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });
}
