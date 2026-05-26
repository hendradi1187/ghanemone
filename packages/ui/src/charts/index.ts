/**
 * Charts module — Recharts-backed cards untuk Dashboard / Analytics.
 *
 * Semua kartu pakai ChartShell (Card + header + loading skeleton + empty state).
 * Color palette dari `chart-colors.ts` (brand tokens — JANGAN tambah hex liar).
 */
export {
  ChartShell,
  type ChartShellProps,
} from './ChartShell';

export {
  LineChartCard,
  type LineChartCardProps,
  type LineSeries,
} from './LineChartCard';

export {
  BarChartCard,
  type BarChartCardProps,
  type BarOrientation,
} from './BarChartCard';

export {
  PieChartCard,
  type PieChartCardProps,
  type PieSlice,
} from './PieChartCard';

export {
  DonutChartCard,
  type DonutChartCardProps,
} from './DonutChartCard';

export {
  CHART_PALETTE,
  CHART_PRIMARY,
  CHART_SECONDARY,
  CHART_GRID,
  CHART_AXIS,
} from './chart-colors';
