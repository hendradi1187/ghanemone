/**
 * RadioGroup — Radix RadioGroup wrapper.
 *
 * Compound API:
 *   <RadioGroup value={…} onValueChange={…}>
 *     <RadioItem value="a">Option A</RadioItem>
 *     <RadioItem value="b">Option B</RadioItem>
 *   </RadioGroup>
 *
 * Radix handle: arrow keys nav, focus management, `role="radiogroup"`/`"radio"`.
 *
 * RHF integration: pakai Controller — `field.onChange` → `onValueChange`.
 */
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';

export interface RadioGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'asChild'> {
  /** Layout — `vertical` (default) atau `horizontal`. */
  layout?: 'vertical' | 'horizontal';
  children?: ReactNode;
}

export const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(function RadioGroup({ layout = 'vertical', className = '', children, ...rest }, ref) {
  const classes = [
    'flex',
    layout === 'horizontal' ? 'flex-row gap-4 items-center' : 'flex-col gap-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioGroupPrimitive.Root ref={ref} className={classes} {...rest}>
      {children}
    </RadioGroupPrimitive.Root>
  );
});

export interface RadioItemProps
  extends Omit<ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'asChild'> {
  /** Inline label rendered di kanan radio button. */
  children?: ReactNode;
  /** Visual error state. */
  invalid?: boolean;
}

export const RadioItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioItemProps
>(function RadioItem({ invalid = false, className = '', children, id, value, ...rest }, ref) {
  // Generate stable id kalau tidak provided — needed untuk label htmlFor association.
  const itemId = id ?? `radio-${value}`;

  const itemClasses = [
    'inline-flex items-center justify-center',
    'h-4 w-4 rounded-pill border bg-surface',
    'transition-colors duration-fast ease-hf',
    'data-[state=checked]:border-green-600',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    invalid ? 'border-red-500' : 'border-line-2',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label
      htmlFor={itemId}
      className={[
        'inline-flex items-center gap-2 cursor-pointer select-none',
        'text-sm text-ink-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <RadioGroupPrimitive.Item
        ref={ref}
        id={itemId}
        value={value}
        className={itemClasses}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        <RadioGroupPrimitive.Indicator className="block h-1.5 w-1.5 rounded-pill bg-green-600" />
      </RadioGroupPrimitive.Item>
      {children !== undefined && children !== null ? <span>{children}</span> : null}
    </label>
  );
});
