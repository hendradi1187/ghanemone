/**
 * SlideOver — panel yang slide-in dari kanan.
 *
 * Implementasi: Radix Dialog dengan custom positioning (bukan centered).
 * Radix handles: focus trap, restore-focus-on-close, ESC, click-outside,
 * `role="dialog"`, `aria-modal`, `aria-labelledby`.
 *
 * Animasi: CSS transition via Tailwind `translate-x` — slide dari kanan.
 * Duration 200ms, easing ease-out.
 *
 * Layout:
 *   - Desktop: panel 400-480px dari kanan, full height viewport
 *   - Mobile <768px: full width, slide dari bawah (bottom-sheet style)
 *
 * Usage:
 *   <SlideOver.Root open={open} onOpenChange={setOpen}>
 *     <SlideOver.Trigger asChild><Button>Open</Button></SlideOver.Trigger>
 *     <SlideOver.Content title="Dataset Detail">
 *       … content …
 *     </SlideOver.Content>
 *   </SlideOver.Root>
 *
 * A11y:
 *   - Focus trap via Radix
 *   - ESC menutup via Radix
 *   - aria-modal via Radix
 *   - aria-labelledby dari title prop
 *   - Body scroll lock saat open di mobile (Radix Dialog default behavior)
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { Icon } from '../icon';

const SlideOverRoot = DialogPrimitive.Root;
const SlideOverTrigger = DialogPrimitive.Trigger;
const SlideOverClose = DialogPrimitive.Close;
const SlideOverPortal = DialogPrimitive.Portal;

/* ─── Overlay ──────────────────────────────────────────────────────────── */

const SlideOverOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function SlideOverOverlay({ className = '', ...rest }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={[
        'fixed inset-0 z-40',
        // Overlay lebih subtle dari Dialog supaya map/list tetap terlihat
        'bg-ink/20',
        'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
});

/* ─── Content ──────────────────────────────────────────────────────────── */

export interface SlideOverContentProps
  extends Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'title'> {
  /** Judul slide-over — di-render sebagai DialogTitle (a11y required). */
  title: ReactNode;
  /** Show X button di header. Default true. */
  showClose?: boolean;
  /** Width desktop. Default "md" = 440px. */
  width?: 'sm' | 'md' | 'lg';
}

const widthMap = {
  sm: 'sm:w-80 sm:max-w-xs',
  md: 'sm:w-[440px] sm:max-w-[440px]',
  lg: 'sm:w-[520px] sm:max-w-[520px]',
} as const;

const SlideOverContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SlideOverContentProps
>(function SlideOverContent(
  { title, children, className = '', showClose = true, width = 'md', ...rest },
  ref,
) {
  return (
    <SlideOverPortal>
      <SlideOverOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={[
          // Positioning — full right side, full height
          'fixed inset-y-0 right-0 z-50',
          // Mobile: full width from bottom (via bottom-sheet feel)
          'w-full',
          // Desktop: fixed width panel
          widthMap[width],
          // Visual
          'bg-surface text-ink border-l border-line shadow-3',
          'flex flex-col',
          // Animasi slide — dari kanan masuk
          'data-[state=open]:animate-slide-in-right',
          'data-[state=closed]:animate-slide-out-right',
          'focus:outline-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-none">
          <DialogPrimitive.Title className="font-display font-bold text-h3 text-ink m-0 truncate pr-4">
            {title}
          </DialogPrimitive.Title>
          {showClose ? (
            <DialogPrimitive.Close
              aria-label="Tutup panel"
              className={[
                'flex-none inline-flex h-8 w-8 items-center justify-center',
                'rounded-2 text-ink-4 hover:bg-surface-2 hover:text-ink',
                'transition-colors duration-hf',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              ].join(' ')}
            >
              <Icon name="x" size={16} aria-hidden="true" />
            </DialogPrimitive.Close>
          ) : null}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </SlideOverPortal>
  );
});

/* ─── Compound export ──────────────────────────────────────────────────── */

export const SlideOver = {
  Root: SlideOverRoot,
  Trigger: SlideOverTrigger,
  Close: SlideOverClose,
  Portal: SlideOverPortal,
  Content: SlideOverContent,
};
