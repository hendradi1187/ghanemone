# Ghanem.one — Platform Build Roadmap

> Todolist lengkap dari current state (prototype) sampai Production launch.
> Last updated: 26 May 2026 (post Visual Refinement Sprint)

---

## 📍 Current Status

| Fase | Deliverable | Status |
|---|---|---|
| **Discovery** | Wireframes (10 sections, 20 artboards) | ✅ Done |
| **Visual Design** | Hi-Fi mockups + Design System | ✅ Done |
| **Prototype** | Interactive clickable prototype + AI + real Leaflet map | ✅ Done |
| **Audit** | UX/Accessibility critical fixes | ✅ Done |
| **Phase 6** | Developer Handoff Package | 🟡 In Progress |
| **Phase 7** | Development Setup (monorepo, tooling) | ✅ Mostly Done |
| **Phase 8** | Frontend Development | ✅ 11 pages live + Visual Refinement Sprint complete |
| **Phase 8.5** | Visual Refinement Sprint (vs AlasBuana ref) | ✅ Done (25 tasks, May 2026) |
| **Phase 9** | Backend Development | ⏳ Next |
| **Launch** | Production deployment | ⏳ Pending |

---

## 🎯 PHASE 6 — Developer Handoff Package

**Timeline:** 1 week | **Owner:** Design + PM

### Documentation
- [ ] `README.md` — setup instructions, tech stack, folder structure
- [ ] `api-contract.md` — OpenAPI 3.0 spec untuk semua endpoint
- [ ] `data-model.md` — Database schema (PostgreSQL + PostGIS)
- [ ] `auth-flow.md` — SSO SKK Migas / OIDC integration spec
- [ ] `component-map.md` — Component tree + props
- [ ] `state-model.md` — AppCtx structure, mutations, side effects

### Design Assets
- [ ] Export design tokens ke JSON (Style Dictionary format)
- [ ] PNG export semua artboard (Wireframes + Hi-Fi)
- [ ] Figma import (jika perlu — pakai built-in skill)
- [ ] Icon library (24 lucide icons sudah ada di Icon component)

### Mock Server
- [ ] `mock-server.js` Express dengan semua endpoint
- [ ] Sample data (5-10 datasets) untuk dev testing
- [ ] WebSocket mock untuk Monitoring page live updates

### Handoff Meeting Materials
- [ ] Walkthrough deck (Loom/screen recording)
- [ ] Q&A session dengan tim Frontend + Backend

---

## 🛠️ PHASE 7 — Development Setup

**Timeline:** 2 weeks | **Owner:** Tech Lead + DevOps

### Infrastructure
- [x] Repo setup (GitHub) + branch strategy — `hendradi1187/ghanemone` main branch
- [ ] CI/CD pipeline (GitHub Actions / GitLab CI)
- [ ] Environment setup: dev, staging, production
- [ ] Domain: `ghanem.one`, `api.ghanem.one`, `tiles.ghanem.one`
- [ ] SSL certificates (Let's Encrypt + auto-renewal)
- [ ] CDN setup (Cloudflare/CloudFront)

### Tech Stack Selection
- [x] Frontend framework: **React 18 + Vite + TypeScript** (finalized)
- [x] State management: **TanStack Query + Zustand** (implemented)
- [ ] Backend framework (NestJS Node.js / FastAPI Python) — Phase 9
- [ ] Database (PostgreSQL 15+ with PostGIS extension) — Phase 9
- [ ] Cache (Redis) — Phase 9
- [ ] Storage (MinIO/S3) — Phase 9
- [ ] Map tile server (Martin / GeoServer) — Phase 9
- [ ] Search engine (Elasticsearch / Meilisearch) — Phase 9
- [ ] Message queue (Redis/RabbitMQ) — Phase 9

### Monorepo Structure
- [x] `/apps/web` — React frontend (Vite + TS, 11 pages live)
- [x] `/apps/api` — Backend service (NestJS scaffold)
- [x] `/apps/admin` — Internal admin tools (scaffold)
- [x] `/apps/workers` — Background workers (scaffold)
- [x] `/packages/ui` — Shared component library (~40+ components)
- [x] `/packages/types` — Shared TypeScript types
- [x] `/packages/config` — Tailwind preset, design tokens

---

## 🎨 PHASE 8 — Frontend Development

**Timeline:** 6-8 weeks | **Owner:** Frontend Team

### Foundation (Week 1-2)
- [x] Convert JSX prototype → TypeScript (strict mode)
- [x] Setup design system package (`@ghanem/ui`) — primitives, data-display, charts, map, nav, overlay, form, icon, feedback
- [x] Migrate CSS tokens → Tailwind preset (`packages/config/tailwind-base.ts`)
- [ ] Component library setup (Storybook) — stories partial untuk Icon, Badge belum
- [x] Atomic design structure (primitives → data-display → composites)
- [ ] Form library (React Hook Form + Zod validation) — Login pakai native, belum migrate
- [x] Toast/notification system (Sonner) — wired di main.tsx, dipakai Add to Map
- [x] Modal/dialog primitives (Radix UI) — Dialog, Popover, DropdownMenu, Tooltip, SlideOver

### Core Pages (Week 3-5)
- [x] **Auth** — Login + mock auth + AuthGuard (SSO/OIDC pending Phase 9)
- [x] **Explore Data** — search, filter, list, pagination, split view, slide-over detail
- [x] **Detail Dataset** — tabs (Overview/Attributes/Lineage/API/Files/Map), Data Quality section, Add to Map
- [x] **Map View** — Leaflet + 8 WK polygons + markers with letter + SlideOver + fly-back UX
- [x] **Dashboard** — KPI widgets, charts (Recharts), persona-aware
- [x] **Analytics** — Chart builder dengan QueryBuilder
- [x] **Workspace** — Project list, Kanban board (dnd-kit)
- [x] **Apps** — Marketplace grid
- [x] **Monitoring** — Live pipeline table + alerts (mocked WebSocket)
- [x] **Upload (KKKS)** — Multi-step wizard 5 steps
- [x] **Compliance (Regulator)** — Approval queue + audit
- [x] **Home/Landing** — Public landing page (Sprint 2C, di luar scope awal)

### Advanced Features (Week 6-7)
- [ ] AI Assistant integration (proxy to Claude via backend) — placeholder UI ada
- [ ] Seismic 3D cross-section (D3.js / Three.js) — placeholder UI ada
- [ ] Real-time monitoring (Socket.io / SSE) — mocked, backend Phase 9
- [ ] Offline support (Service Worker, IndexedDB)
- [ ] Internationalization (i18next, ID + EN) — saat ini ID only
- [ ] Dark mode — token siap (`darkMode: 'class'`), implementasi pending

### Polish (Week 8)
- [x] Loading skeletons — partial (route Suspense loader, Sidebar, Map)
- [ ] Error boundaries — belum di-setup global
- [x] Empty states — `EmptyState` component dipakai di Explore, Workspace, dll
- [x] Mobile responsive (375px+) — verified Sprint 2A/2B
- [x] Tablet layout (768px+) — verified
- [x] Performance optimization (code splitting, lazy load) — semua route lazy
- [ ] Bundle size analysis — last check: HomePage 5.09 kB gzip

---

## 🎨 PHASE 8.5 — Visual Refinement Sprint (26 May 2026)

**Timeline:** ~2 hari intensif | **Owner:** Frontend (claude-code agents)
**Trigger:** User feedback "belum produk enterprise kelas dunia" + reference desain AlasBuana.com
**Outcome:** 25 tasks selesai, gap dari referensi dari ~30% → ~85% match

### Sprint 1 — Foundation Quick Wins (5 tasks) ✅
- [x] Fix font loading (@fontsource Inter + Inter Tight + JetBrains Mono di main.tsx)
- [x] Replace 31 custom SVG icons → Lucide React (backward-compatible API `<Icon name="..." />`)
- [x] Build Badge/StatusChip component (7 variants, animated pulse untuk running status)
- [x] Brand chart theming (CustomTooltip, axis Inter font, brand colors di chart-colors.ts)
- [x] Replace native `<select>` → UI Select component di ExplorePage

### Sprint 2A — Sidebar & Filter Structure (3 tasks) ✅
- [x] Restructure Sidebar match AlasBuana ref:
  - BROWSE: All Data, Layers, Documents, Maps, Apps & Services
  - CATEGORIES (8 expandable): Administrative, Upstream Assets, Wells & Drilling, Facilities, Pipeline, Environment, Infrastructure, Basemap
  - DATA PROVIDER (top 5): PHM 245, PHE ONWJ 183, PSN 167, Medco E&P 142, Harbour Energy 96 + "Show more"
- [x] 4 stat cards di ExplorePage header (47 Datasets, 8 Providers, 38 Wilayah Kerja, 98% Data Availability)
- [x] Horizontal FilterPillBar (Data Type, Theme, Provider, Domain/WK, Format, More Filters) dengan URL state sync

### Sprint 2B — Hybrid Layout (4 tasks) ✅
- [x] Split View toggle di ExplorePage (Map View ↔ Table View) — list compact + embedded map
- [x] MAP LAYERS checkbox panel (Working Area, Block/Contract, Field, Well, Pipeline, Facility, Seismic)
- [x] SlideOver primitive di `packages/ui/src/overlay` + DatasetSlideOver di ExplorePage
- [x] Data Quality section (Completeness %, Positional Accuracy badge, Currency) + Add to Map action

### MapPage Quick Wins (5 tasks) ✅
- [x] LayerPanel collapsed default (icon 40px → expand 280px) — bebaskan area Sumatera-Kalimantan
- [x] SearchBar responsive width (280px mobile → 360px desktop) + clearance untuk View Mode Toggle
- [x] MapLegend reposition `bottom-right` → `bottom-center` (hindari overlap DatasetSidebar)
- [x] CRS Indicator truncate di mobile (hide copyright pada <768px)
- [x] Z-index hierarchy token-based: `floating-base` (50), `floating-panel` (51), `floating-overlay` (55)

### Map Data Visualization (4 tasks) ✅
- [x] Connect DatasetSlideOver ke MapPage (klik polygon/marker → side panel info)
- [x] Upgrade marker 12px solid → 28px circular dengan provider initial letter (highlight: 36px)
- [x] Smart rendering split: `concession`+`seismic` jadi polygon, `well-log`/`production`/`geology`/`document` jadi marker
- [x] 8 handcrafted GeoJSON polygon WK boundaries (ONWJ, Mahakam, Rokan, Cepu, Tarakan, Natuna, Sanga-Sanga, Senoro-Toili) — file `apps/web/src/mocks/wk-boundaries.ts`

### Map Fly-Back UX (1 task) ✅
- [x] Auto fly-back ke Indonesia view saat SlideOver close + Reset Map button dengan smart visibility (muncul setelah pan/zoom)

### Sprint 2C — Home/Landing Page (3 tasks) ✅
- [x] HomePage di route `/` (standalone, tanpa AppShell) — Hero + Stats + Data Flow + Key Benefits + Footer
- [x] Data Flow Architecture 5-step horizontal diagram (KKKS Internal → Connector → SPEKTRUM Dataspace → Governance → Consumption)
- [x] Key Benefits Band dark navy (5 items: Satu Peta Nasional, Single Source of Truth, Governance Berkelas Dunia, AI Intelligence, Interoperable & Scalable)

### Bug Fixes (Selama Sprint)
- [x] React Router v6 routing pattern fix — parent `/dashboard` dengan absolute child paths invalid → pakai pathless parent layout

### Component & File Additions (di luar todolist awal)
**Components baru di `packages/ui`:**
- `data-display/Badge.tsx` (+ StatusChip variant)
- `charts/CustomTooltip.tsx`
- `icon/icon-map.ts` (Lucide mapping)
- `overlay/SlideOver.tsx` (Radix Dialog wrapper)

**Components baru di `apps/web`:**
- `components/home/DataFlowDiagram.tsx`
- `components/home/KeyBenefitsBand.tsx`
- `components/explore/FilterPillBar.tsx`
- `components/explore/CompactDatasetCard.tsx`
- `components/explore/ExploreMapPane.tsx`
- `components/explore/MapLayersPanel.tsx`
- `components/explore/DatasetSlideOver.tsx`
- `components/dataset/DataQualitySection.tsx`
- `pages/HomePage.tsx`
- `pages/map/ResetMapButton.tsx`
- `layouts/sidebar-config.ts`
- `mocks/wk-boundaries.ts` (8 handcrafted WK polygons)

**Design Token Additions:**
- z-index hierarchy: `floating-base`, `floating-panel`, `floating-overlay`
- SlideOver animation keyframes: `slide-in-right`, `slide-out-right`
- Lucide React dependency added to `@ghanem/ui`

### Sprint Outcome Metrics
- **Visual match vs AlasBuana reference**: ~30% → ~85%
- **Tasks completed**: 25
- **New components**: 12
- **Files modified**: 30+
- **Type-check**: PASS (0 errors)
- **Build**: 27.68s, HomePage chunk 17.47 kB raw / 5.09 kB gzip

---

## 🗄️ PHASE 9 — Backend Development

**Timeline:** 6-8 weeks | **Owner:** Backend Team (parallel dengan Frontend)

### Core APIs
- [ ] Auth service (OIDC integration dengan SKK Migas SSO)
- [ ] User management (RBAC: Regulator, KKKS Operator, Public)
- [ ] Dataset CRUD APIs
- [ ] Search API (Elasticsearch integration)
- [ ] Geospatial API (PostGIS queries)
- [ ] File upload API (multipart, chunked, resumable)
- [ ] AI proxy endpoint (Claude API + rate limiting + audit log)

### Spatial Services
- [ ] PostGIS schema + indexes (GIST untuk geom columns)
- [ ] Tile server setup (Martin atau pg_tileserv)
- [ ] GeoJSON export endpoint
- [ ] SHP/KML import pipeline
- [ ] CRS transformation (PROJ library)

### Data Pipeline
- [ ] Connector framework (SPARK Connector untuk KKKS)
- [ ] Metadata broker
- [ ] Auto-validation pipeline (topology, schema, attributes)
- [ ] Approval workflow engine
- [ ] Audit log service (immutable)

### Background Jobs
- [ ] Worker queue (BullMQ / Celery)
- [ ] File processing (SHP → PostGIS, SEG-Y → tiles)
- [ ] Email notifications (SendGrid/AWS SES)
- [ ] Webhook system untuk integrasi eksternal

### Real-time
- [ ] WebSocket gateway (Monitoring + collaboration)
- [ ] Activity feed service
- [ ] Live cursor tracking (opsional, untuk Workspace)

---

## 🔒 PHASE 10 — Security & Compliance

**Timeline:** 2 weeks | **Owner:** Security + Legal

### Security Audit
- [ ] OWASP Top 10 review
- [ ] Penetration testing (eksternal vendor)
- [ ] Dependency vulnerability scan (Snyk/Dependabot)
- [ ] SAST/DAST automation
- [ ] Secret management (HashiCorp Vault / AWS Secrets Manager)

### Compliance
- [ ] GDPR / UU PDP compliance review
- [ ] Data residency (server di Indonesia)
- [ ] Audit log retention policy
- [ ] Backup & disaster recovery plan
- [ ] Privacy policy & Terms of service
- [ ] Cookie consent banner

### Access Control
- [ ] Role-based permissions matrix
- [ ] Data sensitivity classification (public, internal, confidential)
- [ ] Row-level security di PostgreSQL
- [ ] API rate limiting (per user, per IP)
- [ ] DDoS protection (Cloudflare)

---

## 🧪 PHASE 11 — Testing & QA

**Timeline:** 3 weeks | **Owner:** QA Team

### Automated Testing
- [ ] Unit tests (Vitest/Jest) — target 80%+ coverage
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (Playwright/Cypress) — critical user flows
- [ ] Visual regression (Percy/Chromatic)
- [ ] Accessibility tests (axe-core automated)
- [ ] Performance tests (k6/Artillery untuk load testing)

### Manual Testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Tablet testing
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Keyboard navigation audit

### User Acceptance Testing (UAT)
- [ ] UAT plan dengan 5-10 user representatif
- [ ] Test scenarios per persona (Regulator, KKKS, Analyst)
- [ ] Feedback collection (Hotjar / FullStory)
- [ ] Iteration berdasarkan UAT findings

---

## 🚀 PHASE 12 — Pre-Launch

**Timeline:** 2 weeks | **Owner:** All Teams

### Performance Optimization
- [ ] Lighthouse audit (target 90+ untuk Performance, Accessibility, SEO)
- [ ] Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Image optimization (WebP, lazy load, responsive)
- [ ] Bundle splitting + tree shaking
- [ ] CDN caching strategy
- [ ] Database query optimization (EXPLAIN ANALYZE)
- [ ] Redis cache warming

### Monitoring & Observability
- [ ] APM setup (Datadog / New Relic / Sentry)
- [ ] Log aggregation (ELK / Grafana Loki)
- [ ] Metrics dashboard (Grafana)
- [ ] Uptime monitoring (Pingdom / Better Uptime)
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog / Mixpanel / Google Analytics)

### Content & Support
- [ ] User documentation / Help Center
- [ ] Video tutorials (Loom)
- [ ] FAQ page
- [ ] Support email/ticket system
- [ ] Onboarding email sequence
- [ ] In-app product tour (Userflow / Intro.js)

### Marketing & Launch Prep
- [ ] Landing page
- [ ] Press release
- [ ] Demo video
- [ ] Stakeholder briefing (SKK Migas, KKKS partners)
- [ ] Launch announcement
- [ ] Social media kit

---

## 🎉 PHASE 13 — Production Launch

**Timeline:** 1 week | **Owner:** All Teams + Leadership

### Go-Live Checklist
- [ ] Final security review sign-off
- [ ] Backup verification
- [ ] Rollback plan documented
- [ ] On-call rotation schedule
- [ ] Status page (status.ghanem.one)
- [ ] Database migration scripts tested
- [ ] DNS cutover plan
- [ ] Feature flags configured (LaunchDarkly / Unleash)

### Launch Day
- [ ] Deploy to production
- [ ] Smoke tests pasca-deployment
- [ ] Monitor metrics intensif (24-48 jam)
- [ ] Hotfix protocol ready
- [ ] Communication channels active (Slack war room)

### Soft Launch (Week 1-2)
- [ ] Internal users only
- [ ] Selected KKKS partners
- [ ] Collect feedback
- [ ] Performance monitoring

### Public Launch
- [ ] Open registration
- [ ] Marketing campaign go-live
- [ ] Press release publication
- [ ] Stakeholder announcement

---

## 📈 PHASE 14 — Post-Launch (Ongoing)

**Timeline:** Ongoing | **Owner:** Product + Engineering

### Week 1-4
- [ ] Daily metrics review
- [ ] Bug triage & hotfixes
- [ ] User feedback collection
- [ ] Performance tuning

### Month 2-3
- [ ] Retrospective + lessons learned
- [ ] Roadmap iteration 2 (post-launch features)
- [ ] User research interviews
- [ ] A/B testing setup

### Continuous Improvements
- [ ] **Q2 2026:** Mobile app (React Native)
- [ ] **Q3 2026:** Advanced AI features (predictive analytics)
- [ ] **Q3 2026:** Multi-tenancy (B2B SaaS untuk KKKS lain)
- [ ] **Q4 2026:** Open API marketplace untuk 3rd party developers
- [ ] **Q4 2026:** White-label option untuk regulator negara lain

---

## 📊 Timeline Summary

```
Phase 6:  Handoff           ▓░░░░░░░░░░░░░░░░░  1 week    🟡 In Progress
Phase 7:  Setup             ░▓▓░░░░░░░░░░░░░░░  2 weeks   ✅ Monorepo done
Phase 8:  Frontend          ░░▓▓▓▓▓▓▓▓░░░░░░░░  8 weeks   ✅ 11 pages live
Phase 8.5:Visual Refinement ░░░░▓░░░░░░░░░░░░░  2 days    ✅ Done 26 May 2026
Phase 9:  Backend           ░░▓▓▓▓▓▓▓▓░░░░░░░░  8 weeks   ⏳ NEXT
Phase 10: Security          ░░░░░░░░░░▓▓░░░░░░  2 weeks   ⏳ Pending
Phase 11: Testing & QA      ░░░░░░░░░░░▓▓▓░░░░  3 weeks   ⏳ Pending
Phase 12: Pre-Launch        ░░░░░░░░░░░░░▓▓░░░  2 weeks   ⏳ Pending
Phase 13: Launch            ░░░░░░░░░░░░░░░▓░░  1 week    ⏳ Pending
Phase 14: Post-Launch       ░░░░░░░░░░░░░░░░▓▓  Ongoing   ⏳ Pending

Total to Production:        ~14-16 weeks (3.5-4 months)
```

---

## 👥 Team Composition Recommended

| Role | Count | Phase |
|---|---|---|
| Product Manager | 1 | All |
| Tech Lead | 1 | 7-14 |
| Frontend Engineer | 2-3 | 8-14 |
| Backend Engineer | 2-3 | 9-14 |
| DevOps Engineer | 1 | 7, 10, 12-14 |
| QA Engineer | 1-2 | 11-14 |
| UI/UX Designer | 1 | All (advisor) |
| GIS Specialist | 1 | 9 (PostGIS expertise) |
| Security Engineer | 1 (consultant) | 10 |

**Total budget estimate:** 8-10 FTE × 3.5-4 months

---

## 🎯 Success Metrics (KPI)

### Launch (Month 1)
- [ ] 100+ datasets onboarded
- [ ] 5+ KKKS partners connected
- [ ] 99.5% uptime SLA
- [ ] < 2s average page load
- [ ] 0 P1 incidents

### Growth (Month 3-6)
- [ ] 500+ datasets
- [ ] 20+ KKKS partners
- [ ] 1000+ monthly active users
- [ ] 80%+ user satisfaction (CSAT)
- [ ] 70%+ DAU/MAU ratio (sticky)

### Maturity (Year 1)
- [ ] 2,500+ datasets (sesuai target Hi-Fi)
- [ ] All 8+ major KKKS connected
- [ ] 5K+ MAU
- [ ] 99.9% uptime
- [ ] Featured di SKK Migas annual report

---

## 📚 References & Standards

- **Geospatial:** OGC standards (WMS, WFS, WMTS), EPSG codes
- **API:** REST + OpenAPI 3.0, GraphQL untuk complex queries
- **Auth:** OAuth 2.0 + OIDC, SAML 2.0 untuk enterprise SSO
- **Data:** GeoJSON, SHP, KML, SEG-Y, LAS standards
- **Accessibility:** WCAG 2.2 Level AA
- **Security:** OWASP, ISO 27001 alignment

---

*Dokumen ini hidup — update setiap sprint review.*
