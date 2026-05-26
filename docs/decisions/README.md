# Architecture Decision Records (ADRs)

Catatan keputusan arsitektur penting Ghanem.one. Setiap ADR berisi konteks, alternatif, keputusan, dan konsekuensi.

## Format

`NNNN-short-title.md` — sequential numbering, hyphens for spaces.

## Status Values

- **Proposed** — under discussion, not yet decided
- **Accepted** — decided, in effect
- **Superseded by ADR-XXXX** — replaced by newer decision
- **Deprecated** — no longer applicable

## Daftar ADRs

| # | Title | Status | Date |
|---|---|---|---|
| [0001](./0001-backend-framework-hybrid.md) | Backend Framework: Hybrid (NestJS + Python Workers) | Accepted | 2026-05-19 |
| [0002](./0002-hosting-on-prem-skk-migas.md) | Hosting: On-Prem SKK Migas Data Center | Accepted | 2026-05-19 |
| [0003](./0003-sso-jit-provisioning.md) | SSO Strategy: JIT Provisioning sebagai Primary | Accepted | 2026-05-19 |
| [0004](./0004-tech-stack-finalize.md) | Tech Stack Finalize: Frontend, State, Search, Tiles, Orchestration, CI/CD, Storage | Accepted | 2026-05-19 |
| [0005](./0005-font-loading-fontsource.md) | Font Loading: @fontsource (bundled) instead of Google Fonts CDN | Accepted | 2026-05-19 |

## Kapan Tulis ADR?

- Pilih framework/library mayor (React vs Vue, NestJS vs FastAPI)
- Pilih infrastructure (hosting, database, cache strategy)
- Trade-off arsitektur (sync vs async, monolith vs microservice)
- Security/compliance decisions (auth strategy, data residency)
- Apapun yang akan susah di-reverse setelah Phase 8+ dimulai

## Kapan Update ADR?

ADR adalah snapshot keputusan **pada waktunya**. Jangan edit ADR yang sudah Accepted untuk merefleksikan kondisi baru — tulis ADR baru dengan status "Supersedes ADR-XXXX" dan update ADR lama jadi "Superseded by ADR-YYYY".
