/**
 * Textarea — multi-line input.
 *
 * Sama pola dengan Input (no internal state, RHF-friendly forwardRef).
 * Size mengontrol min-height + padding; user tetap bisa resize vertical.
 */
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Visual size — affects min-height + padding. Default `md`. */
  size?: TextareaSize;
  /** Visual error state. Set `aria-invalid` + red border. */
  invalid?: boolean;
}

const sizeMap: Record<TextareaSize, string> = {
  sm: 'min-h-[60px] px-2 py-1.5 text-xs',
  md: 'min-h-[80px] px-3 py-2 text-sm',
  lg: 'min-h-[120px] px-4 py-3 text-h3',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = 'md', invalid = false, className = '', disabled, ...rest },
  ref,
) {
  const classes = [
    'w-full rounded-2 bg-surface text-ink',
    'border outline-none transition-colors duration-hf ease-hf',
    'placeholder:text-ink-5',
    'resize-y',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-2',
    invalid
      ? 'border-red-500 focus-visible:border-red-700'
      : 'border-line focus-visible:border-green-500',
    sizeMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      ref={ref}
      className={classes}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      {...rest}
    />
  );
});
