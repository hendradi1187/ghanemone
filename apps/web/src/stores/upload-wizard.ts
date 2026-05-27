/**
 * Upload wizard store — Zustand slice untuk multi-step upload flow (Phase 8.15).
 *
 * Wizard punya 5 step:
 *   1. File          → pilih + drop file
 *   2. Metadata      → nama, deskripsi, kategori, lisensi, tags, bbox
 *   3. Schema        → preview atribut auto-detected
 *   4. Validasi      → 4 check (topology, schema, attribute, integrity)
 *   5. Review        → ringkasan + submit
 *
 * Persistence strategy:
 *   - `metadata` + `currentStep` di-mirror ke sessionStorage (`ghanem.upload-wizard.state`).
 *   - File objects TIDAK serializable — kita hanya simpan metadata file
 *     (name, size). Kalau user refresh page, dia harus re-select file (kita
 *     tampilkan banner reminder di UploadDropZone).
 *   - sessionStorage (bukan localStorage) — wizard state hilang ketika tab
 *     ditutup. Itu yang kita mau: cegah stale draft menumpuk + mempermudah
 *     "fresh start" setelah submit.
 *
 * Phase 9: ganti sessionStorage dengan server-side draft (POST /v1/datasets/drafts)
 * supaya user bisa lanjutkan dari device lain.
 */
import { create } from 'zustand';
import type { ValidationResult, DatasetCategoryId, DatasetLicense } from '../mocks/upload';

/** Storage key untuk persisted slice (`metadata` + `currentStep`). */
const STORAGE_KEY = 'ghanem.upload-wizard.state';

/** Total step di wizard (1-indexed). */
export const TOTAL_STEPS = 5 as const;

export type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * Metadata yang dikumpulkan di step 2. bbox di-store sebagai tuple supaya
 * map preview/validation gampang konsumsi. `tags` di-normalisasi (lowercase,
 * dedupe) saat di-set.
 */
export interface WizardMetadata {
  name: string;
  description: string;
  category: DatasetCategoryId | '';
  license: DatasetLicense | '';
  tags: string[];
  bbox: [number, number, number, number] | null;
}

/** Lightweight info tentang file — full File object tidak serializable. */
export interface SelectedFileInfo {
  /** Stable id (uuid-ish) untuk key + remove. */
  id: string;
  name: string;
  size: number;
  /** Lowercased extension tanpa dot. */
  ext: string;
  /** File object — `null` setelah hydrate dari sessionStorage. */
  // reason: File tidak serializable; setelah refresh kita anggap user perlu re-select.
  file: File | null;
}

/** Hasil validasi global (step 4). */
export interface ValidationCheckResult {
  topology: 'pass' | 'warning' | 'fail';
  schema: 'pass' | 'warning' | 'fail';
  attributes: 'pass' | 'warning' | 'fail';
  integrity: 'pass' | 'warning' | 'fail';
  /** Detail message per check. */
  messages: {
    topology: string;
    schema: string;
    attributes: string;
    integrity: string;
  };
  /** Aggregated per-file validation hasil dari `validateFileMock`. */
  perFile: ValidationResult[];
  /** Timestamp ms — untuk display "diverifikasi 12s lalu" + freshness check. */
  ranAt: number;
}

export interface UploadWizardState {
  currentStep: WizardStep;
  metadata: WizardMetadata;
  selectedFiles: SelectedFileInfo[];
  validationResults: ValidationCheckResult | null;
  /** Progress per file id (0-100). Dipakai oleh ReviewSummary saat submit. */
  uploadProgress: Record<string, number>;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WizardStep) => void;
  setMetadata: (next: Partial<WizardMetadata>) => void;
  setSelectedFiles: (files: SelectedFileInfo[]) => void;
  setValidationResults: (results: ValidationCheckResult | null) => void;
  setUploadProgress: (fileId: string, pct: number) => void;
  reset: () => void;
}

/* ─── Defaults ────────────────────────────────────────────────────────── */

const DEFAULT_METADATA: WizardMetadata = {
  name: '',
  description: '',
  category: '',
  license: '',
  tags: [],
  bbox: null,
};

/* ─── Persistence helpers ─────────────────────────────────────────────── */

/** Shape yang di-persist ke sessionStorage. Subset dari full state. */
interface PersistedSlice {
  currentStep: WizardStep;
  metadata: WizardMetadata;
  /** Catatan kecil tentang file (tanpa File object). */
  selectedFileInfo: { id: string; name: string; size: number; ext: string }[];
}

function isWizardStep(value: unknown): value is WizardStep {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function persistSlice(slice: PersistedSlice): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch (err) {
    // reason: sessionStorage bisa throw di Safari Private Mode / quota — diam saja,
    // wizard tetap jalan di memory.
    void err;
  }
}

function readSlice(): PersistedSlice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedSlice>;
    if (!isWizardStep(parsed.currentStep)) return null;
    if (!parsed.metadata || typeof parsed.metadata !== 'object') return null;
    const meta = parsed.metadata as WizardMetadata;
    const files = Array.isArray(parsed.selectedFileInfo) ? parsed.selectedFileInfo : [];
    return {
      currentStep: parsed.currentStep,
      metadata: {
        name: typeof meta.name === 'string' ? meta.name : '',
        description: typeof meta.description === 'string' ? meta.description : '',
        category: (meta.category as WizardMetadata['category']) ?? '',
        license: (meta.license as WizardMetadata['license']) ?? '',
        tags: Array.isArray(meta.tags) ? meta.tags.filter((t) => typeof t === 'string') : [],
        bbox:
          Array.isArray(meta.bbox) && meta.bbox.length === 4 && meta.bbox.every((n) => typeof n === 'number')
            ? (meta.bbox as [number, number, number, number])
            : null,
      },
      selectedFileInfo: files,
    };
  } catch (err) {
    void err;
    return null;
  }
}

function clearPersisted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    void err;
  }
}

/* ─── Hydration ────────────────────────────────────────────────────────── */

const hydrated = readSlice();

const initialMetadata: WizardMetadata = hydrated?.metadata ?? DEFAULT_METADATA;
const initialStep: WizardStep = hydrated?.currentStep ?? 1;
const initialFiles: SelectedFileInfo[] = hydrated
  ? hydrated.selectedFileInfo.map((info) => ({ ...info, file: null }))
  : [];

/* ─── Store ──────────────────────────────────────────────────────────── */

export const useUploadWizardStore = create<UploadWizardState>((set, get) => ({
  currentStep: initialStep,
  metadata: initialMetadata,
  selectedFiles: initialFiles,
  validationResults: null,
  uploadProgress: {},

  nextStep: () => {
    const next = Math.min(TOTAL_STEPS, get().currentStep + 1) as WizardStep;
    set({ currentStep: next });
    persistCurrent({ currentStep: next });
  },

  prevStep: () => {
    const prev = Math.max(1, get().currentStep - 1) as WizardStep;
    set({ currentStep: prev });
    persistCurrent({ currentStep: prev });
  },

  goToStep: (step) => {
    if (!isWizardStep(step)) return;
    set({ currentStep: step });
    persistCurrent({ currentStep: step });
  },

  setMetadata: (next) => {
    const merged: WizardMetadata = { ...get().metadata, ...next };
    set({ metadata: merged });
    persistCurrent({ metadata: merged });
  },

  setSelectedFiles: (files) => {
    set({ selectedFiles: files });
    persistCurrent({
      selectedFileInfo: files.map(({ id, name, size, ext }) => ({ id, name, size, ext })),
    });
  },

  setValidationResults: (results) => {
    set({ validationResults: results });
  },

  setUploadProgress: (fileId, pct) => {
    set((s) => ({ uploadProgress: { ...s.uploadProgress, [fileId]: pct } }));
  },

  reset: () => {
    clearPersisted();
    set({
      currentStep: 1,
      metadata: DEFAULT_METADATA,
      selectedFiles: [],
      validationResults: null,
      uploadProgress: {},
    });
  },
}));

/**
 * Persist hanya slice yang di-track. Caller pass partial untuk merge dengan
 * state currently di store; field yang tidak di-pass dibaca dari store.
 */
function persistCurrent(partial: Partial<PersistedSlice>): void {
  const s = useUploadWizardStore.getState();
  const slice: PersistedSlice = {
    currentStep: partial.currentStep ?? s.currentStep,
    metadata: partial.metadata ?? s.metadata,
    selectedFileInfo:
      partial.selectedFileInfo ??
      s.selectedFiles.map(({ id, name, size, ext }) => ({ id, name, size, ext })),
  };
  persistSlice(slice);
}
