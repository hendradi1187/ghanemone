/**
 * Badge / StatusChip — compact label chip untuk status dan kategori.
 *
 * API:
 *   <Badge variant="success" size="sm" dot>Active</Badge>
 *   <Badge variant="warning" size="md" leadingIcon={<AlertTriangle size={10} />}>Draft</Badge>
 *   <StatusChip status="running">Processing…</StatusChip>  (animated pulse dot)
 *
 * Variants: default | success | warning | danger | info | neutral | brand
 * Sizes: sm | md
 *
 * Semua warna dari design tokens (tailwind-base.ts). Zero hex hardcoded.
 *
 * A11y:
 *   - Rendered sebagai `<span>` (inline presentational) — tidak menjadi focusable
 *   - Bila dipakai sebagai status indicator, wrapper harus provide context via
 *     aria-label pada elemen induk atau nearby text.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'brand';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant. Default `default`. */
  variant?: BadgeVariant;
  /** Size. Default `sm`. */
  size?: BadgeSize;
  /** Tampilkan animated dot di depan text (pakai untuk status live / processing). */
  dot?: boolean;
  /** Custom leading element (icon component, atau ReactNode lain). */
  leadingIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-ink-2 border-line',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-100',
  danger: 'bg-red-100 text-red-500 border-red-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
  neutral: 'bg-surface-3 text-ink-3 border-line',
  brand: 'bg-green-500 text-white border-green-600',
};

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-ink-4',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-ink-5',
  brand: 'bg-white',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10.5px] gap-1',
  md: 'px-2 py-1 text-xs gap-1.5',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  leadingIcon,
  children,
  className = '',
  ...rest
}: BadgeProps): JSX.Element {
  const classes = [
    'inline-flex items-center rounded-pill border',
    'font-semibold leading-none tracking-wide',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {dot ? (
        <span
          aria-hidden="true"
          className={[
            'inline-block rounded-full flex-none',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotClasses[variant],
          ].join(' ')}
        />
      ) : null}
      {leadingIcon ? (
        <span aria-hidden="true" className="inline-flex flex-none">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/* ─── StatusChip ──────────────────────────────────────────────────────── */

export type StatusChipStatus =
  | 'running'
  | 'processing'
  | 'queued'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'public'
  | 'internal'
  | 'confidential';

export interface StatusChipProps extends Omit<BadgeProps, 'variant' | 'dot'> {
  /** Semantic status — maps to BadgeVariant + dot animation. */
  status: StatusChipStatus;
}

const statusVariantMap: Record<StatusChipStatus, BadgeVariant> = {
  running: 'info',
  processing: 'info',
  queued: 'neutral',
  completed: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  public: 'success',
  internal: 'warning',
  confidential: 'danger',
};

/** Status values yang perlu animated pulse dot (operasi sedang berlangsung). */
const pulsingStatuses = new Set<StatusChipStatus>(['running', 'processing']);

/**
 * StatusChip — Badge khusus untuk status semantik.
 *
 * Running + Processing mendapat animated pulse dot untuk indikasi operasi live.
 * Semua status lain mendapat static dot.
 *
 * Usage:
 *   <StatusChip status="running">Running</StatusChip>
 *   <StatusChip status="completed">Completed</StatusChip>
 *   <StatusChip status="confidential" size="md">Confidential</StatusChip>
 */
export function StatusChip({
  status,
  size = 'sm',
  children,
  className = '',
  ...rest
}: StatusChipProps): JSX.Element {
  const variant = statusVariantMap[status];
  const isPulsing = pulsingStatuses.has(status);

  const classes = [
    'inline-flex items-center rounded-pill border',
    'font-semibold leading-none tracking-wide',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dotColor = dotClasses[variant];
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={classes} {...rest}>
      <span
        aria-hidden="true"
        className={[
          'inline-block rounded-full flex-none relative',
          dotSize,
          dotColor,
        ].join(' ')}
      >
        {isPulsing ? (
          <span
            aria-hidden="true"
            className={[
              'absolute inset-0 rounded-full animate-ping opacity-75',
              dotColor,
            ].join(' ')}
          />
        ) : null}
      </span>
      {children}
    </span>
  );
}
