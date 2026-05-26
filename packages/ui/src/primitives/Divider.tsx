/**
 * Divider — thin horizontal/vertical rule. Port dari `.hf .divider`
 * di hifi-tokens.css (1px line-token background).
 *
 * A11y: render sebagai `<hr role="separator">` (atau `aria-orientation` untuk vertical)
 * sehingga screen reader tetap mengumumkan section break.
 */
import { forwardRef, type HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Orientation — default `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { orientation = 'horizontal', className = '', ...rest },
  ref,
) {
  const isVertical = orientation === 'vertical';
  const classes = [
    'bg-line border-0',
    isVertical ? 'w-px h-full self-stretch' : 'h-px w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <hr
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={classes}
      {...rest}
    />
  );
});
