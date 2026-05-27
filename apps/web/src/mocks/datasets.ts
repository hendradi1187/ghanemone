/**
 * Mock dataset catalog — ~50 realistic Indonesian E&P entries.
 *
 * Deterministic (no `Math.random()` di module-level) supaya consumer dapat
 * predictable behavior antar reload. Phase 9 akan diganti dengan response
 * dari `GET /v1/datasets` (api-contract.md §3).
 *
 * Schema sengaja sedikit lebih kaya dari DatasetCardData supaya bisa di-filter
 * berdasarkan field tambahan (location, file_count, size_mb).
 *
 * Phase 8.8 (Detail Page): tambahan field detail per dataset
 *   - metadata (CRS, bbox, record count, formats, license, dates)
 *   - attributes (schema 10-20 columns)
 *   - lineage (upstream + downstream graph 1-3 each)
 *   - files (3-10 per dataset)
 *   - tags (3-5)
 *   - contact (steward info)
 *   - usage_stats (30d window)
 */
import type { DatasetCardData, DatasetKind, DatasetStatus } from '@ghanem/ui';
import type { Geometry as GeoJsonGeometry } from 'geojson';
import { WK_GEOMETRY_BY_DATASET_ID } from './wk-boundaries';

export type DatasetCategory =
  | 'seismic'
  | 'well-log'
  | 'production'
  | 'concession'
  | 'geology'
  | 'document';

/** Tipe data atribut untuk schema view. */
export type AttributeType = 'string' | 'number' | 'date' | 'geometry';

/** Metadata teknis dataset (Phase 8.8). */
export interface DatasetMetadata {
  /** EPSG code, mis. "EPSG:4326". */
  crs: string;
  /** Bounding box [minLon, minLat, maxLon, maxLat] WGS84. */
  bbox: [number, number, number, number];
  /** Jumlah record/feature di dataset. */
  record_count: number;
  /** Format file yang tersedia. */
  file_format: string[];
  /** ISO 8601 last-updated timestamp. */
  last_updated: string;
  /** ISO 8601 created timestamp. */
  created_at: string;
  /** Lisensi penggunaan. */
  license: string;
}

/** Satu atribut/kolom di dataset schema. */
export interface DatasetAttribute {
  name: string;
  type: AttributeType;
  description: string;
  nullable: boolean;
  example: string;
}

/** Item lineage (upstream/downstream link). */
export interface LineageItem {
  id: string;
  name: string;
  /** Jenis sumber/turunan. */
  type: 'source' | 'connector' | 'derived' | 'product';
}

/** Lineage graph: dataset ini punya upstream + downstream nodes. */
export interface DatasetLineage {
  upstream: LineageItem[];
  downstream: LineageItem[];
}

/** File item dalam dataset (untuk Files tab). */
export interface DatasetFile {
  name: string;
  size_bytes: number;
  format: string;
  updated_at: string;
}

/** Contact / data steward. */
export interface DatasetContact {
  name: string;
  email: string;
  organization: string;
}

/** Usage statistics 30 hari terakhir. */
export interface DatasetUsageStats {
  downloads_30d: number;
  api_calls_30d: number;
  unique_users_30d: number;
}

/** Kualitas data — untuk DataQualitySection di slide-over dan detail page. */
export interface DataQualityInfo {
  /** Persentase completeness data (0-100). */
  completeness: number;
  /** Tingkat akurasi posisi/geometri. */
  positionalAccuracy: 'high' | 'medium' | 'low';
  /** Tanggal terakhir diperbarui dalam format ISO 8601 atau label relatif. */
  currency: string;
}

export interface DatasetRecord extends DatasetCardData {
  /** Kategori canonical (untuk filter). */
  categoryId: DatasetCategory;
  /** KKKS / provider id (slug). */
  providerId: string;
  /** Approx longitude (Indonesia bbox). */
  longitude: number;
  /** Approx latitude. */
  latitude: number;
  /** Jumlah file di dataset. */
  fileCount: number;
  /** Ukuran agregat dalam MB. */
  sizeMb: number;
  /** Metadata teknis lengkap (Phase 8.8). */
  metadata: DatasetMetadata;
  /** Schema atribut/kolom (Phase 8.8). */
  attributes: DatasetAttribute[];
  /** Lineage graph (Phase 8.8). */
  lineage: DatasetLineage;
  /** File list (Phase 8.8). */
  files: DatasetFile[];
  /** Tag bebas-teks (Phase 8.8). */
  tags: string[];
  /** Contact / data steward (Phase 8.8). */
  contact: DatasetContact;
  /** Usage stats 30d window (Phase 8.8). */
  usage_stats: DatasetUsageStats;
  /** Informasi kualitas data (Sprint 2B). */
  dataQuality: DataQualityInfo;
  /**
   * Task #21: GeoJSON geometry organik untuk concession WK — polygon handcrafted.
   * Jika tersedia, HfMap akan pakai ini (bukan bbox rectangle) untuk render polygon.
   */
  geometry?: GeoJsonGeometry;
}

/** Provider catalog — fixed list of KKKS. */
export const PROVIDERS: readonly {
  id: string;
  name: string;
  initials: string;
  color: string;
  domain: string;
}[] = [
  { id: 'phe-onwj', name: 'PHE ONWJ', initials: 'PH', color: 'var(--hf-amber-500, #c2840d)', domain: 'phe-onwj.co.id' },
  { id: 'pertamina-hulu', name: 'Pertamina Hulu Mahakam', initials: 'PHM', color: 'var(--hf-green-500, #1f8a4a)', domain: 'pertamina-hulu.com' },
  { id: 'medco', name: 'Medco E&P', initials: 'ME', color: 'var(--hf-blue-500, #2a5fb8)', domain: 'medcoenergi.com' },
  { id: 'chevron', name: 'Chevron Indonesia', initials: 'CI', color: 'var(--hf-amber-500, #c2840d)', domain: 'chevron.co.id' },
  { id: 'inpex', name: 'Inpex Masela', initials: 'IM', color: 'var(--hf-purple-500, #7a5cb8)', domain: 'inpex.co.jp' },
  { id: 'eni', name: 'Eni Indonesia', initials: 'EI', color: 'var(--hf-blue-500, #2a5fb8)', domain: 'eni.com' },
  { id: 'skk-migas', name: 'SKK Migas', initials: 'SM', color: 'var(--hf-blue-500, #2a5fb8)', domain: 'skkmigas.go.id' },
  { id: 'harbour', name: 'Harbour Energy', initials: 'HE', color: 'var(--hf-green-500, #1f8a4a)', domain: 'harbourenergy.com' },
];

export const CATEGORIES: readonly { id: DatasetCategory; label: string; color: string }[] = [
  { id: 'seismic', label: 'Seismic 2D/3D', color: '#2a5fb8' },
  { id: 'well-log', label: 'Well log', color: '#1f8a4a' },
  { id: 'production', label: 'Production', color: '#c2840d' },
  { id: 'concession', label: 'Concession & WK', color: '#7a5cb8' },
  { id: 'geology', label: 'Geology & Geochemistry', color: '#cf3a2a' },
  { id: 'document', label: 'Document', color: '#5b667e' },
];

/* ─── Mock catalog factory ────────────────────────────────────────────── */

const TITLE_PREFIX: Record<DatasetCategory, string[]> = {
  seismic: ['Seismic 3D —', 'Seismic 2D —', 'PSDM Volume —', 'PSTM Survey —'],
  'well-log': ['Well Log Composite —', 'Wireline Logs —', 'Mud Log —', 'LWD Data —'],
  production: ['Production History —', 'Monthly Production —', 'Allocation Report —'],
  concession: ['Working Area Boundary —', 'PSC Map —', 'Field Outline —'],
  geology: ['Geochemistry Sample —', 'Core Photo Library —', 'Biostratigraphy —'],
  document: ['Final Well Report —', 'AFE Document —', 'Annual Audit —'],
};

const REGIONS = [
  { name: 'North Sumatra Basin', lng: 99.0, lat: 3.5 },
  { name: 'Central Sumatra Basin', lng: 101.4, lat: 0.5 },
  { name: 'South Sumatra Basin', lng: 104.0, lat: -3.0 },
  { name: 'Offshore Northwest Java', lng: 107.5, lat: -5.7 },
  { name: 'East Java Basin', lng: 113.0, lat: -7.2 },
  { name: 'Kutai Basin', lng: 117.5, lat: -0.3 },
  { name: 'Mahakam Delta', lng: 117.7, lat: -0.8 },
  { name: 'Tarakan Basin', lng: 117.6, lat: 3.3 },
  { name: 'Bonaparte Basin', lng: 127.6, lat: -8.2 },
  { name: 'Salawati Basin', lng: 131.0, lat: -1.0 },
  { name: 'Berau Bay', lng: 132.6, lat: -2.5 },
];

const FORMAT_BY_KIND: Record<DatasetKind, string[]> = {
  LAYER: ['Vector · SHP, GeoJSON', 'Vector · GeoPackage', 'Raster · GeoTIFF'],
  VOLUME: ['Volume · SEG-Y', 'Volume · ZGY', 'Volume · OpenVDS'],
  DOC: ['PDF · 2.4 MB', 'PDF · 12.8 MB', 'XLSX · 1.1 MB', 'DOCX · 540 KB'],
};

const KIND_BY_CATEGORY: Record<DatasetCategory, DatasetKind> = {
  seismic: 'VOLUME',
  'well-log': 'LAYER',
  production: 'LAYER',
  concession: 'LAYER',
  geology: 'LAYER',
  document: 'DOC',
};

const STATUS_CYCLE: DatasetStatus[] = ['public', 'internal', 'internal', 'confidential'];

const LICENSES: Record<DatasetStatus, string> = {
  public: 'CC-BY-4.0',
  internal: 'Internal SPEKTRUM',
  confidential: 'Restricted SKK Migas',
};

/* ─── Attribute schemas per category ──────────────────────────────────── */

const ATTRIBUTES_BY_CATEGORY: Record<DatasetCategory, DatasetAttribute[]> = {
  seismic: [
    { name: 'survey_id', type: 'string', description: 'Identifier survey (UWI-style).', nullable: false, example: 'SRV-2024-ONWJ-3D-01' },
    { name: 'survey_name', type: 'string', description: 'Nama lengkap survey.', nullable: false, example: 'ONWJ 3D Reprocessing 2024' },
    { name: 'survey_type', type: 'string', description: 'Jenis akuisisi (2D/3D/4D).', nullable: false, example: '3D' },
    { name: 'inline_min', type: 'number', description: 'Inline minimum.', nullable: false, example: '1001' },
    { name: 'inline_max', type: 'number', description: 'Inline maximum.', nullable: false, example: '1850' },
    { name: 'xline_min', type: 'number', description: 'Crossline minimum.', nullable: false, example: '2001' },
    { name: 'xline_max', type: 'number', description: 'Crossline maximum.', nullable: false, example: '2850' },
    { name: 'sample_interval_ms', type: 'number', description: 'Interval sampling (ms).', nullable: false, example: '2' },
    { name: 'bin_size_m', type: 'string', description: 'Ukuran bin akuisisi.', nullable: false, example: '12.5m × 12.5m' },
    { name: 'phase', type: 'string', description: 'Stack phase.', nullable: false, example: 'Full Stack' },
    { name: 'processing_vendor', type: 'string', description: 'Vendor processing.', nullable: true, example: 'CGG' },
    { name: 'acquired_at', type: 'date', description: 'Tanggal akuisisi.', nullable: false, example: '2023-11-12' },
    { name: 'processed_at', type: 'date', description: 'Tanggal selesai processing.', nullable: false, example: '2024-06-04' },
    { name: 'bbox', type: 'geometry', description: 'Bounding box survey area.', nullable: false, example: 'POLYGON((...))' },
  ],
  'well-log': [
    { name: 'uwi', type: 'string', description: 'Unique Well Identifier.', nullable: false, example: 'GWN-01' },
    { name: 'well_name', type: 'string', description: 'Nama sumur.', nullable: false, example: 'Ghanem-Well-North-01' },
    { name: 'well_type', type: 'string', description: 'Tipe sumur (Exploration/Production/Injector).', nullable: false, example: 'Exploration' },
    { name: 'operator', type: 'string', description: 'Operator KKKS.', nullable: false, example: 'PHE ONWJ' },
    { name: 'spud_date', type: 'date', description: 'Tanggal mulai pengeboran.', nullable: false, example: '2022-01-12' },
    { name: 'td_date', type: 'date', description: 'Total-depth date.', nullable: true, example: '2022-04-28' },
    { name: 'total_depth_m', type: 'number', description: 'Total kedalaman (m TVDSS).', nullable: false, example: '3250' },
    { name: 'status', type: 'string', description: 'Status saat ini.', nullable: false, example: 'Active' },
    { name: 'field', type: 'string', description: 'Lapangan/blok.', nullable: false, example: 'Ghanem Field' },
    { name: 'formation', type: 'string', description: 'Formasi target.', nullable: true, example: 'Bekasap Formation' },
    { name: 'reservoir', type: 'string', description: 'Jenis reservoir.', nullable: true, example: 'Sandstone' },
    { name: 'location', type: 'geometry', description: 'Lokasi well-head.', nullable: false, example: 'POINT(107.10 -5.85)' },
    { name: 'kb_elevation_m', type: 'number', description: 'Kelly Bushing elevation.', nullable: true, example: '32.5' },
  ],
  production: [
    { name: 'field_id', type: 'string', description: 'Identifier lapangan.', nullable: false, example: 'FLD-ONWJ-001' },
    { name: 'field_name', type: 'string', description: 'Nama lapangan.', nullable: false, example: 'Bekasap Field' },
    { name: 'period_start', type: 'date', description: 'Awal periode produksi.', nullable: false, example: '2024-01-01' },
    { name: 'period_end', type: 'date', description: 'Akhir periode produksi.', nullable: false, example: '2024-01-31' },
    { name: 'oil_bopd', type: 'number', description: 'Produksi minyak (BOPD).', nullable: false, example: '12450' },
    { name: 'gas_mmscfd', type: 'number', description: 'Produksi gas (MMSCFD).', nullable: false, example: '45.2' },
    { name: 'water_bwpd', type: 'number', description: 'Produksi air (BWPD).', nullable: false, example: '8200' },
    { name: 'water_cut_pct', type: 'number', description: 'Persen water cut.', nullable: false, example: '39.7' },
    { name: 'gor_scf_bbl', type: 'number', description: 'Gas-Oil Ratio.', nullable: true, example: '3635' },
    { name: 'reservoir_pressure_psi', type: 'number', description: 'Tekanan reservoir.', nullable: true, example: '2840' },
    { name: 'operator', type: 'string', description: 'Operator KKKS.', nullable: false, example: 'PHE ONWJ' },
    { name: 'reporting_unit', type: 'string', description: 'Unit pelaporan.', nullable: false, example: 'Monthly' },
  ],
  concession: [
    { name: 'wk_id', type: 'string', description: 'Identifier Wilayah Kerja.', nullable: false, example: 'WK-ONWJ-001' },
    { name: 'wk_name', type: 'string', description: 'Nama Wilayah Kerja.', nullable: false, example: 'Offshore Northwest Java' },
    { name: 'operator', type: 'string', description: 'Operator utama.', nullable: false, example: 'PHE ONWJ' },
    { name: 'contract_type', type: 'string', description: 'Jenis kontrak PSC.', nullable: false, example: 'Gross Split' },
    { name: 'contract_start', type: 'date', description: 'Awal kontrak.', nullable: false, example: '2018-08-09' },
    { name: 'contract_end', type: 'date', description: 'Akhir kontrak.', nullable: false, example: '2048-08-08' },
    { name: 'status', type: 'string', description: 'Status kontrak.', nullable: false, example: 'Active' },
    { name: 'area_km2', type: 'number', description: 'Luas area (km²).', nullable: false, example: '13978.45' },
    { name: 'water_depth_m', type: 'number', description: 'Kedalaman laut rata-rata.', nullable: true, example: '45' },
    { name: 'basin', type: 'string', description: 'Cekungan utama.', nullable: false, example: 'Northwest Java Basin' },
    { name: 'geometry', type: 'geometry', description: 'Batas WK.', nullable: false, example: 'MULTIPOLYGON((...))' },
    { name: 'gazetted_at', type: 'date', description: 'Tanggal SK Menteri.', nullable: true, example: '2018-08-09' },
  ],
  geology: [
    { name: 'sample_id', type: 'string', description: 'Identifier sampel.', nullable: false, example: 'GC-2024-001' },
    { name: 'sample_type', type: 'string', description: 'Jenis sampel.', nullable: false, example: 'Source Rock Extract' },
    { name: 'well_id', type: 'string', description: 'Sumur asal sampel.', nullable: true, example: 'GWN-01' },
    { name: 'depth_m', type: 'number', description: 'Kedalaman ambil (m).', nullable: false, example: '2480.5' },
    { name: 'formation', type: 'string', description: 'Formasi geologi.', nullable: false, example: 'Talangakar Formation' },
    { name: 'toc_pct', type: 'number', description: 'Total Organic Carbon.', nullable: true, example: '2.4' },
    { name: 'tmax_c', type: 'number', description: 'Tmax (°C).', nullable: true, example: '438' },
    { name: 'hi_mg_g', type: 'number', description: 'Hydrogen Index.', nullable: true, example: '320' },
    { name: 'kerogen_type', type: 'string', description: 'Tipe kerogen.', nullable: true, example: 'Type II' },
    { name: 'collected_at', type: 'date', description: 'Tanggal koleksi.', nullable: false, example: '2024-03-15' },
    { name: 'analyzed_at', type: 'date', description: 'Tanggal analisis lab.', nullable: true, example: '2024-04-02' },
    { name: 'lab', type: 'string', description: 'Lab pelaksana.', nullable: true, example: 'LEMIGAS' },
  ],
  document: [
    { name: 'doc_id', type: 'string', description: 'Identifier dokumen.', nullable: false, example: 'FWR-2024-ONWJ-12' },
    { name: 'title', type: 'string', description: 'Judul dokumen.', nullable: false, example: 'Final Well Report GWN-01' },
    { name: 'doc_type', type: 'string', description: 'Jenis dokumen.', nullable: false, example: 'Final Well Report' },
    { name: 'related_well', type: 'string', description: 'Sumur terkait.', nullable: true, example: 'GWN-01' },
    { name: 'related_field', type: 'string', description: 'Lapangan terkait.', nullable: true, example: 'Ghanem Field' },
    { name: 'author', type: 'string', description: 'Penulis/operator.', nullable: false, example: 'PHE ONWJ Geology Team' },
    { name: 'language', type: 'string', description: 'Bahasa dokumen.', nullable: false, example: 'id-ID' },
    { name: 'page_count', type: 'number', description: 'Jumlah halaman.', nullable: true, example: '142' },
    { name: 'published_at', type: 'date', description: 'Tanggal publikasi.', nullable: false, example: '2024-05-12' },
    { name: 'classification', type: 'string', description: 'Klasifikasi sensitivitas.', nullable: false, example: 'Internal' },
  ],
};

/* ─── Builders untuk field detail ─────────────────────────────────────── */

function buildBbox(lng: number, lat: number, kind: DatasetKind): [number, number, number, number] {
  // Span lebih lebar untuk seismic/concession, kecil untuk well-log/document.
  const span = kind === 'VOLUME' ? 1.8 : kind === 'DOC' ? 0.4 : 1.1;
  const minLon = +(lng - span / 2).toFixed(4);
  const maxLon = +(lng + span / 2).toFixed(4);
  const minLat = +(lat - span / 2).toFixed(4);
  const maxLat = +(lat + span / 2).toFixed(4);
  return [minLon, minLat, maxLon, maxLat];
}

function buildTags(cat: DatasetCategory, provider: string, region: string): string[] {
  const slug = (s: string): string => s.toLowerCase().replace(/[ &]+/g, '-').replace(/[^a-z0-9-]/g, '');
  const base = [cat, slug(provider), 'indonesia', slug(region)];
  // 5 tags total — tambah tag spesifik kategori.
  const extra: Record<DatasetCategory, string> = {
    seismic: 'subsurface',
    'well-log': 'borehole',
    production: 'monthly',
    concession: 'psc',
    geology: 'geochemistry',
    document: 'reference',
  };
  return [...base, extra[cat]];
}

function buildFiles(record: { id: string; kind: DatasetKind; sizeMb: number; fileCount: number; year: number }): DatasetFile[] {
  const formats: Record<DatasetKind, string[]> = {
    LAYER: ['SHP', 'GeoJSON', 'GeoPackage', 'CSV'],
    VOLUME: ['SEG-Y', 'ZGY', 'OpenVDS'],
    DOC: ['PDF', 'XLSX', 'DOCX'],
  };
  const fmts = formats[record.kind];
  const count = Math.min(Math.max(record.fileCount, 3), 10);
  const perFileMb = Math.max(1, Math.floor(record.sizeMb / count));
  const files: DatasetFile[] = [];
  for (let n = 0; n < count; n += 1) {
    const fmt = fmts[n % fmts.length] ?? fmts[0] ?? 'SHP';
    files.push({
      name: `${record.id}-part${(n + 1).toString().padStart(2, '0')}.${fmt.toLowerCase().replace('-', '')}`,
      size_bytes: perFileMb * 1024 * 1024 + (n * 13_337),
      format: fmt,
      updated_at: `${record.year}-${String(((n * 2) % 12) + 1).padStart(2, '0')}-15T08:30:00Z`,
    });
  }
  return files;
}

const FALLBACK_PROVIDER = { id: 'unknown', name: 'Unknown Provider', initials: '?', color: '', domain: 'unknown' };

function buildLineage(record: { id: string; categoryId: DatasetCategory; providerId: string }): DatasetLineage {
  // Upstream: source systems + connector.
  const provider = PROVIDERS.find((p) => p.id === record.providerId) ?? FALLBACK_PROVIDER;
  const catLabel = CATEGORIES.find((c) => c.id === record.categoryId)?.label ?? record.categoryId;
  const upstream: LineageItem[] = [
    {
      id: `src-${record.providerId}-gis`,
      name: `${provider.name} GIS Repository`,
      type: 'source',
    },
    {
      id: `conn-spark-${record.categoryId}`,
      name: `SPARK Connector · ${catLabel}`,
      type: 'connector',
    },
  ];
  // Downstream: 1-3 derivative datasets (e.g., aggregates, atlas products).
  const downstream: LineageItem[] = [
    {
      id: `${record.id}-atlas`,
      name: `Atlas Spasial · ${catLabel}`,
      type: 'product',
    },
    {
      id: `${record.id}-summary`,
      name: 'Summary Report (Annual)',
      type: 'derived',
    },
  ];
  return { upstream, downstream };
}

function buildContact(provider: { name: string; id: string; domain: string }): DatasetContact {
  const slug = provider.id.split('-')[0] ?? 'data';
  return {
    name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Data Steward`,
    email: `data-steward@${provider.domain}`,
    organization: provider.name,
  };
}

function buildUsageStats(seed: number): DatasetUsageStats {
  return {
    downloads_30d: 12 + (seed * 7) % 240,
    api_calls_30d: 380 + (seed * 53) % 5800,
    unique_users_30d: 6 + (seed * 3) % 60,
  };
}

function buildDataQuality(seed: number, year: number): DataQualityInfo {
  // Completeness: 75-100% dengan distribusi realistis — mayoritas >90%
  const completeness = 75 + ((seed * 7 + 3) % 26);
  // Positional accuracy: mayoritas high (seismic/concession), medium (well-log), low (document)
  const accuracyValues: DataQualityInfo['positionalAccuracy'][] = ['high', 'high', 'medium', 'high', 'low', 'high', 'medium'];
  const positionalAccuracy = accuracyValues[seed % accuracyValues.length] ?? 'high';
  // Currency: relative time berdasarkan year + seed
  const daysAgo = 1 + (seed * 3) % 180;
  let currency: string;
  if (daysAgo <= 1) {
    currency = 'kemarin';
  } else if (daysAgo <= 7) {
    currency = `${daysAgo} hari lalu`;
  } else if (daysAgo <= 30) {
    currency = `${Math.floor(daysAgo / 7)} minggu lalu`;
  } else {
    currency = `${Math.floor(daysAgo / 30)} bulan lalu`;
  }
  void year; // year tersedia untuk future relative-to-now calculation
  return { completeness, positionalAccuracy, currency };
}

function buildMetadata(args: {
  status: DatasetStatus;
  kind: DatasetKind;
  longitude: number;
  latitude: number;
  year: number;
  sizeMb: number;
  i: number;
}): DatasetMetadata {
  const fileFormatByKind: Record<DatasetKind, string[]> = {
    LAYER: ['SHP', 'GeoJSON', 'GeoPackage'],
    VOLUME: ['SEG-Y', 'ZGY'],
    DOC: ['PDF', 'XLSX'],
  };
  const month = String(((args.i * 5) % 12) + 1).padStart(2, '0');
  const day = String(((args.i * 7) % 28) + 1).padStart(2, '0');
  return {
    crs: 'EPSG:4326',
    bbox: buildBbox(args.longitude, args.latitude, args.kind),
    record_count: args.kind === 'VOLUME' ? 1_200_000 + args.i * 5_000 : 240 + args.i * 17,
    file_format: fileFormatByKind[args.kind],
    last_updated: `${args.year}-${month}-${day}T10:30:00Z`,
    created_at: `${args.year - 1}-${month}-${day}T08:00:00Z`,
    license: LICENSES[args.status],
  };
}

/** Build the canonical mock catalog — fixed ~50 entries. */
function buildCatalog(): DatasetRecord[] {
  const records: DatasetRecord[] = [];
  let i = 0;
  for (const cat of CATEGORIES) {
    // 7-10 entries per category → sekitar 50 total.
    const perCat = cat.id === 'document' ? 5 : 8;
    for (let j = 0; j < perCat; j += 1) {
      const provider = PROVIDERS[i % PROVIDERS.length] ?? FALLBACK_PROVIDER;
      const region = REGIONS[(i * 3) % REGIONS.length] ?? { name: 'Indonesia', lng: 117, lat: -2 };
      const titlePrefix = TITLE_PREFIX[cat.id]?.[j % (TITLE_PREFIX[cat.id]?.length ?? 1)] ?? cat.label;
      const kind = KIND_BY_CATEGORY[cat.id];
      const formatList = FORMAT_BY_KIND[kind];
      const format = formatList[(i + j) % formatList.length] ?? formatList[0] ?? 'SHP';
      const year = 2018 + ((i + j) % 8); // 2018-2025
      const status = STATUS_CYCLE[i % STATUS_CYCLE.length] ?? 'public';
      const verified = (i + j) % 3 !== 0;
      const id = `${cat.id}-${provider.id}-${j + 1}`;
      const sizeMb = kind === 'VOLUME' ? 4500 + ((i * 137) % 14000) : 5 + ((i * 11) % 240);
      const fileCount = 1 + ((i + j) % 24);
      records.push({
        id,
        title: `${titlePrefix} ${region.name}${cat.id === 'document' ? ` (${year})` : ''}`,
        description: descriptionFor(cat.id, region.name, provider.name),
        kind,
        category: cat.label,
        categoryId: cat.id,
        format,
        provider: {
          name: provider.name,
          initials: provider.initials,
          color: provider.color,
        },
        providerId: provider.id,
        verified,
        status,
        year,
        updatedLabel: relativeLabel(j),
        stats: {
          downloads: 30 + ((i * 13) % 400),
          views: 200 + ((i * 91) % 9000),
          stars: (i + j) % 25,
        },
        longitude: region.lng,
        latitude: region.lat,
        fileCount,
        sizeMb,
        metadata: buildMetadata({
          status,
          kind,
          longitude: region.lng,
          latitude: region.lat,
          year,
          sizeMb,
          i,
        }),
        attributes: ATTRIBUTES_BY_CATEGORY[cat.id],
        lineage: buildLineage({ id, categoryId: cat.id, providerId: provider.id }),
        files: buildFiles({ id, kind, sizeMb, fileCount, year }),
        tags: buildTags(cat.id, provider.name, region.name),
        contact: buildContact(provider),
        usage_stats: buildUsageStats(i + j),
        dataQuality: buildDataQuality(i + j, year),
        // Task #21: Attach geometry organik WK untuk concession records yang punya entry di WK_BOUNDARIES
        ...(cat.id === 'concession' && WK_GEOMETRY_BY_DATASET_ID.has(id)
          ? { geometry: WK_GEOMETRY_BY_DATASET_ID.get(id) }
          : {}),
      });
      i += 1;
    }
  }
  return records;
}

function descriptionFor(cat: DatasetCategory, region: string, provider: string): string {
  switch (cat) {
    case 'seismic':
      return `Data seismik di area ${region}, hasil akuisisi terkini oleh ${provider}. Kualitas tinggi, fully processed.`;
    case 'well-log':
      return `Komposit wireline log dari sumur di ${region}. Terverifikasi oleh ${provider}.`;
    case 'production':
      return `Laporan produksi bulanan untuk lapangan di ${region}, dikelola oleh ${provider}.`;
    case 'concession':
      return `Batas Wilayah Kerja di ${region}. Sumber: kontrak PSC terkini, ${provider}.`;
    case 'geology':
      return `Sampel geologi/geokimia dari ${region}. Akuisisi & analisis ${provider}.`;
    case 'document':
      return `Dokumen referensi ${provider} untuk operasional di ${region}.`;
    default:
      return `Dataset di ${region}.`;
  }
}

function relativeLabel(j: number): string {
  if (j === 0) return 'kemarin';
  if (j === 1) return '2 hari lalu';
  if (j === 2) return '5 hari lalu';
  if (j === 3) return '1 minggu lalu';
  if (j === 4) return '2 minggu lalu';
  if (j === 5) return '1 bulan lalu';
  return `${j} bulan lalu`;
}

/** Frozen canonical catalog — same data antar reload. */
export const MOCK_CATALOG: readonly DatasetRecord[] = Object.freeze(buildCatalog());

/** Helper: tahun min/max yang available di catalog (untuk slider). */
export const DATASET_YEAR_RANGE: Readonly<[number, number]> = (() => {
  const years = MOCK_CATALOG.map((d) => d.year ?? 2024);
  return [Math.min(...years), Math.max(...years)];
})();
