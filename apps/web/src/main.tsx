// Fix bug #3 (prototype): Toast lifecycle managed by Sonner via `<Toaster>`.
//
// Original prototype's AppProvider.toast (prototype-app.jsx:168-172) scheduled
// `setTimeout(... 3200)` untuk auto-dismiss tanpa menyimpan handle, sehingga
// kalau provider unmounted (test teardown, hot reload, route swap dengan
// suspense boundary di atasnya), timer tetap fires `setToasts` pada komponen
// dead → React warning "Can't perform state update on unmounted component"
// + memory leak (ref ke setter tertahan sampai timer kedaluwarsa).
//
// Sonner internally manages timer lifecycle on its own provider tree dan
// melakukan cleanup pada unmount. Kita hanya mount `<Toaster />` sekali di
// root sini; consumers memakai `toast.*` dari `@ghanem/ui` tanpa harus
// memikirkan timer.
//
// Lihat docs/bug-fixes/prototype-bug-fixes.md §3 untuk traceback lengkap.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// reason: BrowserRouter dipindah ke router.tsx via `createBrowserRouter`.
// `RouterProvider` di App.tsx menggantikan `<BrowserRouter>` wrapper di sini.

// Bundled fonts — @fontsource ships woff2 di node_modules, di-bundle oleh Vite.
// Tidak ada runtime egress ke fonts.googleapis.com (ADR 0005 + ADR 0002).
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import { Toaster, TooltipProvider } from '@ghanem/ui';
import App from './App';
// Leaflet CSS — wajib di-load sebelum render MapPage supaya tile + marker
// rendering benar. Vite akan bundle ke chunk app entry (~10KB gzipped).
import 'leaflet/dist/leaflet.css';
// Global stylesheet — Tailwind base + design tokens dari @ghanem/config tailwind-base preset.
import './index.css';

// Root client-state defaults aligned dengan ADR 0004 (TanStack Query staleTime 60s).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root tidak ditemukan di index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={500}>
        <App />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
