/**
 * FormError — error message dengan `role="alert"` + `aria-live="polite"`.
 *
 * Diumumkan otomatis ke SR ketika message berubah (mis. validasi async).
 * Pakai polite (bukan assertive) karena form validation feedback bukan critical
 * interruption — assertive berlebihan, dapat membatalkan SR speech yang sedang
 * berjalan.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  /** ID error — di-set oleh FormField. */
  id?: string;
  children?: ReactNode;
}

export const FormError = forwardRef<HTMLParagraphElement, FormErrorProps>(function FormError(
  { className = '', children, ...rest },
  ref,
) {
  // Tidak render apa-apa kalau tidak ada error — keep DOM clean.
  if (!children) return null;

  const classes = [
    'text-xs text-red-700 leading-snug',
    'flex items-start gap-1',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <p
      ref={ref}
      role="alert"
      aria-live="polite"
      className={classes}
      {...rest}
    >
      <span aria-hidden="true">⚠</span>
      <span>{children}</span>
    </p>
  );
});
