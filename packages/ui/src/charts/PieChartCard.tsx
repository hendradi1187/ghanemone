/**
 * PieChartCard — Recharts PieChart dibungkus ChartShell.
 *
 * Legend di bawah, slice colors dari `CHART_PALETTE` atau caller-provided.
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

export interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: PieSlice[];
  height?: number;
  loading?: boolean;
  /** Tampilkan legend di bawah. Default true. */
  showLegend?: boolean;
  formatValue?: (value: number) => string;
  rightSlot?: ReactNode;
  className?: string;
}

export function PieChartCard({
  title,
  subtitle,
  data,
  height = 260,
  loading = false,
  showLegend = true,
  formatValue,
  rightSlot,
  className,
}: PieChartCardProps): JSX.Element {
  const empty = !loading && data.length === 0;

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
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy={showLegend ? '42%' : '50%'}
            outerRadius="72%"
            innerRadius={0}
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
    </ChartShell>
  );
}
