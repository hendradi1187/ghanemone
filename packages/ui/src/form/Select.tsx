/**
 * Select — Radix Select wrapper.
 *
 * Radix Select adalah custom popup-based select (bukan native `<select>`)
 * yang konsisten lintas browser + styleable + a11y-correct (combobox pattern
 * dengan keyboard nav, type-ahead, focus trap).
 *
 * Compound API mirror Radix supaya tetap fleksibel:
 *   <Select value={…} onValueChange={…}>
 *     <SelectTrigger placeholder="Pilih kategori"><SelectValue /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="seismic">Seismic</SelectItem>
 *       …
 *     </SelectContent>
 *   </Select>
 *
 * Untuk RHF: pakai Controller — `field.value` → Select `value`, `field.onChange` → `onValueChange`.
 */
import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { Icon } from '../icon';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>, 'asChild'> {
  /** Size — affects height + padding. */
  size?: 'sm' | 'md' | 'lg';
  /** Visual error state — red border. */
  invalid?: boolean;
}

const triggerSizeMap = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-h3',
} as const;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(function SelectTrigger(
  { size = 'md', invalid = false, className = '', children, ...rest },
  ref,
) {
  const classes = [
    'inline-flex items-center justify-between gap-2 w-full',
    'rounded-2 bg-surface text-ink',
    'border outline-none transition-colors duration-hf ease-hf',
    'data-[placeholder]:text-ink-5',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-2',
    'focus-visible:border-green-500',
    triggerSizeMap[size],
    invalid ? 'border-red-500' : 'border-line',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={classes}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon name="chevron" size={16} aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent(
  { className = '', children, position = 'popper', sideOffset = 4, ...rest },
  ref,
) {
  const classes = [
    'z-50 min-w-[8rem] max-h-[--radix-select-content-available-height] overflow-hidden',
    'rounded-2 border border-line bg-surface text-ink shadow-2',
    'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    position === 'popper'
      ? 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={sideOffset}
        className={classes}
        {...rest}
      >
        <SelectPrimitive.Viewport
          className={
            position === 'popper'
              ? 'p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
              : 'p-1'
          }
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export interface SelectItemProps
  extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Item>, 'asChild'> {
  children?: ReactNode;
}

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(function SelectItem({ className = '', children, ...rest }, ref) {
  const classes = [
    'relative flex w-full cursor-pointer select-none items-center',
    'rounded-1 py-1.5 pl-7 pr-2 text-sm outline-none',
    'data-[highlighted]:bg-green-50 data-[highlighted]:text-green-700',
    'data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SelectPrimitive.Item ref={ref} className={classes} {...rest}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon name="check" size={12} aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className = '', ...rest }, ref) {
  const classes = [
    'py-1.5 pl-7 pr-2 text-xs font-semibold uppercase text-ink-4 tracking-wider',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <SelectPrimitive.Label ref={ref} className={classes} {...rest} />;
});

export const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className = '', ...rest }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={['my-1 h-px bg-line', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});
