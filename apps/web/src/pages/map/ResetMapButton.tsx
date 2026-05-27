/**
 * ResetMapButton — tombol floating untuk fly-back ke default Indonesia view.
 *
 * Task #22 (Goal B + C):
 *   - Icon: Lucide `Globe2` (melambangkan "kembali ke overview dunia/Indonesia)
 *   - Posisi: bottom-right, di atas legenda Leaflet (z-floating-overlay)
 *   - Smart visibility: hanya tampil kalau user sudah interaksi manual dengan peta
 *     (pan/zoom). Kalau peta masih di default view, tombol hidden.
 *   - Tooltip: "Reset ke tampilan Indonesia"
 *   - A11y: aria-label untuk screen reader, focus ring via focus-visible
 *
 * Ukuran 40×40px sesuai spec Task #22. Style pakai design tokens, zero hex.
 */
import { type ReactElement } from 'react';
import { Icon } from '@ghanem/ui';

export interface ResetMapButtonProps {
  /** Apakah tombol visible (Goal C: hanya tampil kalau hasInteracted). */
  visible: boolean;
  /** Callback saat tombol diklik — parent trigger flyToDefaultSignal. */
  onClick: () => void;
}

export function ResetMapButton({ visible, onClick }: ResetMapButtonProps): ReactElement | null {
  // Goal C: Sembunyikan sepenuhnya saat user belum interaksi manual.
  // Pakai opacity + pointer-events supaya ada transisi smooth masuk/keluar.
  return (
    <button
      type="button"
      aria-label="Reset ke tampilan Indonesia"
      title="Reset ke tampilan Indonesia"
      onClick={onClick}
      className={[
        // Dimensi 40×40px sesuai spec
        'w-10 h-10',
        // Style surface: bg-surface border shadow, rounded-md
        'inline-flex items-center justify-center',
        'bg-surface border border-line rounded-2 shadow-3',
        // Hover state
        'hover:bg-surface-2 hover:border-line-2',
        // Focus ring a11y
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
        // Transition smooth masuk/keluar
        'transition-all duration-slow ease-hf',
        // Smart visibility — Goal C
        visible
          ? 'opacity-100 pointer-events-auto translate-y-0'
          : 'opacity-0 pointer-events-none translate-y-1',
        // Kursor
        'cursor-pointer',
      ].join(' ')}
    >
      <Icon name="globe" size={16} aria-hidden className="text-ink-3" />
    </button>
  );
}
