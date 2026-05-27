/**
 * LineChartCard — Recharts LineChart dibungkus ChartShell.
 *
 * Pola: title + optional subtitle + responsive line chart dengan tooltip
 * styled brand. Bisa multi-series (pass `series` array) atau single (default
 * `yKey`).
 *
 * Brand:
 *   - Stroke pakai token (`CHART_PRIMARY` default; multi → CHART_PALETTE)
 *   - Tooltip styled di `chart-colors.ts`
 *   - Grid + axis netral
 *
 * A11y:
 *   - ChartShell sudah pakai `<section>` + `aria-labelledby`
 *   - Recharts SVG tidak fully screen-reader-friendly; caller boleh tambah
 *     table fallback di luar untuk SR (out of scope).
 */
import type { ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_PALETTE,
  CHART_PRIMARY,
} from './chart-colors';
import { ChartShell } from './ChartShell';
import { CustomTooltip } from './CustomTooltip';
import { fontFamilyTokens } from '../tokens';

export interface LineSeries {
  key: string;
  label: string;
  color?: string;
}

export interface LineChartCardProps {
  title: string;
  subtitle?: string;
  /** Data array — caller pass any object shape; Recharts membaca by key. */
  data: ReadonlyArray<object>;
  /** Field untuk X axis (kategori/waktu). */
  xKey: string;
  /** Field untuk Y axis (single-series). Diabaikan kalau `series` diisi. */
  yKey?: string;
  /** Multi-series — kalau diisi, override `yKey`. */
  series?: LineSeries[];
  /** Warna line single-series. Default brand green. */
  color?: string;
  /** Tinggi area chart (px). */
  height?: number;
  /** Loading state. */
  loading?: boolean;
  /** Format value Y (mis. `(v) => v.toLocaleString('id-ID')`). */
  formatValue?: (value: number) => string;
  /** Slot kanan header. */
  rightSlot?: ReactNode;
  /** Class name tambahan. */
  className?: string;
}

export function LineChartCard({
  title,
  subtitle,
  data,
  xKey,
  yKey = 'value',
  series,
  color = CHART_PRIMARY,
  height = 240,
  loading = false,
  formatValue,
  rightSlot,
  className,
}: LineChartCardProps): JSX.Element {
  const empty = !loading && data.length === 0;
  const seriesList: LineSeries[] = series ?? [{ key: yKey, label: yKey, color }];

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
        <LineChart
          // reason: Recharts membaca shape secara loose by key. Cast ke writable
          // array supaya typing internal LineChart tidak komplain.
          data={data as Array<Record<string, unknown>>}
          margin={{ top: 6, right: 12, left: 0, bottom: 4 }}
        >
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
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
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: CHART_GRID, strokeWidth: 1 }}
            formatter={
              formatValue
                ? (value: number | string) =>
                    typeof value === 'number' ? formatValue(value) : String(value)
                : undefined
            }
          />
          {seriesList.map((s, idx) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color ?? CHART_PALETTE[idx % CHART_PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0, fill: s.color ?? CHART_PALETTE[idx % CHART_PALETTE.length] }}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={400}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
