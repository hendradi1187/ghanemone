/**
 * TopNav — primary site-wide chrome.
 *
 * Port dari `HfTopNav` di `hifi-components.jsx` (line 77-125) + interactive
 * extensions dari `IxTopNav` di `prototype-app.jsx` (a11y improvements:
 * `aria-current`, `aria-label` untuk icon-only buttons, focus-visible).
 *
 * Konsumer bertanggung jawab atas navigation behavior (mis. via React Router
 * useNavigate). Komponen ini **stateless** — props.activeRoute decides which
 * link mendapat highlight.
 *
 * A11y:
 *   - `<nav role="navigation" aria-label="Primary">` landmark
 *   - Active link: `aria-current="page"`
 *   - Icon-only buttons (help, notifications): `aria-label` + tooltip via `title`
 *   - Notification dot: `aria-hidden` (count diumumkan via aria-label button)
 *   - Search input: `<label class="sr-only">` untuk SR users
 */
import { forwardRef, type HTMLAttributes, type KeyboardEvent } from 'react';
import { Icon, type IconName } from '../icon';

/** Item untuk link nav — `route` adalah identifier yang dibandingkan dgn `activeRoute`. */
export interface TopNavLink {
  /** Label visible (UPPERCASE) — e.g. 'EXPLORE DATA'. */
  label: string;
  /** Route identifier, e.g. '/explore', '/map'. */
  route: string;
  /** Optional icon ditampilkan di kiri label (not rendered by default at hi-fi). */
  icon?: IconName;
}

export interface TopNavUser {
  /** 2-char initials untuk avatar. */
  initials: string;
  /** Display name organisasi atau user — e.g. 'SKK Migas'. */
  org: string;
  /** Role display — e.g. 'Regulator', 'Compliance Officer'. */
  role: string;
}

export interface TopNavBrand {
  /** Brand mark text — biasanya 2 huruf (e.g. 'GO' untuk Ghanem.one). */
  mark: string;
  /** Primary brand name — e.g. 'Ghanem'. */
  name: string;
  /** Suffix (after dot) — e.g. '.one'. */
  suffix?: string;
  /** Subtitle tagline — e.g. 'AI Intelligence · Satu Peta Nasional'. */
  tagline?: string;
}

export interface TopNavProps extends HTMLAttributes<HTMLElement> {
  /** Brand block — defaults ke Ghanem.one. */
  brand?: TopNavBrand;
  /** List of nav links. */
  links: TopNavLink[];
  /** Currently active route (matched against link.route). */
  activeRoute: string;
  /** Handler saat link di-click — caller bertanggung jawab atas actual navigation. */
  onNavigate: (route: string) => void;
  /** User block (avatar + org/role). Bila omit, user block tidak dirender. */
  user?: TopNavUser;
  /** Jumlah notifikasi unread. `>0` menampilkan red dot indicator. */
  notificationsCount?: number;
  /** Handler untuk klik bell — bila omit, button tetap tampil tapi noop. */
  onNotificationsClick?: () => void;
  /** Handler untuk klik help icon. */
  onHelpClick?: () => void;
  /** Search box config. Bila omit, search disembunyikan. */
  search?: {
    placeholder?: string;
    value?: string;
    onChange?: (next: string) => void;
    /** Show hint pill (e.g. "⌘K"). */
    shortcutHint?: string;
  };
}

const DEFAULT_BRAND: TopNavBrand = {
  mark: 'GO',
  name: 'Ghanem',
  suffix: '.one',
  tagline: 'AI Intelligence · Satu Peta Nasional',
};

export const TopNav = forwardRef<HTMLElement, TopNavProps>(function TopNav(
  {
    brand = DEFAULT_BRAND,
    links,
    activeRoute,
    onNavigate,
    user,
    notificationsCount = 0,
    onNotificationsClick,
    onHelpClick,
    search,
    className = '',
    ...rest
  },
  ref,
) {
  const handleLinkKey = (e: KeyboardEvent<HTMLAnchorElement>, route: string): void => {
    // a11y: anchor dengan href="#" tetap respond ke Enter, tapi Space tidak default.
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onNavigate(route);
    }
  };

  const hasNotifications = notificationsCount > 0;
  const bellLabel = hasNotifications
    ? `Notifications (${notificationsCount} unread)`
    : 'Notifications';

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Primary"
      className={[
        'flex-none flex items-center gap-4',
        'px-5 py-3',
        'bg-surface border-b border-line',
        'relative z-nav',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* ── Brand ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span
          aria-hidden="true"
          className={[
            'inline-flex items-center justify-center',
            'w-7 h-7 rounded-2',
            'bg-gradient-to-br from-green-500 to-green-700',
            'text-white font-display font-extrabold text-xs',
            'shadow-1',
          ].join(' ')}
        >
          {brand.mark}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-h3 text-ink whitespace-nowrap tracking-h3">
            {brand.name}
            {brand.suffix ? (
              <span className="text-blue-500 font-semibold">{brand.suffix}</span>
            ) : null}
          </span>
          {brand.tagline ? (
            <span className="font-sans font-semibold text-[9.5px] uppercase tracking-widest text-green-600 mt-0.5 whitespace-nowrap">
              {brand.tagline}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Search box (optional) ───────────────────────────────── */}
      {search ? (
        <div
          className={[
            'flex items-center gap-2',
            'px-3 py-1.5',
            'bg-surface border border-line-2 rounded-2',
            'text-ink text-sm',
            'min-w-0 max-w-[360px] w-full',
            'transition-colors duration-hf',
            'focus-within:border-green-500 focus-within:shadow-focus',
          ].join(' ')}
        >
          <Icon name="search" size={14} className="text-ink-4" aria-hidden />
          <label className="sr-only" htmlFor="topnav-search">
            Cari dataset, area kerja, sumur, atau dokumen
          </label>
          <input
            id="topnav-search"
            type="search"
            placeholder={search.placeholder ?? 'Cari dataset, area kerja, sumur, atau dokumen…'}
            value={search.value ?? ''}
            onChange={(e) => search.onChange?.(e.target.value)}
            className="flex-1 min-w-0 border-0 outline-0 bg-transparent text-sm placeholder:text-ink-5"
          />
          {search.shortcutHint ? (
            <span
              aria-hidden="true"
              className="inline-flex items-center px-2 py-px rounded-pill border border-line-2 text-[10px] font-semibold text-ink-3"
            >
              {search.shortcutHint}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* ── Links ───────────────────────────────────────────────── */}
      <ul className="flex items-center gap-1 ml-auto list-none m-0 p-0">
        {links.map((link) => {
          const active = link.route === activeRoute;
          return (
            <li key={link.route}>
              <a
                href={link.route}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route);
                }}
                onKeyDown={(e) => handleLinkKey(e, link.route)}
                className={[
                  'inline-flex items-center gap-2',
                  'px-2.5 py-1.5 rounded-2',
                  'font-semibold text-sm whitespace-nowrap',
                  'transition-colors duration-hf ease-hf',
                  active
                    ? 'text-green-700 bg-green-50'
                    : 'text-ink-3 hover:text-ink hover:bg-surface-3',
                ].join(' ')}
              >
                {link.icon ? <Icon name={link.icon} size={14} aria-hidden /> : null}
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* ── Actions + User ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 ml-2">
        <button
          type="button"
          aria-label="Help"
          title="Help"
          onClick={onHelpClick}
          className={[
            'inline-flex items-center justify-center',
            'w-[30px] h-[30px] rounded-2',
            'border border-line bg-surface',
            'text-ink-2 transition-colors duration-hf',
            'hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2',
          ].join(' ')}
        >
          <Icon name="help" size={15} aria-hidden />
        </button>

        <button
          type="button"
          aria-label={bellLabel}
          title={bellLabel}
          onClick={onNotificationsClick}
          className={[
            'relative inline-flex items-center justify-center',
            'w-[30px] h-[30px] rounded-2',
            'border border-line bg-surface',
            'text-ink-2 transition-colors duration-hf',
            'hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2',
          ].join(' ')}
        >
          <Icon name="bell" size={15} aria-hidden />
          {hasNotifications ? (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-red-500 border-[1.5px] border-white"
            />
          ) : null}
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-line">
            <span
              aria-hidden="true"
              className={[
                'inline-flex items-center justify-center flex-none',
                'w-7 h-7 rounded-full',
                'bg-green-100 text-green-700 border border-green-200',
                'font-sans font-bold text-xs leading-none',
              ].join(' ')}
            >
              {user.initials}
            </span>
            <div className="flex flex-col gap-px leading-tight">
              <span className="text-xs font-semibold text-ink whitespace-nowrap">
                {user.org}
              </span>
              <span className="text-[10px] text-ink-4 whitespace-nowrap">{user.role}</span>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
});
