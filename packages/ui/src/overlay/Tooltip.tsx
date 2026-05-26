/**
 * Tooltip — Radix Tooltip wrapper.
 *
 * Convenience API:
 *   <Tooltip content="Help text"><button>?</button></Tooltip>
 *
 * Lower-level Radix parts juga di-export untuk advanced use case.
 *
 * App harus mount satu `<TooltipProvider>` di root supaya skip-delay shared
 * across multiple tooltips (kalau user hover tooltip kedua dalam < 300ms,
 * skip delay).
 *
 * A11y:
 *   - Radix render konten sebagai `role="tooltip"` + wire `aria-describedby`
 *     ke trigger automatic.
 *   - Untuk icon-only triggers (e.g. help icon), `aria-label` di trigger
 *     tetap recommended sebagai accessible name.
 */
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className = '', sideOffset = 6, ...rest }, ref) {
  const classes = [
    'z-50 max-w-xs',
    'px-2 py-1 text-xs',
    'bg-ink text-white',
    'rounded-2 shadow-2',
    'data-[state=delayed-open]:animate-fade-in data-[state=closed]:animate-fade-out',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={classes}
        {...rest}
      />
    </TooltipPrimitive.Portal>
  );
});

export interface TooltipProps {
  /** Tooltip content. Bisa string atau ReactNode. */
  content: ReactNode;
  /** Trigger element — biasanya icon/button. */
  children: ReactNode;
  /** Delay sebelum tooltip muncul (ms). Default 500. */
  delayDuration?: number;
  /** Side relative ke trigger. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Disable tooltip — render children langsung tanpa wrapper. */
  disabled?: boolean;
}

/**
 * Convenience `Tooltip` — handles 90% of use cases dengan single prop.
 * Untuk control penuh (custom delay, controlled open), pakai compound parts:
 *   <TooltipRoot><TooltipTrigger>…</TooltipTrigger><TooltipContent>…</TooltipContent></TooltipRoot>
 */
export function Tooltip({
  content,
  children,
  delayDuration = 500,
  side = 'top',
  disabled = false,
}: TooltipProps): JSX.Element {
  if (disabled) {
    // reason: cast fragment children — caller bertanggung jawab passing valid ReactNode.
    return <>{children}</>;
  }

  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
  );
}
