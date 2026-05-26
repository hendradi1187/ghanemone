/**
 * MonitoringPage — `/monitoring` route (Phase 8.14).
 *
 * Live ops view dengan 4 tabs: Pipelines, Alerts, Jobs Log, System Health.
 * URL state `?tab=…&status=…` untuk shareability.
 *
 * Real-time strategy:
 *   - Initial fetch via TanStack Query (`getPipelines`/`getAlerts`)
 *   - Subscribe ke `subscribeToPipelineUpdates` (mock setInterval 3-5s)
 *   - Merge updates ke cache via `queryClient.setQueryData`
 *   - Track `lastUpdate` Date untuk LiveIndicator
 *   - SR announcement throttled — hanya major status transitions
 *     (running→completed/failed), bukan setiap progress tick
 *
 * Role guard: regulator + analyst boleh akses; KKKS operator dapat 403.
 *
 * A11y:
 *   - Heading hierarchy h1 > h2 > h3
 *   - Live region `<div role="status" aria-live="polite">` di pojok
 *   - Status badge punya text label + warna (color-blind safe via icon)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChartCard,
  Button,
  DonutChartCard,
  EmptyState,
  Icon,
  LineChartCard,
  StatCard,
  Tabs,
  toast,
} from '@ghanem/ui';
import {
  acknowledgeAlert,
  getAlertsWithAcks,
  getPipelines,
  getRecentJobs,
  getSystemHealth,
  subscribeToPipelineUpdates,
  type PipelineUpdate,
} from '../api/monitoring';
import type {
  Alert,
  JobLogEntry,
  Pipeline,
  PipelineStatus,
  SystemHealth,
} from '../mocks/monitoring';
import { useAuth } from '../hooks/use-auth';
import { PipelineRow } from './monitoring/PipelineRow';
import { AlertCard } from './monitoring/AlertCard';
import { LiveIndicator } from './monitoring/LiveIndicator';

type MonTab = 'pipelines' | 'alerts' | 'jobs' | 'health';
const VALID_TABS: ReadonlyArray<MonTab> = ['pipelines', 'alerts', 'jobs', 'health'];

const STATUS_FILTERS: ReadonlyArray<{ value: PipelineStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'running', label: 'Running' },
  { value: 'queued', label: 'Queued' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function parseTab(raw: string | null): MonTab {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) return raw as MonTab;
  return 'pipelines';
}

function parseStatusFilter(raw: string | null): PipelineStatus | 'all' {
  if (!raw) return 'all';
  if (raw === 'all') return 'all';
  if (
    raw === 'running' ||
    raw === 'queued' ||
    raw === 'completed' ||
    raw === 'failed' ||
    raw === 'cancelled'
  ) {
    return raw;
  }
  return 'all';
}

export function MonitoringPage(): JSX.Element {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // ── Role guard ──────────────────────────────────────────────────────
  const allowed = user?.role === 'regulator' || user?.role === 'analyst' || user?.role === 'admin';
  if (!allowed) {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <EmptyState
          variant="error"
          title="Akses ditolak"
          description={
            <>
              Halaman <b>Monitoring</b> hanya tersedia untuk Regulator / Analyst.
              Akun Anda terdaftar sebagai <i>{user?.role ?? 'tamu'}</i>.
            </>
          }
        />
      </div>
    );
  }

  const tab = parseTab(searchParams.get('tab'));
  const statusFilter = parseStatusFilter(searchParams.get('status'));

  const setTab = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === 'pipelines') params.delete('tab');
          else params.set('tab', next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setStatusFilter = useCallback(
    (next: PipelineStatus | 'all') => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === 'all') params.delete('status');
          else params.set('status', next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // ── Queries ─────────────────────────────────────────────────────────
  const pipelinesQuery = useQuery({
    queryKey: ['monitoring', 'pipelines'],
    queryFn: getPipelines,
    staleTime: 5_000,
  });
  const alertsQuery = useQuery({
    queryKey: ['monitoring', 'alerts'],
    queryFn: getAlertsWithAcks,
    staleTime: 10_000,
  });
  const healthQuery = useQuery({
    queryKey: ['monitoring', 'health'],
    queryFn: getSystemHealth,
    staleTime: 15_000,
  });
  const jobsQuery = useQuery({
    queryKey: ['monitoring', 'jobs'],
    queryFn: () => getRecentJobs(50),
    staleTime: 15_000,
  });

  // ── Live subscription ───────────────────────────────────────────────
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  // Throttle SR announcement — minimal 8 detik antar announcement.
  const lastAnnouncementRef = useRef<number>(0);

  useEffect(() => {
    const unsubscribe = subscribeToPipelineUpdates((updates) => {
      // Merge ke cache.
      queryClient.setQueryData<Pipeline[] | undefined>(
        ['monitoring', 'pipelines'],
        (prev) => {
          if (!prev) return prev;
          const map = new Map<string, PipelineUpdate>();
          for (const u of updates) map.set(u.id, u);
          return prev.map((p) => {
            const u = map.get(p.id);
            if (!u) return p;
            return {
              ...p,
              ...(u.status !== undefined ? { status: u.status } : {}),
              ...(u.progress !== undefined ? { progress: u.progress } : {}),
              ...(u.throughput !== undefined ? { throughput: u.throughput } : {}),
              ...(u.stepCurrent !== undefined ? { stepCurrent: u.stepCurrent } : {}),
            };
          });
        },
      );
      setLastUpdate(new Date());
      // SR announcement — hanya untuk status transitions besar.
      const transitions = updates.filter(
        (u) => u.status === 'completed' || u.status === 'failed',
      );
      if (transitions.length > 0) {
        const now = Date.now();
        if (now - lastAnnouncementRef.current >= 8_000) {
          lastAnnouncementRef.current = now;
          const completed = transitions.filter((u) => u.status === 'completed').length;
          const failed = transitions.filter((u) => u.status === 'failed').length;
          const parts: string[] = [];
          if (completed > 0) parts.push(`${completed} pipeline selesai`);
          if (failed > 0) parts.push(`${failed} pipeline gagal`);
          setLiveAnnouncement(parts.join(', '));
        }
      }
    });
    return () => unsubscribe();
    // queryClient stable; tidak dimasukkan supaya unsubscribe tidak repeat per render.
  }, [queryClient]);

  // ── Derived: filter pipelines ───────────────────────────────────────
  const filteredPipelines = useMemo(() => {
    const list = pipelinesQuery.data ?? [];
    if (statusFilter === 'all') return list;
    return list.filter((p) => p.status === statusFilter);
  }, [pipelinesQuery.data, statusFilter]);

  const pipelineCounts = useMemo(() => {
    const list = pipelinesQuery.data ?? [];
    const counts: Record<PipelineStatus | 'all', number> = {
      all: list.length,
      queued: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };
    for (const p of list) counts[p.status] += 1;
    return counts;
  }, [pipelinesQuery.data]);

  // ── Alerts handlers ────────────────────────────────────────────────
  const handleAck = useCallback(
    async (id: string) => {
      // Optimistic update
      queryClient.setQueryData<Alert[] | undefined>(['monitoring', 'alerts'], (prev) =>
        prev ? prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)) : prev,
      );
      try {
        await acknowledgeAlert(id);
        toast.success('Alert di-acknowledge');
      } catch {
        toast.error('Gagal acknowledge alert');
        void queryClient.invalidateQueries({ queryKey: ['monitoring', 'alerts'] });
      }
    },
    [queryClient],
  );

  const handleOpenAlert = useCallback((alert: Alert) => {
    toast.info(alert.title, {
      description: alert.message,
    });
  }, []);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    setLastUpdate(new Date());
    toast.success('Data dimuat ulang');
  }, [queryClient]);

  // ── Health KPI ─────────────────────────────────────────────────────
  const health = healthQuery.data;
  const activeJobs = pipelineCounts.running + pipelineCounts.queued;
  const failedCount = pipelineCounts.failed;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <header className="px-6 pt-6 pb-3 bg-surface border-b border-line">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
              SPEKTRUM · Monitoring
            </p>
            <h1 className="font-display font-bold text-h1 text-ink m-0">Live Operations</h1>
            <p className="text-sm text-ink-4 mt-1 max-w-2xl">
              Pipeline status, alerts, dan health metrics secara real-time. Update bergulir
              otomatis setiap 3-5 detik.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LiveIndicator lastUpdate={lastUpdate} />
            <Button
              variant="secondary"
              size="sm"
              leftIcon="refresh"
              onClick={handleRefresh}
              aria-label="Muat ulang data monitoring"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid gap-3 mt-4 grid-cols-2 md:grid-cols-4">
          <StatCard
            label="Uptime"
            value={health ? `${health.uptimePct.toFixed(1)}` : '—'}
            unit="%"
            icon="shield"
            tone="green"
          />
          <StatCard
            label="Latensi rata-rata"
            value={health ? health.avgLatencyMs : '—'}
            unit="ms"
            icon="bolt"
            tone="blue"
          />
          <StatCard
            label="Throughput"
            value={health ? `${(health.throughputRpm / 1000).toFixed(1)}k` : '—'}
            unit="/min"
            icon="activity"
            tone="purple"
          />
          <StatCard
            label="Error rate"
            value={health ? `${health.errorRatePct.toFixed(2)}` : '—'}
            unit="%"
            icon="warn"
            tone={health && health.errorRatePct > 1 ? 'amber' : 'neutral'}
          />
        </div>
      </header>

      {/* SR live region — visually hidden, used untuk announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="px-6 py-5 flex-1">
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List aria-label="Monitoring sections">
            <Tabs.Trigger value="pipelines">
              Pipelines{' '}
              <span className="text-ink-4 font-normal">({pipelineCounts.all})</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="alerts">
              Alerts{' '}
              <span className="text-ink-4 font-normal">
                ({alertsQuery.data?.filter((a) => !a.acknowledged).length ?? 0})
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="jobs">Jobs Log</Tabs.Trigger>
            <Tabs.Trigger value="health">System Health</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="pipelines" className="pt-5">
            <PipelinesTab
              pipelines={filteredPipelines}
              counts={pipelineCounts}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              activeJobs={activeJobs}
              failedCount={failedCount}
              loading={pipelinesQuery.isLoading}
            />
          </Tabs.Content>

          <Tabs.Content value="alerts" className="pt-5">
            <AlertsTab
              alerts={alertsQuery.data ?? []}
              onAck={handleAck}
              onOpen={handleOpenAlert}
              loading={alertsQuery.isLoading}
            />
          </Tabs.Content>

          <Tabs.Content value="jobs" className="pt-5">
            <JobsLogTab jobs={jobsQuery.data ?? []} loading={jobsQuery.isLoading} />
          </Tabs.Content>

          <Tabs.Content value="health" className="pt-5">
            <HealthTab health={health} loading={healthQuery.isLoading} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

/* ─── Pipelines tab ────────────────────────────────────────────────────── */

interface PipelinesTabProps {
  pipelines: Pipeline[];
  counts: Record<PipelineStatus | 'all', number>;
  statusFilter: PipelineStatus | 'all';
  onStatusFilter: (next: PipelineStatus | 'all') => void;
  activeJobs: number;
  failedCount: number;
  loading: boolean;
}

function PipelinesTab({
  pipelines,
  counts,
  statusFilter,
  onStatusFilter,
  activeJobs,
  failedCount,
  loading,
}: PipelinesTabProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="text-sm text-ink-3">
          <span className="num font-semibold text-ink">{activeJobs}</span> aktif ·{' '}
          <span className="num font-semibold text-red-500">{failedCount}</span> gagal
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value;
            const count = counts[f.value];
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => onStatusFilter(f.value)}
                aria-pressed={isActive}
                className={[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold',
                  'border transition-colors duration-hf',
                  isActive
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-surface text-ink-3 border-line hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                {f.label}
                <span className="num opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-line rounded-3 bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left">
            <tr className="border-b border-line">
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Job
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Status
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Step
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Durasi
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Progress / Throughput
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && pipelines.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10">
                  <div role="status" aria-live="polite" className="text-center text-ink-4 text-sm">
                    Memuat pipelines…
                  </div>
                </td>
              </tr>
            ) : pipelines.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10">
                  <div role="status" className="flex flex-col items-center gap-2 text-ink-4">
                    <Icon name="activity" size={28} className="text-ink-5" aria-hidden />
                    <span className="text-sm">Tidak ada pipeline dengan filter ini.</span>
                  </div>
                </td>
              </tr>
            ) : (
              pipelines.map((p) => <PipelineRow key={p.id} pipeline={p} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Alerts tab ───────────────────────────────────────────────────────── */

interface AlertsTabProps {
  alerts: Alert[];
  onAck: (id: string) => void;
  onOpen: (alert: Alert) => void;
  loading: boolean;
}

function AlertsTab({ alerts, onAck, onOpen, loading }: AlertsTabProps): JSX.Element {
  const [showAcked, setShowAcked] = useState(false);
  const visible = useMemo(
    () => (showAcked ? alerts : alerts.filter((a) => !a.acknowledged)),
    [alerts, showAcked],
  );

  if (loading && alerts.length === 0) {
    return (
      <div role="status" aria-live="polite" className="text-center text-ink-4 py-10 text-sm">
        Memuat alerts…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="text-sm text-ink-3">
          <span className="num font-semibold text-ink">{visible.length}</span> alert
          ditampilkan
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-ink-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showAcked}
            onChange={(e) => setShowAcked(e.target.checked)}
            className="accent-green-500"
          />
          Tampilkan yang sudah di-ack
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          variant="no-data"
          icon="check"
          title="Tidak ada alert aktif"
          description="Semua alert sudah di-acknowledge. Sistem berjalan normal."
        />
      ) : (
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
          {visible.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAck}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Jobs log tab ─────────────────────────────────────────────────────── */

interface JobsLogTabProps {
  jobs: JobLogEntry[];
  loading: boolean;
}

function JobsLogTab({ jobs, loading }: JobsLogTabProps): JSX.Element {
  const [filter, setFilter] = useState<'all' | 'success' | 'failure'>('all');
  const visible = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter((j) => j.status === filter);
  }, [jobs, filter]);

  if (loading && jobs.length === 0) {
    return (
      <div role="status" aria-live="polite" className="text-center text-ink-4 py-10 text-sm">
        Memuat jobs log…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 flex-wrap">
        {(['all', 'success', 'failure'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold',
              'border transition-colors duration-hf',
              filter === f
                ? 'bg-green-500 text-white border-green-600'
                : 'bg-surface text-ink-3 border-line hover:bg-surface-2',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
          >
            {f === 'all' ? 'Semua' : f === 'success' ? 'Sukses' : 'Gagal'}
          </button>
        ))}
      </div>

      <div className="border border-line rounded-3 bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left">
            <tr className="border-b border-line">
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 w-24">
                Status
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Pipeline
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 w-24">
                Durasi
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 w-32">
                Selesai
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((j) => (
              <tr key={j.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                <td className="px-3 py-2">
                  <span
                    className={[
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-1 text-[10.5px] font-semibold uppercase tracking-widest leading-none border',
                      j.status === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-100 text-red-500 border-red-100',
                    ].join(' ')}
                  >
                    <Icon name={j.status === 'success' ? 'check' : 'warn'} size={10} aria-hidden />
                    {j.status === 'success' ? 'Sukses' : 'Gagal'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="font-semibold text-sm text-ink">{j.pipelineName}</div>
                  <div className="text-[11px] text-ink-4 mt-0.5">{j.message}</div>
                </td>
                <td className="px-3 py-2 num font-mono text-xs text-ink-3">
                  {formatDuration(j.durationSec)}
                </td>
                <td className="px-3 py-2 text-xs text-ink-3">
                  {new Date(j.finishedAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/* ─── Health tab ───────────────────────────────────────────────────────── */

interface HealthTabProps {
  health: SystemHealth | undefined;
  loading: boolean;
}

function HealthTab({ health, loading }: HealthTabProps): JSX.Element {
  if (loading || !health) {
    return (
      <div role="status" aria-live="polite" className="text-center text-ink-4 py-10 text-sm">
        Memuat health metrics…
      </div>
    );
  }

  const errorSlices = health.errorBreakdown.map((e) => ({ name: e.source, value: e.count }));

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <LineChartCard
        title="Latensi 24 jam"
        subtitle="Rata-rata response time per jam (ms)"
        data={[...health.latencyTrend]}
        xKey="hour"
        yKey="latency"
        height={220}
        formatValue={(v) => `${v} ms`}
      />
      <BarChartCard
        title="Throughput per jam"
        subtitle="Records di-proses per jam (24h)"
        data={[...health.throughputByHour]}
        xKey="hour"
        yKey="throughput"
        orientation="vertical"
        height={220}
        formatValue={(v) => `${(v / 1000).toFixed(1)}k`}
      />
      <DonutChartCard
        title="Error breakdown"
        subtitle="Per sumber, 24 jam terakhir"
        data={errorSlices}
        height={220}
        className="lg:col-span-2"
      />
    </div>
  );
}

export default MonitoringPage;
