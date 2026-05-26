/**
 * DonutChartCard — Recharts PieChart dengan inner radius (donut).
 *
 * Menampilkan center label berupa total (atau `centerValue` override).
 * Cocok untuk komposisi (mis. status sensitivity / data type).
 */
import type { ReactNode } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  CHART_PALETTE,
  CHART_SURFACE,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
} from './chart-colors';
import { ChartShell } from './ChartShell';
import type { PieSlice } from './PieChartCard';

export interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data: PieSlice[];
  height?: number;
  loading?: boolean;
  /** Tampilkan legend di bawah. Default true. */
  showLegend?: boolean;
  /** Override center value (default = sum of values). */
  centerValue?: string | number;
  /** Label kecil di bawah center value. Default "Total". */
  centerLabel?: string;
  formatValue?: (value: number) => string;
  rightSlot?: ReactNode;
  className?: string;
}

export function DonutChartCard({
  title,
  subtitle,
  data,
  height = 260,
  loading = false,
  showLegend = true,
  centerValue,
  centerLabel = 'Total',
  formatValue,
  rightSlot,
  className,
}: DonutChartCardProps): JSX.Element {
  const empty = !loading && data.length === 0;
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const displayCenter =
    centerValue ?? (formatValue ? formatValue(total) : total.toLocaleString('id-ID'));

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
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy={showLegend ? '42%' : '50%'}
              outerRadius="72%"
              innerRadius="48%"
              stroke={CHART_SURFACE}
              strokeWidth={2}
              isAnimationActive
              animationDuration={400}
            >
              {data.map((slice, idx) => (
                <Cell
                  key={slice.name}
                  fill={slice.color ?? CHART_PALETTE[idx % CHART_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={
                formatValue
                  ? (value: number | string) =>
                      typeof value === 'number' ? formatValue(value) : String(value)
                  : undefined
              }
            />
            {showLegend ? (
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>
        {/* Center label overlay (decorative — value sudah ada di tooltip + legend). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: showLegend ? '16%' : 0 }}
        >
          <span className="font-display font-bold text-h2 text-ink num leading-tight">
            {displayCenter}
          </span>
          <span className="text-[10.5px] uppercase tracking-cap text-ink-4 font-semibold mt-0.5">
            {centerLabel}
          </span>
        </div>
      </div>
    </ChartShell>
  );
}
