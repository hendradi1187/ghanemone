# Handoff Deck — Walkthrough & Q&A

Materi handoff Phase 6 → Phase 7/8/9. Dipakai sebagai script di kick-off meeting
dengan tim Frontend + Backend, dan sebagai self-serve onboarding doc setelahnya.

**Format meeting yang disarankan:** 90 menit, 2 sesi:
1. Sesi 1 (45 menit) — walkthrough lengkap (presenter share screen)
2. Sesi 2 (45 menit) — Q&A terbuka, fokus per discipline (FE 15m, BE 15m, joint 15m)

---

## 1. Agenda walkthrough (45 menit)

| Menit | Topik | Lead | Material |
|---|---|---|---|
| 0–3 | Context: Ghanem.one mission, SKK Migas relationship, 4-bulan target launch | PM | `README.md` §1-2 |
| 3–7 | Live demo: open `AlasBuana Prototype.html`, klik through Explore → Detail → Map → AI | Designer / PM | prototype |
| 7–15 | Architecture overview: stack, monorepo, env per-layer | Tech Lead | `README.md` §3-4 |
| 15–25 | API contract: walk OpenAPI, focus 5 critical endpoints | Backend Lead | `api-contract.md` |
| 25–32 | Data model: walk DDL, RLS, PostGIS choices | Backend Lead | `data-model.md` |
| 32–38 | Auth: OIDC flow diagram, RBAC matrix | Tech Lead / Security | `auth-flow.md` |
| 38–42 | FE component map + state model | Frontend Lead | `component-map.md`, `state-model.md` |
| 42–45 | Roadmap recap: Phase 7 next steps, Phase 8/9 parallel | PM | `todolist.md` |

---

## 2. Demo script (live prototype walkthrough)

> Tester: jalankan `python3 -m http.server 8000` di workspace root.
> Open `http://localhost:8000/AlasBuana%20Prototype.html`. Recommended browser:
> Chrome / Edge (Safari has minor Babel issues with private fields).

### Step-by-step

**1. Landing on Explore Data**
> "Ini Explore — homepage user setelah login. Persona dominan di sini adalah
> Analyst atau Regulator. Sidebar kiri punya 3 grup: Browse (by kind), Categories
> (by theme — multi-select filter), Data provider (by org)."

Action: scroll sidebar, click "Seismic" category — chips appear in middle panel,
results filter to seismic datasets, brief skeleton.

> "Filter logic ada di `prototype-app.jsx:411`. Empty state otomatis muncul kalau
> nol hasil — lihat `EmptyState` component."

**2. Quick search in TopNav**
> "Tap ⌘K atau klik di search bar. Mengetik 'onwj' — dropdown muncul dengan
> instant matches. Click → langsung ke detail page."

> "Backend perlu sediakan `GET /search?q=…&limit=5` — saat ini frontend filter
> CATALOG client-side, tapi production wajib server-side untuk skala 2,500+
> datasets."

**3. Dataset card interactions**
> "Setiap card punya 3 actions: click row → select (preview di kanan), click
> arrow icon → open detail, click Add → push to map dengan toast confirmation."

Action: click "Add" — toast "✓ … ditambahkan ke peta" pop dari bawah.
> "Toast hidup 3.2 detik. Map di sebelah kanan auto-update — overlay polygon
> WK ONWJ muncul."

**4. Detail page**
> "Klik dataset → detail page. 5 tabs: Overview, Attributes, Quality, Lineage,
> API. Lineage menunjukkan: Source (provider) → Connector (SPARK) → Validated
> → Published — empat-langkah pipeline yang akan jadi endpoint
> `/datasets/:id/lineage`."

Action: click each tab, point out shape that backend will return.

**5. Map page (full-bleed)**
> "Klik MAP di top nav. Layer panel di kiri menampilkan dataset di catalog
> dengan checkbox state. Aktifkan/deaktifkan layer → Leaflet update real-time."

Action: toggle off WK ONWJ, layer disappears. Toggle on Seismic 3D — purple
rectangle appears in N. Sumatra.

> "Catatan: prototype punya bug di `PageMap` — `seismicOn`/`showHorizons`/
> `showFaults` undefined. Itu masuk known-quirks list, akan di-fix saat porting
> dengan proper useState. (Lihat README §9)"

**6. AI Assistant**
> "Bottom-right ada pill 'AI Assistant'. Click → expand chat. Try: 'Berapa
> sumur aktif di area ONWJ?' → calls `window.claude.complete()` (browser-side,
> prototype only)."

> "**Production:** backend wajib proxy via `POST /ai/ask` — alasannya: hide API
> key, rate limit, audit log, RBAC check sebelum forward."

**7. Upload flow (static hi-fi)**
> "Untuk persona KKKS Operator. Open `AlasBuana Hi-Fi.html`, scroll ke section
> AUX. Lihat 6-step wizard, dropzone, file progress, guidelines sidebar.
> Endpoint: `POST /uploads/init`, `PUT /chunks/:n`, `POST /complete` (lihat
> api-contract.md §6)."

**8. Compliance (static)**
> "Persona Regulator/Compliance Officer. Approval queue dengan validation status
> (ok/warn/err), risk level (low/med/high), bulk actions Approve/Review/Reject.
> Audit Trail di bottom-right append-only — masuk tabel `audit_log` (lihat
> data-model.md §3.11)."

**9. Monitoring (static)**
> "Live pipeline status — `Harvest`, `Sync`, `Validation`, `Publish` jobs per
> KKKS. Frontend ambil snapshot via `GET /monitoring/pipelines`, plus subscribe
> ke `WSS /monitoring/stream` untuk updates. Lihat api-contract.md §8."

---

## 3. Q&A — anticipated questions

### General

**Q: Kenapa namanya AlasBuana di file?**
A: Codename internal saat prototyping. Brand publik: Ghanem.one. Saat porting,
rename file (`AlasBuana *.html` → `index.html` di apps/web), update cross-file
nav links di setiap HTML.

**Q: Apakah ada Figma file?**
A: Tidak. Source of truth = JSX di repo. Phase 6 deliverable termasuk
"Export design tokens ke JSON (Style Dictionary format)" dan "PNG export
artboards" — itu untuk dokumentasi visual, bukan re-design tool.

**Q: Berapa lama Phase 7 (Setup)?**
A: 2 minggu. Lihat `todolist.md` §Phase 7. Itu termasuk monorepo scaffolding,
CI/CD, domain + SSL, env setup, tech stack final-pick.

**Q: Apakah prototype yang ada masih dipakai?**
A: Sebagai **reference visual + behavioral spec**, ya. Sebagai **codebase**,
tidak — kita rewrite di TypeScript + Vite. Estimasi: 40% logic dari prototype
bisa direuse setelah JSX → TSX conversion.

### Frontend

**Q: Vite atau Next.js?**
A: **Vite + TanStack Router**. Alasan: SPA cocok dengan use-case (Leaflet,
heavy interactivity, no SEO requirement untuk authenticated views), HMR Vite
lebih cepat untuk dev experience, dan tidak butuh server-side rendering.
Decision di-finalize di Phase 7 kick-off oleh Tech Lead.

**Q: State management?**
A: **TanStack Query** (server state, ~13 KB gz) + **Zustand** (client state,
~1 KB gz). Pola sesuai prototype AppCtx tapi dipisah per concern. Detail di
`state-model.md` §4-5.

**Q: Styling — Tailwind atau CSS-in-JS?**
A: **Port CSS variables dulu**, lalu pilih. Token file (`hifi-tokens.css`)
sudah pakai CSS custom properties — strategi simplest: copy as-is ke
`apps/web/src/styles/tokens.css` dan reference via `var(--hf-…)`. Kalau team
mau Tailwind, generate `tailwind.config.ts` dari token JSON.

**Q: Mobile responsive sudah ada?**
A: Sebagian — `hifi-mobile.jsx` shows 4-5 mobile screens (Explore, Detail,
Map, Search, Empty). Tapi belum full responsive. Phase 8 §Polish menargetkan
375px (mobile) dan 768px (tablet) breakpoints.

**Q: PWA / offline?**
A: Stretch goal Phase 8 §Advanced. Service Worker + IndexedDB untuk last-viewed
datasets + saved filters. Tidak blocking launch.

**Q: i18n?**
A: Phase 8. Bahasa Indonesia default. English secondary. Library: i18next.
Strings di prototype sudah Bahasa Indonesia — saat extract ke `messages.id.json`,
mirror file `messages.en.json` dengan translation.

### Backend

**Q: NestJS atau FastAPI?**
A: Open. Tech Lead decide di Phase 7. Argument for **NestJS**: same language
as FE (TypeScript), shared types via `packages/types`, ecosystem (PgBouncer,
BullMQ, openid-client) mature. Argument for **FastAPI**: GIS ecosystem
(GeoPandas, Shapely) lebih kuat untuk PostGIS-heavy operations, pydantic
matches OpenAPI 1:1.

**Q: Database — kenapa PostgreSQL + PostGIS, bukan dedicated GIS database (Oracle Spatial, MS SQL)?**
A: 1) Open source — kompatibel dengan UU PDP data residency. 2) PostGIS
matang untuk 20+ tahun. 3) Tidak butuh license. 4) Operational simplicity:
satu DB untuk transactional + spatial. 5) Existing team familiarity assumed.

**Q: SHP upload — bagaimana validasi topology?**
A: Backend pipeline: 1) Receive chunks → reassemble file di S3/MinIO.
2) Worker job (`BullMQ` / `Celery`) load with `ogr2ogr` atau `GeoPandas`.
3) Run topology checks: `ST_IsValid()`, `ST_IsValidReason()`. 4) If invalid,
emit `validation='err'` to approval queue. 5) If valid, write to
`dataset_features` with GIST index. Detail di data-model.md §3.10.

**Q: Seismic SEG-Y — bisa render in-browser?**
A: Tidak realistic untuk file > 1 GB. Strategi: backend pre-render slice/section
PNG saat upload (worker job), serve via `GET /seismic/:id/cross-section?format=png`.
For interactive (zoom into amplitudes), need WebGL viewer — Phase 8 §Advanced,
likely 3rd-party app integration (lihat HfApps "Seismic Viewer Pro").

**Q: Tile server pilihan?**
A: **Martin** (Rust, fast, vector tiles dari PostGIS) atau **pg_tileserv**
(Postgres-native). MapLibre GL JS di frontend untuk vector. Untuk basemap,
tetap Carto Positron (sudah dipakai di prototype, free, ODbL).

**Q: AI proxy — Claude API access?**
A: Set up `ANTHROPIC_API_KEY` di backend env (HashiCorp Vault for prod).
`/ai/ask` endpoint: rate limit 30/min/user, log full prompt+reply ke
`audit_log`, RBAC check user has access to `context.datasetId`. Detail di
api-contract.md §9.

### Auth & Security

**Q: SSO SKK Migas — apakah sudah ada existing OIDC IdP?**
A: **Open question untuk SKK Migas IT.** Asumsi: ada SSO standar pemerintahan
(mungkin pakai OIDC atau SAML 2.0). Phase 7 owner harus follow-up: 1) confirm
issuer URL, 2) procure client_id/secret, 3) verify claim mappings.

**Q: KKKS yang non-Pertamina — bagaimana SSO mereka?**
A: Login page menawarkan 3 options (SKK Migas SSO, Pertamina SSO, Microsoft
Azure AD). Sebagian besar non-Pertamina KKKS pakai Azure AD (corporate).
Phase 7 owner: confirm per-KKKS preference, document per-IdP setup.

**Q: Row-level security — performance impact?**
A: RLS di Postgres relatif murah jika policies sederhana (single column
comparison). Heavy queries (cross-org analytics) bisa pakai `BYPASS RLS` via
admin role. Benchmark di Phase 9.

**Q: Audit log retention?**
A: Per todolist.md §Phase 10. Default proposal: 7 tahun (sesuai standar
governance hulu migas), partitioned by month. Hot partition (last 30d) di
SSD, cold ke S3 Glacier via `pg_partman`.

### DevOps

**Q: Hosting — on-prem atau cloud?**
A: **Server di Indonesia** (UU PDP). Pilihan: 1) On-prem datacenter SKK Migas
(jika tersedia), 2) AWS Jakarta region, 3) Indonesian cloud provider
(Telkomsigma, Lintasarta, Biznet Gio). Decision di Phase 7 dengan input dari
Legal + Procurement.

**Q: Domain ownership — siapa yang punya `ghanem.one`?**
A: Confirm dengan PM / Legal. Phase 7 §Infrastructure mentions:
`ghanem.one`, `api.ghanem.one`, `tiles.ghanem.one`. Pastikan domain
sudah diregistrasi dan DNS bisa di-control.

**Q: Disaster recovery?**
A: Phase 10 §Compliance "Backup & disaster recovery plan". Minimum: daily
pg_basebackup + WAL streaming ke offsite, RTO 4 jam, RPO 1 jam.

### QA

**Q: Bagaimana E2E test seismic flow yang punya UI complex?**
A: Lihat qa-agent.md di `.claude/agents/`. Strategy: Playwright + screenshot
regression (Percy) untuk visual; functional E2E focus on click paths
(toggle 3D scene → cross-section drops in → toggle horizon → drawer updates).
Skip pixel-perfect untuk SVG procedural rendering.

**Q: Test data untuk PostGIS?**
A: Phase 7 §Mock Server. Sample dataset list di data-model.md §6.

---

## 4. Slide-style key takeaways (for sharing on Slack/Notion)

```
┌─────────────────────────────────────────────────┐
│  Ghanem.one — Phase 6 Handoff                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  WHAT EXISTS:                                   │
│   • 3 HTML deliverables (Wireframes, Hi-Fi,     │
│     Prototype). Inline JSX, Babel browser.      │
│   • 1,262-line interactive prototype with       │
│     real Leaflet + Claude AI integration.       │
│   • Design tokens + 24-icon library + full      │
│     component catalog (12 hi-fi, 6 wireframe).  │
│                                                 │
│  WHAT'S PROPOSED (this handoff):                │
│   • REST API spec (OpenAPI 3.0) — 40+ endpoints │
│   • PostgreSQL + PostGIS schema (15 tables)     │
│   • OIDC SSO flow (SKK Migas, Pertamina, Azure) │
│   • RBAC matrix: 4 roles × all endpoints        │
│   • Component map: prototype → TS folder layout │
│   • State model: AppCtx → TanStack Query +      │
│     Zustand                                     │
│                                                 │
│  NEXT (Phase 7, 2 weeks):                       │
│   • Monorepo scaffold (pnpm + Turborepo)        │
│   • CI/CD + 3 env (dev/staging/prod)            │
│   • Procure SKK Migas SSO credentials           │
│   • Tech stack final pick (NestJS vs FastAPI)   │
│                                                 │
│  PARALLEL (Phase 8 + 9, 8 weeks each):          │
│   • Frontend: port JSX → TSX, build 12 pages    │
│   • Backend: 40+ endpoints + WS + AI proxy +    │
│     upload pipeline + approval workflow         │
│                                                 │
│  LAUNCH: 14–16 weeks from Phase 7 kickoff.      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 5. Onboarding kit per role (post-handoff)

### Frontend Engineer Day 1

1. Read `README.md` + `component-map.md` + `state-model.md` (90 min).
2. Run prototype locally (`python3 -m http.server 8000`). Click through 5 pages.
3. Open `prototype-app.jsx` and trace one flow: "what happens when I click Add to Map?"
4. Read `apps/web/` once scaffold exists (Phase 7).
5. Ask: "Komponen mana yang mau aku grab dulu?" — answer biasanya `<Icon>`, `<EmptyState>`, `<DsRowInteractive>`.

### Backend Engineer Day 1

1. Read `README.md` + `api-contract.md` + `data-model.md` (2 jam).
2. Spin up Postgres + PostGIS locally:
   ```bash
   docker run -d --name pg-ghanem -e POSTGRES_PASSWORD=dev -p 5432:5432 postgis/postgis:16-3.4
   ```
3. Apply seed migrations (akan tersedia post-Phase-7).
4. Pick 1 endpoint to spike-implement: rekomendasi `GET /datasets` (paling banyak filter knobs).
5. Ask: "Spek mana yang ambigu?" — flag at next standup.

### Tech Lead Day 1

1. Read **semua** docs (full sweep, 4 jam).
2. Validate stack pick dengan team — schedule Phase 7 kickoff.
3. Coordinate SKK Migas SSO procurement — long-lead item.
4. Identify hire/contract gaps: GIS specialist? DevOps for Indonesian cloud?
5. Set up shared Notion/Confluence; pin handoff docs there.

### Designer Day 1 (ongoing advisor)

1. Already familiar with prototype. Tasks:
   - Figma import (Phase 6 todo) — optional but useful for non-coder stakeholders.
   - Mobile responsive specs for screens beyond `hifi-mobile.jsx`.
   - Empty/error/loading state coverage matrix per page (currently inconsistent).
   - Icon expansion if BE/FE find missing icons during build.

---

## 6. Open questions log (ratify before Phase 7 end)

| # | Question | Owner | Deadline |
|---|---|---|---|
| 1 | SKK Migas OIDC issuer URL + claim mappings | Tech Lead + SKK IT | Week 1 of Phase 7 |
| 2 | Final pick: NestJS vs FastAPI | Tech Lead | Week 1 of Phase 7 |
| 3 | Hosting environment (on-prem vs AWS Jakarta) | DevOps + Legal | Week 1 of Phase 7 |
| 4 | Domain registration status (`ghanem.one` + subdomains) | PM | Week 1 of Phase 7 |
| 5 | Confirm OpenAPI spec with backend (any endpoints to add/remove?) | Backend Lead | Week 2 of Phase 7 |
| 6 | Validate Dataset shape with GIS specialist (any missing fields?) | GIS Specialist | Week 2 of Phase 7 |
| 7 | RBAC: should "Compliance Officer" be a separate role from "Regulator" or just an attribute? | Product + Security | Week 2 of Phase 7 |
| 8 | AI proxy: budget cap per user/day? | Product + Finance | Phase 9 |

---

## 7. Reference docs (in this repo)

| Doc | Purpose |
|---|---|
| [README.md](../README.md) | Root onboarding + setup |
| [docs/api-contract.md](./api-contract.md) | REST API spec (OpenAPI 3.0) |
| [docs/data-model.md](./data-model.md) | PostgreSQL + PostGIS DDL |
| [docs/auth-flow.md](./auth-flow.md) | OIDC + session + RBAC |
| [docs/component-map.md](./component-map.md) | Component tree + props |
| [docs/state-model.md](./state-model.md) | Client + server state architecture |
| [todolist.md](../todolist.md) | Phase 6 → 14 roadmap |

---

*Last updated: May 2026. Ratify Section 6 (open questions) at Phase 7 kickoff.*
