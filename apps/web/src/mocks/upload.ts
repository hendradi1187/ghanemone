/**
 * Mock data + validation untuk Upload wizard (Phase 8.15).
 *
 * KKKS operator submission flow — Phase 8 hanya mock client-side.
 * Phase 9 implement multipart-upload nyata ke `/v1/datasets/uploads`
 * dengan presigned URL untuk S3-compatible storage.
 */
import type { AttributeRow } from '@ghanem/ui';

/** Whitelist extension (lowercase, tanpa dot). */
export const ALLOWED_EXTENSIONS: readonly string[] = [
  'shp',
  'zip',
  'kml',
  'geojson',
  'json',
  'csv',
  'segy',
  'sgy',
];

/** Threshold size dalam bytes. */
export const SIZE_WARN_BYTES = 100 * 1024 * 1024; // 100 MB
export const SIZE_FAIL_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

export type ValidationSeverity = 'pass' | 'warning' | 'fail';

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

export interface ValidationResult {
  fileName: string;
  /** Lulus → siap upload. Warning → boleh lanjut tapi user diberi tahu. Fail → blokir. */
  severity: ValidationSeverity;
  issues: ValidationIssue[];
  /** Auto-detected attributes — kalau format mendukung (SHP, GeoJSON, CSV). */
  detectedAttributes: AttributeRow[];
}

/* ─── Schema templates per ekstensi ────────────────────────────────────── */

const ATTRIBUTE_TEMPLATES: Record<string, AttributeRow[]> = {
  shp: [
    { name: 'OBJECTID', type: 'number', description: 'Feature ID otomatis dari ESRI.', nullable: false, example: '1' },
    { name: 'name', type: 'string', description: 'Nama feature.', nullable: false, example: 'WK-ONWJ' },
    { name: 'operator', type: 'string', description: 'KKKS operator.', nullable: true, example: 'PHE ONWJ' },
    { name: 'area_km2', type: 'number', description: 'Luas (km²).', nullable: true, example: '13978.45' },
    { name: 'status', type: 'string', description: 'Status kontrak.', nullable: false, example: 'Active' },
    { name: 'geometry', type: 'geometry', description: 'Geometri polygon.', nullable: false, example: 'POLYGON(…)' },
  ],
  geojson: [
    { name: 'id', type: 'string', description: 'Feature identifier.', nullable: false, example: 'f-001' },
    { name: 'name', type: 'string', description: 'Nama feature.', nullable: false, example: 'Block A' },
    { name: 'category', type: 'string', description: 'Kategori.', nullable: true, example: 'pipeline' },
    { name: 'length_m', type: 'number', description: 'Panjang (meter).', nullable: true, example: '12480' },
    { name: 'geometry', type: 'geometry', description: 'Geometri.', nullable: false, example: 'LineString(…)' },
  ],
  kml: [
    { name: 'name', type: 'string', description: 'Nama placemark.', nullable: false, example: 'Well A' },
    { name: 'description', type: 'string', description: 'Deskripsi.', nullable: true, example: 'Exploration well.' },
    { name: 'styleUrl', type: 'string', description: 'Style URL.', nullable: true, example: '#blue' },
    { name: 'geometry', type: 'geometry', description: 'Geometri.', nullable: false, example: 'Point(…)' },
  ],
  csv: [
    { name: 'well_id', type: 'string', description: 'Identifier sumur.', nullable: false, example: 'GWN-01' },
    { name: 'spud_date', type: 'date', description: 'Tanggal mulai bor.', nullable: false, example: '2024-03-15' },
    { name: 'depth_m', type: 'number', description: 'Total depth (m).', nullable: false, example: '3250' },
    { name: 'operator', type: 'string', description: 'Operator KKKS.', nullable: false, example: 'PHE ONWJ' },
    { name: 'lat', type: 'number', description: 'Latitude.', nullable: false, example: '-5.85' },
    { name: 'lon', type: 'number', description: 'Longitude.', nullable: false, example: '107.10' },
  ],
  segy: [
    { name: 'inline', type: 'number', description: 'Inline number.', nullable: false, example: '1001' },
    { name: 'xline', type: 'number', description: 'Crossline number.', nullable: false, example: '2001' },
    { name: 'samples', type: 'number', description: 'Sample count.', nullable: false, example: '1500' },
    { name: 'sample_interval', type: 'number', description: 'Interval (ms).', nullable: false, example: '2' },
  ],
};

/** Lookup attribute template; SHP zip kembali ke SHP. */
function templateForExt(ext: string): AttributeRow[] {
  if (ext === 'sgy') return ATTRIBUTE_TEMPLATES['segy'] ?? [];
  if (ext === 'zip') return ATTRIBUTE_TEMPLATES['shp'] ?? [];
  if (ext === 'json') return ATTRIBUTE_TEMPLATES['geojson'] ?? [];
  return ATTRIBUTE_TEMPLATES[ext] ?? [];
}

export function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  if (idx < 0) return '';
  return fileName.slice(idx + 1).toLowerCase();
}

/**
 * Validate satu file. Format check + size check + auto-detect attributes.
 * Async untuk konsistensi dengan API kontrak; sleep 200-500ms supaya
 * UX terasa realistic.
 */
export async function validateFileMock(file: File): Promise<ValidationResult> {
  const delayMs = 200 + Math.floor(Math.random() * 300);
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

  const ext = getExtension(file.name);
  const issues: ValidationIssue[] = [];

  // Format check
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    issues.push({
      code: 'format/unsupported',
      severity: 'fail',
      message: `Format .${ext || '(tidak dikenal)'} tidak didukung. Gunakan: SHP, GeoJSON, KML, CSV, SEG-Y.`,
    });
  }

  // Size check
  if (file.size > SIZE_FAIL_BYTES) {
    issues.push({
      code: 'size/exceeds-limit',
      severity: 'fail',
      message: `Ukuran ${formatBytes(file.size)} melebihi batas 5 GB. Pertimbangkan split file.`,
    });
  } else if (file.size > SIZE_WARN_BYTES) {
    issues.push({
      code: 'size/large',
      severity: 'warning',
      message: `Ukuran ${formatBytes(file.size)} cukup besar. Upload mungkin perlu beberapa menit.`,
    });
  }

  // Mock pseudo-random schema warning untuk certain ext (10% chance via deterministic name hash).
  const nameHash = simpleHash(file.name);
  if (issues.length === 0 && (ext === 'shp' || ext === 'geojson') && nameHash % 5 === 0) {
    issues.push({
      code: 'schema/missing-attribute',
      severity: 'warning',
      message: 'Atribut wajib "operator" tidak ditemukan. Akan di-fallback ke nullable.',
    });
  }

  const failed = issues.some((i) => i.severity === 'fail');
  const warned = issues.some((i) => i.severity === 'warning');
  const severity: ValidationSeverity = failed ? 'fail' : warned ? 'warning' : 'pass';

  if (issues.length === 0) {
    issues.push({
      code: 'all-ok',
      severity: 'pass',
      message: 'Validasi lulus — file siap diunggah.',
    });
  }

  return {
    fileName: file.name,
    severity,
    issues,
    detectedAttributes: failed ? [] : templateForExt(ext),
  };
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/* ─── Submit dataset ───────────────────────────────────────────────────── */

export type DatasetLicense = 'CC-BY-4.0' | 'Internal SPEKTRUM' | 'Restricted SKK Migas';

export type DatasetCategoryId =
  | 'seismic'
  | 'well-log'
  | 'production'
  | 'concession'
  | 'geology'
  | 'document';

export interface UploadFormData {
  name: string;
  description: string;
  category: DatasetCategoryId;
  provider: string;
  license: DatasetLicense;
  tags: string[];
  bbox: [number, number, number, number];
  files: { name: string; size: number }[];
  attributes: AttributeRow[];
}

export async function submitDatasetMock(data: UploadFormData): Promise<{ id: string }> {
  // Simulasi submit 2-3 detik supaya UX terasa "processing".
  const delayMs = 2000 + Math.floor(Math.random() * 1000);
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  void data;
  const id = `new-${Date.now().toString(36)}`;
  return { id };
}
