/**
 * Card — surface container dengan border + shadow yang konsisten.
 *
 * Port dari `.hf .card` di hifi-tokens.css (line 145-152). Elevation variant
 * dipetakan ke shadow tokens 1-3.
 *
 * Examples:
 *   <Card>…</Card>                       // default elevation 1
 *   <Card elevation="2">…</Card>         // medium elevation
 *   <Card elevation="flat">…</Card>      // no shadow (border only)
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Shadow depth — `1` (default) | `2` (elevated) | `3` (modal-ish) | `flat` (no shadow). */
  elevation?: '1' | '2' | '3' | 'flat';
  /** Padding internal — pakai Tailwind `p-{n}` step. Default `4` (16px). */
  padding?: '0' | '2' | '3' | '4' | '5' | '6';
  /** Border-radius step. Default `3` (8px) — match `.hf .card`. */
  radius?: '1' | '2' | '3' | '4';
  /** Interactive variant — adds hover state untuk clickable cards. */
  interactive?: boolean;
  children?: ReactNode;
}

const elevationMap = {
  '1': 'shadow-1',
  '2': 'shadow-2',
  '3': 'shadow-3',
  flat: 'shadow-none',
} as const;

const paddingMap = {
  '0': 'p-0',
  '2': 'p-2',
  '3': 'p-3',
  '4': 'p-4',
  '5': 'p-5',
  '6': 'p-6',
} as const;

const radiusMap = {
  '1': 'rounded-1',
  '2': 'rounded-2',
  '3': 'rounded-3',
  '4': 'rounded-4',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    elevation = '1',
    padding = '4',
    radius = '3',
    interactive = false,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    'bg-surface',
    'border',
    'border-line',
    radiusMap[radius],
    paddingMap[padding],
    elevationMap[elevation],
    interactive
      ? 'transition-colors duration-hf ease-hf hover:bg-surface-2 cursor-pointer'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      {children}
    </div>
  );
});
