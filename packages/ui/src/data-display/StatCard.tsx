/**
 * StatCard — kartu metrik compact untuk usage stats / KPI strip.
 *
 * Props:
 *   - `label`: deskripsi singkat (mis. "Unduhan 30 hari")
 *   - `value`: nilai utama (string atau number — number di-format id-ID)
 *   - `change`: optional persentase delta vs periode sebelumnya
 *   - `icon`: optional IconName (lucide-set di @ghanem/ui)
 *   - `size`: `sm` (compact tile) atau `md` (KPI strip)
 *   - `tone`: warna accent untuk icon background
 *
 * A11y:
 *   - Pakai `<article>` dengan `aria-labelledby` ke label heading
 *   - Change indicator: include teks "(naik/turun X%)" untuk SR via sr-only
 *   - Icon decorative → `aria-hidden`
 */
import { type HTMLAttributes } from 'react';
import { Icon, type IconName } from '../icon';

export type StatCardTone = 'green' | 'blue' | 'amber' | 'purple' | 'neutral';
export type StatCardSize = 'sm' | 'md';

export interface StatCardProps extends HTMLAttributes<HTMLElement> {
  /** Label deskriptif (mis. "Unduhan 30 hari"). */
  label: string;
  /** Nilai metrik. Number akan di-format `id-ID`. */
  value: string | number;
  /** Persentase delta — positif naik, negatif turun. */
  change?: number;
  /** Optional unit (mis. "%", "jam"). */
  unit?: string;
  /** Icon dekoratif di pojok kiri. */
  icon?: IconName;
  /** Visual tone. Default `green`. */
  tone?: StatCardTone;
  /** Ukuran kartu. Default `md`. */
  size?: StatCardSize;
}

const toneClasses: Record<StatCardTone, { bg: string; fg: string }> = {
  green: { bg: 'bg-green-50', fg: 'text-green-700' },
  blue: { bg: 'bg-blue-50', fg: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', fg: 'text-amber-700' },
  purple: { bg: 'bg-purple-100', fg: 'text-purple-700' },
  neutral: { bg: 'bg-surface-3', fg: 'text-ink-3' },
};

export function StatCard({
  label,
  value,
  change,
  unit,
  icon,
  tone = 'green',
  size = 'md',
  className = '',
  ...rest
}: StatCardProps): JSX.Element {
  const labelId = `${label.replace(/\s+/g, '-').toLowerCase()}-stat-label`;
  const formatted = typeof value === 'number' ? value.toLocaleString('id-ID') : value;
  const { bg, fg } = toneClasses[tone];

  const containerClasses = [
    'flex items-start gap-3 bg-surface border border-line rounded-3',
    size === 'sm' ? 'p-3' : 'p-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const changeAbs = change !== undefined ? Math.abs(change) : null;
  const changeDir: 'up' | 'down' | 'flat' =
    change === undefined ? 'flat' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const changeColor =
    changeDir === 'up'
      ? 'text-green-700 bg-green-50'
      : changeDir === 'down'
        ? 'text-red-500 bg-red-100'
        : 'text-ink-4 bg-surface-3';
  const changeIcon: IconName = changeDir === 'down' ? 'arrowDown' : 'arrowUp';

  return (
    <article aria-labelledby={labelId} className={containerClasses} {...rest}>
      {icon ? (
        <span
          aria-hidden="true"
          className={[
            'flex-none inline-flex items-center justify-center rounded-2',
            size === 'sm' ? 'w-8 h-8' : 'w-9 h-9',
            bg,
            fg,
          ].join(' ')}
        >
          <Icon name={icon} size={size === 'sm' ? 14 : 16} aria-hidden />
        </span>
      ) : null}
      <div className="flex-1 min-w-0">
        <p id={labelId} className="text-xs text-ink-4 m-0 font-medium uppercase tracking-cap">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
          <span
            className={[
              'num font-display font-bold text-ink',
              size === 'sm' ? 'text-h3' : 'text-h2',
            ].join(' ')}
          >
            {formatted}
            {unit ? <span className="text-h3 text-ink-3 font-medium ml-0.5">{unit}</span> : null}
          </span>
          {changeAbs !== null && changeDir !== 'flat' ? (
            <span
              className={[
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-1',
                'text-[10.5px] font-semibold',
                changeColor,
              ].join(' ')}
            >
              <Icon name={changeIcon} size={9} aria-hidden />
              <span className="num">{changeAbs.toLocaleString('id-ID')}%</span>
              <span className="sr-only">
                {changeDir === 'up' ? 'naik' : 'turun'} {changeAbs}%
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
