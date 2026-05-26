/**
 * LiveIndicator — pulsing dot + relative-time label ("Diperbarui 2 detik lalu").
 *
 * Re-render ringan via internal interval 1 detik untuk update relative time.
 * Cleanup on unmount.
 *
 * A11y:
 *   - `role="status"` + `aria-live="polite"` — supaya SR announce update
 *     status, throttled oleh interval (1s) bukan setiap render.
 */
import { useEffect, useState } from 'react';

export interface LiveIndicatorProps {
  /** Timestamp last update — di-update parent setiap event. */
  lastUpdate: Date | null;
  /** Label "Live" optional override. */
  label?: string;
}

function formatRelative(diffMs: number): string {
  if (diffMs < 2_000) return 'baru saja';
  if (diffMs < 60_000) return `${Math.floor(diffMs / 1000)} detik lalu`;
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} menit lalu`;
  return `${Math.floor(diffMs / 3_600_000)} jam lalu`;
}

export function LiveIndicator({ lastUpdate, label = 'Live' }: LiveIndicatorProps): JSX.Element {
  const [, force] = useState(0);

  // Re-render setiap 1 detik untuk refresh relative time.
  useEffect(() => {
    const tick = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const diffMs = lastUpdate ? Date.now() - lastUpdate.getTime() : null;
  const relative = diffMs !== null ? formatRelative(diffMs) : 'menunggu data…';

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-green-50 border border-green-200"
    >
      <span className="relative inline-flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-[11px] font-semibold text-green-700">{label}</span>
      <span className="text-[11px] text-ink-4">· {relative}</span>
    </div>
  );
}
