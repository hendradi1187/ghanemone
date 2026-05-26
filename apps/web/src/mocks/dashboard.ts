/**
 * Mock data dashboard — persona-aware KPI + tren + komposisi + activity feed.
 *
 * Deterministic (tidak ada `Math.random()` di module-level). Phase 9 akan
 * diganti dengan call ke `/v1/dashboard/*`.
 *
 * Pola pemanggilan dari TanStack Query:
 *   useQuery({ queryKey: ['dashboard', 'kpi', persona], queryFn: () => getKpiSummary(persona) })
 */
import type { UserRole } from '@ghanem/types';
import type { IconName } from '@ghanem/ui';
import { CATEGORIES, MOCK_CATALOG, PROVIDERS } from './datasets';

/** Persona = subset UserRole yang relevan untuk Dashboard. `admin` fallback ke regulator. */
export type Persona = Extract<UserRole, 'regulator' | 'kkks_operator' | 'analyst'>;

/** Map UserRole → Persona dengan fallback. */
export function rolePersona(role: UserRole | null | undefined): Persona {
  if (role === 'regulator' || role === 'kkks_operator' || role === 'analyst') return role;
  // admin or null → tampilkan dashboard regulator (paling komprehensif)
  return 'regulator';
}

export type KpiTone = 'green' | 'blue' | 'amber' | 'purple';

export interface KpiItem {
  id: string;
  label: string;
  /** Nilai utama (string formatted atau number). */
  value: string | number;
  /** Optional unit (mis. "%", "jam"). */
  unit?: string;
  /** Delta vs periode sebelumnya (persen). */
  change?: number;
  icon: IconName;
  tone: KpiTone;
}

/** KPI 4-tile per persona — deterministic mock. */
export function getKpiSummary(persona: Persona): KpiItem[] {
  switch (persona) {
    case 'regulator':
      return [
        { id: 'total-datasets', label: 'Total Dataset', value: 2452, icon: 'database', tone: 'green', change: 5.4 },
        { id: 'active-providers', label: 'Provider Aktif', value: PROVIDERS.length, icon: 'user', tone: 'blue', change: 2.1 },
        { id: 'pending-approvals', label: 'Pending Approval', value: 12, icon: 'clock', tone: 'amber', change: -8.3 },
        { id: 'compliance-rate', label: 'Compliance', value: 96, unit: '%', icon: 'shield', tone: 'purple', change: 0.8 },
      ];
    case 'kkks_operator':
      return [
        { id: 'my-datasets', label: 'Dataset Saya', value: 184, icon: 'database', tone: 'green', change: 3.2 },
        { id: 'uploads-30d', label: 'Upload 30 Hari', value: 24, icon: 'upload', tone: 'blue', change: 12.4 },
        { id: 'quality-score', label: 'Skor Kualitas', value: 92, unit: '%', icon: 'check', tone: 'purple', change: 1.5 },
        { id: 'pipeline-status', label: 'Pipeline Aktif', value: 5, icon: 'activity', tone: 'amber', change: 0 },
      ];
    case 'analyst':
      return [
        { id: 'available-datasets', label: 'Dataset Tersedia', value: 1840, icon: 'database', tone: 'green', change: 6.1 },
        { id: 'queries-30d', label: 'Query 30 Hari', value: 426, icon: 'bolt', tone: 'blue', change: 14.7 },
        { id: 'avg-response', label: 'Avg Response', value: 1.4, unit: 's', icon: 'clock', tone: 'amber', change: -5.2 },
        { id: 'favorites', label: 'Favorit', value: 18, icon: 'star', tone: 'purple', change: 2.0 },
      ];
  }
}

/* ─── Tren dataset bulanan (untuk LineChart) ─────────────────────────── */

const MONTH_LABELS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export interface TrendPoint {
  month: string;
  count: number;
  added: number;
  accessed: number;
}

/** Time series 12 bulan deterministic. */
export function getDatasetTrend(monthRange = 12): TrendPoint[] {
  // Base from current month going back N months — tapi pakai seed deterministic
  // (i adalah index "anti-clockwise" supaya reload memberikan series sama).
  const points: TrendPoint[] = [];
  const now = new Date(2026, 4, 1); // 2026-05 — frozen di Phase 8
  for (let i = monthRange - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${MONTH_LABELS_ID[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    // Seed sederhana berbasis index — kurva naik landai dengan noise.
    const base = 80 + (monthRange - i) * 4;
    const noise = ((i * 17) % 11) - 5;
    const added = Math.max(20, base + noise);
    const accessed = Math.round(added * (8.4 + ((i * 3) % 5) * 0.4));
    points.push({ month: monthLabel, count: added, added, accessed });
  }
  return points;
}

/* ─── Top 5 providers by dataset count ────────────────────────────────── */

export interface ProviderRank {
  id: string;
  name: string;
  initials: string;
  color: string;
  count: number;
}

export function getProvidersTop5(): ProviderRank[] {
  // Hitung dari MOCK_CATALOG (deterministic).
  const counts = new Map<string, number>();
  for (const ds of MOCK_CATALOG) {
    counts.set(ds.providerId, (counts.get(ds.providerId) ?? 0) + 1);
  }
  // Boost dengan pseudo-multiplier supaya angka mirror prototype hi-fi.
  const ranks: ProviderRank[] = PROVIDERS.map((p, idx) => {
    const real = counts.get(p.id) ?? 0;
    const boosted = real * 6 + (idx + 1) * 13 + 40;
    // Resolve color — substitusi `var(--hf-...)` ke hex literal dari tokens
    // (Recharts butuh hex string). Mapping minimal: berdasarkan substring.
    let color = '#1f8a4a';
    if (p.color.includes('amber')) color = '#c2840d';
    else if (p.color.includes('blue')) color = '#2a5fb8';
    else if (p.color.includes('purple')) color = '#7a5cb8';
    return { id: p.id, name: p.name, initials: p.initials, color, count: boosted };
  });
  return ranks.sort((a, b) => b.count - a.count).slice(0, 5);
}

/* ─── Distribution per kategori (untuk PieChart) ──────────────────────── */

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export function getCategoryDistribution(): CategorySlice[] {
  const counts = new Map<string, number>();
  for (const ds of MOCK_CATALOG) {
    counts.set(ds.categoryId, (counts.get(ds.categoryId) ?? 0) + 1);
  }
  return CATEGORIES.map((c) => {
    const real = counts.get(c.id) ?? 0;
    // Boost mirip prototype (multiplier sesuai kategori).
    const boosted = real * (c.id === 'seismic' ? 18 : c.id === 'well-log' ? 14 : 6) + 24;
    return { name: c.label, value: boosted, color: c.color };
  });
}

/* ─── Status breakdown (untuk DonutChart) ─────────────────────────────── */

export function getStatusBreakdown(): CategorySlice[] {
  // Status colors dari brand palette.
  const counts = { public: 0, internal: 0, confidential: 0 } as Record<string, number>;
  for (const ds of MOCK_CATALOG) {
    if (ds.status) counts[ds.status] = (counts[ds.status] ?? 0) + 1;
  }
  return [
    { name: 'Public', value: (counts.public ?? 0) * 12 + 220, color: '#1f8a4a' },
    { name: 'Internal', value: (counts.internal ?? 0) * 18 + 380, color: '#2a5fb8' },
    { name: 'Confidential', value: (counts.confidential ?? 0) * 10 + 120, color: '#7a5cb8' },
  ];
}

/* ─── Activity feed (events) ──────────────────────────────────────────── */

export type ActivityType = 'upload' | 'approval' | 'alert' | 'query' | 'download' | 'comment';
export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  /** ISO timestamp. */
  timestamp: string;
  actor: {
    name: string;
    initials: string;
  };
  severity: ActivitySeverity;
}

const ACTIVITY_FIXTURES: ReadonlyArray<Omit<ActivityEvent, 'id' | 'timestamp'>> = [
  { type: 'upload', message: 'PHE ONWJ mengunggah dataset baru "WK Boundary 2024"', actor: { name: 'PHE ONWJ', initials: 'PH' }, severity: 'success' },
  { type: 'upload', message: 'Medco E&P mengunggah Seismic 3D N.Sumatra', actor: { name: 'Medco E&P', initials: 'ME' }, severity: 'success' },
  { type: 'approval', message: 'SKK Migas menyetujui PSC Doc Rokan', actor: { name: 'SKK Migas', initials: 'SM' }, severity: 'success' },
  { type: 'query', message: 'PHM menjalankan query Well Headers Q3', actor: { name: 'PHM', initials: 'PM' }, severity: 'info' },
  { type: 'comment', message: 'PHE ONWJ memberi komentar pada Facility Inventory', actor: { name: 'PHE ONWJ', initials: 'PH' }, severity: 'info' },
  { type: 'download', message: 'Medco E&P mengunduh WK Boundary ONWJ', actor: { name: 'Medco E&P', initials: 'ME' }, severity: 'info' },
  { type: 'alert', message: 'Spatial Index throughput turun di-bawah SLA 99%', actor: { name: 'System Monitor', initials: 'SY' }, severity: 'warning' },
  { type: 'approval', message: 'Chevron menyetujui amandemen kontrak West Seno', actor: { name: 'Chevron', initials: 'CI' }, severity: 'success' },
  { type: 'upload', message: 'Inpex mengunggah update sensor IoT Masela', actor: { name: 'Inpex', initials: 'IM' }, severity: 'success' },
  { type: 'query', message: 'Analyst menyimpan view "Top 10 sumur produktif"', actor: { name: 'Analyst', initials: 'AN' }, severity: 'info' },
  { type: 'alert', message: 'Quota API harian KKKS-OP mencapai 80%', actor: { name: 'System Monitor', initials: 'SY' }, severity: 'warning' },
  { type: 'comment', message: 'Geology Team komentar di dataset Talangakar', actor: { name: 'Geology Team', initials: 'GT' }, severity: 'info' },
];

/** Activity feed deterministic — timestamps dihitung mundur dari `now` fixed. */
export function getActivityFeed(limit = 10): ActivityEvent[] {
  const now = new Date(2026, 4, 20, 9, 30, 0); // 2026-05-20 09:30
  // Offset dalam menit (deterministic): 4, 12, 34, 60, 120, 180, ... naik exponential lalu hari kemarin.
  const offsetsMin = [4, 12, 34, 60, 120, 180, 360, 720, 1440, 1500, 1620, 1880];
  const max = Math.min(limit, ACTIVITY_FIXTURES.length);
  const out: ActivityEvent[] = [];
  for (let i = 0; i < max; i += 1) {
    const fix = ACTIVITY_FIXTURES[i]!;
    const offset = offsetsMin[i] ?? (offsetsMin.at(-1)! + (i - offsetsMin.length + 1) * 360);
    const ts = new Date(now.getTime() - offset * 60_000).toISOString();
    out.push({
      id: `evt-${i + 1}`,
      type: fix.type,
      message: fix.message,
      timestamp: ts,
      actor: fix.actor,
      severity: fix.severity,
    });
  }
  return out;
}
