/**
 * Input — single-line text input dengan size/invalid variants + slot composition.
 *
 * Compatible dengan React Hook Form `register`: meneruskan ref + spread props,
 * `onChange`/`onBlur` mengalir natural. Tidak punya internal state.
 *
 * A11y:
 *   - `aria-invalid` di-set otomatis ketika `invalid={true}`
 *   - `aria-describedby` di-pass-through (FormField yang mengatur ID hint+error)
 *   - Focus ring via `:focus-visible` token (lihat index.css base layer)
 *
 * Slots:
 *   - `leftSlot` / `rightSlot` untuk icon dalam container — input tetap full-width,
 *     padding di-adjust supaya text tidak overlap icon.
 */
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual size — affects height + padding. Default `md`. */
  size?: InputSize;
  /** Visual error state. Set `aria-invalid` + red border. FormField biasanya set otomatis. */
  invalid?: boolean;
  /** Content di kiri input (e.g. search icon). */
  leftSlot?: ReactNode;
  /** Content di kanan input (e.g. clear button, unit suffix). */
  rightSlot?: ReactNode;
  /** Container className — input class diteruskan via prop standard `className`. */
  containerClassName?: string;
}

const sizeContainerMap: Record<InputSize, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-h3',
};

const sizePaddingMap: Record<InputSize, { base: string; left: string; right: string }> = {
  sm: { base: 'px-2', left: 'pl-7', right: 'pr-7' },
  md: { base: 'px-3', left: 'pl-9', right: 'pr-9' },
  lg: { base: 'px-4', left: 'pl-11', right: 'pr-11' },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    invalid = false,
    leftSlot,
    rightSlot,
    className = '',
    containerClassName = '',
    disabled,
    ...rest
  },
  ref,
) {
  const padding = sizePaddingMap[size];
  const inputClasses = [
    'w-full rounded-2 bg-surface text-ink',
    'border outline-none transition-colors duration-hf ease-hf',
    'placeholder:text-ink-5',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-2',
    invalid
      ? 'border-red-500 focus-visible:border-red-700'
      : 'border-line focus-visible:border-green-500',
    sizeContainerMap[size],
    leftSlot ? padding.left : padding.base,
    rightSlot ? padding.right : '',
    rightSlot && !leftSlot ? padding.base : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Single-child case (no slots) → render bare input untuk menjaga DOM minimal.
  if (!leftSlot && !rightSlot) {
    return (
      <input
        ref={ref}
        className={inputClasses}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        {...rest}
      />
    );
  }

  const containerClasses = [
    'relative inline-flex items-center w-full',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const slotBaseClasses = 'absolute inset-y-0 flex items-center text-ink-4 pointer-events-none';
  const slotSizeMap: Record<InputSize, string> = {
    sm: 'w-7',
    md: 'w-9',
    lg: 'w-11',
  };

  return (
    <div className={containerClasses}>
      {leftSlot ? (
        <span className={`${slotBaseClasses} left-0 ${slotSizeMap[size]} justify-center`}>
          {leftSlot}
        </span>
      ) : null}
      <input
        ref={ref}
        className={inputClasses}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        {...rest}
      />
      {rightSlot ? (
        <span className={`${slotBaseClasses} right-0 ${slotSizeMap[size]} justify-center`}>
          {rightSlot}
        </span>
      ) : null}
    </div>
  );
});
