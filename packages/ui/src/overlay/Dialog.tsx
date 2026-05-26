/**
 * Dialog — Radix Dialog wrapper dengan compound API + brand styling.
 *
 * Radix handles: focus trap, restore-focus-on-close, ESC to close, click-outside,
 * `role="dialog"` + `aria-modal`, label association via `aria-labelledby`.
 *
 * Usage:
 *   <Dialog.Root open={open} onOpenChange={setOpen}>
 *     <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>
 *     <Dialog.Content>
 *       <Dialog.Header>
 *         <Dialog.Title>Reset Password</Dialog.Title>
 *         <Dialog.Description>Masukkan email yang…</Dialog.Description>
 *       </Dialog.Header>
 *       <p>… body content …</p>
 *       <Dialog.Footer>
 *         <Dialog.Close asChild><Button variant="secondary">Batal</Button></Dialog.Close>
 *         <Button onClick={…}>Submit</Button>
 *       </Dialog.Footer>
 *     </Dialog.Content>
 *   </Dialog.Root>
 *
 * Untuk dialog non-modal (mis. preview yang user bisa interact di luar):
 *   <Dialog.Content modal={false}> — Radix akan set `aria-modal={false}` + skip backdrop interaction blocker.
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { Icon } from '../icon';

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className = '', ...rest }, ref) {
  const classes = [
    'fixed inset-0 z-40',
    'bg-ink/40 backdrop-blur-sm',
    'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <DialogPrimitive.Overlay ref={ref} className={classes} {...rest} />;
});

export interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Show close (X) button di pojok kanan atas. Default true. */
  showClose?: boolean;
  /** Max width — Tailwind size class atau `lg` (default `md`). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  { className = '', children, showClose = true, size = 'md', ...rest },
  ref,
) {
  const classes = [
    'fixed left-[50%] top-[50%] z-50',
    'translate-x-[-50%] translate-y-[-50%]',
    'w-full',
    sizeMap[size],
    'bg-surface text-ink',
    'border border-line rounded-3 shadow-3',
    'p-5',
    'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    'focus:outline-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={classes} {...rest}>
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label="Tutup dialog"
            className={[
              'absolute right-3 top-3',
              'inline-flex h-8 w-8 items-center justify-center',
              'rounded-2 text-ink-4 hover:bg-surface-2 hover:text-ink',
              'transition-colors duration-fast ease-hf',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
          >
            <Icon name="x" size={16} aria-hidden="true" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

const DialogHeader = ({ className = '', ...rest }: { className?: string; children?: ReactNode }): JSX.Element => {
  const classes = ['flex flex-col gap-1 pr-8', className].filter(Boolean).join(' ');
  return <div className={classes} {...rest} />;
};

const DialogFooter = ({ className = '', ...rest }: { className?: string; children?: ReactNode }): JSX.Element => {
  const classes = ['flex flex-row justify-end gap-2 pt-4 mt-4 border-t border-line', className]
    .filter(Boolean)
    .join(' ');
  return <div className={classes} {...rest} />;
};

const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className = '', ...rest }, ref) {
  const classes = ['text-h3 font-semibold text-ink font-display', className]
    .filter(Boolean)
    .join(' ');
  return <DialogPrimitive.Title ref={ref} className={classes} {...rest} />;
});

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className = '', ...rest }, ref) {
  const classes = ['text-sm text-ink-4', className].filter(Boolean).join(' ');
  return <DialogPrimitive.Description ref={ref} className={classes} {...rest} />;
});

/**
 * Compound Dialog export. Pakai sebagai `Dialog.Root`, `Dialog.Trigger`, dll.
 *
 * Kami pilih pattern `Dialog.X` (bukan named exports terpisah) supaya consumer
 * intuitive — Radix Dialog adalah compound widget yang banyak parts-nya.
 */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Close: DialogClose,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
};
