# Ghanem.one — Platform Build Roadmap

> Todolist lengkap dari current state (prototype) sampai Production launch.
> Last updated: May 2026

---

## 📍 Current Status

| Fase | Deliverable | Status |
|---|---|---|
| **Discovery** | Wireframes (10 sections, 20 artboards) | ✅ Done |
| **Visual Design** | Hi-Fi mockups + Design System | ✅ Done |
| **Prototype** | Interactive clickable prototype + AI + real Leaflet map | ✅ Done |
| **Audit** | UX/Accessibility critical fixes | ✅ Done |
| **Backend Handoff** | API contract, FE codebase ready | ⏳ Next |
| **Development** | Production build | ⏳ Pending |
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
- [ ] Repo setup (GitHub/GitLab) + branch strategy (main/dev/feature)
- [ ] CI/CD pipeline (GitHub Actions / GitLab CI)
- [ ] Environment setup: dev, staging, production
- [ ] Domain: `ghanem.one`, `api.ghanem.one`, `tiles.ghanem.one`
- [ ] SSL certificates (Let's Encrypt + auto-renewal)
- [ ] CDN setup (Cloudflare/CloudFront)

### Tech Stack Selection
- [ ] Frontend framework finalize (React + Vite recommended)
- [ ] State management (TanStack Query + Zustand atau Redux Toolkit)
- [ ] Backend framework (NestJS Node.js / FastAPI Python)
- [ ] Database (PostgreSQL 15+ with PostGIS extension)
- [ ] Cache (Redis untuk session + tile cache)
- [ ] Storage (MinIO/S3 untuk SHP, SEG-Y, PDF)
- [ ] Map tile server (Martin / GeoServer)
- [ ] Search engine (Elasticsearch / Meilisearch)
- [ ] Message queue (Redis/RabbitMQ untuk upload processing)

### Monorepo Structure
- [ ] `/apps/web` — React frontend
- [ ] `/apps/api` — Backend service
- [ ] `/apps/admin` — Internal admin tools
- [ ] `/packages/ui` — Shared component library
- [ ] `/packages/types` — Shared TypeScript types
- [ ] `/packages/config` — ESLint, Prettier, TSConfig

---

## 🎨 PHASE 8 — Frontend Development

**Timeline:** 6-8 weeks | **Owner:** Frontend Team

### Foundation (Week 1-2)
- [ ] Convert JSX prototype → TypeScript
- [ ] Setup design system package (`@ghanem/ui`)
- [ ] Migrate CSS tokens → CSS-in-JS atau Tailwind config
- [ ] Component library setup (Storybook)
- [ ] Atomic design structure (atoms/molecules/organisms)
- [ ] Form library (React Hook Form + Zod validation)
- [ ] Toast/notification system (Sonner)
- [ ] Modal/dialog primitives (Radix UI)

### Core Pages (Week 3-5)
- [ ] **Auth** — Login + SSO + Logout
- [ ] **Explore Data** — search, filter, list, pagination
- [ ] **Detail Dataset** — tabs, attributes, lineage, API docs
- [ ] **Map View** — Leaflet integration + layer management
- [ ] **Dashboard** — KPI widgets, charts (Recharts/Visx)
- [ ] **Analytics** — Chart builder (drag-drop interface)
- [ ] **Workspace** — Project list, Kanban board (dnd-kit)
- [ ] **Apps** — Marketplace grid
- [ ] **Monitoring** — Live pipeline table + alerts
- [ ] **Upload (KKKS)** — Multi-step wizard + file upload
- [ ] **Compliance (Regulator)** — Approval queue + audit

### Advanced Features (Week 6-7)
- [ ] AI Assistant integration (proxy to Claude via backend)
- [ ] Seismic 3D cross-section (D3.js / Three.js)
- [ ] Real-time monitoring (Socket.io / SSE)
- [ ] Offline support (Service Worker, IndexedDB)
- [ ] Internationalization (i18next, ID + EN)
- [ ] Dark mode

### Polish (Week 8)
- [ ] Loading skeletons di semua pages
- [ ] Error boundaries
- [ ] Empty states
- [ ] Mobile responsive (375px+)
- [ ] Tablet layout (768px+)
- [ ] Performance optimization (code splitting, lazy load)
- [ ] Bundle size analysis

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
Phase 6:  Handoff           ▓░░░░░░░░░░░░░░░░░  1 week
Phase 7:  Setup             ░▓▓░░░░░░░░░░░░░░░  2 weeks
Phase 8:  Frontend          ░░▓▓▓▓▓▓▓▓░░░░░░░░  8 weeks (parallel)
Phase 9:  Backend           ░░▓▓▓▓▓▓▓▓░░░░░░░░  8 weeks (parallel)
Phase 10: Security          ░░░░░░░░░░▓▓░░░░░░  2 weeks
Phase 11: Testing & QA      ░░░░░░░░░░░▓▓▓░░░░  3 weeks
Phase 12: Pre-Launch        ░░░░░░░░░░░░░▓▓░░░  2 weeks
Phase 13: Launch            ░░░░░░░░░░░░░░░▓░░  1 week
Phase 14: Post-Launch       ░░░░░░░░░░░░░░░░▓▓  Ongoing

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
