# Ghanem.one — Developer Handoff

Spatial Intelligence Platform untuk hulu migas Indonesia (regulator SKK Migas + KKKS).
Repo ini berisi **design-stage prototype** (HTML + inline JSX yang di-compile via Babel
Standalone di browser) yang akan diporting ke production stack di Phase 7.

> **Codename → brand:** File HTML masih bernama `AlasBuana *.html` (codename internal).
> Display brand di UI sudah `Ghanem.one`. Rename file saat porting; cross-file nav
> links di setiap HTML harus di-update bersamaan.

---

## 1. Audience dokumen ini

Dokumen ini ditujukan untuk **Tech Lead, Frontend Engineer, dan Backend Engineer**
yang akan memulai Phase 7 (Setup) dan Phase 8/9 (Build). Target: clone repo →
`npm install` → `npm run dev` jalan dalam < 30 menit setelah scaffolding production.

Semua spec API, schema database, auth flow, component map, dan state model
hidup di [`docs/`](./docs/).

| Topic | File |
|---|---|
| API contract (REST, OpenAPI 3.0) | [docs/api-contract.md](./docs/api-contract.md) |
| Data model (PostgreSQL + PostGIS DDL) | [docs/data-model.md](./docs/data-model.md) |
| Auth & SSO (OIDC SKK Migas) | [docs/auth-flow.md](./docs/auth-flow.md) |
| Component tree + props | [docs/component-map.md](./docs/component-map.md) |
| State model (AppCtx) | [docs/state-model.md](./docs/state-model.md) |
| Walkthrough deck + Q&A | [docs/handoff-deck.md](./docs/handoff-deck.md) |
| Build roadmap (Phase 6 → 14) | [todolist.md](./todolist.md) |

---

## 2. Apa yang sudah ada (current state)

3 deliverable design, satu repo:

```
ghanemone/
├── AlasBuana Wireframes.html      Wireframes — 10 sections, 20 artboards (mid-fi)
├── AlasBuana Hi-Fi.html           Hi-Fi mockups + Design System showcase
├── AlasBuana Prototype.html       Interactive prototype (clickable, Leaflet, Claude AI)
│
├── todolist.md                    Production roadmap (Phase 6 → 14)
├── docs/                          Handoff documentation (this folder)
│
├── hifi-tokens.css                Design tokens (color, type, spacing, radii, shadows)
├── styles.css                     Wireframe-only styles
│
├── design-canvas.jsx              Pan/zoom canvas + artboard chrome
├── tweaks-panel.jsx               Tweaks UI (in-design controls)
├── browser-window.jsx             Browser chrome (vestigial)
│
├── primitives.jsx                 Wireframe shared primitives (MapBlock SVG, etc)
├── page-*.jsx (9 files)           Wireframe pages
│
├── hifi-components.jsx            TopNav, Sidebar, Icon, HfMap, KPI, charts
├── hifi-explore.jsx               Hi-Fi Explore Data page
├── hifi-pages.jsx                 Hi-Fi Dashboard, Detail, Monitoring, Design System
├── hifi-pages-2.jsx               Hi-Fi Map View (+ Seismic 3D), Analytics, Workspace, Apps
├── hifi-mobile.jsx                Hi-Fi mobile screens
├── hifi-auxiliary.jsx             Hi-Fi Login, Upload, Compliance, 404
│
├── prototype-app.jsx              Prototype main (router, AppCtx, pages, AI assistant)
├── prototype-realmap.jsx          Real Leaflet map (Carto Positron tiles)
└── prototype-states.jsx           Loading skeletons, EmptyState, ErrorState
```

### Tech yang dipakai prototype (akan diganti di Phase 7)

| Library | Versi | Sumber load |
|---|---|---|
| React | 18.3.1 | CDN `unpkg.com` |
| Babel Standalone | 7.29.0 | CDN — compile JSX in-browser |
| Leaflet | 1.9.4 | CDN |
| Carto Positron tiles | — | `basemaps.cartocdn.com/light_all` (OSM data, ODbL) |
| Inter / Inter Tight / JetBrains Mono | Latest | Google Fonts |

**Tidak ada build step.** Semua di-compile di browser. Cara jalan lokal:

```bash
python3 -m http.server 8000
# buka http://localhost:8000/AlasBuana%20Prototype.html
```

Atau pakai VS Code Live Server. Buka file langsung via `file://` sebagian fitur
tidak bekerja (CORS untuk tiles).

---

## 3. Target production stack (Phase 7)

Berikut **rekomendasi** stack untuk mengeksekusi build. Final sign-off di Phase 7
oleh Tech Lead.

### Frontend
| Layer | Pilihan |
|---|---|
| Build tool | **Vite 5+** (fast HMR, native ESM) |
| Framework | **React 18+** dengan **TypeScript 5+** (strict mode) |
| Routing | **TanStack Router** atau **React Router v6** |
| Server state | **TanStack Query v5** (caching, retry, pagination, infinite scroll) |
| Client state | **Zustand** (ringan; sesuai pola AppCtx prototype) atau Redux Toolkit |
| Forms | **React Hook Form + Zod** |
| Map | **Leaflet 1.9+** (sudah dipakai prototype) atau **MapLibre GL JS** untuk vector tiles |
| Charts | **Recharts** atau **Visx** |
| Component primitives | **Radix UI** (dialog, dropdown, tooltip) |
| Drag & drop | **dnd-kit** (Workspace Kanban) |
| Tokens | Port `hifi-tokens.css` → CSS variables di `src/styles/tokens.css` atau **Tailwind** config |
| Toast | **Sonner** atau pertahankan `ToastStack` dari prototype |
| Testing | **Vitest** (unit), **Playwright** (E2E), **axe-core** (a11y) |
| i18n | **i18next** (Bahasa Indonesia default, English secondary) |

### Backend
| Layer | Pilihan |
|---|---|
| Runtime | **Node.js 20 LTS** dengan **NestJS** atau **Python 3.12** dengan **FastAPI** |
| Database | **PostgreSQL 16+** dengan **PostGIS 3.4+** |
| ORM | **Prisma** (Node) atau **SQLAlchemy 2.x** (Python) — keduanya support PostGIS via custom types |
| Cache | **Redis 7+** (session, tile cache, rate limit) |
| Object storage | **MinIO** (on-prem) atau **AWS S3** — SHP, SEG-Y, PDF |
| Tile server | **Martin** (Rust, fast) atau **pg_tileserv** |
| Search | **Meilisearch** (sederhana, BM25) atau **Elasticsearch 8+** |
| Queue | **BullMQ** (Redis-backed) atau **Celery** (Python) — untuk processing upload |
| Auth | **OIDC client** ke SSO SKK Migas (lihat [docs/auth-flow.md](./docs/auth-flow.md)) |
| Observability | **OpenTelemetry → Grafana Tempo/Loki**, **Sentry** untuk error |

### Infrastruktur
- Domain: `ghanem.one` (web), `api.ghanem.one` (REST), `tiles.ghanem.one` (vector/raster tiles)
- Data residency: **server di Indonesia** (UU PDP compliance)
- CI/CD: GitHub Actions
- Container: Docker + Kubernetes (atau Docker Compose untuk MVP)

---

## 4. Proposed monorepo structure (Phase 7)

```
ghanemone/                          Monorepo root (pnpm + Turborepo)
├── apps/
│   ├── web/                        Vite + React + TS — public-facing app
│   │   ├── src/
│   │   │   ├── pages/              Route-level components (Explore, Detail, Map, …)
│   │   │   ├── features/           Domain features (datasets, auth, map, ai-chat)
│   │   │   │   ├── datasets/       Hooks, components, types untuk dataset domain
│   │   │   │   └── map/            Leaflet wrapper + layer management
│   │   │   ├── components/         Cross-feature UI (TopNav, Sidebar, Toast)
│   │   │   ├── lib/                api client, auth utils, format helpers
│   │   │   ├── store/              Zustand stores (AppCtx → useAppStore)
│   │   │   ├── styles/             tokens.css (ported dari hifi-tokens.css)
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   ├── api/                        NestJS / FastAPI backend
│   │   ├── src/
│   │   │   ├── modules/            Datasets, Auth, Search, Upload, AI, Monitoring
│   │   │   ├── db/                 Migrations (Prisma / Alembic)
│   │   │   └── main.ts
│   │   └── ...
│   └── admin/                      (Phase 9+) Internal admin tools
├── packages/
│   ├── ui/                         @ghanem/ui — Storybook-driven design system
│   ├── types/                      Shared TS types (Dataset, User, Pipeline, …)
│   ├── tokens/                     Style Dictionary output (JSON → CSS/SCSS/TS)
│   └── config/                     ESLint, Prettier, tsconfig shared
├── docs/                           Handoff docs (this folder)
├── .github/workflows/              CI/CD pipelines
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. Quick-start (post-Phase-7 scaffold)

> Berikut script target. Saat ini belum berlaku — repo masih HTML/JSX. Skrip ini
> akan dieksekusi setelah scaffolding selesai di Phase 7.

```bash
# Prerequisites
# - Node.js 20+ (via nvm/volta)
# - pnpm 9+ (corepack enable && corepack prepare pnpm@latest --activate)
# - Docker + Docker Compose (untuk Postgres + Redis lokal)

git clone git@github.com:ghanem-tech/ghanemone.git
cd ghanemone
pnpm install

# Spin up infra (Postgres+PostGIS, Redis, MinIO, Meilisearch)
docker compose -f infra/docker-compose.dev.yml up -d

# Initialize database (migrations + seed)
pnpm --filter @ghanem/api db:migrate
pnpm --filter @ghanem/api db:seed   # ~10 sample datasets (lihat docs/data-model.md §Seeds)

# Run all services
pnpm dev   # turborepo → web on :5173, api on :3000, storybook on :6006
```

Env vars yang dibutuhkan (akan di-document di Phase 7):
- `DATABASE_URL` — Postgres connection string
- `REDIS_URL`
- `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` (lihat [docs/auth-flow.md](./docs/auth-flow.md))
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- `ANTHROPIC_API_KEY` — untuk AI proxy (lihat [docs/api-contract.md](./docs/api-contract.md) §AI)

---

## 6. Personas & RBAC ringkas

Tiga role utama (lihat [docs/auth-flow.md](./docs/auth-flow.md) untuk full matrix):

| Role | Org contoh | Ringkas kemampuan |
|---|---|---|
| **Regulator** | SKK Migas | Read semua dataset, approve/reject submission, full monitoring, audit log |
| **KKKS Operator** | PHE ONWJ, PHM, Medco | Upload data milik organisasinya, edit metadata sebelum approval, lihat dataset publik & milik sendiri |
| **Public / Analyst** | (anonim atau guest) | Read dataset bertanda `sensitivity = public`, no upload, no admin views |

Bukti dari kode:
- `hifi-components.jsx:77` — default user `{ org: 'SKK Migas', role: 'Regulator' }`
- `hifi-auxiliary.jsx:162` — HfUpload header pakai `{ org: 'PHE ONWJ', role: 'Data Operator' }`
- `hifi-auxiliary.jsx:397` — HfCompliance pakai `{ org: 'SKK Migas', role: 'Compliance Officer' }`

---

## 7. Design tokens

Semua sebagai CSS custom properties di `hifi-tokens.css`. Saat porting:
1. Salin ke `packages/tokens/src/tokens.css` (single source of truth).
2. Generate JSON (Style Dictionary) untuk konsumsi non-CSS (TS, Figma).
3. Jangan duplikasi hex codes — selalu reference via `var(--hf-…)`.

Highlight:
- Primary: forest green `--hf-green-500: #1f8a4a`
- Accent: prussian blue `--hf-blue-500: #2a5fb8`
- Supports: amber, red, purple
- Spacing: 4px base scale `--hf-1` (4px) → `--hf-16` (64px)
- Radii: `--hf-r-1` (4px) → `--hf-r-pill` (999px)
- Shadows: 4 elevation levels `--hf-sh-1` → `--hf-sh-4`
- Type: Inter (UI), Inter Tight (display), JetBrains Mono (mono)

---

## 8. Accessibility baseline

Prototype sudah implement (jangan regresi saat port):

- `:focus-visible` di semua interactive elements (lihat `hifi-tokens.css`)
- `aria-label` di icon-only buttons (`prototype-app.jsx:306-309`)
- `aria-current="page"` di nav links (`prototype-app.jsx:299`)
- `aria-busy="true"` + `aria-live="polite"` di loading region (`prototype-app.jsx:502`)
- Skip-to-content link (lihat HTML files)
- `prefers-reduced-motion` support (`hifi-tokens.css`)
- Keyboard nav: Enter/Space trigger links (`prototype-app.jsx:301`)
- Color contrast text minimum 4.5:1

Target compliance: **WCAG 2.2 Level AA**.

---

## 9. Known prototype quirks (akan dibereskan saat port)

| Quirk | File:Line | Action |
|---|---|---|
| `seismicOn`, `showHorizons`, `showFaults` referenced di `PageMap` tapi tidak dideklarasi | `prototype-app.jsx:873-1048` | Declare sebagai `React.useState` di PageMap saat port |
| `SeismicCrossSection`, `SeismicWellDetails` direference di `prototype-app.jsx` tapi defined di `hifi-pages-2.jsx` | `prototype-app.jsx:1043-1048` | Refactor jadi shared component di `features/seismic/` |
| Toast text pakai literal Unicode `✓` (`prototype-app.jsx:177`) | — | Ganti ke Icon component saat port |
| Search via `window.claude.complete()` (browser-only) | `prototype-app.jsx:1084` | Replace dengan backend proxy `POST /api/v1/ai/ask` (lihat api-contract.md) |
| Tidak ada error boundary di root | — | Wrap router dengan `<ErrorBoundary>` saat port |
| Mock data inline (CATALOG) tidak persist | `prototype-app.jsx:8-141` | Ganti ke `useDatasets()` hook → TanStack Query → REST API |

---

## 10. Reference standards

- **Geospatial:** OGC WMS/WFS/WMTS, EPSG codes (4326 default, UTM zones untuk seismic)
- **Spatial formats:** GeoJSON (transit), SHP (KKKS upload), KML, SEG-Y (seismic), LAS (well log)
- **API:** REST + OpenAPI 3.0 (lihat [docs/api-contract.md](./docs/api-contract.md))
- **Auth:** OAuth 2.0 + OIDC (lihat [docs/auth-flow.md](./docs/auth-flow.md))
- **Accessibility:** WCAG 2.2 Level AA
- **Security:** OWASP Top 10, ISO 27001 alignment
- **Indonesian law:** UU PDP (Pelindungan Data Pribadi) — data residency mandatory

---

## 11. License & attribution

- **Map tiles:** © OpenStreetMap contributors, © Carto (light_all style)
- **Icons:** Inspired by Lucide (ISC License) — re-drawn as 41 inline SVG paths in `hifi-components.jsx:8-50`
- **Fonts:** Inter (OFL), Inter Tight (OFL), JetBrains Mono (OFL)

Internal proprietary project. All rights reserved.

---

## 12. Production Codebase (Phase 7+)

Per **Phase 7 — Infrastructure Setup**, repo ini sekarang juga berisi **production monorepo
scaffold** yang **coexist** dengan prototype files di root. Prototype akan tetap di-jaga
sampai port ke `apps/web` selesai di Phase 8.

### Layout aktual (sesudah Phase 7 Batch 2)

```
ghanemone/                          (workspace root)
├── apps/                                  Production source
│   ├── web/                               Vite + React 18 + TS — user-facing UI
│   ├── admin/                             Vite + React 18 + TS — admin tools
│   ├── api/                               NestJS + TS — REST API + WS gateway
│   └── workers/                           Python 3.12 + Poetry — spatial workers
├── packages/                              Shared libs
│   ├── ui/                                Design system (port hifi-components di Phase 8)
│   ├── types/                             Shared TS types (codegen dari OpenAPI nanti)
│   └── config/                            ESLint + Prettier + TSConfig base
├── infra/                                 Infrastructure-as-Code
│   ├── ansible/                           Playbooks (placeholder → Task #4)
│   ├── helm/                              Helm charts (placeholder → Task #5)
│   └── scripts/                           Deploy/maintenance scripts (placeholder → Task #6)
├── .github/                               CI/CD + templates
│   ├── workflows/                         ci.yml, deploy-{dev,staging,prod}.yml
│   ├── ISSUE_TEMPLATE/
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── docs/                                  Handoff + decisions + runbooks
│   ├── api-contract.md, data-model.md, auth-flow.md, ...
│   ├── decisions/                         ADR 0001-0004 (locked)
│   ├── infrastructure/                    Hardware sizing, network requirements
│   ├── runbooks/                          Promotion, rollback, hotfix, secret rotation
│   └── branch-strategy.md                 Branch model + Conventional Commits
├── package.json                           Root — npm workspaces declare
├── turbo.json                             Turborepo pipeline config
├── .nvmrc                                 Node 20
├── .gitignore                             Workspace-wide ignores
│
└── *.jsx, *.html, *.css                   Prototype (coexisting; kept until Phase 8 port)
```

### Tooling

- **Package manager:** npm 10 + **npm workspaces** (built-in, no extra binary needed di on-prem)
- **Build orchestrator:** **Turborepo** (`turbo run dev/build/test/lint`)
- **Node version:** 20.11.0 (pin di `.nvmrc`)
- **TypeScript:** 5.5 strict mode, no `any` (enforced via ESLint)
- **Python:** 3.12 + Poetry untuk `apps/workers/`

### Quick-start (akan jalan setelah Phase 7 Week 2 dev VM ready)

```bash
# Prerequisites (sekali setup):
# - Node 20.11.0 (via nvm: `nvm install` akan baca .nvmrc)
# - Python 3.12 + Poetry 1.8 (untuk workers)
# - Docker (untuk local infra services nanti)

git clone git@github.com:ghanem-tech/ghanemone.git
cd ghanemone

# Install workspace dependencies
npm install                                 # akan install di-semua-workspaces

# Install Python workers deps
cd apps/workers && poetry install && cd ../..

# Run semua apps parallel (web :5173, admin :5174, api :3000, workers idle)
npm run dev

# Atau spesifik workspace
npm run dev --workspace=@ghanem/web
npm run build --workspace=@ghanem/api

# Lint + type-check + test (cached via Turborepo)
npm run lint
npm run type-check
npm run test
```

### CI/CD

- **`.github/workflows/ci.yml`** — run pada PR + push ke main/dev, lint+type+test+build per workspace, matrix paralel
- **`.github/workflows/deploy-dev.yml`** — auto-deploy ke dev env on push to `dev` branch
- **`.github/workflows/deploy-staging.yml`** — auto-deploy ke staging on push to `release/**`
- **`.github/workflows/deploy-prod.yml`** — manual `workflow_dispatch` only, dengan 2 reviewer approval + 5-menit cooldown

Branch strategy + commit convention: **[docs/branch-strategy.md](./docs/branch-strategy.md)**.

GitHub setup manual (one-time, harus dijalankan Hendra): **[docs/runbooks/github-setup.md](./docs/runbooks/github-setup.md)**.

### Runbooks (Phase 7 Batch 2)

| Runbook | Scope |
|---|---|
| [docs/runbooks/promotion.md](./docs/runbooks/promotion.md) | Flow dev → staging → prod, approval gates, smoke + UAT |
| [docs/runbooks/rollback.md](./docs/runbooks/rollback.md) | App / DB / config / DNS rollback dengan decision tree |
| [docs/runbooks/hotfix.md](./docs/runbooks/hotfix.md) | Emergency prod fix dari `main` branch, fast-track review |
| [docs/runbooks/secret-rotation.md](./docs/runbooks/secret-rotation.md) | 90-day rotation cadence (placeholder full Vault di Phase 10) |
| [docs/runbooks/db-migration-safety.md](./docs/runbooks/db-migration-safety.md) | Safe PG migration patterns, 2-phase expand→contract |
| [docs/runbooks/github-setup.md](./docs/runbooks/github-setup.md) | Manual GitHub UI + `gh` CLI setup (one-time) |

### What's deferred (akan diisi di task / phase berikutnya)

| Item | Phase / Task |
|---|---|
| Ansible playbooks (k3s, Postgres, MinIO, runner) | Task #4 (Phase 7 W1-3) |
| Helm charts (per app + monitoring umbrella) | Task #5 (Phase 7 W2-4) |
| Operations scripts (deploy.sh, db-backup.sh, smoke-test.sh) | Task #6 (Phase 7 W3-4) |
| Dockerfile per app | Task #5/#7 |
| HashiCorp Vault setup + ESO integration | Phase 10 Security Hardening |
| Backup verification + DR failover runbook | Phase 10 |
| Postmortem template + on-call rota | Phase 10 Launch SRE |
| Storybook + visual regression untuk `@ghanem/ui` | Phase 8 |

---

*Last updated: May 2026 — Phase 7 Batch 2 (monorepo scaffold + CI/CD + runbooks).*
