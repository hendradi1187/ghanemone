/**
 * ChartShell — wrapper Card konsisten untuk semua chart card (Line/Bar/Pie/Donut).
 *
 * Menyediakan:
 *   - Header (title + optional subtitle)
 *   - Body container dengan height fixed (penting untuk Recharts ResponsiveContainer)
 *   - Loading skeleton (shimmer bar) yang menggantikan body, bukan generic spinner
 *   - Empty state default kalau caller pass `empty=true`
 *
 * A11y:
 *   - `<section>` dengan `aria-labelledby` ke heading id stable
 *   - Bila loading: `aria-busy="true"` + `role="status"` di skeleton
 */
import type { HTMLAttributes, ReactNode } from 'react';

export interface ChartShellProps extends HTMLAttributes<HTMLElement> {
  /** Judul kartu (h3). */
  title: string;
  /** Subtitle opsional (caption di bawah title). */
  subtitle?: string;
  /** Tinggi area chart (px). Default 240. */
  height?: number;
  /** Loading state — tampilkan skeleton. */
  loading?: boolean;
  /** Empty state — tampilkan placeholder zero-data. */
  empty?: boolean;
  /** Pesan empty state. Default "Belum ada data". */
  emptyMessage?: string;
  /** Slot di kanan header (mis. period chips). */
  rightSlot?: ReactNode;
  /** Konten chart (Recharts ResponsiveContainer). */
  children: ReactNode;
}

export function ChartShell({
  title,
  subtitle,
  height = 240,
  loading = false,
  empty = false,
  emptyMessage = 'Belum ada data',
  rightSlot,
  children,
  className = '',
  ...rest
}: ChartShellProps): JSX.Element {
  const headingId = `chart-${title.replace(/\s+/g, '-').toLowerCase()}-title`;

  const containerClasses = [
    'bg-surface border border-line rounded-3 p-4',
    'flex flex-col gap-3',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section aria-labelledby={headingId} className={containerClasses} {...rest}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="font-display font-semibold text-h3 text-ink m-0 truncate"
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="text-xs text-ink-4 m-0 mt-0.5">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="flex-none">{rightSlot}</div> : null}
      </header>

      <div className="relative flex-1 min-w-0" style={{ height }}>
        {loading ? (
          <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className="absolute inset-0 flex items-end gap-2"
          >
            <span className="sr-only">Memuat chart…</span>
            {[40, 65, 55, 75, 50, 80, 60, 70, 45, 85, 65, 90].map((h, idx) => (
              <span
                key={idx}
                aria-hidden="true"
                className="flex-1 bg-surface-3 rounded-1 animate-skeleton-shimmer"
                style={{
                  height: `${h}%`,
                  backgroundImage:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.7) 50%, transparent 100%)',
                  backgroundColor: 'var(--tw-bg-opacity, #f1ede4)',
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </div>
        ) : empty ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-4">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
