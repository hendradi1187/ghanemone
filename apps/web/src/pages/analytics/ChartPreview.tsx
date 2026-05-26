/**
 * ChartPreview — render chart sesuai query result.
 *
 * Mapping `QueryResult.rows` → shape yang diterima @ghanem/ui chart cards:
 *   - line/bar: `[{ label, value }]` dengan xKey='label', yKey='value'
 *   - pie/donut: `[{ name, value }]`
 *
 * States:
 *   - loading: ChartShell built-in skeleton
 *   - error (`result.valid = false`): EmptyState variant="error"
 *   - empty (no rows): EmptyState variant="no-data"
 *   - rendered: chart card sesuai chartType
 */
import { useMemo } from 'react';
import {
  BarChartCard,
  DonutChartCard,
  EmptyState,
  LineChartCard,
  PieChartCard,
} from '@ghanem/ui';
import type { AnalyticsQuery, QueryResult } from '../../mocks/analytics';

export interface ChartPreviewProps {
  /** Query result (atau null kalau belum dijalankan). */
  result: QueryResult | null;
  /** Query yang menghasilkan result (untuk titles + labels). */
  query: AnalyticsQuery | null;
  /** Loading state. */
  loading: boolean;
}

function buildTitle(query: AnalyticsQuery | null): { title: string; subtitle: string } {
  if (!query) return { title: 'Preview', subtitle: 'Pilih dataset + atribut, lalu jalankan.' };
  const agg = query.aggregation;
  const aggLabel = agg.charAt(0).toUpperCase() + agg.slice(1);
  return {
    title: `${aggLabel} ${query.yAxis} per ${query.xAxis}`,
    subtitle: `Dataset: ${query.datasetId}`,
  };
}

function fmtInt(n: number): string {
  return n.toLocaleString('id-ID');
}

export function ChartPreview({ result, query, loading }: ChartPreviewProps): JSX.Element {
  const { title, subtitle } = useMemo(() => buildTitle(query), [query]);

  // Belum ada query yang di-run.
  if (!query && !loading) {
    return (
      <EmptyState
        variant="no-data"
        icon="chart"
        title="Belum ada chart"
        description="Lengkapi query builder di atas, lalu hasil chart akan muncul di sini."
      />
    );
  }

  // Result invalid (validation error from runner).
  if (result && !result.valid) {
    return (
      <EmptyState
        variant="error"
        title="Query tidak valid"
        description={result.errorMessage ?? 'Periksa field X / Y / agregasi.'}
      />
    );
  }

  // Map data shape sesuai chart type.
  const safeRows = result?.rows ?? [];
  const lineBarData = safeRows.map((r) => ({ label: r.label, value: r.value }));
  const pieData = safeRows.map((r) => ({ name: r.label, value: r.value }));

  switch (query?.chartType) {
    case 'line':
      return (
        <LineChartCard
          title={title}
          subtitle={subtitle}
          data={lineBarData}
          xKey="label"
          yKey="value"
          loading={loading}
          height={320}
          formatValue={fmtInt}
        />
      );
    case 'bar':
      return (
        <BarChartCard
          title={title}
          subtitle={subtitle}
          data={lineBarData}
          xKey="label"
          yKey="value"
          loading={loading}
          height={320}
          orientation="horizontal"
          formatValue={fmtInt}
        />
      );
    case 'pie':
      return (
        <PieChartCard
          title={title}
          subtitle={subtitle}
          data={pieData}
          loading={loading}
          height={320}
          formatValue={fmtInt}
        />
      );
    case 'donut':
      return (
        <DonutChartCard
          title={title}
          subtitle={subtitle}
          data={pieData}
          loading={loading}
          height={320}
          centerLabel="Total"
          centerValue={result?.totalValue ?? 0}
          formatValue={fmtInt}
        />
      );
    default:
      // Loading initial state without query.
      return (
        <LineChartCard
          title={title}
          subtitle={subtitle}
          data={[]}
          xKey="label"
          loading={loading}
          height={320}
        />
      );
  }
}

/* ─── Export helpers ─────────────────────────────────────────────────── */

/**
 * Export result rows ke CSV string. Header `label,value,comparison?`.
 *
 * Trigger download via temporary <a download>. Tidak dependent ke library
 * eksternal. Memilih CSV vs Excel karena interoperability + zero dep.
 */
export function exportResultAsCsv(filename: string, result: QueryResult): void {
  if (!result.valid || result.rows.length === 0) return;
  const hasComparison = result.rows.some((r) => typeof r.comparison === 'number');
  const header = hasComparison ? 'label,value,comparison\n' : 'label,value\n';
  const body = result.rows
    .map((r) => {
      const safeLabel = `"${r.label.replace(/"/g, '""')}"`;
      return hasComparison
        ? `${safeLabel},${r.value},${r.comparison ?? ''}`
        : `${safeLabel},${r.value}`;
    })
    .join('\n');
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
