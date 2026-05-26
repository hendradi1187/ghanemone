/**
 * DashboardPage — landing untuk authenticated user, persona-aware.
 *
 * Layout (Phase 8.9, rewrite dari placeholder Phase 8.6):
 *   - Header: greeting "Selamat {time-of-day}, {user}" + persona badge
 *   - Row 1: 4 KPI cards (StatCard dari @ghanem/ui)
 *   - Row 2: charts grid (line trend + bar top providers) + activity feed
 *   - Row 3: pie kategori + donut status + quick actions
 *
 * Data fetching: TanStack Query (semua endpoint mock di-wrapped `api/dashboard.ts`).
 * Responsive: collapses ke single column < 768px (md breakpoint).
 */
import { useMemo, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChartCard,
  DonutChartCard,
  Icon,
  LineChartCard,
  PieChartCard,
  StatCard,
} from '@ghanem/ui';
import {
  fetchActivityFeed,
  fetchCategoryDistribution,
  fetchDatasetTrend,
  fetchKpiSummary,
  fetchProvidersTop5,
  fetchStatusBreakdown,
} from '../api/dashboard';
import { rolePersona, type Persona } from '../mocks/dashboard';
import { useAuth } from '../hooks/use-auth';
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

export function DashboardPage(): ReactElement {
  const { user } = useAuth();
  const persona = rolePersona(user?.role);
  const displayName = user?.fullName ?? user?.email ?? 'Pengguna';
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);

  const kpiQuery = useQuery({
    queryKey: ['dashboard', 'kpi', persona],
    queryFn: () => fetchKpiSummary(persona),
    staleTime: 60_000,
  });
  const trendQuery = useQuery({
    queryKey: ['dashboard', 'trend', 12],
    queryFn: () => fetchDatasetTrend(12),
    staleTime: 60_000,
  });
  const providersQuery = useQuery({
    queryKey: ['dashboard', 'providers-top5'],
    queryFn: fetchProvidersTop5,
    staleTime: 60_000,
  });
  const categoryQuery = useQuery({
    queryKey: ['dashboard', 'category-dist'],
    queryFn: fetchCategoryDistribution,
    staleTime: 60_000,
  });
  const statusQuery = useQuery({
    queryKey: ['dashboard', 'status-breakdown'],
    queryFn: fetchStatusBreakdown,
    staleTime: 60_000,
  });
  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity', 8],
    queryFn: () => fetchActivityFeed(8),
    staleTime: 60_000,
  });

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

      {/* Row 1: KPI grid */}
      <section
        aria-label="Ringkasan KPI"
        className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiQuery.isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface border border-line rounded-3 p-4 h-[88px] animate-skeleton-shimmer"
                aria-busy="true"
                aria-label="Memuat KPI"
              />
            ))
          : kpiQuery.data?.map((kpi) => (
              <StatCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                unit={kpi.unit}
                change={kpi.change}
                icon={kpi.icon}
                tone={kpi.tone}
                size="md"
              />
            ))}
      </section>

      {/* Row 2: 2/3 charts grid + 1/3 activity */}
      <section
        aria-label="Tren dan aktivitas"
        className="grid gap-3 grid-cols-1 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <LineChartCard
            title="Aktivitas Data"
            subtitle="Dataset ditambahkan & diakses per bulan"
            data={trendQuery.data ?? []}
            xKey="month"
            series={[
              { key: 'added', label: 'Ditambahkan' },
              { key: 'accessed', label: 'Diakses' },
            ]}
            height={260}
            loading={trendQuery.isLoading}
            formatValue={fmtInt}
          />
          <BarChartCard
            title="Top 5 Provider"
            subtitle="Berdasarkan jumlah dataset"
            data={(providersQuery.data ?? []).map((p) => ({ name: p.name, count: p.count }))}
            xKey="name"
            yKey="count"
            colors={(providersQuery.data ?? []).map((p) => p.color)}
            orientation="horizontal"
            height={260}
            loading={providersQuery.isLoading}
            formatValue={fmtInt}
          />
        </div>
        <ActivityFeed events={activityQuery.data ?? []} loading={activityQuery.isLoading} />
      </section>

      {/* Row 3: pie kategori + donut status + quick actions */}
      <section
        aria-label="Komposisi dan aksi cepat"
        className="grid gap-3 grid-cols-1 lg:grid-cols-3"
      >
        <PieChartCard
          title="Distribusi Kategori"
          subtitle="Persentase per kategori"
          data={categoryQuery.data ?? []}
          height={300}
          loading={categoryQuery.isLoading}
          formatValue={fmtInt}
        />
        <DonutChartCard
          title="Status Sensitivitas"
          subtitle="Public · Internal · Confidential"
          data={statusQuery.data ?? []}
          height={300}
          loading={statusQuery.isLoading}
          centerLabel="Total"
          formatValue={fmtInt}
        />
        <QuickActions persona={persona} />
      </section>
    </div>
  );
}

export default DashboardPage;
