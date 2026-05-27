/**
 * TanStack Query hooks for spatial/GeoJSON data.
 *
 * Sprint 9.3: All hooks call real backend. staleTime=5min matches
 * backend Cache-Control: max-age=300 header on GeoJSON endpoints.
 */
import { useQuery } from '@tanstack/react-query';
import {
  getWorkAreasGeoJSON,
  getWellsGeoJSON,
  getPipelinesGeoJSON,
  getFacilitiesGeoJSON,
  getSeismicCoveragesGeoJSON,
  getDatasetGeoJSON,
  searchBbox,
  type BboxParams,
} from '../api/spatial';

const FIVE_MINUTES = 5 * 60_000;

export function useWorkAreas() {
  return useQuery({
    queryKey: ['spatial', 'work-areas'],
    queryFn: getWorkAreasGeoJSON,
    staleTime: FIVE_MINUTES,
    gcTime: 10 * 60_000,
  });
}

export function useWells() {
  return useQuery({
    queryKey: ['spatial', 'wells'],
    queryFn: getWellsGeoJSON,
    staleTime: FIVE_MINUTES,
    gcTime: 10 * 60_000,
  });
}

export function usePipelines() {
  return useQuery({
    queryKey: ['spatial', 'pipelines'],
    queryFn: getPipelinesGeoJSON,
    staleTime: FIVE_MINUTES,
    gcTime: 10 * 60_000,
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ['spatial', 'facilities'],
    queryFn: getFacilitiesGeoJSON,
    staleTime: FIVE_MINUTES,
    gcTime: 10 * 60_000,
  });
}

export function useSeismicCoverages() {
  return useQuery({
    queryKey: ['spatial', 'seismic-coverages'],
    queryFn: getSeismicCoveragesGeoJSON,
    staleTime: FIVE_MINUTES,
    gcTime: 10 * 60_000,
  });
}

export function useDatasetGeoJSON(id: string | undefined) {
  return useQuery({
    queryKey: ['spatial', 'dataset', id],
    queryFn: () => getDatasetGeoJSON(id!),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

export function useSpatialBbox(params: BboxParams & { enabled?: boolean }) {
  const { enabled = true, ...bboxParams } = params;
  return useQuery({
    queryKey: ['spatial', 'bbox', bboxParams],
    queryFn: () => searchBbox(bboxParams),
    enabled,
    staleTime: 30_000,
  });
}
