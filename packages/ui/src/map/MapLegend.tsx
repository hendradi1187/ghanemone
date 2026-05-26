/**
 * MapLegend — floating bottom-right card untuk show color→category mapping.
 *
 * Stateless: caller pass entries + visible flag. Pakai Tailwind tokens.
 */
import type { HTMLAttributes } from 'react';

export interface LegendEntry {
  /** Label kategori. */
  label: string;
  /** Color swatch (hex atau token CSS-var string). */
  color: string;
  /** Count opsional (mis. 12 dataset). */
  count?: number;
}

export interface MapLegendProps extends HTMLAttributes<HTMLElement> {
  entries: LegendEntry[];
  /** Toggle visibility. Default true. */
  visible?: boolean;
  /** Title legend. Default "Kategori". */
  title?: string;
}

export function MapLegend({
  entries,
  visible = true,
  title = 'Kategori',
  className = '',
  ...rest
}: MapLegendProps): JSX.Element | null {
  if (!visible || entries.length === 0) return null;

  const classes = [
    'bg-surface border border-line rounded-3 shadow-3',
    'p-3 min-w-[180px] max-w-[260px]',
    'text-xs',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside aria-label="Legenda peta" className={classes} {...rest}>
      <p className="text-cap uppercase tracking-cap text-ink-4 font-semibold m-0 mb-2">
        {title}
      </p>
      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {entries.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-3 h-3 rounded-1 flex-none"
              style={{ background: entry.color }}
            />
            <span className="flex-1 text-ink-2 truncate">{entry.label}</span>
            {typeof entry.count === 'number' ? (
              <span className="num text-ink-4 text-[10.5px]">{entry.count}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
