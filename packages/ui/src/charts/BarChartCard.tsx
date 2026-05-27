/**
 * BarChartCard — Recharts BarChart dibungkus ChartShell.
 *
 * Default horizontal (provider names di Y, count di X) — lebih readable untuk
 * label panjang. Bisa diubah ke vertical via `orientation="vertical"`.
 */
import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_PRIMARY,
} from './chart-colors';
import { ChartShell } from './ChartShell';
import { CustomTooltip } from './CustomTooltip';
import { fontFamilyTokens } from '../tokens';

export type BarOrientation = 'horizontal' | 'vertical';

export interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: ReadonlyArray<object>;
  /** Kategori (label). */
  xKey: string;
  /** Value field. */
  yKey: string;
  /** Default 'horizontal' (label di sumbu Y, bar memanjang ke kanan). */
  orientation?: BarOrientation;
  /** Single color (semua bar). */
  color?: string;
  /** Per-bar warna — kalau diisi, override `color`. Indeks mengikuti data. */
  colors?: ReadonlyArray<string>;
  height?: number;
  loading?: boolean;
  formatValue?: (value: number) => string;
  rightSlot?: ReactNode;
  className?: string;
}

export function BarChartCard({
  title,
  subtitle,
  data,
  xKey,
  yKey,
  orientation = 'horizontal',
  color = CHART_PRIMARY,
  colors,
  height = 240,
  loading = false,
  formatValue,
  rightSlot,
  className,
}: BarChartCardProps): JSX.Element {
  const empty = !loading && data.length === 0;
  const isHorizontal = orientation === 'horizontal';

  return (
    <ChartShell
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      empty={empty}
      rightSlot={rightSlot}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data as Array<Record<string, unknown>>}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 6, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            stroke={CHART_GRID}
            strokeDasharray="3 3"
            horizontal={!isHorizontal}
            vertical={isHorizontal}
          />
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fill: CHART_AXIS, fontSize: 11, fontFamily: fontFamilyTokens.sans }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
                tickFormatter={formatValue}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={{ fill: CHART_AXIS, fontSize: 11, fontFamily: fontFamilyTokens.sans }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
                width={120}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fill: CHART_AXIS, fontSize: 11, fontFamily: fontFamilyTokens.sans }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
              />
              <YAxis
                tick={{ fill: CHART_AXIS, fontSize: 11, fontFamily: fontFamilyTokens.sans }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
                tickFormatter={formatValue}
                width={40}
              />
            </>
          )}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: CHART_GRID, opacity: 0.3 }}
            formatter={
              formatValue
                ? (value: number | string) =>
                    typeof value === 'number' ? formatValue(value) : String(value)
                : undefined
            }
          />
          <Bar
            dataKey={yKey}
            fill={color}
            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            isAnimationActive
            animationDuration={400}
          >
            {colors
              ? data.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length] ?? color} />
                ))
              : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
