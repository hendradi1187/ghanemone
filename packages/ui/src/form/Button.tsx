/**
 * Button — variant-driven action button.
 *
 * Variants:
 *   - `primary`: brand green, white text. CTA default.
 *   - `secondary`: surface bg, ink text, line border. Lower emphasis.
 *   - `ghost`: transparent, hover surface. Tertiary, dipakai di toolbar.
 *   - `danger`: red, white text. Destructive actions (delete, revoke).
 *
 * Loading state:
 *   - `aria-busy={true}` saat loading
 *   - Spinner di kiri menggantikan `leftIcon` (atau prepend kalau tidak ada icon)
 *   - Button di-disable (cannot double-submit)
 *   - Text tetap visible tapi dim (mempertahankan width — no layout shift)
 *
 * A11y:
 *   - Native `<button>` semantik
 *   - Icon-only mode (no children): caller harus pass `aria-label`
 *   - Disabled state: `cursor-not-allowed` + opacity 60
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. Default `primary`. */
  variant?: ButtonVariant;
  /** Size — affects height + padding + text. Default `md`. */
  size?: ButtonSize;
  /** Loading state. Disables button + shows spinner. */
  loading?: boolean;
  /** Icon di kiri (replaced oleh spinner saat loading). */
  leftIcon?: IconName;
  /** Icon di kanan. */
  rightIcon?: IconName;
  /** Full-width button. Default false. */
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'bg-green-500 text-white border-green-600 hover:bg-green-600 active:bg-green-700',
  secondary:
    'bg-surface text-ink border-line hover:bg-surface-2 active:bg-surface-3',
  ghost:
    'bg-transparent text-ink-2 border-transparent hover:bg-surface-2 active:bg-surface-3',
  danger:
    'bg-red-500 text-white border-red-700 hover:bg-red-700 active:bg-red-700',
};

const sizeMap: Record<ButtonSize, { container: string; iconSize: number }> = {
  sm: { container: 'h-8 px-3 text-xs gap-1.5', iconSize: 14 },
  md: { container: 'h-10 px-4 text-sm gap-2', iconSize: 16 },
  lg: { container: 'h-12 px-5 text-h3 gap-2', iconSize: 18 },
};

/** Inline spinner — pure SVG, no external dep. */
function Spinner({ size }: { size: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="animate-spin"
      style={{ flex: '0 0 auto' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = '',
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const sizeCfg = sizeMap[size];
  const isDisabled = disabled || loading;

  const classes = [
    'inline-flex items-center justify-center',
    'border rounded-2 font-medium',
    'transition-colors duration-hf ease-hf',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
    sizeCfg.container,
    variantMap[variant],
    fullWidth ? 'w-full' : '',
    loading ? 'cursor-wait' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Spinner menggantikan leftIcon — kalau tidak ada leftIcon original, spinner tetap muncul di kiri.
  const leftAdornment = loading ? (
    <Spinner size={sizeCfg.iconSize} />
  ) : leftIcon ? (
    <Icon name={leftIcon} size={sizeCfg.iconSize} aria-hidden="true" />
  ) : null;

  const rightAdornment = !loading && rightIcon ? (
    <Icon name={rightIcon} size={sizeCfg.iconSize} aria-hidden="true" />
  ) : null;

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {leftAdornment}
      {children !== undefined && children !== null ? (
        <span className={loading ? 'opacity-80' : ''}>{children}</span>
      ) : null}
      {rightAdornment}
    </button>
  );
});
