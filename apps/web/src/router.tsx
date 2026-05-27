/**
 * Router — React Router v6 config.
 *
 * Public routes:
 *   - /                       HomePage (landing page — tanpa AppShell sidebar)
 *   - /login                  LoginPage (mock auth)
 *
 * Protected routes (di-wrap AuthGuard + AppShell layout):
 *   - /dashboard              DashboardPage (Phase 8.9 — persona-aware)
 *   - /explore                ExplorePage
 *   - /datasets/:id           DatasetDetailPage (Phase 8.8)
 *   - /map                    MapPage (Phase 8.10 — Leaflet integration)
 *   - /analytics              AnalyticsPage (Phase 8.11 — chart builder)
 *   - /workspace              WorkspacePage (Phase 8.12 — project list)
 *   - /workspace/:projectId   ProjectKanbanPage (Phase 8.12 — Kanban dnd-kit)
 *   - /apps                   AppsPage (Phase 8.13 — marketplace)
 *   - /monitoring             MonitoringPage
 *   - /upload                 UploadPage (KKKS)
 *   - /compliance             CompliancePage (Regulator)
 *
 * Sprint 2C change:
 *   - `/` sekarang adalah HomePage (landing page publik, no AppShell).
 *   - `/dashboard` adalah entry point AppShell (menggantikan `/` index route).
 *   - AuthGuard tetap melindungi semua route app (redirect ke `/login` lalu back ke `/dashboard`).
 *
 * Fallback:
 *   - *                       NotFoundPage
 *
 * Lazy-load semua page modules — initial bundle hanya berisi router + auth.
 * Suspense fallback adalah minimal loader (centered spinner).
 */
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppShell } from './layouts/AppShell';

const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })),
);
const DatasetDetailPage = lazy(() =>
  import('./pages/DatasetDetailPage').then((m) => ({ default: m.DatasetDetailPage })),
);
const MapPage = lazy(() =>
  import('./pages/MapPage').then((m) => ({ default: m.MapPage })),
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const WorkspacePage = lazy(() =>
  import('./pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage })),
);
const ProjectKanbanPage = lazy(() =>
  import('./pages/workspace/ProjectKanbanPage').then((m) => ({
    default: m.ProjectKanbanPage,
  })),
);
const AppsPage = lazy(() =>
  import('./pages/AppsPage').then((m) => ({ default: m.AppsPage })),
);
const MonitoringPage = lazy(() =>
  import('./pages/MonitoringPage').then((m) => ({ default: m.MonitoringPage })),
);
const UploadPage = lazy(() =>
  import('./pages/UploadPage').then((m) => ({ default: m.UploadPage })),
);
const CompliancePage = lazy(() =>
  import('./pages/CompliancePage').then((m) => ({ default: m.CompliancePage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
);

/** Minimal centered loader untuk Suspense fallback. */
function RouteLoader(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center h-full min-h-[40vh] text-ink-4 text-sm"
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block w-4 h-4 border-2 border-line border-t-green-500 rounded-pill animate-spin"
        />
        Memuat…
      </span>
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }): JSX.Element {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

const routes: RouteObject[] = [
  // ── Public routes ──────────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <Lazy>
        <HomePage />
      </Lazy>
    ),
  },
  {
    path: '/login',
    element: (
      <Lazy>
        <LoginPage />
      </Lazy>
    ),
  },
  // ── Protected routes (AppShell) ────────────────────────────────────────
  // Pakai pathless parent (tanpa `path`) sebagai layout wrapper — ini valid
  // di React Router v6 dan memungkinkan child pakai absolute paths bebas.
  // Sebelumnya parent `/dashboard` dengan child `/explore` invalid karena
  // absolute child path harus start dengan parent path.
  {
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <Lazy>
            <DashboardPage />
          </Lazy>
        ),
      },
      {
        path: '/explore',
        element: (
          <Lazy>
            <ExplorePage />
          </Lazy>
        ),
      },
      {
        path: '/datasets/:id',
        element: (
          <Lazy>
            <DatasetDetailPage />
          </Lazy>
        ),
      },
      {
        path: '/map',
        element: (
          <Lazy>
            <MapPage />
          </Lazy>
        ),
      },
      {
        path: '/analytics',
        element: (
          <Lazy>
            <AnalyticsPage />
          </Lazy>
        ),
      },
      {
        path: '/workspace',
        element: (
          <Lazy>
            <WorkspacePage />
          </Lazy>
        ),
      },
      {
        path: '/workspace/:projectId',
        element: (
          <Lazy>
            <ProjectKanbanPage />
          </Lazy>
        ),
      },
      {
        path: '/apps',
        element: (
          <Lazy>
            <AppsPage />
          </Lazy>
        ),
      },
      {
        path: '/monitoring',
        element: (
          <Lazy>
            <MonitoringPage />
          </Lazy>
        ),
      },
      {
        path: '/upload',
        element: (
          <Lazy>
            <UploadPage />
          </Lazy>
        ),
      },
      {
        path: '/compliance',
        element: (
          <Lazy>
            <CompliancePage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
  },
];

export const router = createBrowserRouter(routes);
