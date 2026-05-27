/**
 * Mock data untuk Compliance Regulator page (Phase 8.16).
 *
 * Phase 9 replace dengan:
 *   - GET /v1/compliance/queue
 *   - GET /v1/compliance/audit-log
 *   - POST /v1/compliance/datasets/:id/approve
 *   - POST /v1/compliance/datasets/:id/reject
 *   - POST /v1/compliance/datasets/:id/request-changes
 */
import type { User } from '@ghanem/types';

export type RiskFlag =
  | 'contains-pii'
  | 'large-file'
  | 'sensitive-area'
  | 'incomplete-metadata';

export type ApprovalAction = 'submit' | 'approve' | 'reject' | 'request-changes' | 'archive';

export interface PendingDataset {
  id: string;
  title: string;
  description: string;
  kkks: string;
  category: 'seismic' | 'well-log' | 'production' | 'concession' | 'geology' | 'document';
  kind: 'LAYER' | 'VOLUME' | 'DOC';
  sizeMb: number;
  fileCount: number;
  /** ISO timestamp submission. */
  submittedAt: string;
  submittedBy: User;
  submitterNotes: string;
  riskFlags: RiskFlag[];
  /** Mock pre-check result. */
  validationStatus: 'pass' | 'warning' | 'fail';
}

export interface AuditEntry {
  id: string;
  action: ApprovalAction;
  datasetId: string;
  datasetTitle: string;
  actor: User;
  /** ISO timestamp. */
  timestamp: string;
  reason?: string;
  /** Optional before/after snapshot — minimal untuk drawer view. */
  before?: string;
  after?: string;
}

/* ─── Sample users ─────────────────────────────────────────────────────── */

function buildUser(email: string, fullName: string, role: User['role'], organization: string): User {
  return {
    id: `usr_${email.split('@')[0]}`,
    sub: `mock|${email}`,
    email,
    fullName,
    organization,
    role,
    provisioningStatus: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  };
}

const KKKS_USERS: readonly User[] = [
  buildUser('andi@phe-onwj.co.id', 'Andi Nugroho', 'kkks_operator', 'PHE ONWJ'),
  buildUser('lina@pertamina-hulu.com', 'Lina Marpaung', 'kkks_operator', 'Pertamina Hulu Mahakam'),
  buildUser('budi@medcoenergi.com', 'Budi Adi', 'kkks_operator', 'Medco E&P'),
  buildUser('erina@chevron.co.id', 'Erina Fauzi', 'kkks_operator', 'Chevron Indonesia'),
  buildUser('rio@harbourenergy.com', 'Rio Kusuma', 'kkks_operator', 'Harbour Energy'),
  buildUser('joko@phe-onwj.co.id', 'Joko Darmawan', 'kkks_operator', 'PHE ONWJ'),
];

const REGULATOR_USERS: readonly User[] = [
  buildUser('citra@skkmigas.go.id', 'Citra Wibowo', 'regulator', 'SKK Migas'),
  buildUser('budi.r@skkmigas.go.id', 'Budi Rahmat', 'regulator', 'SKK Migas'),
  buildUser('dewi@skkmigas.go.id', 'Dewi Hapsari', 'regulator', 'SKK Migas'),
  buildUser('ahmad@skkmigas.go.id', 'Ahmad Subagja', 'regulator', 'SKK Migas'),
];

/* ─── Pending datasets templates ──────────────────────────────────────── */

const PENDING_TEMPLATES: readonly {
  title: string;
  category: PendingDataset['category'];
  kind: PendingDataset['kind'];
  sizeMb: number;
  fileCount: number;
  riskFlags: RiskFlag[];
  validation: PendingDataset['validationStatus'];
  notes: string;
}[] = [
  {
    title: 'WK Boundary ONWJ 2024 Update',
    category: 'concession',
    kind: 'LAYER',
    sizeMb: 12,
    fileCount: 4,
    riskFlags: [],
    validation: 'pass',
    notes: 'Update boundary sesuai SK Menteri 2024. Polygon WGS84.',
  },
  {
    title: 'Seismic 3D North Sumatra Reprocessed',
    category: 'seismic',
    kind: 'VOLUME',
    sizeMb: 12_400,
    fileCount: 3,
    riskFlags: ['large-file', 'sensitive-area'],
    validation: 'warning',
    notes: 'Volume reprocessing terbaru. Lokasi di area sensitif eksplorasi.',
  },
  {
    title: 'Well Headers ONWJ Q3 2024',
    category: 'well-log',
    kind: 'LAYER',
    sizeMb: 0.5,
    fileCount: 1,
    riskFlags: [],
    validation: 'pass',
    notes: 'Header sumur kuartal 3 — total 23 sumur baru.',
  },
  {
    title: 'PSC Rokan Amendment 2024',
    category: 'document',
    kind: 'DOC',
    sizeMb: 14,
    fileCount: 2,
    riskFlags: ['contains-pii'],
    validation: 'warning',
    notes: 'Amendment kontrak PSC. Beberapa lampiran berisi data personal.',
  },
  {
    title: 'Pipeline Network TransJava 2024',
    category: 'concession',
    kind: 'LAYER',
    sizeMb: 18,
    fileCount: 5,
    riskFlags: ['incomplete-metadata'],
    validation: 'fail',
    notes: 'Update jaringan pipa Trans Java. Beberapa atribut wajib kosong.',
  },
  {
    title: 'Facility Inventory ONWJ',
    category: 'production',
    kind: 'LAYER',
    sizeMb: 3,
    fileCount: 2,
    riskFlags: [],
    validation: 'pass',
    notes: 'Inventory fasilitas produksi update bulanan.',
  },
  {
    title: 'Geochemistry Talangakar 2024',
    category: 'geology',
    kind: 'LAYER',
    sizeMb: 8,
    fileCount: 12,
    riskFlags: [],
    validation: 'pass',
    notes: 'Analisis geokimia formasi Talangakar — 48 sampel.',
  },
  {
    title: 'Production Monthly Mahakam Mei 2026',
    category: 'production',
    kind: 'LAYER',
    sizeMb: 2,
    fileCount: 1,
    riskFlags: [],
    validation: 'pass',
    notes: 'Laporan produksi bulanan Mei 2026.',
  },
  {
    title: 'Seismic 2D South Sumatra Vintage',
    category: 'seismic',
    kind: 'VOLUME',
    sizeMb: 4_200,
    fileCount: 8,
    riskFlags: ['large-file'],
    validation: 'warning',
    notes: 'Vintage 2D survey. Format SEG-Y rev 0 — perlu konversi.',
  },
  {
    title: 'Final Well Report GWN-15',
    category: 'document',
    kind: 'DOC',
    sizeMb: 24,
    fileCount: 1,
    riskFlags: [],
    validation: 'pass',
    notes: 'FWR sumur eksplorasi GWN-15 (selesai TD).',
  },
  {
    title: 'WK Mahakam Boundary Refresh',
    category: 'concession',
    kind: 'LAYER',
    sizeMb: 9,
    fileCount: 3,
    riskFlags: ['sensitive-area'],
    validation: 'pass',
    notes: 'Refresh boundary WK Mahakam — perubahan 2 polygon.',
  },
  {
    title: 'Core Photo Library Kutai 2023',
    category: 'geology',
    kind: 'DOC',
    sizeMb: 1_800,
    fileCount: 320,
    riskFlags: ['large-file'],
    validation: 'warning',
    notes: 'Library foto core sumur Kutai — high-res.',
  },
  {
    title: 'Mud Log Composite GWN-12',
    category: 'well-log',
    kind: 'LAYER',
    sizeMb: 1.2,
    fileCount: 1,
    riskFlags: [],
    validation: 'pass',
    notes: 'Mud log composite sumur eksplorasi.',
  },
  {
    title: 'Wireline Logs ONWJ Batch 2024-05',
    category: 'well-log',
    kind: 'LAYER',
    sizeMb: 240,
    fileCount: 24,
    riskFlags: ['large-file'],
    validation: 'pass',
    notes: 'Batch 24 sumur — LAS files + headers.',
  },
  {
    title: 'AFE Document Tarakan 2024',
    category: 'document',
    kind: 'DOC',
    sizeMb: 6,
    fileCount: 3,
    riskFlags: ['contains-pii'],
    validation: 'warning',
    notes: 'AFE drilling Tarakan — berisi data personal anggota tim.',
  },
  {
    title: 'Allocation Report PHE Onshore Q2',
    category: 'production',
    kind: 'LAYER',
    sizeMb: 4,
    fileCount: 2,
    riskFlags: [],
    validation: 'pass',
    notes: 'Allocation report kuartal 2 — onshore PHE.',
  },
  {
    title: 'Seismic 3D Berau Bay Survey',
    category: 'seismic',
    kind: 'VOLUME',
    sizeMb: 8_900,
    fileCount: 2,
    riskFlags: ['large-file', 'sensitive-area'],
    validation: 'fail',
    notes: 'Survey baru Berau Bay — SEG-Y kehilangan trace header EBCDIC.',
  },
];

/* ─── Build pending queue (deterministic) ──────────────────────────────── */

const COMPLIANCE_STORAGE_KEY = 'ghanem.compliance.actions';

interface CompliancePersistedAction {
  type: 'approve' | 'reject' | 'request-changes';
  datasetId: string;
  reason?: string;
  actor: User;
  timestamp: string;
}

function readPersistedActions(): CompliancePersistedAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPLIANCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is CompliancePersistedAction =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as { datasetId?: unknown }).datasetId === 'string',
    );
  } catch (err) {
    void err;
    return [];
  }
}

export function writePersistedActions(actions: CompliancePersistedAction[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(actions));
  } catch (err) {
    void err;
  }
}

export function appendPersistedAction(action: CompliancePersistedAction): void {
  const current = readPersistedActions();
  writePersistedActions([action, ...current]);
}

export function listPersistedActions(): CompliancePersistedAction[] {
  return readPersistedActions();
}

export function getApprovalQueue(): PendingDataset[] {
  const persisted = readPersistedActions();
  const acted = new Set(persisted.map((a) => a.datasetId));
  const minute = Math.floor(Date.now() / 60_000);
  const result: PendingDataset[] = [];
  for (let i = 0; i < PENDING_TEMPLATES.length; i += 1) {
    const tpl = PENDING_TEMPLATES[i];
    if (!tpl) continue;
    const id = `pending-${i.toString().padStart(3, '0')}`;
    if (acted.has(id)) continue;
    // i % KKKS_USERS.length always produces a valid index — KKKS_USERS is non-empty.
    const submitterIdx = i % KKKS_USERS.length;
    const submitter = KKKS_USERS[submitterIdx];
    if (!submitter) continue;
    const hoursBack = (i * 7 + (minute % 11)) % 96;
    const submittedAt = new Date(Date.now() - hoursBack * 60 * 60_000).toISOString();
    result.push({
      id,
      title: tpl.title,
      description: tpl.notes,
      kkks: submitter.organization ?? 'Unknown',
      category: tpl.category,
      kind: tpl.kind,
      sizeMb: tpl.sizeMb,
      fileCount: tpl.fileCount,
      submittedAt,
      submittedBy: submitter,
      submitterNotes: tpl.notes,
      riskFlags: tpl.riskFlags,
      validationStatus: tpl.validation,
    });
  }
  return result;
}

/* ─── Audit log ───────────────────────────────────────────────────────── */

// Named actor references — avoids repeated index lookups on readonly arrays.
// These indices match the REGULATOR_USERS / KKKS_USERS definitions above.
const CITRA = REGULATOR_USERS[0] as User;
const BUDI_R = REGULATOR_USERS[1] as User;
const DEWI = REGULATOR_USERS[2] as User;
const AHMAD = REGULATOR_USERS[3] as User;
const ANDI = KKKS_USERS[0] as User;

const SEED_AUDIT_ENTRIES: readonly (Omit<AuditEntry, 'timestamp'> & { hoursBack: number })[] = [
  {
    id: 'audit-001',
    action: 'approve',
    datasetId: 'ds-wk-onwj-2023',
    datasetTitle: 'WK Boundary ONWJ 2023',
    actor: CITRA,
    reason: 'Validasi lulus, boundary sesuai SK 2023.',
    hoursBack: 4,
  },
  {
    id: 'audit-002',
    action: 'reject',
    datasetId: 'ds-pipeline-trans-2023',
    datasetTitle: 'Pipeline TransJava 2023 (draft)',
    actor: DEWI,
    reason: 'Topologi tidak valid — 12 fitur self-intersect.',
    hoursBack: 6,
  },
  {
    id: 'audit-003',
    action: 'request-changes',
    datasetId: 'ds-seismic-medco-2024',
    datasetTitle: 'Seismic 3D Medco Vintage',
    actor: BUDI_R,
    reason: 'Lengkapi metadata processing vendor + tanggal akuisisi.',
    hoursBack: 8,
  },
  {
    id: 'audit-004',
    action: 'approve',
    datasetId: 'ds-wells-phm-2024',
    datasetTitle: 'Wells Headers PHM Q2 2024',
    actor: CITRA,
    hoursBack: 12,
  },
  {
    id: 'audit-005',
    action: 'submit',
    datasetId: 'pending-000',
    datasetTitle: 'WK Boundary ONWJ 2024 Update',
    actor: ANDI,
    hoursBack: 16,
  },
  {
    id: 'audit-006',
    action: 'approve',
    datasetId: 'ds-psc-rokan-2023',
    datasetTitle: 'PSC Rokan 2023',
    actor: AHMAD,
    hoursBack: 24,
  },
  {
    id: 'audit-007',
    action: 'reject',
    datasetId: 'ds-allocation-q1-draft',
    datasetTitle: 'Allocation Q1 2024 (draft)',
    actor: DEWI,
    reason: 'Periode tumpang tindih dengan submission sebelumnya.',
    hoursBack: 36,
  },
  {
    id: 'audit-008',
    action: 'approve',
    datasetId: 'ds-facility-inv-old',
    datasetTitle: 'Facility Inventory ONWJ 2023',
    actor: CITRA,
    hoursBack: 48,
  },
  {
    id: 'audit-009',
    action: 'archive',
    datasetId: 'ds-vintage-survey',
    datasetTitle: 'Vintage Survey 1998',
    actor: BUDI_R,
    reason: 'Data > 25 tahun — pindahkan ke arsip.',
    hoursBack: 72,
  },
  {
    id: 'audit-010',
    action: 'request-changes',
    datasetId: 'ds-core-photo-kutai',
    datasetTitle: 'Core Photo Library Kutai 2022',
    actor: AHMAD,
    reason: 'Resolusi foto kurang — minimal 2400×1800 px.',
    hoursBack: 96,
  },
  {
    id: 'audit-011',
    action: 'approve',
    datasetId: 'ds-wellpath-2024',
    datasetTitle: 'Well Path Database 2024',
    actor: DEWI,
    hoursBack: 120,
  },
  {
    id: 'audit-012',
    action: 'approve',
    datasetId: 'ds-prod-monthly-apr',
    datasetTitle: 'Production Monthly Apr 2026',
    actor: CITRA,
    hoursBack: 144,
  },
];

export interface AuditFilters {
  action?: ApprovalAction;
  actorEmail?: string;
  datasetId?: string;
  /** ISO date string min. */
  fromDate?: string;
  /** ISO date string max. */
  toDate?: string;
}

function persistedToAuditEntry(p: CompliancePersistedAction, idx: number): AuditEntry {
  const tpl = PENDING_TEMPLATES.find((_, i) => `pending-${i.toString().padStart(3, '0')}` === p.datasetId);
  return {
    id: `audit-live-${idx}`,
    action: p.type,
    datasetId: p.datasetId,
    datasetTitle: tpl?.title ?? p.datasetId,
    actor: p.actor,
    timestamp: p.timestamp,
    ...(p.reason ? { reason: p.reason } : {}),
  };
}

export function getAuditLog(filters?: AuditFilters): AuditEntry[] {
  const now = Date.now();
  const seedEntries: AuditEntry[] = SEED_AUDIT_ENTRIES.map((e) => ({
    id: e.id,
    action: e.action,
    datasetId: e.datasetId,
    datasetTitle: e.datasetTitle,
    actor: e.actor,
    timestamp: new Date(now - e.hoursBack * 60 * 60_000).toISOString(),
    ...(e.reason ? { reason: e.reason } : {}),
  }));
  const persisted = readPersistedActions().map(persistedToAuditEntry);
  const combined = [...persisted, ...seedEntries];

  if (!filters) return combined;
  let result = combined;
  if (filters.action) result = result.filter((e) => e.action === filters.action);
  if (filters.actorEmail) {
    const needle = filters.actorEmail.toLowerCase();
    result = result.filter((e) => e.actor.email.toLowerCase().includes(needle));
  }
  if (filters.datasetId) {
    const needle = filters.datasetId.toLowerCase();
    result = result.filter(
      (e) =>
        e.datasetId.toLowerCase().includes(needle) ||
        e.datasetTitle.toLowerCase().includes(needle),
    );
  }
  if (filters.fromDate) {
    const min = new Date(filters.fromDate).getTime();
    result = result.filter((e) => new Date(e.timestamp).getTime() >= min);
  }
  if (filters.toDate) {
    const max = new Date(filters.toDate).getTime();
    result = result.filter((e) => new Date(e.timestamp).getTime() <= max);
  }
  return result;
}

export const RISK_FLAG_META: Record<RiskFlag, { label: string; tone: 'red' | 'amber' | 'blue' }> = {
  'contains-pii': { label: 'Berisi PII', tone: 'red' },
  'large-file': { label: 'File besar', tone: 'amber' },
  'sensitive-area': { label: 'Area sensitif', tone: 'amber' },
  'incomplete-metadata': { label: 'Metadata kurang', tone: 'red' },
};
