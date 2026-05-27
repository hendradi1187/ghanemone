/**
 * WK_BOUNDARIES — handcrafted GeoJSON FeatureCollection untuk Wilayah Kerja (WK)
 * migas Indonesia. Koordinat approximated (bukan survei resmi) — tujuan visual
 * organik di map, bukan akurasi surveyor.
 *
 * Task #21: Polygon organik (8-15 titik) untuk mengganti bbox rectangle.
 * Referensi geografis: KKKS Indonesia Hulu per publikasi SKK Migas 2024.
 *
 * Setiap feature punya:
 *   - id: slug WK
 *   - properties.datasetId: link ke MOCK_CATALOG (concession entries)
 *   - properties.color: warna override per WK (hex — data, bukan Tailwind class)
 */
import type {
  Feature,
  FeatureCollection,
  Polygon,
} from 'geojson';

/** Properties yang dilekatkan pada setiap WK feature. */
export interface WkFeatureProperties {
  name: string;
  operator: string;
  /** Link ke DatasetRecord.id di MOCK_CATALOG. */
  datasetId: string;
  /** Warna hex per WK — dipakai sebagai override fillColor di peta. */
  color: string;
}

export const WK_BOUNDARIES: FeatureCollection<Polygon, WkFeatureProperties> = {
  type: 'FeatureCollection',
  features: [
    /* ── ONWJ — Offshore Northwest Java (area Karawang–Indramayu) ────── */
    {
      type: 'Feature',
      id: 'wk-onwj',
      properties: {
        name: 'WK ONWJ',
        operator: 'PHE ONWJ',
        datasetId: 'concession-phe-onwj-1',
        color: '#7a5cb8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [107.10, -5.55],
          [107.70, -5.35],
          [108.30, -5.20],
          [108.90, -5.40],
          [109.10, -5.85],
          [108.80, -6.35],
          [108.20, -6.55],
          [107.55, -6.45],
          [107.05, -6.10],
          [106.90, -5.80],
          [107.10, -5.55],
        ]],
      },
    },

    /* ── WK Mahakam — Kalimantan Timur (Balikpapan-Bontang corridor) ── */
    {
      type: 'Feature',
      id: 'wk-mahakam',
      properties: {
        name: 'WK Mahakam',
        operator: 'Pertamina Hulu Mahakam',
        datasetId: 'concession-pertamina-hulu-2',
        color: '#1f8a4a',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.40, -0.90],
          [117.00, -0.70],
          [117.60, -0.55],
          [118.10, -0.75],
          [118.30, -1.20],
          [118.10, -1.75],
          [117.50, -2.10],
          [116.85, -2.05],
          [116.35, -1.70],
          [116.15, -1.25],
          [116.40, -0.90],
        ]],
      },
    },

    /* ── WK Rokan — Riau Tengah (Duri-Minas field) ────────────────── */
    {
      type: 'Feature',
      id: 'wk-rokan',
      properties: {
        name: 'WK Rokan',
        operator: 'PHR (Pertamina Hulu Rokan)',
        datasetId: 'concession-chevron-3',
        color: '#c2840d',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [100.20, 1.80],
          [100.90, 1.95],
          [101.45, 1.75],
          [101.70, 1.30],
          [101.60, 0.75],
          [101.25, 0.30],
          [100.65, 0.10],
          [100.05, 0.25],
          [99.70,  0.70],
          [99.65,  1.25],
          [99.90,  1.60],
          [100.20, 1.80],
        ]],
      },
    },

    /* ── WK Cepu — Jawa Tengah/Timur (Bojonegoro basin) ──────────── */
    {
      type: 'Feature',
      id: 'wk-cepu',
      properties: {
        name: 'WK Cepu',
        operator: 'ExxonMobil Cepu Ltd / Pertamina EP Cepu',
        datasetId: 'concession-medco-4',
        color: '#2a5fb8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [111.00, -6.75],
          [111.55, -6.65],
          [112.00, -6.80],
          [112.20, -7.15],
          [112.05, -7.50],
          [111.55, -7.65],
          [110.95, -7.55],
          [110.60, -7.25],
          [110.65, -6.95],
          [111.00, -6.75],
        ]],
      },
    },

    /* ── WK Tarakan — Kalimantan Utara ───────────────────────────── */
    {
      type: 'Feature',
      id: 'wk-tarakan',
      properties: {
        name: 'WK Tarakan',
        operator: 'Pertamina EP',
        datasetId: 'concession-eni-5',
        color: '#cf3a2a',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.85, 3.60],
          [117.40, 3.75],
          [117.85, 3.55],
          [118.00, 3.15],
          [117.80, 2.70],
          [117.35, 2.45],
          [116.80, 2.55],
          [116.45, 2.90],
          [116.40, 3.30],
          [116.85, 3.60],
        ]],
      },
    },

    /* ── WK Natuna — Laut Natuna (offshore Riau Kepulauan) ───────── */
    {
      type: 'Feature',
      id: 'wk-natuna',
      properties: {
        name: 'WK Natuna',
        operator: 'Medco E&P Natuna',
        datasetId: 'concession-inpex-6',
        color: '#7a5cb8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [107.50, 3.50],
          [108.30, 3.60],
          [108.90, 3.35],
          [109.00, 2.85],
          [108.75, 2.30],
          [108.10, 2.00],
          [107.40, 2.10],
          [107.05, 2.55],
          [107.10, 3.10],
          [107.50, 3.50],
        ]],
      },
    },

    /* ── WK Sanga-Sanga — Kalimantan Timur (Bontang utara) ───────── */
    {
      type: 'Feature',
      id: 'wk-sanga-sanga',
      properties: {
        name: 'WK Sanga-Sanga',
        operator: 'Vico Indonesia',
        datasetId: 'concession-harbour-7',
        color: '#1f8a4a',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [117.10, -0.10],
          [117.60, -0.00],
          [118.00, -0.20],
          [118.10, -0.65],
          [117.85, -1.05],
          [117.30, -1.15],
          [116.85, -0.95],
          [116.70, -0.55],
          [116.85, -0.20],
          [117.10, -0.10],
        ]],
      },
    },

    /* ── WK Senoro — Sulawesi Tengah (Banggai basin) ─────────────── */
    {
      type: 'Feature',
      id: 'wk-senoro',
      properties: {
        name: 'WK Senoro-Toili',
        operator: 'Pertamina EP / Medco E&P',
        datasetId: 'concession-skk-migas-8',
        color: '#c2840d',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [122.20, -1.55],
          [122.75, -1.40],
          [123.20, -1.60],
          [123.35, -2.00],
          [123.15, -2.45],
          [122.65, -2.60],
          [122.15, -2.45],
          [121.90, -2.05],
          [122.00, -1.70],
          [122.20, -1.55],
        ]],
      },
    },
  ],
};

/**
 * Lookup cepat: datasetId → Polygon geometry.
 * Dipakai di `buildCatalog` untuk attach geometry ke DatasetRecord concession.
 */
export const WK_GEOMETRY_BY_DATASET_ID: ReadonlyMap<string, Polygon> = new Map(
  WK_BOUNDARIES.features.map(
    (f: Feature<Polygon, WkFeatureProperties>): [string, Polygon] => [
      f.properties.datasetId,
      f.geometry,
    ],
  ),
);
