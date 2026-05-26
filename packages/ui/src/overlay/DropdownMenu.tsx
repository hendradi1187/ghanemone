/**
 * DropdownMenu — Radix DropdownMenu wrapper.
 *
 * Untuk action menus (kebab menu, user menu, context menu attached ke trigger).
 * Untuk select-style (form value picker), pakai `Select` di `form/`.
 *
 * Radix handle: keyboard nav (arrow keys), type-ahead, focus trap saat open,
 * `role="menu"`/`"menuitem"`, sub-menus.
 *
 * Usage:
 *   <DropdownMenu.Root>
 *     <DropdownMenu.Trigger asChild><Button>Aksi</Button></DropdownMenu.Trigger>
 *     <DropdownMenu.Content>
 *       <DropdownMenu.Item onSelect={…}>Edit</DropdownMenu.Item>
 *       <DropdownMenu.Item onSelect={…}>Hapus</DropdownMenu.Item>
 *     </DropdownMenu.Content>
 *   </DropdownMenu.Root>
 */
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { Icon } from '../icon';

const DropdownMenuRoot = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className = '', sideOffset = 4, ...rest }, ref) {
  const classes = [
    'z-50 min-w-[8rem] p-1',
    'bg-surface text-ink',
    'border border-line rounded-2 shadow-2',
    'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    'focus:outline-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={classes}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

const itemBaseClasses = [
  'relative flex w-full cursor-pointer select-none items-center gap-2',
  'rounded-1 py-1.5 px-2 text-sm outline-none',
  'data-[highlighted]:bg-green-50 data-[highlighted]:text-green-700',
  'data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed',
  'transition-colors duration-fast ease-hf',
].join(' ');

const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(function DropdownMenuItem({ className = '', ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={[itemBaseClasses, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});

const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className = '', children, ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={[itemBaseClasses, 'pl-7', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Icon name="check" size={12} aria-hidden="true" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

const DropdownMenuRadioItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(function DropdownMenuRadioItem({ className = '', children, ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={[itemBaseClasses, 'pl-7', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="h-1.5 w-1.5 rounded-pill bg-green-600" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function DropdownMenuLabel({ className = '', ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={[
        'py-1 px-2 text-xs font-semibold uppercase tracking-wider text-ink-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
});

const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className = '', ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={['my-1 h-px bg-line', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});

const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(function DropdownMenuSubTrigger({ className = '', children, ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={[itemBaseClasses, 'pr-7', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
      <span className="ml-auto flex h-3.5 w-3.5 items-center justify-center">
        <Icon name="chevR" size={12} aria-hidden="true" />
      </span>
    </DropdownMenuPrimitive.SubTrigger>
  );
});

const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(function DropdownMenuSubContent({ className = '', ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={[
        'z-50 min-w-[8rem] p-1',
        'bg-surface text-ink border border-line rounded-2 shadow-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
});

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Portal: DropdownMenuPortal,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
  RadioGroup: DropdownMenuRadioGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};
