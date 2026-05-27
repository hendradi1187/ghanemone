/**
 * DashboardPage — landing untuk authenticated user, persona-aware.
 *
 * Sprint 9.5 Phase 2: All KPI cards AND charts now use real backend data.
 *
 * KPI Row 1 sources (useStatsOverview — single call):
 *   totalDatasets, totalProviders, pendingApprovals, totalWells
 *
 * Charts Row 2:
 *   - LineChartCard "Tren Upload Dataset" → useDatasetsByMonth()
 *   - BarChartCard "Upload per Provider" → useUploadsByProvider() top 5
 *
 * Charts Row 3:
 *   - PieChartCard "Distribusi Kategori" → useDatasetsByCategory()
 *   - DonutChartCard "Status Compliance" → useComplianceStatus()
 *
 * Recent Uploads remains via useDashboardStats (GET /datasets?sortBy=createdAt).
 * Activity feed remains mock (no server endpoint yet).
 *
 * Layout:
 *   - Header: greeting + persona badge
 *   - Row 1: 4 KPI stat cards
 *   - Row 2: 2/3 charts + 1/3 activity
 *   - Row 3: pie + donut + quick actions
 */
import { useMemo, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChartCard,
  DonutChartCard,
  Icon,
  LineChartCard,
  PieChartCard,
  StatCard,
} from '@ghanem/ui';
import { fetchActivityFeed } from '../api/dashboard';
import { rolePersona, type Persona } from '../mocks/dashboard';
import { useAuth } from '../hooks/use-auth';
import { useDashboardStats } from '../hooks/useDashboard';
import {
  useStatsOverview,
  useDatasetsByCategory,
  useDatasetsByMonth,
  useUploadsByProvider,
  useComplianceStatus,
} from '../hooks/useStats';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { QuickActions } from './dashboard/QuickActions';

const PERSONA_LABEL: Record<Persona, string> = {
  regulator: 'Regulator',
  kkks_operator: 'KKKS Operator',
  analyst: 'Analyst',
};

const PERSONA_TONE: Record<Persona, { bg: string; fg: string }> = {
  regulator: { bg: 'bg-blue-50', fg: 'text-blue-600' },
  kkks_operator: { bg: 'bg-green-50', fg: 'text-green-700' },
  analyst: { bg: 'bg-purple-100', fg: 'text-purple-500' },
};

function greetingForHour(hour: number): string {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function fmtInt(value: number): string {
  return value.toLocaleString('id-ID');
}

// Palette for bar chart bars (top 5 providers).
const PROVIDER_COLORS = [
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export function DashboardPage(): ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();
  const persona = rolePersona(user?.role);
  const displayName = user?.fullName ?? user?.email ?? 'Pengguna';
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);

  /* ── Phase 2: Real KPI from /stats/overview ──────────────────────── */
  const overviewQuery = useStatsOverview();

  /* ── Fallback: useDashboardStats for recent uploads ───────────────── */
  const { recentUploads, isLoading: uploadsLoading } = useDashboardStats();

  /* ── Real chart data from /stats/* ───────────────────────────────── */
  const monthlyQuery = useDatasetsByMonth();
  const categoryQuery = useDatasetsByCategory();
  const providerQuery = useUploadsByProvider();
  const complianceQuery = useComplianceStatus();

  /* ── Mock activity feed (no endpoint yet) ────────────────────────── */
  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity', 8],
    queryFn: () => fetchActivityFeed(8),
    staleTime: 60_000,
  });

  /* ── Derived data ─────────────────────────────────────────────────── */

  const kpiLoading = overviewQuery.isLoading;
  const overview = overviewQuery.data;

  // Monthly trend → LineChart series with single "count" series.
  const monthlyData = useMemo(
    () => (monthlyQuery.data ?? []).map((d) => ({ month: d.label, count: d.count })),
    [monthlyQuery.data],
  );

  // Top 5 providers → BarChart.
  const top5Providers = useMemo(
    () =>
      (providerQuery.data ?? [])
        .slice(0, 5)
        .map((p) => ({ name: p.providerName, count: p.count })),
    [providerQuery.data],
  );

  // Category distribution → PieChart: { name, value }.
  const categoryData = useMemo(
    () => (categoryQuery.data ?? []).map((c) => ({ name: c.label, value: c.count })),
    [categoryQuery.data],
  );

  // Compliance → DonutChart: { name, value }.
  const complianceData = useMemo(() => {
    const d = complianceQuery.data;
    if (!d) return [];
    return [
      { name: 'Approved', value: d.approved },
      { name: 'Draft', value: d.draft },
      { name: 'Pending Review', value: d.pendingReview },
      { name: 'Rejected', value: d.rejected },
      { name: 'Archived', value: d.archived },
    ].filter((s) => s.value > 0);
  }, [complianceQuery.data]);

  const tone = PERSONA_TONE[persona];

  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-cap text-green-700 uppercase tracking-cap mb-1">SPEKTRUM · Dashboard</p>
          <h1 className="font-display font-bold text-h1 text-ink m-0">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-ink-4 mt-1 m-0">
            Ringkasan ekosistem data — semua KKKS terhubung melalui SPEKTRUM Dataspace.
          </p>
        </div>
        <span
          className={[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill',
            'text-[11px] font-semibold uppercase tracking-cap',
            tone.bg,
            tone.fg,
          ].join(' ')}
        >
          <Icon name="user" size={11} aria-hidden /> {PERSONA_LABEL[persona]}
        </span>
      </header>

      {/* Row 1: KPI grid — real data from /stats/overview */}
      <section
        aria-label="Ringkasan KPI"
        className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface border border-line rounded-3 p-4 h-[88px] animate-pulse"
                aria-busy="true"
                aria-label="Memuat KPI"
              />
            ))
          : (
            <>
              <StatCard
                label="Total Dataset"
                value={fmtInt(overview?.totalDatasets ?? 0)}
                icon="database"
                tone="green"
                size="md"
              />
              <StatCard
                label="Provider Aktif"
                value={fmtInt(overview?.totalProviders ?? 0)}
                icon="user"
                tone="blue"
                size="md"
              />
              <StatCard
                label="Pending Approval"
                value={fmtInt(overview?.pendingApprovals ?? 0)}
                icon="clock"
                tone="amber"
                size="md"
              />
              <StatCard
                label="Total Sumur"
                value={fmtInt(overview?.totalWells ?? 0)}
                icon="database"
                tone="purple"
                size="md"
              />
            </>
          )}
      </section>

      {/* Additional KPI row — new fields from overview */}
      {overview ? (
        <section
          aria-label="KPI tambahan"
          className="grid gap-3 grid-cols-2 sm:grid-cols-4"
        >
          <StatCard
            label="Work Areas"
            value={fmtInt(overview.totalWorkAreas)}
            icon="map"
            tone="green"
            size="sm"
          />
          <StatCard
            label="Fasilitas"
            value={fmtInt(overview.totalFacilities)}
            icon="database"
            tone="blue"
            size="sm"
          />
          <StatCard
            label="Pertumbuhan Bulan Ini"
            value={`+${overview.growthLastMonth}`}
            unit=" dataset"
            icon="activity"
            tone="green"
            size="sm"
          />
          <StatCard
            label="Alert Aktif"
            value={fmtInt(overview.activeAlerts)}
            icon="warn"
            tone={overview.activeAlerts > 0 ? 'amber' : 'neutral'}
            size="sm"
          />
        </section>
      ) : null}

      {/* Recent Uploads section */}
      {!uploadsLoading && recentUploads.length > 0 ? (
        <section
          aria-label="Upload terbaru"
          className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-3"
        >
          <h3 className="font-display font-semibold text-h3 text-ink m-0">Upload Terbaru</h3>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {recentUploads.map((upload) => (
              <li key={upload.id}>
                <button
                  type="button"
                  onClick={() => void navigate(`/datasets/${upload.id}`)}
                  className={[
                    'w-full flex items-center gap-3 py-2 px-2 rounded-2 text-left',
                    'hover:bg-surface-2 transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-2 bg-green-50 text-green-700 flex-none"
                  >
                    <Icon name="database" size={14} aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-ink truncate">{upload.title}</p>
                    <p className="m-0 text-xs text-ink-4">
                      {upload.provider} · {upload.category}
                    </p>
                  </div>
                  <Icon name="arrowR" size={12} className="text-ink-4 flex-none" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Row 2: 2/3 charts + 1/3 activity */}
      <section
        aria-label="Tren dan aktivitas"
        className="grid gap-3 grid-cols-1 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <LineChartCard
            title="Tren Upload Dataset"
            subtitle="Jumlah dataset per bulan (12 bulan terakhir)"
            data={monthlyData}
            xKey="month"
            series={[{ key: 'count', label: 'Dataset' }]}
            height={260}
            loading={monthlyQuery.isLoading}
            formatValue={fmtInt}
          />
          <BarChartCard
            title="Upload per Provider"
            subtitle="Top 5 KKKS berdasarkan jumlah dataset"
            data={top5Providers}
            xKey="name"
            yKey="count"
            colors={PROVIDER_COLORS}
            orientation="horizontal"
            height={260}
            loading={providerQuery.isLoading}
            formatValue={fmtInt}
          />
        </div>
        <ActivityFeed events={activityQuery.data ?? []} loading={activityQuery.isLoading} />
      </section>

      {/* Row 3: pie kategori + donut compliance + quick actions */}
      <section
        aria-label="Komposisi dan aksi cepat"
        className="grid gap-3 grid-cols-1 lg:grid-cols-3"
      >
        <PieChartCard
          title="Distribusi Kategori"
          subtitle="Persentase per kategori dataset"
          data={categoryData}
          height={300}
          loading={categoryQuery.isLoading}
          formatValue={fmtInt}
        />
        <DonutChartCard
          title="Status Compliance"
          subtitle="Approved · Pending · Draft · Rejected"
          data={complianceData}
          height={300}
          loading={complianceQuery.isLoading}
          centerLabel="Total"
          formatValue={fmtInt}
        />
        <QuickActions persona={persona} />
      </section>
    </div>
  );
}

export default DashboardPage;
