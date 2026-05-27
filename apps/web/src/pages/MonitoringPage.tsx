/**
 * MonitoringPage — `/monitoring` route.
 *
 * Sprint 9.5 Phase 2: Summary cards, pipeline table, and alerts panel now
 * connected to real backend endpoints via useMonitoringSummary, usePipelineRuns,
 * useAlerts, useAcknowledgeAlert from hooks/useMonitoring.ts.
 *
 * Jobs Log + System Health tabs remain on mock data (backend doesn't expose
 * those endpoints yet — deferred to Sprint 9.6).
 *
 * Live updates:
 *   - Summary + pipelines refetchInterval: 30s
 *   - Alerts have optimistic ack with rollback on error
 *
 * Role guard: regulator + analyst + admin only.
 *
 * A11y:
 *   - Heading hierarchy h1 > h2 > h3
 *   - SR live region for status announcements
 *   - Status badge has text label + color (color-blind safe)
 */
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChartCard,
  Button,
  DonutChartCard,
  EmptyState,
  Icon,
  LineChartCard,
  StatCard,
  StatusChip,
  Tabs,
  toast,
} from '@ghanem/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRecentJobs,
  getSystemHealth,
} from '../api/monitoring';
import type { JobLogEntry, SystemHealth } from '../mocks/monitoring';
import {
  useAcknowledgeAlert,
  useAlerts,
  useMonitoringSummary,
  usePipelineRuns,
} from '../hooks/useMonitoring';
import type {
  Alert,
  PipelineRun,
  PipelineRunStatus,
} from '../api/monitoring-api';
import { useAuth } from '../hooks/use-auth';
import { LiveIndicator } from './monitoring/LiveIndicator';

/* ─── Tab + filter types ─────────────────────────────────────────────────── */

type MonTab = 'pipelines' | 'alerts' | 'jobs' | 'health';
const VALID_TABS: readonly MonTab[] = ['pipelines', 'alerts', 'jobs', 'health'];

const STATUS_FILTERS: readonly { value: PipelineRunStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function parseTab(raw: string | null): MonTab {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) return raw as MonTab;
  return 'pipelines';
}

function parseStatusFilter(raw: string | null): PipelineRunStatus | 'all' {
  const valid: readonly string[] = ['RUNNING', 'QUEUED', 'SUCCESS', 'FAILED', 'CANCELLED'];
  if (raw && valid.includes(raw)) return raw as PipelineRunStatus;
  return 'all';
}

function formatDurationMs(ms: number | null): string {
  if (!ms || ms <= 0) return '—';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/* ─── Page component ─────────────────────────────────────────────────────── */

export function MonitoringPage(): JSX.Element {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

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
    (next: PipelineRunStatus | 'all') => {
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

  /* ── Real API queries ───────────────────────────────────────────────── */

  const summaryQuery = useMonitoringSummary();

  const pipelinesQuery = usePipelineRuns({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 50,
  });

  const alertsQuery = useAlerts({ acknowledged: false });
  const acknowledgeAlert = useAcknowledgeAlert();

  /* ── Mock queries for tabs not yet on real API ─────────────────────── */

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

  /* ── Handlers ───────────────────────────────────────────────────────── */

  const handleAck = useCallback(
    (id: string) => {
      acknowledgeAlert.mutate(id);
    },
    [acknowledgeAlert],
  );

  const handleOpenAlert = useCallback((alert: Alert) => {
    toast.info(alert.title, { description: alert.message });
  }, []);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    toast.success('Data dimuat ulang');
  }, [queryClient]);

  /* ── Role guard — after all hooks ───────────────────────────────────── */

  const allowed =
    user?.role === 'regulator' ||
    user?.role === 'analyst' ||
    user?.role === 'admin';

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

  /* ── Derived data ───────────────────────────────────────────────────── */

  const summary = summaryQuery.data;
  const health = healthQuery.data;
  const pipelines = pipelinesQuery.data?.items ?? [];
  const pipelineTotal = pipelinesQuery.data?.total ?? 0;
  const alerts = alertsQuery.data?.items ?? [];
  const unackedCount = alertsQuery.data?.items.filter((a) => !a.acknowledged).length ?? 0;

  // Pipeline status counts from summary (more accurate than client-side count).
  const activeJobs = (summary?.runs.running ?? 0) + (summary?.runs.queued ?? 0);
  const failedCount = summary?.runs.failed ?? 0;

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
              Pipeline status, alerts, dan health metrics secara real-time.
              Summary diperbarui setiap 30 detik.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LiveIndicator
              lastUpdate={
                summaryQuery.dataUpdatedAt && summaryQuery.dataUpdatedAt > 0
                  ? new Date(summaryQuery.dataUpdatedAt)
                  : null
              }
            />
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

        {/* Summary KPI strip — 5 pipeline run stats + 4 alert severity counts */}
        {summaryQuery.isLoading ? (
          <div className="grid gap-3 mt-4 grid-cols-2 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-line rounded-3 p-4 h-20 animate-pulse"
                aria-busy="true"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 mt-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Running"
              value={summary?.runs.running ?? 0}
              icon="activity"
              tone="blue"
            />
            <StatCard
              label="Queued"
              value={summary?.runs.queued ?? 0}
              icon="clock"
              tone="purple"
            />
            <StatCard
              label="Success"
              value={summary?.runs.success ?? 0}
              icon="check"
              tone="green"
            />
            <StatCard
              label="Failed"
              value={summary?.runs.failed ?? 0}
              icon="warn"
              tone="amber"
            />
            <StatCard
              label="Alert Aktif"
              value={
                (summary?.alerts.critical ?? 0) +
                (summary?.alerts.error ?? 0) +
                (summary?.alerts.warning ?? 0)
              }
              icon="bell"
              tone={
                (summary?.alerts.critical ?? 0) > 0
                  ? 'amber'
                  : 'neutral'
              }
            />
          </div>
        )}

        {/* Alert severity breakdown */}
        {summary && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <SeverityPill
              label="Critical"
              count={summary.alerts.critical}
              cls="bg-red-100 text-red-600"
            />
            <SeverityPill
              label="Error"
              count={summary.alerts.error}
              cls="bg-orange-100 text-orange-600"
            />
            <SeverityPill
              label="Warning"
              count={summary.alerts.warning}
              cls="bg-amber-100 text-amber-700"
            />
            <SeverityPill
              label="Info"
              count={summary.alerts.info}
              cls="bg-blue-50 text-blue-600"
            />
          </div>
        )}
      </header>

      <div className="px-6 py-5 flex-1">
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List aria-label="Monitoring sections">
            <Tabs.Trigger value="pipelines">
              Pipelines{' '}
              <span className="text-ink-4 font-normal">({pipelineTotal})</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="alerts">
              Alerts{' '}
              <span className="text-ink-4 font-normal">({unackedCount})</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="jobs">Jobs Log</Tabs.Trigger>
            <Tabs.Trigger value="health">System Health</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="pipelines" className="pt-5">
            <PipelinesTab
              pipelines={pipelines}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              activeJobs={activeJobs}
              failedCount={failedCount}
              loading={pipelinesQuery.isLoading}
            />
          </Tabs.Content>

          <Tabs.Content value="alerts" className="pt-5">
            <AlertsTab
              alerts={alerts}
              onAck={handleAck}
              onOpen={handleOpenAlert}
              loading={alertsQuery.isLoading}
              ackPending={acknowledgeAlert.isPending}
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

/* ─── SeverityPill ───────────────────────────────────────────────────────── */

function SeverityPill({
  label,
  count,
  cls,
}: {
  label: string;
  count: number;
  cls: string;
}): JSX.Element | null {
  if (count === 0) return null;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-semibold',
        cls,
      ].join(' ')}
    >
      {label}: <span className="num">{count}</span>
    </span>
  );
}

/* ─── Pipelines tab ──────────────────────────────────────────────────────── */

const STATUS_CHIP_MAP: Record<
  PipelineRunStatus,
  'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
> = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCESS: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

const STATUS_BAR_CLS: Record<PipelineRunStatus, string> = {
  QUEUED: 'bg-ink-5',
  RUNNING: 'bg-blue-500',
  SUCCESS: 'bg-green-500',
  FAILED: 'bg-red-500',
  CANCELLED: 'bg-ink-5',
};

const STATUS_DISPLAY: Record<PipelineRunStatus, string> = {
  QUEUED: 'Queued',
  RUNNING: 'Running',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

interface PipelinesTabProps {
  pipelines: PipelineRun[];
  statusFilter: PipelineRunStatus | 'all';
  onStatusFilter: (next: PipelineRunStatus | 'all') => void;
  activeJobs: number;
  failedCount: number;
  loading: boolean;
}

function PipelinesTab({
  pipelines,
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
                Job / Tipe
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Status
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Dataset
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Durasi
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Records
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
              pipelines.map((p) => (
                <PipelineRunRow key={p.id} run={p} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── PipelineRunRow ─────────────────────────────────────────────────────── */

function PipelineRunRow({ run }: { run: PipelineRun }): JSX.Element {
  const chipStatus = STATUS_CHIP_MAP[run.status];
  const barCls = STATUS_BAR_CLS[run.status];
  const statusLabel = STATUS_DISPLAY[run.status];
  const isRunning = run.status === 'RUNNING';

  // Compute progress: 0-100 based on status.
  const progress =
    run.status === 'SUCCESS'
      ? 100
      : run.status === 'RUNNING' || run.status === 'QUEUED'
      ? 50  // indeterminate — backend doesn't expose step progress yet
      : 0;

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-surface-2">
      <td className="px-3 py-3 align-top">
        <div className="font-semibold text-sm text-ink leading-snug">{run.name}</div>
        <div className="text-[11px] text-ink-4 mt-0.5 uppercase tracking-cap">{run.type}</div>
      </td>
      <td className="px-3 py-3 align-top">
        <StatusChip status={chipStatus}>{statusLabel}</StatusChip>
      </td>
      <td className="px-3 py-3 align-top max-w-[180px]">
        {run.dataset ? (
          <span className="text-xs text-ink-2 line-clamp-2">{run.dataset.title}</span>
        ) : (
          <span className="text-xs text-ink-5">—</span>
        )}
      </td>
      <td className="px-3 py-3 align-top">
        <span className="num font-mono text-xs text-ink-3">
          {formatDurationMs(run.durationMs)}
        </span>
      </td>
      <td className="px-3 py-3 align-top w-44">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1.5 bg-surface-3 rounded-pill overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress ${run.name}`}
          >
            <div
              className={['h-full transition-all duration-500 ease-out', barCls].join(' ')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {run.recordCount !== null ? (
          <div className="text-[10.5px] text-ink-4 mt-1">
            <span className="num font-mono">{run.recordCount.toLocaleString('id-ID')}</span> records
          </div>
        ) : null}
        {run.status === 'FAILED' && run.errorMessage ? (
          <div className="text-[10.5px] text-red-500 mt-1 flex items-start gap-1">
            <Icon name="warn" size={10} aria-hidden />
            <span className="line-clamp-2">{run.errorMessage}</span>
          </div>
        ) : null}
        {isRunning ? (
          <div className="text-[10.5px] text-blue-500 mt-1">Running…</div>
        ) : null}
      </td>
    </tr>
  );
}

/* ─── Alerts tab ─────────────────────────────────────────────────────────── */

interface AlertsTabProps {
  alerts: Alert[];
  onAck: (id: string) => void;
  onOpen: (alert: Alert) => void;
  loading: boolean;
  ackPending: boolean;
}

function AlertsTab({ alerts, onAck, onOpen, loading, ackPending }: AlertsTabProps): JSX.Element {
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
          <span className="num font-semibold text-ink">{visible.length}</span> alert ditampilkan
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
            <RealAlertCard
              key={alert.id}
              alert={alert}
              onAck={onAck}
              onOpen={onOpen}
              ackPending={ackPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── RealAlertCard (for new Alert shape) ────────────────────────────────── */

type AlertSeverity = Alert['severity'];

const ALERT_SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; icon: import('@ghanem/ui').IconName; bg: string; fg: string; border: string }
> = {
  CRITICAL: { label: 'Kritis', icon: 'warn', bg: 'bg-red-100', fg: 'text-red-500', border: 'border-red-100' },
  ERROR: { label: 'Error', icon: 'warn', bg: 'bg-orange-100', fg: 'text-orange-600', border: 'border-orange-100' },
  WARNING: { label: 'Peringatan', icon: 'bell', bg: 'bg-amber-100', fg: 'text-amber-700', border: 'border-amber-100' },
  INFO: { label: 'Info', icon: 'check', bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-100' },
};

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.max(1, Math.floor(ms / 1000))} dtk`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} mnt`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)} jam`;
  return `${Math.floor(ms / 86_400_000)} hari`;
}

function RealAlertCard({
  alert,
  onAck,
  onOpen,
  ackPending,
}: {
  alert: Alert;
  onAck: (id: string) => void;
  onOpen: (alert: Alert) => void;
  ackPending: boolean;
}): JSX.Element {
  const cfg = ALERT_SEVERITY_CONFIG[alert.severity];

  return (
    <article
      className={[
        'flex items-start gap-3 p-3 bg-surface border rounded-3',
        alert.acknowledged ? 'border-line opacity-70' : cfg.border,
        'transition-opacity duration-hf',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'inline-flex items-center justify-center flex-none w-9 h-9 rounded-2',
          cfg.bg,
          cfg.fg,
        ].join(' ')}
      >
        <Icon name={cfg.icon} size={16} aria-hidden />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm text-ink m-0 leading-snug">
            <span className="sr-only">{cfg.label}: </span>
            {alert.title}
          </h3>
          <span className="num text-[11px] text-ink-4 flex-none">
            {formatTimeAgo(alert.createdAt)}
          </span>
        </div>
        <p className="text-xs text-ink-3 mt-0.5 m-0 line-clamp-2">{alert.message}</p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-[10.5px] text-ink-4 font-medium">{alert.source}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpen(alert)}
              className={[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-1 text-[11px] font-semibold',
                'text-blue-600 hover:bg-blue-50',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              ].join(' ')}
            >
              Detail <Icon name="arrowR" size={10} aria-hidden />
            </button>
            {!alert.acknowledged ? (
              <button
                type="button"
                onClick={() => onAck(alert.id)}
                disabled={ackPending}
                aria-label={`Acknowledge ${alert.title}`}
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-1 text-[11px] font-semibold',
                  'text-ink-2 border border-line bg-surface hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                <Icon name="check" size={10} aria-hidden /> Ack
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-4">
                <Icon name="check" size={10} aria-hidden /> Acked
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Jobs log tab (mock) ────────────────────────────────────────────────── */

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

  function fmtSec(sec: number): string {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
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
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 w-24">Status</th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">Pipeline</th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 w-24">Durasi</th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 w-32">Selesai</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((j) => (
              <tr key={j.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                <td className="px-3 py-2">
                  <StatusChip status={j.status === 'success' ? 'completed' : 'failed'}>
                    {j.status === 'success' ? 'Sukses' : 'Gagal'}
                  </StatusChip>
                </td>
                <td className="px-3 py-2">
                  <div className="font-semibold text-sm text-ink">{j.pipelineName}</div>
                  <div className="text-[11px] text-ink-4 mt-0.5">{j.message}</div>
                </td>
                <td className="px-3 py-2 num font-mono text-xs text-ink-3">{fmtSec(j.durationSec)}</td>
                <td className="px-3 py-2 text-xs text-ink-3">
                  {new Date(j.finishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Health tab (mock) ──────────────────────────────────────────────────── */

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
