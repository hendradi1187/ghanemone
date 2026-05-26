/**
 * Monitoring API — mock client untuk Pipeline / Alert / SystemHealth.
 *
 * Phase 8.14. Real-time updates di-simulasikan via `subscribeToPipelineUpdates`:
 * interval 3-5 detik, emit random progress increment + occasional status
 * transition (queued→running→completed). Subscriber dapat batch update; consumer
 * memutuskan apakah men-throttle SR announcement.
 *
 * Phase 9 replace dengan:
 *   - GET /v1/ops/pipelines
 *   - WebSocket wss://…/ops/stream (kafka-backed event bus)
 */
import {
  getAlerts as readAlerts,
  getPipelines as readPipelines,
  getRecentJobs as readRecentJobs,
  getSystemHealth as readHealth,
  type Alert,
  type JobLogEntry,
  type Pipeline,
  type PipelineStatus,
  type SystemHealth,
} from '../mocks/monitoring';

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 80, max = 200): number {
  return min + Math.floor(Math.random() * (max - min));
}

/* ─── Public API ───────────────────────────────────────────────────────── */

export async function getPipelines(): Promise<Pipeline[]> {
  await sleep(jitter());
  return readPipelines();
}

export async function getAlerts(): Promise<Alert[]> {
  await sleep(jitter());
  return readAlerts();
}

export async function getSystemHealth(): Promise<SystemHealth> {
  await sleep(jitter());
  return readHealth();
}

export async function getRecentJobs(limit = 50): Promise<JobLogEntry[]> {
  await sleep(jitter());
  return readRecentJobs(limit);
}

const ACK_STORAGE_KEY = 'ghanem.monitoring.acks';

function readAckSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(ACK_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((s): s is string => typeof s === 'string'));
  } catch (err) {
    void err;
    return new Set();
  }
}

function writeAckSet(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    void err;
  }
}

export async function acknowledgeAlert(id: string): Promise<{ ok: boolean }> {
  await sleep(jitter(50, 120));
  const set = readAckSet();
  set.add(id);
  writeAckSet(set);
  return { ok: true };
}

/** Combine raw alerts dengan ack state localStorage. */
export async function getAlertsWithAcks(): Promise<Alert[]> {
  const [alerts] = await Promise.all([getAlerts()]);
  const acks = readAckSet();
  return alerts.map((a) => ({ ...a, acknowledged: a.acknowledged || acks.has(a.id) }));
}

/* ─── Live subscription (mock WebSocket) ───────────────────────────────── */

export interface PipelineUpdate {
  id: string;
  /** Optional new status — kalau berubah. */
  status?: PipelineStatus;
  /** Increment progress (0-100, baseline progress sebelumnya + delta). */
  progress?: number;
  /** Updated throughput. */
  throughput?: number;
  /** Step current baru. */
  stepCurrent?: number;
}

export type PipelineSubscriber = (updates: PipelineUpdate[]) => void;

/**
 * Subscribe ke "stream" updates pipeline. Returns unsubscribe function.
 *
 * Implementasi mock: interval 3-5 detik (random), pick 2-3 running pipelines,
 * naikkan progress. Occasionally (5% chance) transition queued→running atau
 * running→completed/failed.
 *
 * Consumer pattern (lihat MonitoringPage):
 *   const unsub = subscribeToPipelineUpdates((updates) => {
 *     queryClient.setQueryData(['monitoring','pipelines'], (prev) => merge(prev, updates));
 *   });
 *   return () => unsub();
 */
export function subscribeToPipelineUpdates(callback: PipelineSubscriber): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function tick(): void {
    if (cancelled) return;
    // Generate updates dari snapshot terbaru.
    const snapshot = readPipelines();
    const updates: PipelineUpdate[] = [];
    for (const p of snapshot) {
      // Hanya update 30% pipelines per tick supaya bukan all-at-once.
      if (Math.random() > 0.3) continue;
      if (p.status === 'running') {
        const delta = 2 + Math.floor(Math.random() * 8);
        const nextProgress = Math.min(100, p.progress + delta);
        const update: PipelineUpdate = {
          id: p.id,
          progress: nextProgress,
          throughput: Math.max(60, p.throughput + (Math.random() > 0.5 ? 40 : -40)),
        };
        // Transition kalau progress full.
        if (nextProgress >= 100) {
          update.status = Math.random() > 0.1 ? 'completed' : 'failed';
          update.stepCurrent = p.stepTotal;
        } else {
          update.stepCurrent = Math.max(
            1,
            Math.min(p.stepTotal, Math.ceil((nextProgress / 100) * p.stepTotal)),
          );
        }
        updates.push(update);
      } else if (p.status === 'queued' && Math.random() > 0.7) {
        updates.push({ id: p.id, status: 'running', progress: 8, stepCurrent: 1 });
      }
    }
    if (updates.length > 0) callback(updates);
    const nextDelay = 3000 + Math.floor(Math.random() * 2000);
    timer = setTimeout(tick, nextDelay);
  }

  const initialDelay = 1500 + Math.floor(Math.random() * 1000);
  timer = setTimeout(tick, initialDelay);

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}
