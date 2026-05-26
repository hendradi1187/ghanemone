/**
 * useDebouncedValue — proper debounce hook with cleanup.
 *
 * Fix bug #6 (prototype): Proper debounce dengan cleanup.
 * Original prototype (prototype-app.jsx:404-409) scheduled a 350ms setTimeout
 * on every filter change but the previous timer was effectively replaced by
 * the cleanup returned from the same effect — namun pattern itu fragile dan
 * memicu race condition / flicker pada rapid input karena setiap render baru
 * juga membuat skeleton state ulang.
 *
 * Pola di sini: debounce nilainya saja (string/Set), bukan side-effect.
 * Consumer kemudian boleh memakai nilai debounced sebagai TanStack Query key
 * → query dedupe + `keepPreviousData` menghilangkan flicker tanpa skeleton
 * manual.
 *
 * Cleanup terjaga: setiap re-run effect men-`clearTimeout` handle sebelumnya;
 * unmount juga men-clear handle. Tidak ada `setState` pada komponen yang sudah
 * unmounted.
 *
 * Unit test stubs (untuk Phase 8.6 / Task #15):
 *   - returns initial value synchronously on first render
 *   - returns previous value during the debounce window
 *   - returns the latest value after delayMs elapsed
 *   - clears pending timer pada unmount (no setState warning)
 *   - clears pending timer ketika value berubah berkali-kali rapid (only
 *     the last value lands)
 *   - respects delayMs change (timer di-recreate dengan delay baru)
 */
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    // Fix bug #6 (prototype): clearTimeout di cleanup memastikan rapid input
    // tidak meninggalkan timer yang fires setelah komponen unmount atau
    // setelah value sudah berubah lagi.
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
