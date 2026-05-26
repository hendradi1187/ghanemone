# ADR 0005 — Font Loading: @fontsource (Bundled) instead of Google Fonts CDN

**Status:** Accepted
**Date:** 2026-05-19
**Decision maker:** Hendra Dinata (hendra@pm.ghanemtech.co.id)
**Context:** Phase 8 — Frontend Foundation, follow-up dari [ADR 0002](./0002-hosting-on-prem-skk-migas.md) (on-prem, minimal egress) dan [ADR 0004](./0004-tech-stack-finalize.md) (Vite + React frontend).

## Konteks

Prototype + scaffold awal Phase 7 menggunakan Google Fonts CDN (`https://fonts.googleapis.com/css2?...`) untuk load Inter, Inter Tight, JetBrains Mono. Decision ini di-revisit di Phase 8 ketika frontend mulai di-port ke production code:

- **Firewall on-prem SKK Migas blokir `fonts.googleapis.com` + `fonts.gstatic.com`** secara default (network requirements [ADR 0002 §Network](./0002-hosting-on-prem-skk-migas.md#network-requirements-coordinate-dengan-skk-migas-it) tidak mencantumkan Google Fonts sebagai egress yang di-approve).
- Browser yang dijalankan dari workstation user SKK Migas akan menerima `net::ERR_TIMED_OUT` ketika request font CSS → fallback ke system fonts → visual inconsistency + FOUT yang jelek.
- Untuk offline scenarios (presentasi internal di ruang server tanpa internet, demo lapangan), font harus available tanpa network.

## Keputusan

**Pakai `@fontsource/*` npm packages (bundled woff2) untuk semua font Ghanem.one.**

Specifically:
- `@fontsource/inter` — UI body font, weights 400/500/600/700
- `@fontsource/inter-tight` — display font (headings), weights 500/600/700/800
- `@fontsource/jetbrains-mono` — monospace (code/KPI/data), weights 400/500

Setiap weight di-import secara explicit (bukan `@fontsource/inter` root yang load semua weights) untuk **menjaga bundle size minimum**. Import dilakukan di `apps/web/src/main.tsx` + `apps/admin/src/main.tsx` sekali — Vite akan tree-shake CSS @font-face declarations + bundle woff2 files sebagai asset.

## Alternatif yang Dipertimbangkan

| Alternatif | Pro | Kontra | Kenapa Tidak |
|---|---|---|---|
| **Keep Google Fonts CDN** | Zero-bundle, CDN cache lintas situs, latest version otomatis | Firewall on-prem blokir; tidak reproducible (Google bisa update font subset/version tanpa notice); privacy concern (Google sees user IP) | Violates ADR 0002 (no runtime egress untuk data primary path) |
| **Self-host woff2 manually** (download files, place di `public/fonts/`, write `@font-face`) | Full control, no npm dep | Ops overhead (manual update per font version), tidak versioned via package.json, mudah lupa di-update | More ops surface tanpa benefit dibanding @fontsource |
| **Tambah `fonts.googleapis.com` ke egress allow-list** | Bisa pakai CDN tanpa code change | Setiap request font hit external network — latency variable, point of failure tambahan, audit trail kompleks | Violates "no runtime egress" principle untuk asset yang bisa di-bundle |
| **@fontsource (bundled)** ✅ | Versioned via npm (reproducible builds), zero runtime egress, offline-capable, tree-shakeable per weight | Bundle size +~150KB woff2 (compressed) | Best trade-off untuk on-prem context |

## Konsekuensi

### Positive
- **Zero runtime egress untuk fonts** — sejalan dengan ADR 0002 posture
- **Reproducible builds** — version pinned di `package.json` (^5.1.0), CI build outputnya identical
- **Offline-capable** — app tetap render dengan font brand meski tidak ada internet
- **Versioned upgrades** — Renovate/Dependabot bisa propose font updates via PR, di-review seperti dep lainnya
- **Tree-shakeable** — hanya weights yang di-import yang di-bundle (tidak semua 9 weights Inter)
- **No privacy leak** — user IP tidak di-share ke Google saat load font

### Negative
- **Bundle size meningkat ~150 KB** (compressed woff2) initial download
  - Mitigasi: HTTP/2 multiplexing + `Cache-Control: immutable, max-age=31536000` di nginx → first-load cost satu kali, subsequent visit gratis dari cache
  - Mitigasi: woff2 di-compress dengan Brotli oleh Vite production build
- **Dep tree tambah 3 packages** — minor maintenance surface
- **Updates require npm install** — jika Inter rilis version baru, perlu `pnpm update` + CI rebuild (vs CDN yang auto-pull latest)

### Bundle Size Estimate

| Font | Weights Loaded | Approx Size (woff2, gzipped) |
|---|---|---|
| Inter | 400, 500, 600, 700 | ~60 KB |
| Inter Tight | 500, 600, 700, 800 | ~50 KB |
| JetBrains Mono | 400, 500 | ~40 KB |
| **Total** | 10 files | **~150 KB** |

Dibanding initial JS bundle budget 250 KB (ADR 0004), font budget 150 KB acceptable. Fonts di-load paralel dengan JS bundle (Vite emits sebagai static assets dengan `font/woff2` MIME).

## Implementation Notes

### Files modified Phase 8.3
- `apps/web/package.json` + `apps/admin/package.json` — add 3 `@fontsource/*` deps
- `apps/web/src/main.tsx` + `apps/admin/src/main.tsx` — import per-weight CSS (10 imports total)
- `apps/web/index.html` + `apps/admin/index.html` — REMOVE `<link rel="preconnect" ...>` + `<link rel="stylesheet" href="https://fonts.googleapis.com/...">`
- `apps/web/src/index.css` + `apps/admin/src/index.css` — update header comment (font loading strategy changed)

### Tailwind config tidak berubah
`packages/config/tailwind-base.ts` sudah punya `fontFamily.sans = ['Inter', ...fallbacks]`. @fontsource registers `@font-face` declarations dengan font-family name yang sama (`Inter`, `Inter Tight`, `JetBrains Mono`) — Tailwind utility classes (`font-sans`, `font-display`, `font-mono`) tetap resolve seperti biasa.

### Fallback stack tetap aktif
Bahkan jika font @fontsource gagal load (mis. asset MinIO down), fallback stack di Tailwind config tetap render font system (`system-ui`, `-apple-system`, dst.) — graceful degradation.

## Migration / Rollback Path

Rollback tidak diperlukan — keputusan ini strictly better untuk on-prem. Jika di masa depan ada use case yang butuh Google Fonts (mis. white-label site yang shared lintas customer), implementasi side-by-side: keep @fontsource untuk app utama, allow CDN untuk subdomain tertentu via dedicated config.

## References

- [ADR 0002 — Hosting On-Prem SKK Migas](./0002-hosting-on-prem-skk-migas.md)
- [ADR 0004 — Tech Stack Finalize](./0004-tech-stack-finalize.md)
- [@fontsource project](https://fontsource.org/) — npm-packaged Google Fonts (mirror)
- [Phase 8 timeline](../../todolist.md)
