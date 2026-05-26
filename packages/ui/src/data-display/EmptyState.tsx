/**
 * EmptyState — placeholder UI saat tidak ada konten / no results / error.
 *
 * Port dari `EmptyState` di `prototype-states.jsx:66-109`.
 *
 * Variants:
 *   - `no-data`:    state default. Belum ada data — show generic icon.
 *   - `no-results`: filter/search return 0 hits — show search icon + "reset" CTA.
 *   - `error`:      generic error fallback — red tone + retry CTA.
 *
 * A11y:
 *   - `role="status"` (no-data / no-results) atau `role="alert"` (error)
 *   - Heading: `<h3>` semantic (gunakan dalam section context)
 *   - CTAs: full button semantic dengan keyboard support
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../icon';

export type EmptyStateVariant = 'no-data' | 'no-results' | 'error';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: IconName;
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant. Default `no-data`. */
  variant?: EmptyStateVariant;
  /** Override icon. Default tergantung variant. */
  icon?: IconName;
  /** Heading (1 baris pendek). */
  title: string;
  /** Body penjelasan — optional, mendukung ReactNode untuk inline emphasize. */
  description?: ReactNode;
  /** Primary CTA. */
  action?: EmptyStateAction;
  /** Secondary CTA. */
  secondaryAction?: EmptyStateAction;
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: IconName; role: 'status' | 'alert'; iconBg: string; iconFg: string }
> = {
  'no-data': {
    icon: 'database',
    role: 'status',
    iconBg: 'bg-surface-3',
    iconFg: 'text-ink-4',
  },
  'no-results': {
    icon: 'search',
    role: 'status',
    iconBg: 'bg-green-50',
    iconFg: 'text-green-600',
  },
  error: {
    icon: 'warn',
    role: 'alert',
    iconBg: 'bg-red-100',
    iconFg: 'text-red-500',
  },
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    variant = 'no-data',
    icon,
    title,
    description,
    action,
    secondaryAction,
    className = '',
    ...rest
  },
  ref,
) {
  const cfg = variantConfig[variant];
  const resolvedIcon = icon ?? cfg.icon;

  return (
    <div
      ref={ref}
      role={cfg.role}
      className={[
        'flex flex-col items-center justify-center text-center',
        'gap-3 px-6 py-10',
        'bg-surface border border-line rounded-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={[
          'inline-flex items-center justify-center',
          'w-12 h-12 rounded-pill',
          cfg.iconBg,
        ].join(' ')}
      >
        <Icon name={resolvedIcon} size={22} className={cfg.iconFg} aria-hidden />
      </span>
      <div className="flex flex-col gap-1 max-w-md">
        <h3 className="font-display font-semibold text-h3 text-ink m-0">{title}</h3>
        {description ? (
          <div className="text-sm text-ink-4">{description}</div>
        ) : null}
      </div>
      {action || secondaryAction ? (
        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className={[
                'inline-flex items-center justify-center gap-2',
                'h-9 px-4 rounded-2',
                'border bg-green-500 border-green-600 text-white',
                'font-medium text-sm',
                'transition-colors duration-hf',
                'hover:bg-green-600 active:bg-green-700',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              ].join(' ')}
            >
              {action.icon ? <Icon name={action.icon} size={14} aria-hidden /> : null}
              {action.label}
            </button>
          ) : null}
          {secondaryAction ? (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={[
                'inline-flex items-center justify-center gap-2',
                'h-9 px-4 rounded-2',
                'border bg-surface border-line text-ink-2',
                'font-medium text-sm',
                'transition-colors duration-hf',
                'hover:bg-surface-2',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              ].join(' ')}
            >
              {secondaryAction.icon ? (
                <Icon name={secondaryAction.icon} size={14} aria-hidden />
              ) : null}
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
