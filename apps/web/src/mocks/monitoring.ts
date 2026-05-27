/**
 * Mock data untuk Monitoring page (Phase 8.14).
 *
 * Deterministic baseline + time-rotating offsets supaya feed "live"
 * tetap fresh tanpa benar-benar acak. Phase 9 ganti dengan stream
 * dari `/v1/ops/pipelines` + WebSocket `wss://…/ops/stream`.
 *
 * Schema yang di-expose:
 *   - Pipeline: job pipeline (queued/running/completed/failed/cancelled)
 *   - Alert: alert/notification (critical/warning/info)
 *   - SystemHealth: 4 KPI ringkasan
 *   - JobLogEntry: history singkat (success/failure)
 */

export type PipelineStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type PipelineType =
  | 'shp-import'
  | 'segy-processing'
  | 'tile-generation'
  | 'validation'
  | 'indexing';

export interface Pipeline {
  id: string;
  name: string;
  type: PipelineType;
  status: PipelineStatus;
  /** KKKS / sumber data. */
  provider: string;
  /** ISO timestamp mulai. */
  startedAt: string;
  /** Durasi (detik). 0 kalau belum mulai. */
  durationSec: number;
  /** Progress 0-100 (running/queued < 100, completed = 100). */
  progress: number;
  /** Pesan error — hanya untuk status failed. */
  errorMessage?: string;
  /** Step index saat ini (1-based). */
  stepCurrent: number;
  /** Total step. */
  stepTotal: number;
  /** Throughput records/sec. */
  throughput: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  /** ISO timestamp. */
  createdAt: string;
  acknowledged: boolean;
  /** Optional deep link (dataset id, pipeline id, dst). */
  link?: string;
}

export interface SystemHealth {
  /** Uptime persen (0-100). */
  uptimePct: number;
  /** Latensi rata-rata (ms). */
  avgLatencyMs: number;
  /** Throughput records per menit. */
  throughputRpm: number;
  /** Error rate persen. */
  errorRatePct: number;
  /** Time series 24 jam untuk latency chart. */
  latencyTrend: { hour: string; latency: number }[];
  /** Throughput per jam. */
  throughputByHour: { hour: string; throughput: number }[];
  /** Breakdown error by source. */
  errorBreakdown: { source: string; count: number }[];
}

export type JobLogStatus = 'success' | 'failure';

export interface JobLogEntry {
  id: string;
  pipelineName: string;
  status: JobLogStatus;
  durationSec: number;
  /** ISO timestamp finish. */
  finishedAt: string;
  message: string;
}

/* ─── Catalog data ─────────────────────────────────────────────────────── */

const PROVIDERS = [
  'PHE ONWJ',
  'Pertamina Hulu Mahakam',
  'Medco E&P',
  'Chevron Indonesia',
  'Inpex Masela',
  'SKK Migas',
  'Harbour Energy',
  'Premier Oil',
];

const PIPELINE_TEMPLATES: readonly {
  name: string;
  type: PipelineType;
  stepTotal: number;
}[] = [
  { name: 'SHP Import · WK Boundary', type: 'shp-import', stepTotal: 5 },
  { name: 'SEG-Y Processing · 3D Volume', type: 'segy-processing', stepTotal: 8 },
  { name: 'Tile Generation · Basemap', type: 'tile-generation', stepTotal: 6 },
  { name: 'Validation · Topology Check', type: 'validation', stepTotal: 4 },
  { name: 'Indexing · Spatial Index', type: 'indexing', stepTotal: 3 },
  { name: 'SHP Import · Pipeline Network', type: 'shp-import', stepTotal: 5 },
  { name: 'SEG-Y Processing · PSDM Stack', type: 'segy-processing', stepTotal: 8 },
  { name: 'Validation · Attribute Schema', type: 'validation', stepTotal: 4 },
  { name: 'Tile Generation · Concession Map', type: 'tile-generation', stepTotal: 6 },
  { name: 'Indexing · Vector Tiles', type: 'indexing', stepTotal: 3 },
  { name: 'SHP Import · Well Headers', type: 'shp-import', stepTotal: 5 },
  { name: 'Validation · CRS Check', type: 'validation', stepTotal: 4 },
  { name: 'SEG-Y Processing · Time Migration', type: 'segy-processing', stepTotal: 8 },
  { name: 'Tile Generation · Satellite Layer', type: 'tile-generation', stepTotal: 6 },
];

/** Status cycle deterministic per index supaya distribusi balanced. */
const STATUS_CYCLE: PipelineStatus[] = [
  'running',
  'running',
  'completed',
  'queued',
  'running',
  'failed',
  'completed',
  'running',
  'queued',
  'completed',
  'cancelled',
  'running',
  'completed',
  'failed',
];

/** Snapshot timestamp basis — refresh per call supaya offset bergerak. */
function nowOffset(minutesBack: number): string {
  return new Date(Date.now() - minutesBack * 60_000).toISOString();
}

/** Pseudo-random deterministik dari (key, salt). 0-1 inclusive. */
function pseudo(key: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10_000) / 10_000;
}

/** Return offsets per minute (changes setiap menit). */
export function getCurrentTimeOffsets(): { minute: number; jitter: number } {
  const now = new Date();
  const minute = now.getUTCHours() * 60 + now.getUTCMinutes();
  return { minute, jitter: minute % 7 };
}

export function getPipelines(): Pipeline[] {
  const { minute } = getCurrentTimeOffsets();
  return PIPELINE_TEMPLATES.map((tpl, idx) => {
    const id = `pipe-${idx.toString().padStart(3, '0')}`;
    const statusIdx = (idx + Math.floor(minute / 5)) % STATUS_CYCLE.length;
    const status = STATUS_CYCLE[statusIdx] ?? 'queued';
    const providerIdx = idx % PROVIDERS.length;
    const baseProgress = Math.floor(pseudo(id, minute) * 90) + 8;
    let progress = 0;
    let durationSec = 0;
    let stepCurrent = 1;
    if (status === 'completed') {
      progress = 100;
      stepCurrent = tpl.stepTotal;
      durationSec = 60 + Math.floor(pseudo(id, 2) * 300);
    } else if (status === 'running') {
      progress = baseProgress;
      stepCurrent = Math.max(1, Math.min(tpl.stepTotal, Math.ceil((baseProgress / 100) * tpl.stepTotal)));
      durationSec = 30 + Math.floor(pseudo(id, 3) * 200);
    } else if (status === 'failed') {
      progress = Math.floor(pseudo(id, 4) * 60) + 20;
      stepCurrent = Math.max(1, Math.min(tpl.stepTotal, Math.ceil((progress / 100) * tpl.stepTotal)));
      durationSec = 20 + Math.floor(pseudo(id, 5) * 120);
    } else if (status === 'cancelled') {
      progress = Math.floor(pseudo(id, 6) * 50) + 10;
      stepCurrent = Math.max(1, Math.ceil((progress / 100) * tpl.stepTotal));
      durationSec = 10 + Math.floor(pseudo(id, 7) * 60);
    }
    const minutesBack = Math.floor(pseudo(id, 8) * 240); // 0-4 jam
    const throughput =
      status === 'running' ? 120 + Math.floor(pseudo(id, 9) * 880) : 0;
    return {
      id,
      name: tpl.name,
      type: tpl.type,
      status,
      provider: PROVIDERS[providerIdx] ?? 'Unknown Provider',
      startedAt: nowOffset(minutesBack),
      durationSec,
      progress,
      ...(status === 'failed'
        ? {
            errorMessage:
              'Validation failed: 3 features outside declared CRS (EPSG:4326 expected, got EPSG:3857).',
          }
        : {}),
      stepCurrent,
      stepTotal: tpl.stepTotal,
      throughput,
    };
  });
}

const ALERT_TEMPLATES: readonly {
  severity: AlertSeverity;
  title: string;
  source: string;
  message: string;
  link?: string;
}[] = [
  {
    severity: 'critical',
    title: 'Pipeline harvest failed',
    source: 'Pipeline Network · PHE',
    message:
      'Job harvest pipeline-network gagal di step 4 (Topology Check). 3 fitur tidak valid (self-intersect).',
    link: '/monitoring?tab=pipelines',
  },
  {
    severity: 'critical',
    title: 'SLA breach — uptime 97.8%',
    source: 'System Health',
    message: 'Uptime turun di bawah threshold 99% selama 12 menit (10:18 – 10:30 WIB).',
  },
  {
    severity: 'warning',
    title: 'Schema drift detected',
    source: 'Well Headers PHM',
    message: 'Kolom "elevation_m" tidak ditemukan di submission baru — fallback ke nullable.',
    link: '/datasets/wk-onwj-001',
  },
  {
    severity: 'warning',
    title: 'Latensi tinggi (>1.5s)',
    source: 'Connector PHE ONWJ',
    message: 'Rata-rata response time connector PHE ONWJ 1.7s pada 5 menit terakhir.',
  },
  {
    severity: 'warning',
    title: 'Disk usage > 80%',
    source: 'Spatial Index Cluster',
    message: 'Disk usage cluster spatial-idx-01 mencapai 83%. Pertimbangkan compaction.',
  },
  {
    severity: 'info',
    title: 'Validation passed',
    source: 'WK Topology PSN',
    message: 'Validation pipeline WK boundary PSN selesai tanpa warning.',
  },
  {
    severity: 'info',
    title: 'Sync selesai',
    source: 'Facility Inventory ONWJ',
    message: '348 records ter-sync ke catalog publik.',
  },
  {
    severity: 'critical',
    title: 'Connector timeout',
    source: 'Connector Medco E&P',
    message: 'Health check connector Medco E&P timeout 3x berturut-turut. Auto-retry aktif.',
  },
  {
    severity: 'warning',
    title: 'Lonjakan API calls',
    source: 'API Gateway',
    message: 'Traffic /v1/datasets naik 240% vs baseline 7 hari. Tidak ada error.',
  },
  {
    severity: 'info',
    title: 'Maintenance window',
    source: 'Ops · Scheduled',
    message: 'Maintenance window terjadwal: Senin 03:00–04:00 WIB. Tidak ada downtime user-facing.',
  },
];

export function getAlerts(): Alert[] {
  const { minute } = getCurrentTimeOffsets();
  return ALERT_TEMPLATES.map((tpl, idx) => {
    const id = `alert-${idx.toString().padStart(3, '0')}`;
    const minutesBack = idx * 18 + (minute % 11);
    // ack pattern: alert lama (>2 jam) sudah di-ack, baru belum.
    const acknowledged = minutesBack > 120;
    return {
      id,
      severity: tpl.severity,
      title: tpl.title,
      message: tpl.message,
      source: tpl.source,
      createdAt: nowOffset(minutesBack),
      acknowledged,
      ...(tpl.link ? { link: tpl.link } : {}),
    };
  });
}

export function getSystemHealth(): SystemHealth {
  const { minute, jitter } = getCurrentTimeOffsets();
  const uptimePct = +(98.2 + jitter * 0.08).toFixed(2);
  const avgLatencyMs = 240 + Math.floor(pseudo('latency', minute) * 120);
  const throughputRpm = 18_400 + Math.floor(pseudo('throughput', minute) * 3_600);
  const errorRatePct = +(0.4 + pseudo('err', minute) * 0.9).toFixed(2);

  // 24-hour latency trend
  const latencyTrend = Array.from({ length: 24 }, (_, h) => {
    const noise = Math.sin(((h + minute / 60) / 24) * Math.PI * 2);
    return {
      hour: `${h.toString().padStart(2, '0')}:00`,
      latency: Math.round(220 + noise * 80 + pseudo(`lat-${h}`, minute) * 60),
    };
  });

  const throughputByHour = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, '0')}:00`,
    throughput: Math.round(14_000 + pseudo(`thr-${h}`, minute) * 8_000),
  }));

  const errorBreakdown = [
    { source: 'Validation', count: 12 + Math.floor(pseudo('e-val', minute) * 8) },
    { source: 'Connector', count: 4 + Math.floor(pseudo('e-conn', minute) * 6) },
    { source: 'Schema drift', count: 2 + Math.floor(pseudo('e-sch', minute) * 4) },
    { source: 'Timeout', count: 1 + Math.floor(pseudo('e-to', minute) * 3) },
  ];

  return {
    uptimePct,
    avgLatencyMs,
    throughputRpm,
    errorRatePct,
    latencyTrend,
    throughputByHour,
    errorBreakdown,
  };
}

const RECENT_JOB_TEMPLATES: readonly {
  pipelineName: string;
  status: JobLogStatus;
  message: string;
}[] = [
  { pipelineName: 'SHP Import · WK ONWJ 2024', status: 'success', message: '128 features imported.' },
  { pipelineName: 'Validation · Topology Check', status: 'success', message: 'All checks passed.' },
  { pipelineName: 'SEG-Y Processing · 3D Volume', status: 'failure', message: 'Step 5: missing trace headers.' },
  { pipelineName: 'Indexing · Spatial Index', status: 'success', message: 'Reindex selesai 248k features.' },
  { pipelineName: 'Tile Generation · Basemap', status: 'success', message: '14 zoom levels generated.' },
  { pipelineName: 'SHP Import · Pipeline Network', status: 'failure', message: 'Topology error · 3 features self-intersect.' },
  { pipelineName: 'Validation · CRS Check', status: 'success', message: 'All features EPSG:4326.' },
  { pipelineName: 'Connector Sync · Medco E&P', status: 'success', message: '94 records refreshed.' },
  { pipelineName: 'SEG-Y Processing · PSDM', status: 'success', message: 'Stack completed (8 GB).' },
  { pipelineName: 'Tile Generation · Concession', status: 'failure', message: 'Out of memory di zoom 16.' },
  { pipelineName: 'Validation · Schema Match', status: 'success', message: 'Schema match 100%.' },
  { pipelineName: 'Indexing · Vector Tiles', status: 'success', message: 'Vector tiles ready.' },
  { pipelineName: 'SHP Import · Well Headers', status: 'success', message: '2,041 records imported.' },
  { pipelineName: 'Connector Sync · PHE ONWJ', status: 'success', message: 'Delta sync 12 records.' },
  { pipelineName: 'Validation · Attribute', status: 'failure', message: 'Required field missing: operator.' },
];

export function getRecentJobs(limit = 50): JobLogEntry[] {
  const { minute } = getCurrentTimeOffsets();
  const out: JobLogEntry[] = [];
  for (let i = 0; i < limit; i += 1) {
    const tpl = RECENT_JOB_TEMPLATES[i % RECENT_JOB_TEMPLATES.length] ?? { pipelineName: 'Unknown', status: 'success' as const, message: '' };
    const minutesBack = i * 7 + (minute % 5);
    const id = `job-${i.toString().padStart(3, '0')}`;
    out.push({
      id,
      pipelineName: tpl.pipelineName,
      status: tpl.status,
      durationSec: 20 + Math.floor(pseudo(id, minute) * 400),
      finishedAt: nowOffset(minutesBack),
      message: tpl.message,
    });
  }
  return out;
}
