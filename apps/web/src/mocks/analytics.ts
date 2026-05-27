/**
 * Mock data Analytics — chart builder data source.
 *
 * Phase 8.11. Consumer adalah `pages/AnalyticsPage.tsx` (query builder),
 * yang membaca dataset attribute schema dari `mocks/datasets.ts` + men-jalankan
 * agregasi mock via `runAnalyticsQuery`.
 *
 * Deterministic — same `AnalyticsQuery` shape → same result. Tidak ada
 * `Math.random()` di module-level supaya snapshot-friendly. Hash sederhana
 * yang berbasis query string digunakan sebagai seed agregasi.
 *
 * Phase 9: replace `runAnalyticsQuery` dengan call ke `/v1/analytics/query`
 * (atau SQL endpoint di trusted data plane). Saved queries akan persist ke
 * server, bukan localStorage.
 */
import { MOCK_CATALOG, type DatasetAttribute } from './datasets';

/** Tipe chart yang didukung Analytics page. Sub-set chart cards yang ada di
 *  @ghanem/ui (LineChartCard, BarChartCard, PieChartCard, DonutChartCard). */
export type AnalyticsChartType = 'line' | 'bar' | 'pie' | 'donut';

/** Operasi agregasi yang didukung. */
export type AnalyticsAggregation = 'count' | 'sum' | 'avg' | 'min' | 'max';

/** Query definisi — minimal & serializable supaya bisa di-share via URL +
 *  persist ke localStorage tanpa kehilangan fidelity. */
export interface AnalyticsQuery {
  datasetId: string;
  chartType: AnalyticsChartType;
  xAxis: string;
  yAxis: string;
  aggregation: AnalyticsAggregation;
}

/** Saved query meta (id + nama + audit info). */
export interface SavedQuery extends AnalyticsQuery {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

/** Satu baris hasil agregasi — bisa multi-series (mis. line dengan 2 series). */
export interface QueryResultRow {
  /** Label X (kategori / waktu). */
  label: string;
  /** Nilai utama Y (single series). */
  value: number;
  /** Optional second series (mis. comparison previous period). */
  comparison?: number;
}

export interface QueryResult {
  rows: QueryResultRow[];
  /** Total nilai (untuk donut center). */
  totalValue: number;
  /** Apakah hasil valid (yAxis cocok untuk operasi numerik, dst). */
  valid: boolean;
  /** Pesan error kalau invalid. */
  errorMessage?: string;
}

/* ─── Builtin saved queries (catalog deterministik) ────────────────────── */

/**
 * 7 saved-query starter — di-prefix dengan id `sample-*` supaya bisa
 * dibedakan dari user-saved (`saved-<ts>`) di localStorage layer.
 */
function buildBuiltinSavedQueries(): SavedQuery[] {
  const created = '2026-04-01T08:00:00Z';
  const author = 'SPEKTRUM Sample';
  // Pakai dataset yang dijamin ada di MOCK_CATALOG (cek index pertama per kategori).
  const samples: Omit<SavedQuery, 'createdAt' | 'createdBy'>[] = [
    {
      id: 'sample-prod-by-field',
      name: 'Produksi per Lapangan (BOPD)',
      datasetId: 'production-phe-onwj-1',
      chartType: 'bar',
      xAxis: 'field_name',
      yAxis: 'oil_bopd',
      aggregation: 'sum',
    },
    {
      id: 'sample-wells-by-status',
      name: 'Distribusi Status Sumur',
      datasetId: 'well-log-phe-onwj-1',
      chartType: 'donut',
      xAxis: 'status',
      yAxis: 'total_depth_m',
      aggregation: 'count',
    },
    {
      id: 'sample-seismic-by-survey',
      name: 'Survey Seismic per Vendor',
      datasetId: 'seismic-medco-1',
      chartType: 'pie',
      xAxis: 'processing_vendor',
      yAxis: 'sample_interval_ms',
      aggregation: 'count',
    },
    {
      id: 'sample-water-cut-trend',
      name: 'Water Cut Trend (12 bulan)',
      datasetId: 'production-pertamina-hulu-1',
      chartType: 'line',
      xAxis: 'period_start',
      yAxis: 'water_cut_pct',
      aggregation: 'avg',
    },
    {
      id: 'sample-concession-area',
      name: 'Luas Wilayah Kerja per Operator',
      datasetId: 'concession-skk-migas-1',
      chartType: 'bar',
      xAxis: 'operator',
      yAxis: 'area_km2',
      aggregation: 'sum',
    },
    {
      id: 'sample-geo-toc',
      name: 'TOC Rata-rata per Formasi',
      datasetId: 'geology-chevron-1',
      chartType: 'bar',
      xAxis: 'formation',
      yAxis: 'toc_pct',
      aggregation: 'avg',
    },
    {
      id: 'sample-doc-by-type',
      name: 'Dokumen per Tipe',
      datasetId: 'document-skk-migas-1',
      chartType: 'pie',
      xAxis: 'doc_type',
      yAxis: 'page_count',
      aggregation: 'count',
    },
  ];
  return samples.map((s) => ({ ...s, createdAt: created, createdBy: author }));
}

/** Sync read built-in starter queries — frozen list. */
export function getBuiltinSavedQueries(): readonly SavedQuery[] {
  return BUILTIN_SAVED_QUERIES;
}

const BUILTIN_SAVED_QUERIES: readonly SavedQuery[] = Object.freeze(buildBuiltinSavedQueries());

/* ─── Query runner ─────────────────────────────────────────────────────── */

/** Hash string → integer (32-bit). Deterministic. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable seed dari query — dipakai untuk noise variasi nilai. */
function seedFromQuery(q: AnalyticsQuery): number {
  return hashString(`${q.datasetId}|${q.chartType}|${q.xAxis}|${q.yAxis}|${q.aggregation}`);
}

/** Cari attribute schema by dataset id. */
function lookupDatasetAttributes(datasetId: string): DatasetAttribute[] | null {
  const ds = MOCK_CATALOG.find((d) => d.id === datasetId);
  return ds?.attributes ?? null;
}

/** Cari attribute by name di dataset. */
function findAttribute(
  attrs: DatasetAttribute[],
  name: string,
): DatasetAttribute | undefined {
  return attrs.find((a) => a.name === name);
}

/**
 * Generate label values untuk axis kategorikal — berdasarkan tipe attribute +
 * seed query. Output deterministic. Maks 8 kategori (chart tetap readable).
 */
function generateCategoryLabels(attr: DatasetAttribute, seed: number): string[] {
  // Beberapa attribute punya example yang bersifat kategorikal (status, type).
  // Pakai lookup hand-curated untuk nama-nama umum supaya hasil terlihat realistis.
  const hardcoded: Record<string, string[]> = {
    status: ['Active', 'Suspended', 'Plugged', 'Drilling'],
    well_type: ['Exploration', 'Production', 'Injector', 'Appraisal'],
    survey_type: ['2D', '3D', '4D'],
    contract_type: ['Cost Recovery', 'Gross Split', 'Service Contract'],
    operator: ['PHE ONWJ', 'Pertamina Hulu', 'Medco E&P', 'Chevron', 'Inpex'],
    field_name: ['Bekasap Field', 'Minas Field', 'Duri Field', 'Mahakam', 'Cepu'],
    formation: ['Talangakar', 'Bekasap', 'Baturaja', 'Gumai', 'Air Benakat'],
    processing_vendor: ['CGG', 'Schlumberger', 'PGS', 'TGS', 'Internal'],
    doc_type: ['Final Well Report', 'AFE', 'Audit', 'Compliance', 'Geological Report'],
    kerogen_type: ['Type I', 'Type II', 'Type III', 'Mixed'],
    sample_type: ['Source Rock', 'Reservoir', 'Cap Rock', 'Fluid'],
    phase: ['Full Stack', 'Pre-stack', 'PSDM', 'PSTM'],
    reservoir: ['Sandstone', 'Carbonate', 'Shale', 'Tight'],
  };

  const known = hardcoded[attr.name];
  if (known) {
    // Trim to seed-determined count (3..8).
    const count = 3 + (seed % 6);
    return known.slice(0, Math.min(count, known.length));
  }

  if (attr.type === 'date') {
    // Generate sequential month labels (12 bulan).
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.slice(0, 6 + (seed % 7));
  }

  // Fallback generic labels (attr name + 1..6).
  const count = 4 + (seed % 4);
  return Array.from({ length: count }, (_, i) => `${attr.name}-${i + 1}`);
}

/** Run query (deterministic). Returns aggregated rows. */
export function runAnalyticsQueryMock(q: AnalyticsQuery): QueryResult {
  const attrs = lookupDatasetAttributes(q.datasetId);
  if (!attrs) {
    return { rows: [], totalValue: 0, valid: false, errorMessage: 'Dataset tidak ditemukan.' };
  }
  const xAttr = findAttribute(attrs, q.xAxis);
  const yAttr = findAttribute(attrs, q.yAxis);
  if (!xAttr) {
    return { rows: [], totalValue: 0, valid: false, errorMessage: `Atribut X "${q.xAxis}" tidak ada.` };
  }
  if (!yAttr) {
    return { rows: [], totalValue: 0, valid: false, errorMessage: `Atribut Y "${q.yAxis}" tidak ada.` };
  }
  // Untuk sum/avg/min/max yAxis harus numerik. count selalu valid.
  if (q.aggregation !== 'count' && yAttr.type !== 'number') {
    return {
      rows: [],
      totalValue: 0,
      valid: false,
      errorMessage: `Operasi "${q.aggregation}" memerlukan atribut Y bertipe number.`,
    };
  }

  const seed = seedFromQuery(q);
  const labels = generateCategoryLabels(xAttr, seed);
  // Generate values per label — base + noise.
  const rows: QueryResultRow[] = labels.map((label, i) => {
    const localSeed = hashString(`${seed}|${label}|${i}`);
    // Range berbeda untuk count vs sum/avg/min/max — pakai magnitude attribute name.
    const isMagnitudeLarge = q.aggregation === 'sum' || yAttr.name.includes('depth') || yAttr.name.includes('area');
    const base = q.aggregation === 'count' ? 30 : isMagnitudeLarge ? 50_000 : 100;
    const noise = (localSeed % 100) / 100; // 0..1
    const scale = q.aggregation === 'count' ? 1 + (i * 7) % 5 : 0.5 + noise * 1.5;
    const value = Math.round(base * scale + (localSeed % 200));
    const comparison = Math.round(value * (0.85 + (localSeed % 30) / 100));
    return { label, value, comparison };
  });
  const totalValue = rows.reduce((acc, r) => acc + r.value, 0);
  return { rows, totalValue, valid: true };
}
