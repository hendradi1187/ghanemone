/**
 * seed-geospatial.ts — Sprint 9.1 Task #40
 * Ghanem.one Spatial Intelligence Platform
 *
 * Seeds:
 *   - 8 WorkArea (WK) polygons from wk-boundaries.ts (inlined — no web dep)
 *   - 47 Dataset records from datasets.ts mock catalog (inlined)
 *   - 25 sample Well points distributed across WK bounding boxes
 *   - 4 sample Pipeline routes connecting WK facilities
 *   - 12 sample Facility points (platforms, FPSOs, processing plants)
 *   - 8 SeismicCoverage polygons (one per WK)
 *
 * Uses raw SQL for geometry columns (Prisma does not support PostGIS natively).
 * All geometry stored in EPSG:4326. ST_GeomFromGeoJSON used for WKT-free inserts.
 *
 * Run: npx ts-node --project tsconfig.json prisma/seed-geospatial.ts
 * Or via prisma db seed after configuring package.json seed command.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// =============================================================================
// Inlined WK boundary data (source: apps/web/src/mocks/wk-boundaries.ts)
// Coordinates are WGS84 (EPSG:4326). These are approximate — not survey-grade.
// =============================================================================

interface WkSeedEntry {
  slug: string;
  name: string;
  operator: string;
  color: string;
  contractStart: string;
  contractEnd: string;
  /** GeoJSON Polygon coordinates [[[lon, lat], ...]] */
  coordinates: number[][][];
}

const WK_SEED_DATA: readonly WkSeedEntry[] = [
  {
    slug: 'wk-onwj',
    name: 'WK ONWJ',
    operator: 'PHE ONWJ',
    color: '#7a5cb8',
    contractStart: '2018-08-09T00:00:00Z',
    contractEnd: '2048-08-08T00:00:00Z',
    coordinates: [[
      [107.10, -5.55], [107.70, -5.35], [108.30, -5.20], [108.90, -5.40],
      [109.10, -5.85], [108.80, -6.35], [108.20, -6.55], [107.55, -6.45],
      [107.05, -6.10], [106.90, -5.80], [107.10, -5.55],
    ]],
  },
  {
    slug: 'wk-mahakam',
    name: 'WK Mahakam',
    operator: 'Pertamina Hulu Mahakam',
    color: '#1f8a4a',
    contractStart: '2017-01-01T00:00:00Z',
    contractEnd: '2037-12-31T00:00:00Z',
    coordinates: [[
      [116.40, -0.90], [117.00, -0.70], [117.60, -0.55], [118.10, -0.75],
      [118.30, -1.20], [118.10, -1.75], [117.50, -2.10], [116.85, -2.05],
      [116.35, -1.70], [116.15, -1.25], [116.40, -0.90],
    ]],
  },
  {
    slug: 'wk-rokan',
    name: 'WK Rokan',
    operator: 'PHR (Pertamina Hulu Rokan)',
    color: '#c2840d',
    contractStart: '2021-08-09T00:00:00Z',
    contractEnd: '2041-08-08T00:00:00Z',
    coordinates: [[
      [100.20, 1.80], [100.90, 1.95], [101.45, 1.75], [101.70, 1.30],
      [101.60, 0.75], [101.25, 0.30], [100.65, 0.10], [100.05, 0.25],
      [99.70, 0.70],  [99.65, 1.25],  [99.90, 1.60],  [100.20, 1.80],
    ]],
  },
  {
    slug: 'wk-cepu',
    name: 'WK Cepu',
    operator: 'ExxonMobil Cepu Ltd / Pertamina EP Cepu',
    color: '#2a5fb8',
    contractStart: '2005-09-17T00:00:00Z',
    contractEnd: '2035-09-17T00:00:00Z',
    coordinates: [[
      [111.00, -6.75], [111.55, -6.65], [112.00, -6.80], [112.20, -7.15],
      [112.05, -7.50], [111.55, -7.65], [110.95, -7.55], [110.60, -7.25],
      [110.65, -6.95], [111.00, -6.75],
    ]],
  },
  {
    slug: 'wk-tarakan',
    name: 'WK Tarakan',
    operator: 'Pertamina EP',
    color: '#cf3a2a',
    contractStart: '2010-03-15T00:00:00Z',
    contractEnd: '2030-03-14T00:00:00Z',
    coordinates: [[
      [116.85, 3.60], [117.40, 3.75], [117.85, 3.55], [118.00, 3.15],
      [117.80, 2.70], [117.35, 2.45], [116.80, 2.55], [116.45, 2.90],
      [116.40, 3.30], [116.85, 3.60],
    ]],
  },
  {
    slug: 'wk-natuna',
    name: 'WK Natuna',
    operator: 'Medco E&P Natuna',
    color: '#7a5cb8',
    contractStart: '2015-06-01T00:00:00Z',
    contractEnd: '2045-05-31T00:00:00Z',
    coordinates: [[
      [107.50, 3.50], [108.30, 3.60], [108.90, 3.35], [109.00, 2.85],
      [108.75, 2.30], [108.10, 2.00], [107.40, 2.10], [107.05, 2.55],
      [107.10, 3.10], [107.50, 3.50],
    ]],
  },
  {
    slug: 'wk-sanga-sanga',
    name: 'WK Sanga-Sanga',
    operator: 'Vico Indonesia',
    color: '#1f8a4a',
    contractStart: '1968-08-28T00:00:00Z',
    contractEnd: '2028-08-27T00:00:00Z',
    coordinates: [[
      [117.10, -0.10], [117.60, -0.00], [118.00, -0.20], [118.10, -0.65],
      [117.85, -1.05], [117.30, -1.15], [116.85, -0.95], [116.70, -0.55],
      [116.85, -0.20], [117.10, -0.10],
    ]],
  },
  {
    slug: 'wk-senoro',
    name: 'WK Senoro-Toili',
    operator: 'Pertamina EP / Medco E&P',
    color: '#c2840d',
    contractStart: '2011-12-20T00:00:00Z',
    contractEnd: '2036-12-19T00:00:00Z',
    coordinates: [[
      [122.20, -1.55], [122.75, -1.40], [123.20, -1.60], [123.35, -2.00],
      [123.15, -2.45], [122.65, -2.60], [122.15, -2.45], [121.90, -2.05],
      [122.00, -1.70], [122.20, -1.55],
    ]],
  },
] as const;

// =============================================================================
// Inlined Dataset seed data
// Source: apps/web/src/mocks/datasets.ts MOCK_CATALOG (buildCatalog output)
// Inlined here to avoid importing React-dependent @ghanem/ui types.
// The 47 records mirror exactly what buildCatalog() produces.
// =============================================================================

type DatasetCategoryEnum =
  | 'SEISMIC'
  | 'WELL_LOG'
  | 'PRODUCTION'
  | 'CONCESSION'
  | 'GEOLOGY'
  | 'DOCUMENT';

type SensitivityEnum = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

interface DatasetSeedEntry {
  id: string;
  title: string;
  description: string;
  category: DatasetCategoryEnum;
  format: string;
  sensitivityLevel: SensitivityEnum;
  verified: boolean;
  year: number;
  centerLat: number;
  centerLon: number;
  bboxJson: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  dataQuality: { completeness: number; positionalAccuracy: string; currency: string };
  metadata: {
    crs: string;
    record_count: number;
    file_format: string[];
    license: string;
  };
  downloadCount: number;
  viewCount: number;
}

/**
 * Compute bbox from center + span (mirrors buildBbox in datasets.ts).
 * VOLUME span=1.8, DOC span=0.4, others span=1.1
 */
function bbox(
  lon: number,
  lat: number,
  span: number,
): [number, number, number, number] {
  const half = span / 2;
  return [
    parseFloat((lon - half).toFixed(4)),
    parseFloat((lat - half).toFixed(4)),
    parseFloat((lon + half).toFixed(4)),
    parseFloat((lat + half).toFixed(4)),
  ];
}

// Mirrors STATUS_CYCLE from datasets.ts
type FrontendStatus = 'public' | 'internal' | 'confidential';
const STATUS_CYCLE: FrontendStatus[] = ['public', 'internal', 'internal', 'confidential'];
const LICENSES: Record<FrontendStatus, string> = {
  public: 'CC-BY-4.0',
  internal: 'Internal SPEKTRUM',
  confidential: 'Restricted SKK Migas',
};
function sensitivityFromStatus(s: FrontendStatus): SensitivityEnum {
  if (s === 'public') return 'PUBLIC';
  if (s === 'confidential') return 'CONFIDENTIAL';
  return 'INTERNAL';
}

// REGIONS from datasets.ts (same order)
const REGIONS = [
  { name: 'North Sumatra Basin',      lng: 99.0,  lat: 3.5  },
  { name: 'Central Sumatra Basin',    lng: 101.4, lat: 0.5  },
  { name: 'South Sumatra Basin',      lng: 104.0, lat: -3.0 },
  { name: 'Offshore Northwest Java',  lng: 107.5, lat: -5.7 },
  { name: 'East Java Basin',          lng: 113.0, lat: -7.2 },
  { name: 'Kutai Basin',              lng: 117.5, lat: -0.3 },
  { name: 'Mahakam Delta',            lng: 117.7, lat: -0.8 },
  { name: 'Tarakan Basin',            lng: 117.6, lat: 3.3  },
  { name: 'Bonaparte Basin',          lng: 127.6, lat: -8.2 },
  { name: 'Salawati Basin',           lng: 131.0, lat: -1.0 },
  { name: 'Berau Bay',                lng: 132.6, lat: -2.5 },
] as const;

// PROVIDERS from datasets.ts (same order, id only)
const PROVIDER_IDS = [
  'phe-onwj', 'pertamina-hulu', 'medco', 'chevron',
  'inpex', 'eni', 'skk-migas', 'harbour',
] as const;

// FORMAT_BY_KIND
const FORMAT_BY_KIND: Record<string, string[]> = {
  VOLUME: ['Volume · SEG-Y', 'Volume · ZGY', 'Volume · OpenVDS'],
  LAYER:  ['Vector · SHP, GeoJSON', 'Vector · GeoPackage', 'Raster · GeoTIFF'],
  DOC:    ['PDF · 2.4 MB', 'PDF · 12.8 MB', 'XLSX · 1.1 MB', 'DOCX · 540 KB'],
};

const KIND_BY_CATEGORY: Record<DatasetCategoryEnum, string> = {
  SEISMIC:        'VOLUME',
  WELL_LOG:       'LAYER',
  PRODUCTION:     'LAYER',
  CONCESSION:     'LAYER',
  GEOLOGY:        'LAYER',
  DOCUMENT:       'DOC',
};

interface CategoryDef {
  id: DatasetCategoryEnum;
  label: string;
  perCat: number;
  prefixes: string[];
}

const CATEGORY_DEFS: CategoryDef[] = [
  {
    id: 'SEISMIC', label: 'Seismic 2D/3D', perCat: 8,
    prefixes: ['Seismic 3D —', 'Seismic 2D —', 'PSDM Volume —', 'PSTM Survey —'],
  },
  {
    id: 'WELL_LOG', label: 'Well log', perCat: 8,
    prefixes: ['Well Log Composite —', 'Wireline Logs —', 'Mud Log —', 'LWD Data —'],
  },
  {
    id: 'PRODUCTION', label: 'Production', perCat: 8,
    prefixes: ['Production History —', 'Monthly Production —', 'Allocation Report —'],
  },
  {
    id: 'CONCESSION', label: 'Concession & WK', perCat: 8,
    prefixes: ['Working Area Boundary —', 'PSC Map —', 'Field Outline —'],
  },
  {
    id: 'GEOLOGY', label: 'Geology & Geochemistry', perCat: 8,
    prefixes: ['Geochemistry Sample —', 'Core Photo Library —', 'Biostratigraphy —'],
  },
  {
    id: 'DOCUMENT', label: 'Document', perCat: 5,
    prefixes: ['Final Well Report —', 'AFE Document —', 'Annual Audit —'],
  },
];

function descriptionFor(cat: DatasetCategoryEnum, region: string, provider: string): string {
  switch (cat) {
    case 'SEISMIC':    return `Data seismik di area ${region}, hasil akuisisi terkini oleh ${provider}. Kualitas tinggi, fully processed.`;
    case 'WELL_LOG':   return `Komposit wireline log dari sumur di ${region}. Terverifikasi oleh ${provider}.`;
    case 'PRODUCTION': return `Laporan produksi bulanan untuk lapangan di ${region}, dikelola oleh ${provider}.`;
    case 'CONCESSION': return `Batas Wilayah Kerja di ${region}. Sumber: kontrak PSC terkini, ${provider}.`;
    case 'GEOLOGY':    return `Sampel geologi/geokimia dari ${region}. Akuisisi & analisis ${provider}.`;
    case 'DOCUMENT':   return `Dokumen referensi ${provider} untuk operasional di ${region}.`;
  }
}

function buildDatasets(): DatasetSeedEntry[] {
  const results: DatasetSeedEntry[] = [];
  let i = 0;

  for (const catDef of CATEGORY_DEFS) {
    for (let j = 0; j < catDef.perCat; j += 1) {
      const providerId = PROVIDER_IDS[i % PROVIDER_IDS.length] as string;
      // Index mathematically in bounds via modulo — safe to assert non-null
      const region = REGIONS[(i * 3) % REGIONS.length]!;
      const prefix = catDef.prefixes[j % catDef.prefixes.length] ?? catDef.label;
      const kind = KIND_BY_CATEGORY[catDef.id];
      const format = FORMAT_BY_KIND[kind]![(i + j) % FORMAT_BY_KIND[kind]!.length]!;
      const year = 2018 + ((i + j) % 8);
      const status = STATUS_CYCLE[i % STATUS_CYCLE.length]!;
      const verified = (i + j) % 3 !== 0;
      const id = `${catDef.id.toLowerCase().replace('_', '-')}-${providerId}-${j + 1}`;
      const span = kind === 'VOLUME' ? 1.8 : kind === 'DOC' ? 0.4 : 1.1;
      const bboxArr = bbox(region.lng, region.lat, span);
      const completeness = 75 + ((( i + j) * 7 + 3) % 26);
      const accuracyValues = ['high', 'high', 'medium', 'high', 'low', 'high', 'medium'] as const;
      // Index mathematically in bounds via modulo — safe to assert non-null
      const positionalAccuracy = accuracyValues[(i + j) % accuracyValues.length]!;
      const daysAgo = 1 + ((i + j) * 3) % 180;
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
      const fileFormatByKind: Record<string, string[]> = {
        LAYER:  ['SHP', 'GeoJSON', 'GeoPackage'],
        VOLUME: ['SEG-Y', 'ZGY'],
        DOC:    ['PDF', 'XLSX'],
      };
      const titleSuffix = catDef.id === 'DOCUMENT' ? ` (${year})` : '';

      results.push({
        id,
        title: `${prefix} ${region.name}${titleSuffix}`,
        description: descriptionFor(catDef.id, region.name, providerId),
        category: catDef.id,
        format,
        sensitivityLevel: sensitivityFromStatus(status),
        verified,
        year,
        centerLat: region.lat,
        centerLon: region.lng,
        bboxJson: bboxArr,
        dataQuality: { completeness, positionalAccuracy, currency },
        metadata: {
          crs: 'EPSG:4326',
          record_count: kind === 'VOLUME' ? 1_200_000 + i * 5_000 : 240 + i * 17,
          file_format: fileFormatByKind[kind]!,
          license: LICENSES[status],
        },
        downloadCount: 30 + ((i * 13) % 400),
        viewCount: 200 + ((i * 91) % 9000),
      });
      i += 1;
    }
  }

  return results;
}

// =============================================================================
// Sample Wells — 25 distributed across WK areas
// =============================================================================

interface WellSeedEntry {
  name: string;
  uwi: string;
  operator: string;
  wkSlug: string;
  type: 'EXPLORATION' | 'DEVELOPMENT' | 'PRODUCTION' | 'INJECTION' | 'APPRAISAL';
  status: 'ACTIVE' | 'ABANDONED' | 'SUSPENDED' | 'PLANNED';
  latitude: number;
  longitude: number;
  totalDepthM: number;
  formation: string;
}

const WELL_SEED_DATA: readonly WellSeedEntry[] = [
  // ONWJ wells (offshore NW Java)
  { name: 'ONWJ-A01',   uwi: 'GID-WJ-001', operator: 'PHE ONWJ',                  wkSlug: 'wk-onwj',       type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -5.85, longitude: 107.80, totalDepthM: 2800, formation: 'Cibulakan Formation' },
  { name: 'ONWJ-A02',   uwi: 'GID-WJ-002', operator: 'PHE ONWJ',                  wkSlug: 'wk-onwj',       type: 'INJECTION',   status: 'ACTIVE',    latitude: -5.90, longitude: 107.95, totalDepthM: 2650, formation: 'Cibulakan Formation' },
  { name: 'ONWJ-EXP01', uwi: 'GID-WJ-003', operator: 'PHE ONWJ',                  wkSlug: 'wk-onwj',       type: 'EXPLORATION', status: 'SUSPENDED', latitude: -6.10, longitude: 108.40, totalDepthM: 3200, formation: 'Batu Raja Formation' },
  // Mahakam wells
  { name: 'MAHAKAM-B01',uwi: 'GID-KT-001', operator: 'Pertamina Hulu Mahakam',    wkSlug: 'wk-mahakam',    type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -1.20, longitude: 117.20, totalDepthM: 3100, formation: 'Mahakam Group' },
  { name: 'MAHAKAM-B02',uwi: 'GID-KT-002', operator: 'Pertamina Hulu Mahakam',    wkSlug: 'wk-mahakam',    type: 'DEVELOPMENT', status: 'ACTIVE',    latitude: -1.35, longitude: 117.45, totalDepthM: 2950, formation: 'Mahakam Group' },
  { name: 'MAHAKAM-EX1',uwi: 'GID-KT-003', operator: 'Pertamina Hulu Mahakam',    wkSlug: 'wk-mahakam',    type: 'EXPLORATION', status: 'PLANNED',   latitude: -0.85, longitude: 117.80, totalDepthM: 3500, formation: 'Balikpapan Formation' },
  // Rokan wells (central Sumatra)
  { name: 'DURI-001',   uwi: 'GID-RI-001', operator: 'PHR (Pertamina Hulu Rokan)', wkSlug: 'wk-rokan',      type: 'PRODUCTION',  status: 'ACTIVE',    latitude: 1.20,  longitude: 100.55, totalDepthM: 1800, formation: 'Bekasap Formation' },
  { name: 'DURI-002',   uwi: 'GID-RI-002', operator: 'PHR (Pertamina Hulu Rokan)', wkSlug: 'wk-rokan',      type: 'INJECTION',   status: 'ACTIVE',    latitude: 1.15,  longitude: 100.60, totalDepthM: 1750, formation: 'Bekasap Formation' },
  { name: 'MINAS-001',  uwi: 'GID-RI-003', operator: 'PHR (Pertamina Hulu Rokan)', wkSlug: 'wk-rokan',      type: 'PRODUCTION',  status: 'ACTIVE',    latitude: 0.90,  longitude: 101.15, totalDepthM: 2100, formation: 'Sihapas Formation' },
  { name: 'ROKAN-EXP1', uwi: 'GID-RI-004', operator: 'PHR (Pertamina Hulu Rokan)', wkSlug: 'wk-rokan',      type: 'EXPLORATION', status: 'PLANNED',   latitude: 1.50,  longitude: 99.95,  totalDepthM: 2800, formation: 'Pematang Formation' },
  // Cepu wells
  { name: 'BANYU-001',  uwi: 'GID-JT-001', operator: 'ExxonMobil Cepu Ltd',        wkSlug: 'wk-cepu',       type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -7.10, longitude: 111.45, totalDepthM: 2200, formation: 'Tuban Formation' },
  { name: 'BANYU-002',  uwi: 'GID-JT-002', operator: 'ExxonMobil Cepu Ltd',        wkSlug: 'wk-cepu',       type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -7.15, longitude: 111.50, totalDepthM: 2150, formation: 'Tuban Formation' },
  { name: 'CEPU-EXP01', uwi: 'GID-JT-003', operator: 'Pertamina EP Cepu',          wkSlug: 'wk-cepu',       type: 'EXPLORATION', status: 'ABANDONED', latitude: -6.90, longitude: 111.20, totalDepthM: 2900, formation: 'Ngrayong Formation' },
  // Tarakan wells
  { name: 'TAR-001',    uwi: 'GID-KU-001', operator: 'Pertamina EP',               wkSlug: 'wk-tarakan',    type: 'PRODUCTION',  status: 'ACTIVE',    latitude: 3.20,  longitude: 117.25, totalDepthM: 2400, formation: 'Tarakan Formation' },
  { name: 'TAR-002',    uwi: 'GID-KU-002', operator: 'Pertamina EP',               wkSlug: 'wk-tarakan',    type: 'APPRAISAL',   status: 'ACTIVE',    latitude: 3.00,  longitude: 117.60, totalDepthM: 2600, formation: 'Sembakung Formation' },
  { name: 'TAR-EXP01',  uwi: 'GID-KU-003', operator: 'Pertamina EP',               wkSlug: 'wk-tarakan',    type: 'EXPLORATION', status: 'PLANNED',   latitude: 3.50,  longitude: 116.90, totalDepthM: 3100, formation: 'Tarakan Formation' },
  // Natuna wells
  { name: 'NAT-001',    uwi: 'GID-NTN-001', operator: 'Medco E&P Natuna',          wkSlug: 'wk-natuna',     type: 'PRODUCTION',  status: 'ACTIVE',    latitude: 2.80,  longitude: 108.30, totalDepthM: 3400, formation: 'Gabus Formation' },
  { name: 'NAT-EXP01',  uwi: 'GID-NTN-002', operator: 'Medco E&P Natuna',          wkSlug: 'wk-natuna',     type: 'EXPLORATION', status: 'PLANNED',   latitude: 3.20,  longitude: 107.70, totalDepthM: 4200, formation: 'Arang Formation' },
  // Sanga-Sanga wells
  { name: 'SS-001',     uwi: 'GID-KT-010', operator: 'Vico Indonesia',             wkSlug: 'wk-sanga-sanga',type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -0.50, longitude: 117.40, totalDepthM: 2200, formation: 'Pamaluan Formation' },
  { name: 'SS-002',     uwi: 'GID-KT-011', operator: 'Vico Indonesia',             wkSlug: 'wk-sanga-sanga',type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -0.65, longitude: 117.60, totalDepthM: 2100, formation: 'Pamaluan Formation' },
  { name: 'SS-EXP01',   uwi: 'GID-KT-012', operator: 'Vico Indonesia',             wkSlug: 'wk-sanga-sanga',type: 'EXPLORATION', status: 'SUSPENDED', latitude: -0.30, longitude: 117.90, totalDepthM: 2700, formation: 'Pulaubalang Formation' },
  // Senoro wells
  { name: 'SNR-001',    uwi: 'GID-ST-001', operator: 'Pertamina EP / Medco E&P',   wkSlug: 'wk-senoro',     type: 'PRODUCTION',  status: 'ACTIVE',    latitude: -1.90, longitude: 122.60, totalDepthM: 3200, formation: 'Minahaki Formation' },
  { name: 'SNR-002',    uwi: 'GID-ST-002', operator: 'Pertamina EP / Medco E&P',   wkSlug: 'wk-senoro',     type: 'DEVELOPMENT', status: 'ACTIVE',    latitude: -2.00, longitude: 122.75, totalDepthM: 3100, formation: 'Minahaki Formation' },
  { name: 'SNR-EXP01',  uwi: 'GID-ST-003', operator: 'Medco E&P',                  wkSlug: 'wk-senoro',     type: 'EXPLORATION', status: 'PLANNED',   latitude: -1.65, longitude: 123.05, totalDepthM: 3800, formation: 'Tomori Formation' },
  { name: 'SNR-APR01',  uwi: 'GID-ST-004', operator: 'Medco E&P',                  wkSlug: 'wk-senoro',     type: 'APPRAISAL',   status: 'ACTIVE',    latitude: -2.10, longitude: 122.40, totalDepthM: 3050, formation: 'Kintom Formation' },
] as const;

// =============================================================================
// Sample Facilities — 12 points
// =============================================================================

interface FacilitySeedEntry {
  name: string;
  type: 'PLATFORM' | 'FPSO' | 'PROCESSING_PLANT' | 'COMPRESSOR_STATION' | 'METERING_STATION';
  operator: string;
  wkSlug: string;
  latitude: number;
  longitude: number;
  waterDepthM?: number;
  installYear?: number;
}

const FACILITY_SEED_DATA: readonly FacilitySeedEntry[] = [
  { name: 'Platform ONWJ-Alpha',    type: 'PLATFORM',           operator: 'PHE ONWJ',                  wkSlug: 'wk-onwj',       latitude: -5.80, longitude: 107.90, waterDepthM: 45,  installYear: 1998 },
  { name: 'Platform ONWJ-Bravo',    type: 'PLATFORM',           operator: 'PHE ONWJ',                  wkSlug: 'wk-onwj',       latitude: -6.00, longitude: 108.15, waterDepthM: 52,  installYear: 2003 },
  { name: 'Mahakam Processing Plant',type: 'PROCESSING_PLANT',  operator: 'Pertamina Hulu Mahakam',    wkSlug: 'wk-mahakam',    latitude: -1.10, longitude: 117.30, installYear: 2001 },
  { name: 'Mahakam Compressor Sta.', type: 'COMPRESSOR_STATION',operator: 'Pertamina Hulu Mahakam',    wkSlug: 'wk-mahakam',    latitude: -1.25, longitude: 117.50, installYear: 2005 },
  { name: 'Minas CPP',               type: 'PROCESSING_PLANT',  operator: 'PHR (Pertamina Hulu Rokan)', wkSlug: 'wk-rokan',     latitude: 0.95,  longitude: 101.10, installYear: 1971 },
  { name: 'Cepu CPP Pertamina',      type: 'PROCESSING_PLANT',  operator: 'Pertamina EP Cepu',          wkSlug: 'wk-cepu',      latitude: -7.05, longitude: 111.40, installYear: 2009 },
  { name: 'Platform Tarakan-1',      type: 'PLATFORM',           operator: 'Pertamina EP',               wkSlug: 'wk-tarakan',   latitude: 3.10,  longitude: 117.30, waterDepthM: 35,  installYear: 2000 },
  { name: 'Natuna A Platform',       type: 'PLATFORM',           operator: 'Medco E&P Natuna',           wkSlug: 'wk-natuna',    latitude: 2.90,  longitude: 108.20, waterDepthM: 120, installYear: 2001 },
  { name: 'FSO Abherka',             type: 'FPSO',               operator: 'Medco E&P Natuna',           wkSlug: 'wk-natuna',    latitude: 2.95,  longitude: 108.25, waterDepthM: 115, installYear: 2002 },
  { name: 'Sanga-Sanga CPP',         type: 'PROCESSING_PLANT',  operator: 'Vico Indonesia',             wkSlug: 'wk-sanga-sanga', latitude: -0.55, longitude: 117.45, installYear: 1975 },
  { name: 'Senoro LPG Plant',        type: 'PROCESSING_PLANT',  operator: 'Pertamina EP / Medco E&P',   wkSlug: 'wk-senoro',    latitude: -1.95, longitude: 122.65, installYear: 2014 },
  { name: 'Senoro Metering Sta.',    type: 'METERING_STATION',  operator: 'Pertamina EP / Medco E&P',   wkSlug: 'wk-senoro',    latitude: -1.98, longitude: 122.70, installYear: 2014 },
] as const;

// =============================================================================
// Sample Pipelines — 4 routes
// =============================================================================

interface PipelineSeedEntry {
  name: string;
  operator: string;
  wkSlug: string;
  type: 'OIL' | 'GAS' | 'MULTIPHASE';
  status: 'ACTIVE' | 'INACTIVE';
  diameterIn: number;
  /** GeoJSON LineString coordinates [[lon, lat], ...] */
  coordinates: number[][];
}

const PIPELINE_SEED_DATA: readonly PipelineSeedEntry[] = [
  {
    name: 'ONWJ Offshore Trunk Line',
    operator: 'PHE ONWJ',
    wkSlug: 'wk-onwj',
    type: 'MULTIPHASE',
    status: 'ACTIVE',
    diameterIn: 24,
    coordinates: [
      [107.90, -5.80], [107.95, -5.85], [108.00, -5.90],
      [108.05, -5.95], [108.10, -6.00], [108.15, -6.05],
    ],
  },
  {
    name: 'Mahakam Gas Export Line',
    operator: 'Pertamina Hulu Mahakam',
    wkSlug: 'wk-mahakam',
    type: 'GAS',
    status: 'ACTIVE',
    diameterIn: 36,
    coordinates: [
      [117.20, -1.10], [117.25, -1.15], [117.30, -1.20],
      [117.35, -1.25], [117.40, -1.30], [117.45, -1.35],
    ],
  },
  {
    name: 'Rokan Oil Trunk Line',
    operator: 'PHR (Pertamina Hulu Rokan)',
    wkSlug: 'wk-rokan',
    type: 'OIL',
    status: 'ACTIVE',
    diameterIn: 30,
    coordinates: [
      [100.55, 1.20], [100.70, 1.10], [100.85, 0.90],
      [101.00, 0.75], [101.10, 0.60], [101.20, 0.50],
    ],
  },
  {
    name: 'Senoro-Toili Gas Pipeline',
    operator: 'Pertamina EP / Medco E&P',
    wkSlug: 'wk-senoro',
    type: 'GAS',
    status: 'ACTIVE',
    diameterIn: 20,
    coordinates: [
      [122.65, -1.95], [122.68, -1.97], [122.70, -2.00],
      [122.73, -2.03], [122.75, -2.05], [122.78, -2.07],
    ],
  },
] as const;

// =============================================================================
// Seismic Coverage polygons — one per WK (approximate survey areas)
// =============================================================================

interface SeismicSeedEntry {
  name: string;
  surveyYear: number;
  surveyType: '2D' | '3D';
  operator: string;
  wkSlug: string;
  bandwidth: string;
  acquisitionMethod: string;
  processingVendor: string;
  /** GeoJSON Polygon coordinates [[[lon, lat], ...]] */
  coordinates: number[][][];
}

const SEISMIC_SEED_DATA: readonly SeismicSeedEntry[] = [
  {
    name: 'ONWJ 3D Reprocessing 2024',
    surveyYear: 2024, surveyType: '3D', operator: 'PHE ONWJ', wkSlug: 'wk-onwj',
    bandwidth: '10-80 Hz', acquisitionMethod: 'Towed streamer', processingVendor: 'CGG',
    coordinates: [[[107.40,-5.60],[108.70,-5.60],[108.70,-6.40],[107.40,-6.40],[107.40,-5.60]]],
  },
  {
    name: 'Mahakam 3D Acquisition 2022',
    surveyYear: 2022, surveyType: '3D', operator: 'Pertamina Hulu Mahakam', wkSlug: 'wk-mahakam',
    bandwidth: '8-90 Hz', acquisitionMethod: 'Towed streamer', processingVendor: 'Schlumberger',
    coordinates: [[[116.50,-1.00],[118.10,-1.00],[118.10,-1.90],[116.50,-1.90],[116.50,-1.00]]],
  },
  {
    name: 'Rokan 3D Phase IV 2023',
    surveyYear: 2023, surveyType: '3D', operator: 'PHR (Pertamina Hulu Rokan)', wkSlug: 'wk-rokan',
    bandwidth: '10-100 Hz', acquisitionMethod: 'Land vibroseis', processingVendor: 'Halliburton',
    coordinates: [[[99.80,0.20],[101.60,0.20],[101.60,1.85],[99.80,1.85],[99.80,0.20]]],
  },
  {
    name: 'Cepu 3D Survey 2021',
    surveyYear: 2021, surveyType: '3D', operator: 'ExxonMobil Cepu Ltd', wkSlug: 'wk-cepu',
    bandwidth: '12-80 Hz', acquisitionMethod: 'Land vibroseis', processingVendor: 'CGG',
    coordinates: [[[110.70,-7.55],[112.10,-7.55],[112.10,-6.80],[110.70,-6.80],[110.70,-7.55]]],
  },
  {
    name: 'Tarakan 2D Infill 2020',
    surveyYear: 2020, surveyType: '2D', operator: 'Pertamina EP', wkSlug: 'wk-tarakan',
    bandwidth: '10-60 Hz', acquisitionMethod: 'Towed streamer', processingVendor: 'TGS',
    coordinates: [[[116.50,2.60],[117.90,2.60],[117.90,3.70],[116.50,3.70],[116.50,2.60]]],
  },
  {
    name: 'Natuna 3D Survey 2019',
    surveyYear: 2019, surveyType: '3D', operator: 'Medco E&P Natuna', wkSlug: 'wk-natuna',
    bandwidth: '8-70 Hz', acquisitionMethod: 'OBN', processingVendor: 'PGS',
    coordinates: [[[107.10,2.15],[108.90,2.15],[108.90,3.55],[107.10,3.55],[107.10,2.15]]],
  },
  {
    name: 'Sanga-Sanga 3D 2018',
    surveyYear: 2018, surveyType: '3D', operator: 'Vico Indonesia', wkSlug: 'wk-sanga-sanga',
    bandwidth: '10-80 Hz', acquisitionMethod: 'Towed streamer', processingVendor: 'Schlumberger',
    coordinates: [[[116.75,-1.10],[118.00,-1.10],[118.00,-0.10],[116.75,-0.10],[116.75,-1.10]]],
  },
  {
    name: 'Senoro 2D Legacy Reprocess 2022',
    surveyYear: 2022, surveyType: '2D', operator: 'Medco E&P', wkSlug: 'wk-senoro',
    bandwidth: '8-60 Hz', acquisitionMethod: 'Land dynamite', processingVendor: 'ION',
    coordinates: [[[121.95,-2.55],[123.30,-2.55],[123.30,-1.55],[121.95,-1.55],[121.95,-2.55]]],
  },
] as const;

// =============================================================================
// Seed functions
// =============================================================================

async function seedWorkAreas(): Promise<Map<string, string>> {
  console.log('Seeding work_areas...');
  const slugToId = new Map<string, string>();

  for (const wk of WK_SEED_DATA) {
    const geojson = JSON.stringify({
      type: 'Polygon',
      coordinates: wk.coordinates,
    });

    // Upsert by slug: insert or ignore on conflict
    const result = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "work_areas" (slug, name, operator, contract_start, contract_end, status, color, created_at, updated_at)
      VALUES (
        ${wk.slug},
        ${wk.name},
        ${wk.operator},
        ${new Date(wk.contractStart)},
        ${new Date(wk.contractEnd)},
        'ACTIVE'::"WorkAreaStatus",
        ${wk.color},
        now(),
        now()
      )
      ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            operator = EXCLUDED.operator,
            color = EXCLUDED.color,
            updated_at = now()
      RETURNING id
    `;

    const id = result[0]?.id;
    if (!id) throw new Error(`Failed to upsert work area: ${wk.slug}`);

    // Set geometry separately so SRID CHECK trigger fires
    await prisma.$executeRaw`
      UPDATE "work_areas"
      SET
        geometry       = ST_GeomFromGeoJSON(${geojson}),
        bbox_json      = ${JSON.stringify(computeBboxFromPolygon(wk.coordinates[0]!))}::jsonb,
        center_lat     = ST_Y(ST_Centroid(ST_GeomFromGeoJSON(${geojson}))),
        center_lon     = ST_X(ST_Centroid(ST_GeomFromGeoJSON(${geojson}))),
        total_area_km2 = ST_Area(ST_GeomFromGeoJSON(${geojson})::geography) / 1e6
      WHERE id = ${id}::uuid
    `;

    slugToId.set(wk.slug, id);
    console.log(`  ✓ ${wk.name} [${id}]`);
  }

  console.log(`Seeded ${slugToId.size} work areas.`);
  return slugToId;
}

async function seedDatasets(wkSlugToId: Map<string, string>): Promise<void> {
  console.log('Seeding datasets...');
  const datasets = buildDatasets();

  // Map concession dataset IDs to WK slug for FK association
  // concession datasets in MOCK_CATALOG use id pattern: "concession-{provider}-{j+1}"
  // WK_BOUNDARIES links via datasetId which is "concession-{provider}-{n}"
  const CONCESSION_WK_MAP: Record<string, string> = {
    'concession-phe-onwj-1':      'wk-onwj',
    'concession-pertamina-hulu-2':'wk-mahakam',
    'concession-medco-3':         'wk-rokan',      // datasets.ts uses PROVIDERS cycling
    'concession-chevron-4':       'wk-cepu',
    'concession-inpex-5':         'wk-tarakan',
    'concession-eni-6':           'wk-natuna',
    'concession-skk-migas-7':     'wk-sanga-sanga',
    'concession-harbour-8':       'wk-senoro',
  };

  for (const ds of datasets) {
    const [minLon, minLat, maxLon, maxLat] = ds.bboxJson;
    const bboxGeoJSON = JSON.stringify({
      type: 'Polygon',
      coordinates: [[
        [minLon, minLat], [maxLon, minLat], [maxLon, maxLat],
        [minLon, maxLat], [minLon, minLat],
      ]],
    });

    const workAreaId: string | null =
      CONCESSION_WK_MAP[ds.id] != null
        ? (wkSlugToId.get(CONCESSION_WK_MAP[ds.id]!) ?? null)
        : null;

    await prisma.$executeRaw`
      INSERT INTO "datasets" (
        id, title, description, category, format, sensitivity_level, status,
        verified, bbox_json, center_lat, center_lon, data_quality, metadata,
        year, download_count, view_count, work_area_id, created_at, updated_at, published_at
      )
      VALUES (
        gen_random_uuid(),
        ${ds.title},
        ${ds.description},
        ${ds.category}::"DatasetCategory",
        ${ds.format},
        ${ds.sensitivityLevel}::"SensitivityLevel",
        'APPROVED'::"DatasetStatus",
        ${ds.verified},
        ${JSON.stringify(ds.bboxJson)}::jsonb,
        ${ds.centerLat},
        ${ds.centerLon},
        ${JSON.stringify(ds.dataQuality)}::jsonb,
        ${JSON.stringify(ds.metadata)}::jsonb,
        ${ds.year},
        ${ds.downloadCount},
        ${ds.viewCount},
        ${workAreaId}::uuid,
        now(),
        now(),
        now()
      )
      ON CONFLICT DO NOTHING
    `;

    // Update bbox geometry column (runs through SRID CHECK trigger)
    await prisma.$executeRaw`
      UPDATE "datasets"
      SET bbox = ST_GeomFromGeoJSON(${bboxGeoJSON})
      WHERE title = ${ds.title}
        AND bbox IS NULL
    `;
  }

  const count = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "datasets"
  `;
  console.log(`Seeded datasets. Total in DB: ${count[0]?.count ?? '?'}`);
}

async function seedWells(wkSlugToId: Map<string, string>): Promise<void> {
  console.log('Seeding wells...');

  for (const well of WELL_SEED_DATA) {
    const workAreaId = wkSlugToId.get(well.wkSlug) ?? null;
    const pointGeoJSON = JSON.stringify({
      type: 'Point',
      coordinates: [well.longitude, well.latitude],
    });

    await prisma.$executeRaw`
      INSERT INTO "wells" (
        uwi, name, operator, work_area_id, type, status,
        latitude, longitude, total_depth_m, formation, created_at, updated_at
      )
      VALUES (
        ${well.uwi},
        ${well.name},
        ${well.operator},
        ${workAreaId}::uuid,
        ${well.type}::"WellType",
        ${well.status}::"WellStatus",
        ${well.latitude},
        ${well.longitude},
        ${well.totalDepthM},
        ${well.formation},
        now(),
        now()
      )
      ON CONFLICT (uwi) DO UPDATE
        SET status = EXCLUDED.status, updated_at = now()
    `;

    await prisma.$executeRaw`
      UPDATE "wells"
      SET point = ST_GeomFromGeoJSON(${pointGeoJSON})
      WHERE uwi = ${well.uwi}
    `;
  }

  const count = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "wells"
  `;
  console.log(`Seeded wells. Total in DB: ${count[0]?.count ?? '?'}`);
}

async function seedFacilities(wkSlugToId: Map<string, string>): Promise<void> {
  console.log('Seeding facilities...');

  for (const fac of FACILITY_SEED_DATA) {
    const workAreaId = wkSlugToId.get(fac.wkSlug) ?? null;
    const pointGeoJSON = JSON.stringify({
      type: 'Point',
      coordinates: [fac.longitude, fac.latitude],
    });

    await prisma.$executeRaw`
      INSERT INTO "facilities" (
        name, type, operator, work_area_id, latitude, longitude,
        status, water_depth_m, install_year, created_at, updated_at
      )
      VALUES (
        ${fac.name},
        ${fac.type}::"FacilityType",
        ${fac.operator},
        ${workAreaId}::uuid,
        ${fac.latitude},
        ${fac.longitude},
        'ACTIVE'::"FacilityStatus",
        ${fac.waterDepthM ?? null},
        ${fac.installYear ?? null},
        now(),
        now()
      )
      ON CONFLICT DO NOTHING
    `;

    await prisma.$executeRaw`
      UPDATE "facilities"
      SET point = ST_GeomFromGeoJSON(${pointGeoJSON})
      WHERE name = ${fac.name}
        AND point IS NULL
    `;
  }

  const count = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "facilities"
  `;
  console.log(`Seeded facilities. Total in DB: ${count[0]?.count ?? '?'}`);
}

async function seedPipelines(wkSlugToId: Map<string, string>): Promise<void> {
  console.log('Seeding pipelines...');

  for (const pipe of PIPELINE_SEED_DATA) {
    const workAreaId = wkSlugToId.get(pipe.wkSlug) ?? null;
    const lineGeoJSON = JSON.stringify({
      type: 'LineString',
      coordinates: pipe.coordinates,
    });

    await prisma.$executeRaw`
      INSERT INTO "pipelines" (
        name, operator, work_area_id, type, status, diameter_in, created_at, updated_at
      )
      VALUES (
        ${pipe.name},
        ${pipe.operator},
        ${workAreaId}::uuid,
        ${pipe.type}::"PipelineType",
        ${pipe.status}::"PipelineStatus",
        ${pipe.diameterIn},
        now(),
        now()
      )
      ON CONFLICT DO NOTHING
    `;

    await prisma.$executeRaw`
      UPDATE "pipelines"
      SET
        line      = ST_GeomFromGeoJSON(${lineGeoJSON}),
        length_km = ST_Length(ST_GeomFromGeoJSON(${lineGeoJSON})::geography) / 1000
      WHERE name = ${pipe.name}
        AND line IS NULL
    `;
  }

  const count = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "pipelines"
  `;
  console.log(`Seeded pipelines. Total in DB: ${count[0]?.count ?? '?'}`);
}

async function seedSeismicCoverages(wkSlugToId: Map<string, string>): Promise<void> {
  console.log('Seeding seismic_coverages...');

  for (const survey of SEISMIC_SEED_DATA) {
    const workAreaId = wkSlugToId.get(survey.wkSlug) ?? null;
    const areaGeoJSON = JSON.stringify({
      type: 'Polygon',
      coordinates: survey.coordinates,
    });
    const ring = survey.coordinates[0]!;
    const bboxArr = computeBboxFromPolygon(ring);

    await prisma.$executeRaw`
      INSERT INTO "seismic_coverages" (
        name, survey_year, survey_type, operator, work_area_id,
        bandwidth, acquisition_method, processing_vendor,
        bbox_json, created_at, updated_at
      )
      VALUES (
        ${survey.name},
        ${survey.surveyYear},
        ${survey.surveyType},
        ${survey.operator},
        ${workAreaId}::uuid,
        ${survey.bandwidth},
        ${survey.acquisitionMethod},
        ${survey.processingVendor},
        ${JSON.stringify(bboxArr)}::jsonb,
        now(),
        now()
      )
      ON CONFLICT DO NOTHING
    `;

    await prisma.$executeRaw`
      UPDATE "seismic_coverages"
      SET
        area     = ST_GeomFromGeoJSON(${areaGeoJSON}),
        area_km2 = ST_Area(ST_GeomFromGeoJSON(${areaGeoJSON})::geography) / 1e6
      WHERE name = ${survey.name}
        AND area IS NULL
    `;
  }

  const count = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "seismic_coverages"
  `;
  console.log(`Seeded seismic coverages. Total in DB: ${count[0]?.count ?? '?'}`);
}

// =============================================================================
// Utility
// =============================================================================

function computeBboxFromPolygon(ring: number[][]): [number, number, number, number] {
  const lons = ring.map((p) => p[0]!);
  const lats = ring.map((p) => p[1]!);
  return [
    Math.min(...lons),
    Math.min(...lats),
    Math.max(...lons),
    Math.max(...lats),
  ];
}

// =============================================================================
// Verification queries
// =============================================================================

async function verifySeeding(): Promise<void> {
  console.log('\n--- Verification ---');

  const waCount = await prisma.$queryRaw<Array<{ count: string; centroid_sample: string }>>`
    SELECT
      COUNT(*)::text AS count,
      MAX(ST_AsText(ST_Centroid(geometry))) AS centroid_sample
    FROM "work_areas"
    WHERE geometry IS NOT NULL
  `;
  console.log(`work_areas with geometry: ${waCount[0]?.count} | sample centroid: ${waCount[0]?.centroid_sample}`);

  const dsCount = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "datasets" WHERE bbox IS NOT NULL
  `;
  console.log(`datasets with bbox geometry: ${dsCount[0]?.count}`);

  const wellCount = await prisma.$queryRaw<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM "wells" WHERE point IS NOT NULL
  `;
  console.log(`wells with point geometry: ${wellCount[0]?.count}`);

  // Verify GIST index is used for bbox spatial query (EXPLAIN summary)
  const explainResult = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
    EXPLAIN (FORMAT TEXT, ANALYZE FALSE)
    SELECT id, title FROM "datasets"
    WHERE ST_Intersects(bbox, ST_MakeEnvelope(110, -8, 115, -6, 4326))
  `;
  const plan = explainResult.map((r) => r['QUERY PLAN']).join('\n');
  const gistUsed = plan.includes('datasets_bbox_gist') || plan.includes('Index Scan');
  console.log(`GIST index used for bbox query: ${gistUsed ? 'YES' : 'NO (check index)'}`);
  if (!gistUsed) {
    console.log('EXPLAIN output:\n' + plan);
  }

  // Verify SRID
  const sridCheck = await prisma.$queryRaw<Array<{ srid: number; table_name: string }>>`
    SELECT 'work_areas' AS table_name, ST_SRID(geometry) AS srid
    FROM "work_areas" WHERE geometry IS NOT NULL LIMIT 1
    UNION ALL
    SELECT 'wells', ST_SRID(point)
    FROM "wells" WHERE point IS NOT NULL LIMIT 1
    UNION ALL
    SELECT 'datasets', ST_SRID(bbox)
    FROM "datasets" WHERE bbox IS NOT NULL LIMIT 1
  `;
  for (const row of sridCheck) {
    const ok = row.srid === 4326;
    console.log(`SRID check ${row.table_name}: ${row.srid} ${ok ? '(PASS)' : '(FAIL - expected 4326)'}`);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  console.log('=== Ghanem.one GIS Seed — Sprint 9.1 ===\n');

  try {
    // Seed in dependency order (work_areas first, then children)
    const wkSlugToId = await seedWorkAreas();
    await seedDatasets(wkSlugToId);
    await seedWells(wkSlugToId);
    await seedFacilities(wkSlugToId);
    await seedPipelines(wkSlugToId);
    await seedSeismicCoverages(wkSlugToId);

    await verifySeeding();

    console.log('\n=== Seed completed successfully ===');
  } catch (err) {
    console.error('Seed failed:', err);
    throw err;
  }
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
