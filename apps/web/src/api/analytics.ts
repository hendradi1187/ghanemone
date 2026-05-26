/**
 * Analytics API — mock async wrappers + saved-query persistence.
 *
 * Phase 8.11. Consumer: `pages/AnalyticsPage.tsx`. Phase 9 ganti dengan
 * `/v1/analytics/query` (server-evaluated SQL/agg) + saved queries di DB.
 *
 * localStorage:
 *   - Key `ghanem.analytics.savedQueries`: array `SavedQuery[]` user-created.
 *   - Built-in starter queries (id `sample-*`) di-merge di runtime, tidak
 *     ikut persist supaya update built-in cukup deploy ulang kode.
 */
import {
  getBuiltinSavedQueries,
  runAnalyticsQueryMock,
  type AnalyticsQuery,
  type QueryResult,
  type SavedQuery,
} from '../mocks/analytics';

const STORAGE_KEY = 'ghanem.analytics.savedQueries';

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 200, max = 500): number {
  return min + Math.floor(Math.random() * (max - min));
}

/* ─── localStorage helpers ─────────────────────────────────────────────── */

function readUserSaved(): SavedQuery[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSavedQuery);
  } catch (err) {
    // reason: localStorage parse error tidak boleh men-crash analytics page.
    void err;
    return [];
  }
}

function writeUserSaved(list: SavedQuery[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // reason: quota exceeded / Safari Private Mode → silent fail. State stays in memory.
    void err;
  }
}

function isValidSavedQuery(v: unknown): v is SavedQuery {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['id'] === 'string' &&
    typeof o['name'] === 'string' &&
    typeof o['datasetId'] === 'string' &&
    typeof o['chartType'] === 'string' &&
    typeof o['xAxis'] === 'string' &&
    typeof o['yAxis'] === 'string' &&
    typeof o['aggregation'] === 'string'
  );
}

/* ─── Public API ───────────────────────────────────────────────────────── */

/**
 * List saved queries — built-in starter + user-saved (localStorage).
 *
 * User-saved queries diurutkan terbaru di atas, built-in di bawah.
 */
export async function getSavedQueries(): Promise<SavedQuery[]> {
  await sleep(jitter(120, 280));
  const user = readUserSaved().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const builtin = [...getBuiltinSavedQueries()];
  return [...user, ...builtin];
}

/** Persist new saved query. Auto-generate id + createdAt. */
export async function createSavedQuery(input: {
  name: string;
  query: AnalyticsQuery;
  createdBy: string;
}): Promise<SavedQuery> {
  await sleep(jitter(100, 200));
  const saved: SavedQuery = {
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    datasetId: input.query.datasetId,
    chartType: input.query.chartType,
    xAxis: input.query.xAxis,
    yAxis: input.query.yAxis,
    aggregation: input.query.aggregation,
  };
  const next = [saved, ...readUserSaved()];
  writeUserSaved(next);
  return saved;
}

/** Hapus saved query (hanya user-saved — built-in ditolak). */
export async function deleteSavedQuery(id: string): Promise<{ ok: boolean }> {
  await sleep(jitter(80, 160));
  if (id.startsWith('sample-')) {
    return { ok: false };
  }
  const next = readUserSaved().filter((q) => q.id !== id);
  writeUserSaved(next);
  return { ok: true };
}

/** Jalankan analytics query — mock latency 200-500ms. */
export async function runAnalyticsQuery(q: AnalyticsQuery): Promise<QueryResult> {
  await sleep(jitter(200, 500));
  return runAnalyticsQueryMock(q);
}

export type { AnalyticsQuery, QueryResult, SavedQuery } from '../mocks/analytics';
