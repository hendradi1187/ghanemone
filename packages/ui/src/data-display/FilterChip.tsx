/**
 * FilterChip — pill yang menampilkan filter aktif (key + value) dengan tombol
 * remove (X). Reusable di Explore, Analytics, Monitoring filters.
 *
 * A11y:
 *   - Render sebagai `<span>` dengan inner `<button>` untuk remove
 *   - Remove button: `aria-label="Hapus filter <key>: <value>"`
 *   - Focus visible ring di remove button
 */
import { forwardRef, type HTMLAttributes } from 'react';
import { Icon } from '../icon';

export type FilterChipTone = 'green' | 'blue' | 'amber' | 'neutral';

export interface FilterChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  /** Label kunci filter — mis. "Kategori". */
  label: string;
  /** Nilai filter — mis. "Seismic". */
  value: string;
  /** Tone visual — default `green`. */
  tone?: FilterChipTone;
  /** Handler tombol remove; bila omit, X button tidak dirender. */
  onRemove?: () => void;
}

const toneMap: Record<FilterChipTone, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  amber: 'bg-amber-100 text-amber-700 border-amber-100',
  neutral: 'bg-surface-3 text-ink-3 border-line',
};

export const FilterChip = forwardRef<HTMLSpanElement, FilterChipProps>(function FilterChip(
  { label, value, tone = 'green', onRemove, className = '', ...rest },
  ref,
) {
  const removeLabel = `Hapus filter ${label}: ${value}`;
  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center gap-1.5',
        'px-2 py-0.5 rounded-pill border',
        'text-[11px] font-medium leading-none whitespace-nowrap',
        toneMap[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span className="text-ink-4 font-medium">{label}:</span>
      <b className="font-semibold">{value}</b>
      {onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={removeLabel}
          title={removeLabel}
          className={[
            'inline-flex items-center justify-center',
            'w-4 h-4 rounded-pill',
            'hover:bg-white/40',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name="x" size={10} aria-hidden />
        </button>
      ) : null}
    </span>
  );
});
