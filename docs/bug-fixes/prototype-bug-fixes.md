# Prototype Bug Fixes — Phase 8.5

Tracking dokumen untuk 6 bug yang ditemukan saat Phase 6 handoff documentation
dari prototype (`prototype-app.jsx`, `hifi-pages-2.jsx`) ke production TS code.

**Tujuan dokumen ini:** Regression prevention. Kalau bug muncul lagi di
future iteration, search di file ini untuk lihat root cause, fix history,
dan verification status.

**Scope:** Sprint 8.5 task batch — port code dari prototype JSX (yang hanya
jalan di HTML harness karena hoisted globals + tidak ada strict mode) ke
production TS yang strict + bundled + tree-shaken.

---

## Status summary

| # | Bug | Severity | Fix location | Status |
|---|---|---|---|---|
| 1 | PageMap undeclared identifiers | Crash di bundler | `apps/web/src/pages/MapPage.tsx` | Fixed |
| 2 | Seismic components cross-file globals | Crash di bundler | `apps/web/src/features/seismic/*` | Fixed |
| 3 | Toast setTimeout ref leak | React warning + leak | `apps/web/src/main.tsx` (verified via Sonner) | Fixed |
| 4 | Toast `kind` ignored di renderer | UX/visual confusion | `packages/ui/src/feedback/Toast.tsx` (verified via Sonner) | Fixed |
| 5 | AI chat region missing aria-live | A11y blocker | `apps/web/src/features/ai-chat/ChatPanel.tsx` | Fixed |
| 6 | Filter debounce race | UX flicker | `apps/web/src/hooks/use-debounced-value.ts` | Fixed |

---

## Bug #1 — PageMap undeclared identifiers

### Original (prototype)

- **File:** `prototype-app.jsx`
- **Lines:** 859-1052 (`PageMap` component)
- **Symptom:** Komponen `PageMap` mereferensikan lima identifier yang
  tidak pernah dideklarasi:
  - `seismicOn` — dipakai di lines 873, 885, 888, 890, 949, 951, 952, 956,
    1014, 1022, 1042, 1048
  - `showHorizons` — dipakai di lines 970, 972, 976; setter `setShowHorizons`
    dipanggil di line 966 tanpa ada `useState`
  - `showFaults` — dipakai di lines 994, 996, 1000; setter `setShowFaults`
    dipanggil di line 990
  - `SeismicCrossSection` — direference di line 1043 (di-resolve via global
    karena hifi-pages-2.jsx loaded di harness same window)
  - `SeismicWellDetails` — direference di line 1048 (sama, global)

  Prototype bekerja di HTML harness karena (a) babel-standalone tidak strict
  mode, (b) hifi-pages-2.jsx loaded sebagai `<script>` separate sehingga
  symbol-nya jadi window global, (c) tidak ada TS checker. Begitu dipindah
  ke Vite + TS strict, semua identifier itu `Cannot find name` errors.

### Fix applied

- **File:** `apps/web/src/pages/MapPage.tsx`
- **Tagged:** `// Fix bug #1: …` di komentar header file + di komentar
  inline di state declarations.
- **Apa yang dilakukan:**
  ```ts
  const [seismicOn, setSeismicOn] = useState<boolean>(false);
  const [showHorizons, setShowHorizons] = useState<boolean>(true);
  const [showFaults, setShowFaults] = useState<boolean>(true);
  ```
  Semua tiga state sekarang explicit dideklarasi di top of komponen. Setter
  `setShowHorizons` / `setShowFaults` tidak lagi orphan call.
- **Verification:** Grep `seismicOn|showHorizons|showFaults` di file
  hanya menghasilkan declared usage (state + setter + checkbox `checked={}`).

---

## Bug #2 — SeismicCrossSection + SeismicWellDetails cross-file deps

### Original (prototype)

- **Files:**
  - `hifi-pages-2.jsx:399-585` — `function SeismicCrossSection(props)`
  - `hifi-pages-2.jsx:283-394` — `function WellDetailsPanel(props)`
    (referenced as `SeismicWellDetails` dari prototype-app.jsx)
  - Consumer: `prototype-app.jsx:1043, 1048`
- **Symptom:** Kedua komponen jadi global symbol di window via
  babel-standalone transform di HTML harness. Bekerja karena both `<script>`
  tag loaded sebelum render. Di bundler (Vite + ESM), tidak ada cross-script
  global sharing → `ReferenceError: SeismicCrossSection is not defined`.

### Fix applied

- **Files:**
  - `apps/web/src/features/seismic/SeismicCrossSection.tsx` — port stub
    dengan proper TS interface `SeismicCrossSectionProps`. Actual SVG
    rendering dari hifi-pages-2.jsx:411-535 deferred ke Phase 8.7 (Three.js).
  - `apps/web/src/features/seismic/SeismicWellDetails.tsx` — port stub
    dengan proper TS interface `SeismicWellDetailsProps` + `WellSummary`.
    Renamed dari `WellDetailsPanel` agar match consumer's import name.
  - `apps/web/src/features/seismic/index.ts` — barrel re-export.
- **Tagged:** `// Fix bug #2: …` di komentar header semua 3 file di atas
  + di consumer (MapPage.tsx).
- **Apa yang dilakukan:** Modul-modul sekarang di-`export` proper ES dan
  diimpor oleh `MapPage` lewat:
  ```ts
  import { SeismicCrossSection, SeismicWellDetails } from '../features/seismic';
  ```
- **Verification:** `import` statement explicit di MapPage; tidak ada
  references ke window global. Bundle akan tree-shake unused exports.

---

## Bug #3 — Toast setTimeout ref leak

### Original (prototype)

- **File:** `prototype-app.jsx`
- **Lines:** 168-172 (di `AppProvider.toast` callback)
- **Symptom:**
  ```js
  const toast = React.useCallback((msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, msg, kind }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200);
    //         ^ ref tidak disimpan, tidak ada cleanup
  }, []);
  ```
  Saat `AppProvider` unmount sebelum 3.2s window habis (test teardown, hot
  module replacement, route swap dengan Suspense fallback) → timer tetap
  fires `setToasts` pada setter yang sudah disconnect → React warning
  "Can't perform state update on unmounted component" + memory leak
  (closure tertahan).

### Fix applied

- **File:** `apps/web/src/main.tsx` — mount Sonner `<Toaster />` di root.
- **File:** `packages/ui/src/feedback/Toast.tsx` — wraps Sonner exports.
- **Tagged:** `// Fix bug #3 (prototype): …` di komentar header `main.tsx`.
- **Apa yang dilakukan:** Sonner internally manages timer lifecycle pada
  provider tree-nya sendiri. Pada unmount, Sonner clears semua pending timer.
  Tidak perlu custom toast implementation di consumer code.
- **Verification:**
  - `<Toaster />` mounted di `apps/web/src/main.tsx:48`
  - Tidak ada custom toast implementation tersisa di codebase (grep
    `setToasts\|setTimeout.*toast` mengembalikan zero hits di `apps/`
    dan `packages/`).
  - Consumer pakai `toast.success(...)` etc dari `@ghanem/ui`.

---

## Bug #4 — Toast `kind` parameter ignored di renderer

### Original (prototype)

- **File:** `prototype-app.jsx`
- **Lines:** 168 (function signature accepts `kind`) vs 208-217 (renderer
  ignores it).
- **Symptom:** Function `toast(msg, kind = 'ok')` accept `kind` parameter
  dan kind disimpan ke array `{ id, msg, kind }`. Tapi renderer di
  `ToastStack` (lines 208-217) hanya memakai single dark background
  (`var(--hf-ink)`) tanpa branching by kind. Konsekuensi: success / warning /
  error toasts semua terlihat sama → user tidak bisa membedakan severity
  by visual.

### Fix applied

- **File:** `packages/ui/src/feedback/Toast.tsx` — Sonner wrapper
- **Tagged:** `// Fix bug #4 (prototype): …` di komentar header.
- **Apa yang dilakukan:** Sonner exposes 4 default variants out of box:
  - `toast.success(msg)` — green tint
  - `toast.error(msg)` — red tint
  - `toast.warning(msg)` — amber tint
  - `toast.info(msg)` — blue tint
  Brand styling di-apply via `toastOptions.classNames`:
  ```ts
  classNames: {
    success: 'group toast-success',
    error: 'group toast-error',
    warning: 'group toast-warning',
    info: 'group toast-info',
  }
  ```
- **Verification:**
  - Sonner re-export `toast` di `packages/ui/src/feedback/Toast.tsx:68`
    (sebelum edit Phase 8.5) / equivalent line sekarang setelah comment block.
  - LoginPage di `apps/web/src/pages/LoginPage.tsx` sudah memakai
    `toast.success(...)` / `toast.error(...)` — demonstrasi multi-variant.
  - Lihat infra/tokens-mapping.md untuk brand color values yang dipakai
    di `toast-success` etc class.

---

## Bug #5 — AI chat region missing aria-live

### Original (prototype)

- **File:** `prototype-app.jsx`
- **Lines:** 1137-1169 (message log container di `AiAssistant`)
- **Symptom:** Message log container hanya `<div ref={scrollRef} style={…}>`
  tanpa `role="log"` atau `aria-live`. Saat assistant reply muncul (via
  `setMessages` setelah `await window.claude.complete`), screen reader (NVDA,
  JAWS, VoiceOver) tidak mengannounce konten baru → tidak accessible.

  Ini diakui di `docs/component-map.md` (table §5):
  > AI chat messages | `aria-live="polite"` on messages region | **NEW: missing**

### Fix applied

- **File:** `apps/web/src/features/ai-chat/ChatPanel.tsx`
- **Tagged:** `// Fix bug #5 (prototype): …` di komentar header + inline
  di JSX message log container.
- **Apa yang dilakukan:**
  ```tsx
  <div
    role="log"
    aria-live="polite"
    aria-atomic="false"
    aria-relevant="additions"
    aria-label="Conversation"
    aria-busy={busy}
  >
    {messages.map(...)}
  </div>
  ```
  Composer textarea **tidak** dapat `aria-live` (kalau iya, screen reader
  akan re-announce setiap keystroke yang sedang user ketik).
- **Verification:**
  - `aria-live="polite"` di ChatPanel.tsx (grep). Composer textarea
    (`<input id="ai-composer">`) tidak punya aria-live attribute.
  - `role="log"` ditambahkan sesuai WAI-ARIA pattern.
  - `aria-relevant="additions"` — hanya announce penambahan, tidak rebroadcast
    on removal (kita tidak menghapus messages selama session).
  - `aria-busy={busy}` saat AI sedang composing reply, supaya screen reader
    bisa hint user "assistant is working".

---

## Bug #6 — Filter debounce race

### Original (prototype)

- **File:** `prototype-app.jsx`
- **Lines:** 401, 404-409 (di `PageExplore`)
- **Symptom:**
  ```js
  React.useEffect(() => { setFilters(f => ({ ...f, q: localQ })); }, [localQ]);

  React.useEffect(() => {
    if (!filters.themes.size && !localQ) return;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, [filters.themes.size, localQ]);
  ```
  Effect kedua "set skeleton off after 350ms" cleanup-nya bekerja, tapi pola
  rapid typing menciptakan effect re-runs sangat sering. Setiap re-run:
  1. set `isLoading=true` (sync)
  2. schedule timer baru
  3. cleanup timer lama
  Karena step 1 sync sedangkan step 3 cleanup dari render sebelumnya datang
  belakangan, observed UX adalah skeleton flicker on/off pada rapid input.
  Tambahan: tidak ada throttling pada `filters.q` setter dari effect pertama
  → re-trigger ulang filter computation tiap keystroke.

### Fix applied

- **File:** `apps/web/src/hooks/use-debounced-value.ts`
- **Tagged:** `// Fix bug #6 (prototype): …` di komentar header + inline.
- **Apa yang dilakukan:** Hook `useDebouncedValue<T>(value, delayMs)`:
  - Setiap value change schedule new setTimeout.
  - Cleanup dari effect previous render men-`clearTimeout` handle sebelum
    timer fires → tidak ada setState pada unmounted, tidak ada race.
  - Consumer (Phase 8.6 ExplorePage) memakai debounced value sebagai TanStack
    Query key. Query cache + `keepPreviousData` menghilangkan kebutuhan
    manual skeleton flicker.
- **Verification:**
  - Hook signature strict-typed; tidak ada `any`.
  - `clearTimeout` dipanggil di cleanup setiap effect run dan pada unmount.
  - Unit test stubs documented di header komentar — akan di-implement di
    Task #15 (Vitest setup) atau dedicated hooks test task.

---

## Files created / modified

| File | Kind | Bug(s) |
|---|---|---|
| `apps/web/src/hooks/use-debounced-value.ts` | NEW | #6 |
| `apps/web/src/features/seismic/SeismicCrossSection.tsx` | NEW | #2 |
| `apps/web/src/features/seismic/SeismicWellDetails.tsx` | NEW | #2 |
| `apps/web/src/features/seismic/index.ts` | NEW | #2 |
| `apps/web/src/pages/MapPage.tsx` | NEW | #1, #2 |
| `apps/web/src/features/ai-chat/ChatPanel.tsx` | NEW | #5 |
| `apps/web/src/features/ai-chat/index.ts` | NEW | #5 |
| `apps/web/src/main.tsx` | EDIT (comment only) | #3 |
| `packages/ui/src/feedback/Toast.tsx` | EDIT (comment only) | #4 |
| `docs/bug-fixes/prototype-bug-fixes.md` | NEW | meta |

---

## Cross-references

- Original quirks catalog: `docs/state-model.md` §6 (Toast), §7 (Race), §3
  (Effect cleanup hygiene)
- Component-level a11y checklist: `docs/component-map.md` §5
- PageMap bug callout: `docs/component-map.md` §2 (`<PageMap>` entry, lines
  293-303 di doc)
- AI chat a11y gap callout: `docs/component-map.md` §2 (`<AiAssistant>` entry)
- ADR re Sonner choice (toast lifecycle): `docs/decisions/0004-tech-stack-finalize.md`

---

## Deferred follow-up

Bug fixes ini complete untuk Phase 8.5 scope. Deferred:

- **Actual Leaflet integration** untuk `MapPage` — Phase 8.3 follow-up
  (`<RealMap>` component port dari `prototype-realmap.jsx`).
- **Actual SEG-Y rendering** untuk `SeismicCrossSection` — Phase 8.7
  (Three.js + `/seismic/:id/cross-section` API).
- **Actual AI API wiring** untuk `ChatPanel` — Phase 8.6 / 9
  (`POST /api/v1/ai/ask` SSE stream).
- **Unit tests** untuk `useDebouncedValue` — Task #15 (Vitest setup).
- **Zustand `useAppStore`** — Phase 8.6; saat ini `mapLayers` di MapPage
  local state.

Begitu salah satu deferred item diaktifkan, re-verify bug fixes masih
in-place di sini.
