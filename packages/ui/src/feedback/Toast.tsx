/**
 * Toast — Sonner wrapper dengan brand styling.
 *
 * Fix bug #4 (prototype): 4 visual variants (success / error / warning /
 * info) dengan brand colors.
 *
 * Original prototype's `toast(msg, kind = 'ok')` di prototype-app.jsx:168
 * menerima parameter `kind` tapi renderer di prototype-app.jsx:208-217
 * memakai single dark background untuk semua jenis → user tidak bisa
 * membedakan "success" dari "error" / "warning" secara visual. Itu masalah
 * UX yang signifikan terutama untuk Compliance Officer (approve/reject)
 * dimana feedback warna penting.
 *
 * Sonner exposes 4 variants out of the box (lihat re-export `toast` di
 * bawah file ini): `toast.success`, `toast.error`, `toast.warning`,
 * `toast.info`. Brand styling di-apply lewat `classNames` di `toastOptions`
 * dengan token-aligned colors (lihat infra/tokens-mapping.md).
 *
 * Lihat docs/bug-fixes/prototype-bug-fixes.md §4 untuk traceback lengkap.
 *
 * Sonner adalah toast lib yang sudah a11y-correct (`role="status"`/`"alert"`),
 * dengan API ergonomic: `toast.success('…')`, `toast.error('…')`, dll.
 *
 * Mount satu `<Toaster />` di app root (apps/web/src/main.tsx). Kemudian
 * dari mana saja call `toast.*` — sonner manage internal queue + lifecycle.
 *
 * Defaults yang kami pilih:
 *   - position: top-right (consistent dengan top nav notifications)
 *   - max visible: 3
 *   - duration: 4000ms (cukup baca tanpa terlalu lama menutup map content)
 *   - closeButton: true (dismissible)
 *   - richColors: false — kami pakai styling sendiri via toastOptions
 */
import { Toaster as SonnerToaster, toast as sonnerToast, type ToasterProps } from 'sonner';

/**
 * Brand-themed Toaster. Drop di app root sekali.
 *
 * Override props bila perlu (e.g., position berbeda untuk admin app):
 *   <Toaster position="bottom-right" duration={2000} />
 */
export function Toaster(props: ToasterProps = {}): JSX.Element {
  return (
    <SonnerToaster
      position="top-right"
      duration={4000}
      visibleToasts={3}
      closeButton
      richColors={false}
      toastOptions={{
        // Brand colors via inline style (Sonner pakai CSS variables internal).
        // reason: Sonner butuh inline style untuk CSS vars; Tailwind class tidak applicable
        // ke shadow DOM internal Sonner. Hardcoded token values mirror packages/ui/src/tokens.
        style: {
          background: '#ffffff',
          color: '#0e1726',
          border: '1px solid #e6e1d4',
          borderRadius: '8px',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(14,23,38,0.12)',
        },
        classNames: {
          success: 'group toast-success',
          error: 'group toast-error',
          warning: 'group toast-warning',
          info: 'group toast-info',
        },
      }}
      {...props}
    />
  );
}

/**
 * Re-export sonner `toast` API. 4 default variants:
 *   - toast.success(message, options?)
 *   - toast.error(message, options?)
 *   - toast.warning(message, options?)
 *   - toast.info(message, options?)
 *
 * Generic: `toast(message)` — neutral, default variant.
 * Async: `toast.promise(promise, { loading, success, error })`.
 */
export const toast = sonnerToast;

export type { ToasterProps };
