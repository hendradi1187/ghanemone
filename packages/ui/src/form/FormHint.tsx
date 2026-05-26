/**
 * FormHint — helper text di bawah field.
 *
 * Dipasangkan dengan FormField yang mengeluarkan `id` deterministik, sehingga
 * control input dapat `aria-describedby={hintId}` untuk SR.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface FormHintProps extends HTMLAttributes<HTMLParagraphElement> {
  /** ID hint — di-set oleh FormField. */
  id?: string;
  children?: ReactNode;
}

export const FormHint = forwardRef<HTMLParagraphElement, FormHintProps>(function FormHint(
  { className = '', children, ...rest },
  ref,
) {
  const classes = [
    'text-xs text-ink-4 leading-snug',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <p ref={ref} className={classes} {...rest}>
      {children}
    </p>
  );
});
