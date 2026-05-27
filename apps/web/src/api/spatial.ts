/**
 * Spatial API — GeoJSON endpoints for map layers.
 *
 * Sprint 9.3: All functions call real backend at /api/v1/spatial/*.
 * staleTime in hooks matches backend Cache-Control: max-age=300 (5 min).
 *
 * GeoJSON types from @types/geojson (installed at workspace root).
 */
import type {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
  Point,
  LineString,
  MultiLineString,
} from 'geojson';
import { apiClient } from './client';

/* ─── Property types for each layer ───────────────────────────────────── */

export interface WorkAreaProperties {
  name: string;
  slug: string;
  color: string;
  status: string;
  operator: string;
  centerLat: number;
  centerLon: number;
  contractEnd: string | null;
  totalAreaKm2: number | null;
  contractStart: string | null;
}

export interface WellProperties {
  uwi: string;
  name: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  operator: string;
  formation: string | null;
  workAreaId: string | null;
  totalDepthM: number | null;
}

export interface PipelineProperties {
  name?: string;
  operator?: string;
  status?: string;
  [key: string]: unknown;
}

export interface FacilityProperties {
  name?: string;
  type?: string;
  operator?: string;
  status?: string;
  [key: string]: unknown;
}

export interface SeismicCoverageProperties {
  name?: string;
  type?: string;
  operator?: string;
  surveyYear?: number | null;
  [key: string]: unknown;
}

/* ─── API functions ────────────────────────────────────────────────────── */

export async function getWorkAreasGeoJSON(): Promise<FeatureCollection<Polygon | MultiPolygon, WorkAreaProperties>> {
  return apiClient.get('/spatial/work-areas.geojson');
}

export async function getWellsGeoJSON(): Promise<FeatureCollection<Point, WellProperties>> {
  return apiClient.get('/spatial/wells.geojson');
}

export async function getPipelinesGeoJSON(): Promise<FeatureCollection<LineString | MultiLineString, PipelineProperties>> {
  return apiClient.get('/spatial/pipelines.geojson');
}

export async function getFacilitiesGeoJSON(): Promise<FeatureCollection<Point, FacilityProperties>> {
  return apiClient.get('/spatial/facilities.geojson');
}

export async function getSeismicCoveragesGeoJSON(): Promise<FeatureCollection<Polygon | MultiPolygon, SeismicCoverageProperties>> {
  return apiClient.get('/spatial/seismic-coverages.geojson');
}

export async function getDatasetGeoJSON(id: string): Promise<Feature> {
  return apiClient.get(`/spatial/datasets/${id}/geojson`);
}

export interface BboxParams {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  type: 'datasets' | 'work_areas' | 'wells' | 'pipelines' | 'facilities' | 'seismic_coverages';
  limit?: number;
}

export async function searchBbox(params: BboxParams): Promise<FeatureCollection> {
  return apiClient.get('/spatial/bbox', {
    minLon: params.minLon,
    minLat: params.minLat,
    maxLon: params.maxLon,
    maxLat: params.maxLat,
    type: params.type,
    limit: params.limit ?? 100,
  });
}
