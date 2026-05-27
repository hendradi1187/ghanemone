/**
 * AppShell — chrome untuk protected routes (TopNav + Sidebar + Outlet).
 *
 * Pola: route `/` (protected) di-wrap dengan AppShell di router.tsx
 * (lihat). Child route mengisi `<Outlet />` di kolom main content.
 *
 * Responsif:
 *   - ≥ lg (1024px): sidebar visible permanent
 *   - < lg: sidebar collapse — bisa di-toggle via state `sidebarOpen`
 *
 * A11y:
 *   - `<Page>` primitive memberikan landmark default
 *   - TopNav already provides `<nav role="navigation" aria-label="Primary">`
 *   - Main content wrapped in `<main role="main">`
 *   - Skip-to-content link di awal (tab pertama)
 */
import { useState, useMemo, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DropdownMenu,
  Icon,
  Page,
  Sidebar,
  TopNav,
  toast,
  type SidebarBrowseItem,
  type SidebarCategoryItem,
  type SidebarProviderItem,
  type TopNavLink,
  type TopNavUser,
} from '@ghanem/ui';
import { useAuth } from '../hooks/use-auth';
import { APP_SIDEBAR_SECTIONS, SIDEBAR_ITEM_ROUTES } from './sidebar-config';

/**
 * Definisi 7 top-level routes (lihat docs/component-map.md §1).
 * Sprint 2C: DASHBOARD route diubah dari `/` ke `/dashboard` karena `/` sekarang
 * adalah HomePage publik (landing page).
 */
const TOP_NAV_LINKS: TopNavLink[] = [
  { label: 'EXPLORE', route: '/explore' },
  { label: 'MAP', route: '/map' },
  { label: 'DASHBOARD', route: '/dashboard' },
  { label: 'ANALYTICS', route: '/analytics' },
  { label: 'WORKSPACE', route: '/workspace' },
  { label: 'APPS', route: '/apps' },
  { label: 'MONITORING', route: '/monitoring' },
];


function deriveInitials(emailOrName: string): string {
  const parts = emailOrName.split(/[._@\-\s]/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return emailOrName.slice(0, 2).toUpperCase();
}

function roleDisplayLabel(role: string | null): string {
  switch (role) {
    case 'regulator':
      return 'Regulator';
    case 'kkks_operator':
      return 'KKKS Operator';
    case 'analyst':
      return 'Analyst';
    case 'admin':
      return 'Admin';
    default:
      return 'Member';
  }
}

export function AppShell(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tentukan active route — match prefix supaya `/datasets/wk-onwj` tetap
  // mengaktifkan tab "EXPLORE".
  // Sprint 2C: `/dashboard` sekarang route utama dashboard (bukan `/`).
  const activeRoute = useMemo(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path.startsWith('/dashboard')) return '/dashboard';
    const matched = TOP_NAV_LINKS.find(
      (l) => l.route !== '/dashboard' && path.startsWith(l.route),
    );
    return matched?.route ?? '/dashboard';
  }, [location.pathname]);

  /**
   * Tentukan active sidebar item berdasarkan path + search params.
   * Prioritas: param match lebih spesifik dari path-only match.
   */
  const activeSidebarId = useMemo((): string => {
    const path = location.pathname;
    const categoryParam = searchParams.get('category');
    const providerParam = searchParams.get('provider');
    const typeParam = searchParams.get('type');

    // Cek item yang paling spesifik dulu (param match)
    for (const [id, route] of Object.entries(SIDEBAR_ITEM_ROUTES)) {
      if (
        route.path === path &&
        route.param &&
        route.value
      ) {
        if (route.param === 'category' && categoryParam === route.value) return id;
        if (route.param === 'provider' && providerParam === route.value) return id;
        if (route.param === 'type' && typeParam === route.value) return id;
      }
    }

    // Fallback: match path saja (tanpa param)
    for (const [id, route] of Object.entries(SIDEBAR_ITEM_ROUTES)) {
      if (route.path === path && !route.param) return id;
    }

    // Default saat di /explore tanpa param
    if (path === '/explore') return 'all-data';

    return '';
  }, [location.pathname, searchParams]);

  /**
   * Handle klik sidebar item — navigate ke route yang sesuai dari config.
   * Digunakan oleh semua variant (browse, category, provider).
   */
  const handleSidebarItemClick = useCallback(
    (item: SidebarBrowseItem | SidebarCategoryItem | SidebarProviderItem) => {
      const route = SIDEBAR_ITEM_ROUTES[item.id];
      if (!route) return;
      if (route.param && route.value) {
        navigate(`${route.path}?${route.param}=${encodeURIComponent(route.value)}`);
      } else {
        navigate(route.path);
      }
    },
    [navigate],
  );

  const topNavUser: TopNavUser | undefined = user
    ? {
        initials: deriveInitials(user.fullName ?? user.email),
        org: user.organization ?? 'Ghanem.one',
        role: roleDisplayLabel(user.role),
      }
    : undefined;

  const handleLogout = (): void => {
    // logout() is async but we navigate immediately; server-side invalidation
    // happens in the background (non-fatal if it fails).
    void logout().catch(() => null);
    toast.success('Anda telah keluar', {
      description: 'Sesi diakhiri. Silakan login kembali untuk melanjutkan.',
    });
    navigate('/login', { replace: true });
  };

  return (
    <Page>
      {/* Skip-to-content link (a11y) — visible saat focus */}
      <a
        href="#main-content"
        className={[
          'sr-only focus:not-sr-only',
          'absolute top-2 left-2 z-tooltip',
          'px-3 py-2 bg-green-700 text-white rounded-2 text-sm font-medium',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
        ].join(' ')}
      >
        Lewati ke konten utama
      </a>

      {/*
       * TopNav stateless dari @ghanem/ui — tidak mengekspos `onLogout` callback
       * (driver: keep komponen stateless + reusable). Untuk Phase 8.6 kita
       * compose chevron user-menu dropdown di sebelahnya. Future: jika design
       * perlu integrate ke avatar TopNav, dapat extend TopNav `actions` slot.
       */}
      <div className="flex items-stretch bg-surface border-b border-line">
        <TopNav
          links={TOP_NAV_LINKS}
          activeRoute={activeRoute}
          onNavigate={(route) => navigate(route)}
          user={topNavUser}
          notificationsCount={3}
          search={{ placeholder: 'Cari dataset, area kerja, sumur…', shortcutHint: '⌘K' }}
          className="flex-1 border-b-0"
        />
        <div className="flex items-center pr-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Menu akun"
                title="Menu akun"
                className={[
                  'inline-flex items-center justify-center',
                  'w-7 h-7 rounded-pill',
                  'border border-line bg-surface text-ink-3',
                  'hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                <Icon name="chevron" size={12} aria-hidden />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {user ? (
                <>
                  <DropdownMenu.Label>{user.email}</DropdownMenu.Label>
                  <DropdownMenu.Separator />
                </>
              ) : null}
              <DropdownMenu.Item onSelect={() => navigate('/dashboard')}>
                <Icon name="user" size={14} aria-hidden /> Profil
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => navigate('/dashboard')}>
                <Icon name="settings" size={14} aria-hidden /> Pengaturan
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={handleLogout}>
                <Icon name="arrowR" size={14} aria-hidden /> Keluar
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop permanent, mobile via toggle (collapse) */}
        <div
          id="appshell-sidebar"
          className={[
            'lg:flex flex-col',
            sidebarOpen ? 'flex' : 'hidden',
          ].join(' ')}
        >
          <Sidebar
            sections={APP_SIDEBAR_SECTIONS}
            activeId={activeSidebarId}
            onItemClick={handleSidebarItemClick}
          />
        </div>

        {/* Mobile sidebar toggle button (visible < lg) */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-expanded={sidebarOpen}
          aria-controls="appshell-sidebar"
          aria-label={sidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
          className={[
            'lg:hidden absolute left-2 bottom-3 z-floating',
            'inline-flex items-center justify-center w-9 h-9 rounded-pill',
            'border border-line bg-surface text-ink-3 shadow-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name="layers" size={16} aria-hidden />
        </button>

        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 min-w-0 overflow-auto bg-surface-bg"
        >
          <Outlet />
        </main>
      </div>
    </Page>
  );
}

export default AppShell;
