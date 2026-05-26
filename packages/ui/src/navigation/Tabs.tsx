/**
 * Tabs — accessible WAI-ARIA tabs component.
 *
 * Implementasi mengikuti WAI-ARIA Authoring Practices 1.2 §Tabs:
 *   - `role="tablist"` on container, `role="tab"` on triggers, `role="tabpanel"` on content
 *   - Arrow Left/Right untuk pindah tab; Home/End untuk first/last
 *   - Automatic activation (focus = select) — match Radix default behavior
 *   - `aria-selected`, `aria-controls`, `aria-labelledby` wired otomatis via context
 *
 * Mengapa tidak pakai `@radix-ui/react-tabs`:
 *   - Dependency tidak di-install di workspace (Phase 8.8 hard constraint).
 *   - Native implementation cukup ringkas (~120 LOC) + zero runtime cost.
 *
 * API (subset Radix-like — drop-in upgrade saat dep ditambahkan di Phase 9):
 *   <Tabs.Root value={tab} onValueChange={setTab}>
 *     <Tabs.List variant="underline">
 *       <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
 *       <Tabs.Trigger value="files">Files</Tabs.Trigger>
 *     </Tabs.List>
 *     <Tabs.Content value="overview">…</Tabs.Content>
 *     <Tabs.Content value="files">…</Tabs.Content>
 *   </Tabs.Root>
 *
 * Variants:
 *   - `underline` (default) — border-bottom active, ala Detail page tabs.
 *   - `pill`                — bg pill highlight, ala segmented control.
 */
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export type TabsVariant = 'underline' | 'pill';

interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  /** Auto-generated id namespace untuk wire `aria-controls` ↔ `aria-labelledby`. */
  baseId: string;
  variant: TabsVariant;
  /** Ref ke list element supaya Trigger bisa lookup siblings untuk arrow nav. */
  listRef: React.MutableRefObject<HTMLDivElement | null>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<Tabs.${component}> harus berada di dalam <Tabs.Root>.`);
  }
  return ctx;
}

/* ─── Root ────────────────────────────────────────────────────────────── */

export interface TabsRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled active value. */
  value: string;
  /** Handler perubahan tab. */
  onValueChange: (next: string) => void;
  /** Variant visual (default `underline`). */
  variant?: TabsVariant;
  children: ReactNode;
}

const Root = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  { value, onValueChange, variant = 'underline', children, className = '', ...rest },
  ref,
) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement | null>(null);

  const ctx = useMemo<TabsContextValue>(
    () => ({ value, setValue: onValueChange, baseId, variant, listRef }),
    [value, onValueChange, baseId, variant],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

/* ─── List ────────────────────────────────────────────────────────────── */

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible label untuk tablist. */
  'aria-label'?: string;
  children: ReactNode;
}

const List = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { children, className = '', ...rest },
  ref,
) {
  const { variant, listRef } = useTabsContext('List');
  const variantClass =
    variant === 'pill'
      ? 'inline-flex items-center gap-1 p-1 bg-surface-3 rounded-2 border border-line'
      : 'flex items-center gap-1 border-b border-line';
  const classes = [variantClass, className].filter(Boolean).join(' ');

  return (
    <div
      ref={(node) => {
        listRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      role="tablist"
      className={classes}
      {...rest}
    >
      {children}
    </div>
  );
});

/* ─── Trigger ─────────────────────────────────────────────────────────── */

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role'> {
  /** Value tab yang diaktifkan saat trigger di-click. */
  value: string;
  /** Disable tab (focus tetap di-skip oleh roving tabindex). */
  disabled?: boolean;
  children: ReactNode;
}

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, disabled = false, children, className = '', onKeyDown, ...rest },
  ref,
) {
  const ctx = useTabsContext('Trigger');
  const isActive = ctx.value === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const list = ctx.listRef.current;
      if (!list) return;
      const triggers = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      );
      if (triggers.length === 0) return;
      const currentIdx = triggers.findIndex((el) => el === e.currentTarget);

      let nextIdx = -1;
      switch (e.key) {
        case 'ArrowRight':
          nextIdx = (currentIdx + 1) % triggers.length;
          break;
        case 'ArrowLeft':
          nextIdx = (currentIdx - 1 + triggers.length) % triggers.length;
          break;
        case 'Home':
          nextIdx = 0;
          break;
        case 'End':
          nextIdx = triggers.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const target = triggers[nextIdx];
      if (target) {
        target.focus();
        // Automatic activation — focus = select (Radix default).
        const nextValue = target.dataset['tabValue'];
        if (nextValue) ctx.setValue(nextValue);
      }
    },
    [ctx, onKeyDown],
  );

  const baseClasses = 'inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors duration-hf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500';
  const variantClasses =
    ctx.variant === 'pill'
      ? [
          'px-3 py-1.5 rounded-1 text-sm font-medium',
          isActive ? 'bg-surface text-ink shadow-1' : 'text-ink-4 hover:text-ink',
        ].join(' ')
      : [
          'px-3 py-2 text-sm font-semibold -mb-px border-b-2 border-transparent',
          isActive ? 'border-green-500 text-ink' : 'text-ink-4 hover:text-ink hover:border-line-2',
        ].join(' ');

  const classes = [baseClasses, variantClasses, className].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId}
      data-tab-value={value}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && ctx.setValue(value)}
      onKeyDown={handleKeyDown}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
});

/* ─── Content ─────────────────────────────────────────────────────────── */

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

const Content = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, children, className = '', ...rest },
  ref,
) {
  const ctx = useTabsContext('Content');
  const isActive = ctx.value === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
});

/** Compound API — `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`. */
export const Tabs = {
  Root,
  List,
  Trigger,
  Content,
};
