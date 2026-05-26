/**
 * FormLabel — semantic `<label>` dengan required indicator.
 *
 * Wraps Radix `<Label.Root>` (asal `for`/`htmlFor` association lebih robust di
 * compound widget seperti RadioGroup). Untuk text input biasa, equivalent dengan
 * native `<label htmlFor=…>`.
 *
 * Required indicator: asterisk merah dengan `aria-hidden` — semantic required
 * di-handle via `aria-required` di control + Zod schema (.required()).
 */
import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export interface FormLabelProps extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Apakah field di-mark required. Menampilkan asterisk visual + `data-required`. */
  required?: boolean;
  /** Display size — `sm` untuk inline label, `md` default. */
  size?: 'sm' | 'md';
  children?: ReactNode;
}

const sizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
} as const;

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel(
  { required = false, size = 'md', className = '', children, ...rest },
  ref,
) {
  const classes = [
    'inline-flex items-center gap-1',
    'font-medium text-ink-2',
    'select-none',
    sizeMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LabelPrimitive.Root
      ref={ref}
      data-required={required || undefined}
      className={classes}
      {...rest}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-red-500" data-required-marker>
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
});
