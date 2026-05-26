/**
 * App — root component.
 *
 * Tanggung jawab:
 *   1. Hydrate auth session dari localStorage (one-shot on mount) sebelum
 *      AuthGuard di route evaluator berjalan.
 *   2. Mount RouterProvider dengan config dari `./router`.
 *
 * QueryClient, TooltipProvider, dan Toaster di-mount di `main.tsx` (one level
 * lebih atas) supaya tidak ikut re-mount saat App di-suspended (lazy route
 * boundaries di bawah RouterProvider).
 */
import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import { router } from './router';

export default function App(): JSX.Element {
  const hydrate = useAuthStore((s) => s.hydrate);
  // reason: hydrate hanya boleh jalan sekali. StrictMode (dev) memicu effect dua kali
  // — guard ref memastikan tidak ada double-hydrate yang bisa override perubahan
  // user (login → langsung logout di re-mount StrictMode).
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    hydrate();
  }, [hydrate]);

  return <RouterProvider router={router} />;
}
