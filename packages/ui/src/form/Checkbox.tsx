/**
 * Checkbox — Radix Checkbox wrapper dengan brand styling.
 *
 * Radix sudah handle keyboard (Space toggles), focus management, dan `role="checkbox"`.
 * Wrapper ini hanya re-style untuk konsisten dengan token + ekspor `forwardRef` yang
 * RHF-friendly (Controller compatible).
 *
 * A11y:
 *   - `aria-checked` di-handle Radix
 *   - `aria-invalid` di-set via prop, untuk visual error border
 *   - Label association: gunakan FormLabel + share id, atau wrap dengan <label>
 */
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild'> {
  /** Visual error state — red border. */
  invalid?: boolean;
  /** Optional inline label rendered di kanan checkbox. */
  label?: ReactNode;
  /** Size — `sm` 14px, `md` 16px (default), `lg` 20px. */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: 'h-3.5 w-3.5', icon: 10 },
  md: { box: 'h-4 w-4', icon: 12 },
  lg: { box: 'h-5 w-5', icon: 14 },
} as const;

/** Check icon — pure inline SVG, no external dep. */
function CheckIcon({ size }: { size: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(function Checkbox({ invalid = false, label, size = 'md', className = '', id, ...rest }, ref) {
  const sizeCfg = sizeMap[size];
  const boxClasses = [
    'inline-flex items-center justify-center',
    'rounded-1 border bg-surface',
    'transition-colors duration-fast ease-hf',
    'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-600 data-[state=checked]:text-white',
    'data-[state=indeterminate]:bg-green-500 data-[state=indeterminate]:border-green-600 data-[state=indeterminate]:text-white',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    invalid ? 'border-red-500' : 'border-line-2',
    sizeCfg.box,
  ]
    .filter(Boolean)
    .join(' ');

  const root = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={id}
      className={boxClasses}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon size={sizeCfg.icon} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) {
    return <span className={className}>{root}</span>;
  }

  // Inline label wrapper — clickable area termasuk text.
  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex items-center gap-2 cursor-pointer select-none',
        'text-sm text-ink-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {root}
      <span>{label}</span>
    </label>
  );
});
