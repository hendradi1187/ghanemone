/**
 * Popover — Radix Popover wrapper.
 *
 * Non-modal overlay yang anchor ke trigger. Pakai untuk:
 *   - Date picker (Phase 8.5+)
 *   - Filter dropdown
 *   - Color picker
 *   - Info popouts
 *
 * Untuk modal dialog yang membutuhkan focus trap, pakai Dialog.
 *
 * Usage:
 *   <Popover.Root>
 *     <Popover.Trigger asChild><Button>…</Button></Popover.Trigger>
 *     <Popover.Content>…</Popover.Content>
 *   </Popover.Root>
 */
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

const PopoverRoot = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className = '', sideOffset = 6, align = 'center', ...rest }, ref) {
  const classes = [
    'z-50 w-72 p-3',
    'bg-surface text-ink',
    'border border-line rounded-2 shadow-2',
    'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    'focus:outline-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={classes}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
});

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Close: PopoverClose,
  Content: PopoverContent,
};
