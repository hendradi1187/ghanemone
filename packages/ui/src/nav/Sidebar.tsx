/**
 * Sidebar — left-rail categories + data providers list.
 *
 * Port dari `HfSidebar` di `hifi-components.jsx` (line 130-196) dengan props
 * yang explicit (sebelumnya hardcoded di JSX). Generic enough untuk reuse di
 * berbagai halaman (Explore, Map, Workspace) — content driven entirely by props.
 *
 * A11y:
 *   - Wrapper `<aside aria-label="…">` landmark
 *   - Setiap section `<nav>` dengan `aria-labelledby` ke heading
 *   - Item interaktif: render sebagai `<button>` (bukan `<div>`) → otomatis
 *     keyboard-focusable, Enter/Space activate.
 *   - Active item: `aria-current="page"` (untuk navigasi) atau `aria-pressed`
 *     (untuk toggle filter — tidak dipakai di port awal ini).
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../icon';

/** Item di section "Browse" — dengan icon + count optional. */
export interface SidebarBrowseItem {
  /** Stable id untuk match dengan `activeId`. */
  id: string;
  /** Label visible. */
  label: string;
  /** Optional icon di kiri. */
  icon?: IconName;
  /** Hitungan numerik di kanan. Bila undefined, count tidak dirender. */
  count?: number;
}

/** Item di section "Categories" — color swatch + label + chevron. */
export interface SidebarCategoryItem {
  id: string;
  label: string;
  /** Hex color atau token CSS var untuk swatch. */
  color: string;
}

/** Item di section "Data provider" — initials avatar + label + count. */
export interface SidebarProviderItem {
  id: string;
  label: string;
  initials: string;
  count: number;
  /** Hex color atau token CSS var untuk border avatar. */
  color: string;
}

/** Section group — bisa Browse, Category, atau Provider. */
export interface SidebarSection {
  /** Section heading — uppercase di render. */
  title: string;
  /** Variant menentukan item shape. */
  variant: 'browse' | 'category' | 'provider';
  items: SidebarBrowseItem[] | SidebarCategoryItem[] | SidebarProviderItem[];
  /** Optional footer link (mis. "Show all 145 providers →"). */
  footer?: {
    label: string;
    onClick: () => void;
  };
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Label landmark untuk SR. Default `'Sidebar navigation'`. */
  ariaLabel?: string;
  /** Section groups untuk ditampilkan, top-to-bottom. */
  sections: SidebarSection[];
  /** Currently-active item id (across all sections). */
  activeId?: string;
  /** Handler saat item di-click. Caller dapat membedakan section by variant via `item`. */
  onItemClick: (
    item: SidebarBrowseItem | SidebarCategoryItem | SidebarProviderItem,
    section: SidebarSection,
  ) => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    ariaLabel = 'Sidebar navigation',
    sections,
    activeId,
    onItemClick,
    className = '',
    ...rest
  },
  ref,
) {
  return (
    <aside
      ref={ref}
      aria-label={ariaLabel}
      className={[
        'flex-none w-60', // 240px
        'border-r border-line bg-surface-2',
        'px-3 py-4',
        'overflow-y-auto',
        'flex flex-col gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {sections.map((section, sIdx) => {
        const headingId = `sidebar-section-${sIdx}-${section.title.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <nav key={section.title} aria-labelledby={headingId} className="flex flex-col gap-0.5">
            <h2
              id={headingId}
              className={[
                'text-[10.5px] font-bold uppercase tracking-widest',
                'text-ink-4',
                'px-2 pb-1.5 m-0',
              ].join(' ')}
            >
              {section.title}
            </h2>

            {section.variant === 'browse' &&
              (section.items as SidebarBrowseItem[]).map((item) => {
                const active = item.id === activeId;
                return (
                  <SidebarItemButton
                    key={item.id}
                    active={active}
                    onClick={() => onItemClick(item, section)}
                  >
                    {item.icon ? <Icon name={item.icon} size={15} aria-hidden /> : null}
                    <span className="flex-1 min-w-0 truncate text-left">{item.label}</span>
                    {typeof item.count === 'number' ? (
                      <span className="ml-auto text-[10.5px] text-ink-4 font-medium num">
                        {item.count.toLocaleString('id-ID')}
                      </span>
                    ) : null}
                  </SidebarItemButton>
                );
              })}

            {section.variant === 'category' &&
              (section.items as SidebarCategoryItem[]).map((item) => {
                const active = item.id === activeId;
                return (
                  <SidebarItemButton
                    key={item.id}
                    active={active}
                    onClick={() => onItemClick(item, section)}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block w-2.5 h-2.5 rounded-pill flex-none"
                      style={{ background: item.color }}
                    />
                    <span className="flex-1 min-w-0 truncate text-left">{item.label}</span>
                    <Icon name="chevR" size={12} className="text-ink-5" aria-hidden />
                  </SidebarItemButton>
                );
              })}

            {section.variant === 'provider' &&
              (section.items as SidebarProviderItem[]).map((item) => {
                const active = item.id === activeId;
                return (
                  <SidebarItemButton
                    key={item.id}
                    active={active}
                    onClick={() => onItemClick(item, section)}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'inline-flex items-center justify-center flex-none',
                        'w-[22px] h-[22px] rounded-full',
                        'text-[9px] font-bold leading-none',
                        'border bg-transparent',
                      ].join(' ')}
                      style={{ borderColor: item.color, color: item.color }}
                    >
                      {item.initials}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-left text-xs">
                      {item.label}
                    </span>
                    <span className="ml-auto text-[10.5px] text-ink-4 font-medium num">
                      {item.count.toLocaleString('id-ID')}
                    </span>
                  </SidebarItemButton>
                );
              })}

            {section.footer ? (
              <button
                type="button"
                onClick={section.footer.onClick}
                className={[
                  'flex items-center gap-2.5 px-2 py-1.5 rounded-2',
                  'text-[11.5px] font-semibold text-green-600',
                  'transition-colors duration-hf',
                  'hover:bg-surface-3',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:-outline-offset-2',
                ].join(' ')}
              >
                <span className="w-[22px] flex-none" aria-hidden />
                <span className="text-left">{section.footer.label}</span>
              </button>
            ) : null}
          </nav>
        );
      })}
    </aside>
  );
});

/* ─── Internal: shared item button (DRY) ──────────────────────────────── */

interface SidebarItemButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function SidebarItemButton({ active, onClick, children }: SidebarItemButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center gap-2.5 w-full',
        'px-2 py-1.5 rounded-2',
        'text-sm font-medium text-left',
        'transition-colors duration-hf',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:-outline-offset-2',
        active
          ? 'bg-green-50 text-green-700 font-semibold'
          : 'text-ink-2 hover:bg-surface-3',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
