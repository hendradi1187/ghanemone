# ADR 0004 — Tech Stack Finalize: Frontend, State, Search, Tiles, Orchestration, CI/CD, Storage

**Status:** Accepted
**Date:** 2026-05-19
**Decision maker:** Hendra Dinata (hendra@pm.ghanemtech.co.id)
**Context:** Phase 7 — Infrastructure Setup, locking remaining tech choices yang masih open setelah [ADR 0001](./0001-backend-framework-hybrid.md), [ADR 0002](./0002-hosting-on-prem-skk-migas.md), [ADR 0003](./0003-sso-jit-provisioning.md).

## Konteks

ADR 0001 lock backend framework (NestJS + Python). ADR 0002 lock hosting (on-prem SKK Migas, k3s/RKE2, MinIO, self-hosted observability). ADR 0003 lock SSO strategy.

Masih ada **7 area tech stack** yang perlu di-lock supaya Phase 8 (Frontend) dan Phase 9 (Backend) dapat start tanpa ambiguity:

1. Frontend framework
2. State management
3. Search engine
4. Map tile server
5. Container orchestration (k3s vs RKE2 vs full k8s)
6. CI/CD runner topology
7. Persistent volume backend

Decision di sini bukan greenfield — kebanyakan sudah lean-tested di prototype (Vite + React) atau referenced di ADR sebelumnya. Dokumen ini formalkan + dokumentasikan trade-off.

## Keputusan

### Ringkasan Tabel

| Area | Pilihan | Alternatif Utama | Trade-off Singkat |
|---|---|---|---|
| Frontend framework | **Vite + React 18 + TypeScript** | Next.js, Remix | SPA simpler, no SSR overhead untuk internal platform |
| State management | **TanStack Query + Zustand** | Redux Toolkit, Jotai, MobX | Less boilerplate; server state vs UI state explicit |
| Search engine | **Meilisearch** | Elasticsearch, Typesense | Ops simpler; switch ke ES kalau butuh log analytics |
| Map tile server | **Martin (Rust)** | GeoServer, pg_tileserv, MapServer | Native PostGIS, low memory; no OGC kalau butuh tambah pg_tileserv |
| Container orchestration | **k3s** | RKE2, full k8s | Single-binary, lighter ops; RKE2 kalau butuh FIPS |
| CI/CD runner | **Self-hosted GitHub Actions runners** | GitHub-hosted, GitLab CI | Secrets stay di SKK Migas; ops overhead 1 VM minimum |
| Persistent volumes | **Longhorn** | NFS, Ceph (Rook), TopoLVM | k8s-native snapshot + replication; bisa fallback ke NFS |

### Detail per Keputusan

---

#### 1. Frontend Framework — **Vite + React 18 + TypeScript**

**Decision:** SPA dengan Vite sebagai build tool, React 18 sebagai framework, TypeScript untuk type safety.

**Why over Next.js / Remix:**
- **Internal-facing platform** — tidak ada public marketing page yang butuh SEO atau prerendering
- **SPA simplicity** — single deployable artifact (static files), tidak perlu Node.js runtime di prod (cuma nginx serve static)
- **Faster dev iteration** — Vite HMR sub-second; Next.js dev server lebih heavy
- **Smaller deployment surface** — tidak ada SSR cache invalidation, edge function complexity, atau Node.js security patching di critical path
- **k3s deployment lebih sederhana** — nginx pod serve static `dist/` dari ConfigMap atau MinIO; tidak perlu Node.js sidecar
- **Existing prototype** — sudah pakai React + Vite, migration cost minimum

**Trade-off:**
- Kalau nanti dibutuhkan public marketing/landing page dengan SEO (mis. `about.ghanem.one`, blog), itu **separate build** menggunakan Next.js atau Astro (static-only). Tidak mempengaruhi main app architecture.
- Initial bundle size lebih besar dari Next.js dengan code splitting (mitigated via React.lazy + route-based code split).
- No server-side rendering untuk first paint (mitigated via skeleton UI + persistent service worker cache).

**Implementation notes:**
- Build target: ES2022, browserlist `> 0.5%, last 2 versions, not dead`
- Bundle analyzer di CI untuk track size budget (target: initial < 250 KB gzipped)
- Routing: TanStack Router (type-safe) atau React Router v6
- Output served oleh nginx pod di k3s, dengan brotli pre-compression

---

#### 2. State Management — **TanStack Query (server state) + Zustand (client state)**

**Decision:** Explicit pemisahan server state (data dari API) dan client state (UI state, form state, ephemeral).

**Why:**
- **No Redux boilerplate** — Redux Toolkit reduces boilerplate tapi tetap verbose untuk async patterns. TanStack Query + Zustand combined < 50% of equivalent Redux code.
- **TanStack Query** handles: cache, refetching, invalidation, optimistic updates, infinite query, prefetch — semua patterns yang biasanya custom di Redux thunks/sagas.
- **Zustand** untuk UI state yang sederhana: sidebar open/closed, modal stack, theme, draft form data. Single hook, no provider hell.
- **Local state** (`useState`) tetap untuk component-scoped state.

**Trade-off:**
- Tim yang familiar dengan Redux DevTools akan adaptasi (Zustand support DevTools, tetapi paradigm beda).
- Tidak ada single global store untuk debug (split intentional — debugging by domain, not by store).
- Form state: pakai React Hook Form (form-specific lib, bukan global state).

**Implementation notes:**
- TanStack Query default `staleTime: 60_000`, `gcTime: 5 * 60_000` — tunable per query
- Zustand store per domain: `useUiStore`, `useDraftStore`, `useNotificationStore`
- Persist Zustand selected slices ke `localStorage` (theme, sidebar pref)

---

#### 3. Search Engine — **Meilisearch**

**Decision:** Meilisearch untuk dataset metadata search (full-text, typo-tolerant, faceted).

**Why over Elasticsearch:**
- **Ops simpler** — single binary, no JVM tuning, no separate cluster coordinator
- **Lower memory footprint** — ~500 MB RAM untuk index 100k documents vs 4+ GB untuk ES
- **Typo-tolerance built-in** — relevant untuk dataset name search (KKKS pakai abbreviations)
- **Self-host friendly** — fits ADR 0002 self-managed posture
- **Use case match** — dataset metadata (titles, descriptions, tags, geo bounds) bukan log analytics atau time-series

**Trade-off:**
- **Aggregations terbatas** — Meilisearch tidak punya rich aggregations ala ES (e.g., percentiles, date histograms with sub-bucketing). Kalau butuh, query langsung ke PostgreSQL atau gunakan ClickHouse.
- **No log analytics** — kalau di future ingest application logs untuk search, switch ke Elasticsearch atau OpenSearch. Decision revisit di **Phase 12** atau post-launch jika ada use case yang muncul.
- **Cluster mode immature** — Meilisearch 1.x baru tambah experimental cluster. Untuk prod kita single-instance dengan snapshot backup; HA via Longhorn volume replication + k3s pod restart < 30s.

**Implementation notes:**
- Indexed entities: `datasets`, `wells`, `seismic_surveys`, `user_organizations`
- Backend: NestJS module `SearchModule` wraps Meilisearch JS client
- Reindex job: nightly cron + on-demand via admin UI
- Resource: 4c/16G VM atau pod sufficient for 3-year horizon (1-2M documents)

---

#### 4. Map Tile Server — **Martin (Rust)**

**Decision:** Martin sebagai vector tile server, output Mapbox Vector Tiles (MVT) langsung dari PostGIS.

**Why over GeoServer / pg_tileserv / MapServer:**
- **Native PostGIS integration** — Martin reads PostGIS tables langsung, generate MVT on-the-fly atau dari materialized tables
- **Faster than Java alternatives** — Rust runtime, async I/O, no JVM warmup. Benchmark: 5-10x faster tile generation untuk komplexity yang sama dibanding GeoServer
- **Low memory footprint** — typical ~200 MB resident, scales ke ~1 GB untuk heavy load
- **Simple config** — single TOML file, no XML hell ala GeoServer
- **Active development** — Maplibre org maintains, stable v0.13+

**Trade-off:**
- **No built-in WMS/WFS** — Martin hanya MVT tiles. Kalau butuh OGC compliance untuk integrasi pihak ke-3 (Esri ArcGIS, QGIS via WMS), tambah `pg_tileserv` atau MapServer side-by-side. Decision: defer — most consumers Ghanem.one akan pakai MapLibre web client atau direct API.
- **No styling server-side** — styling di client (MapLibre GL JS style spec). Konsisten dengan modern web map stack.
- **Raster tiles tidak native** — untuk raster (satellite imagery, DEM hillshade), generate offline jadi MBTiles + serve via `mbtileserver` atau MinIO static. Acceptable untuk Phase 8-10 scope.

**Implementation notes:**
- Endpoint: `tiles.ghanem.one/{layer}/{z}/{x}/{y}.pbf`
- Auth: signed URLs untuk protected layers (cek RBAC di NestJS, generate signed URL dengan HMAC, Martin verify)
- Cache: CDN-level (Cloudflare) untuk public layers; Redis-backed untuk protected layers
- Resource: 4c/8G pod, replica 2 in prod

---

#### 5. Container Orchestration — **k3s**

**Decision:** k3s sebagai Kubernetes distribution untuk semua environments (dev/staging/prod).

**Why over full k8s / RKE2:**
- **Lighter** — single binary, ~50 MB. Full kubeadm install ~500 MB + many components
- **Simpler ops** — `curl -sfL https://get.k3s.io | sh -` vs multi-step kubeadm + CNI + CSI install
- **Built-in defaults** — Traefik ingress, Local Path Provisioner, CoreDNS — semua opsional bisa swap (Traefik → nginx-ingress kalau preferred)
- **Embedded etcd** — atau external SQLite/PostgreSQL (untuk small cluster dev)
- **Production-proven** — Rancher backing, used di edge + medium-prod widely
- **Perfect fit small-medium on-prem** — Ghanem.one ~5 prod nodes, k3s sweet spot

**Trade-off:**
- **Not full CNCF conformant** — k3s pass conformance tests umumnya, tetapi minor differences (e.g., embedded SQLite default). Kalau procurement / audit require strict CNCF certification atau FIPS 140-2, switch ke **RKE2** (k3s sibling, full conformance + FIPS).
- **Default Traefik ingress** mungkin perlu di-swap ke nginx-ingress kalau team familiar nginx config patterns. Easy swap via `--disable traefik`.

**Implementation notes:**
- Cluster bootstrap via Ansible playbook (`infra/ansible/k3s-install.yml`)
- HA mode di staging + prod: embedded etcd, 3+ control-plane nodes
- Single-node mode di dev
- Decision revisit kalau cluster size > 10 nodes — pada size itu RKE2 / full k8s mungkin lebih appropriate
- Hardware specs per [hardware sizing doc](../infrastructure/hardware-sizing-request.md)

---

#### 6. CI/CD Runner — **Self-Hosted GitHub Actions Runners**

**Decision:** GitHub Actions di SaaS (control plane), tetapi runners self-hosted di SKK Migas network untuk job execution.

**Why:**
- **Secrets stay di SKK Migas network** — runner punya akses ke kubeconfig, DB credentials, MinIO credentials yang tidak akan pernah outbound. Cuma metadata + status report ke GitHub.
- **No egress untuk prod deploys** — `kubectl apply` ke k3s API server stays internal
- **Network access to on-prem services** — runner bisa langsung connect ke internal PostgreSQL untuk migration jobs, ke internal MinIO untuk backup jobs, dll.
- **Compliance posture** — audit trail di SKK Migas network, network IDS dapat inspect job traffic
- **Cost** — self-hosted runner gratis (only VM cost); GitHub-hosted runners $0.008/minute untuk Linux yang akan add up dengan CI volume

**Trade-off:**
- **Ops overhead** — 1 dedicated VM minimum, runner upgrades manual atau via cron (`/runner upgrade`), monitor health
- **Single point of failure** — kalau runner down, no deploys. Mitigation: 2nd runner standby di prod (acceptable cost — 1 extra VM)
- **Network bootstrapping** — runner perlu egress ke `github.com` (registration + job polling). Already covered di [network requirements](../infrastructure/network-requirements.md)

**Implementation notes:**
- Runner provisioned via Ansible: `infra/ansible/runner-install.yml`
- Runner labels: `self-hosted`, `linux`, `skk-migas`, `prod-deploy` — workflow targets via `runs-on: [self-hosted, prod-deploy]`
- Runner version pin: `v2.317+` (auto-update enabled with restart-after-job)
- Secrets backed by GitHub Actions secrets (encrypted at rest); accessed only di runner during job execution
- VM spec: 16c/32G/200GB SSD (per [hardware sizing](../infrastructure/hardware-sizing-request.md))

---

#### 7. Persistent Volumes — **Longhorn**

**Decision:** Longhorn sebagai CSI driver untuk k8s persistent volumes di semua environments.

**Why over NFS / Ceph (Rook) / TopoLVM:**
- **Cloud-native** — k8s-native CSI, snapshot CRDs, volume cloning
- **Replication built-in** — replicate volumes across nodes (factor 3 default), survive single-node failure
- **Snapshot-friendly** — point-in-time snapshots, backup to S3/MinIO via CronJob
- **Web UI** — observability untuk volumes, easier troubleshooting
- **Smaller learning curve dibanding Rook/Ceph** — Ceph powerful tetapi very ops-heavy untuk small cluster

**Trade-off:**
- **Heavier than NFS** — Longhorn runs replica controllers + engine per volume. Overhead ~5-10% performance vs raw NFS.
- **Etcd pressure** — banyak Longhorn CRDs di etcd; mitigated dengan tidak over-provisioning volume count
- **Postgres NOT di Longhorn** — DB di dedicated VM (per [hardware sizing](../infrastructure/hardware-sizing-request.md)), bukan k3s volume. Longhorn untuk apps yang generate state di pod (Prometheus TSDB, Grafana, Sentry, Loki indexes, Uptime Kuma).

**Fallback option (NFS):**
- Kalau Longhorn ops complexity terlalu tinggi untuk team, switch ke **NFS** dari SKK Migas storage (asumsi available)
- Trade-off: tidak ada built-in replication; perlu separate backup strategy via Velero atau snapshot-based
- Decision revisit at Phase 7 Week 3 setelah evaluate Longhorn ops di dev environment

**Implementation notes:**
- Install via Helm chart: `longhorn/longhorn` v1.6+
- Storage class: `longhorn` (default 3 replicas), `longhorn-single` (1 replica untuk dev only)
- Backup target: MinIO bucket `ghanem-longhorn-backups`
- Snapshots: daily, retention 14 days

---

## Alternatif yang Dipertimbangkan (Roll-up)

Sudah diuraikan per-item di atas. Ringkasan alternatif yang **dipertimbangkan tetapi tidak dipilih**:

- **Next.js** — overkill untuk internal SPA
- **Redux Toolkit** — boilerplate tinggi untuk benefit minim dengan server state
- **Elasticsearch** — too heavy untuk dataset metadata use case
- **GeoServer** — Java overhead, slower than Martin
- **Full Kubernetes (kubeadm)** — too much ops surface untuk small team
- **GitHub-hosted runners** — cannot access on-prem services, secrets cannot leak ke SaaS context
- **Rook/Ceph** — overpowered untuk our scale; ops complexity tinggi
- **NFS-only** — viable fallback tetapi tidak sebagus Longhorn untuk k8s-native ops

## Konsekuensi

### Positive
- **Single coherent stack** — semua pilihan integrate clean: Vite output → nginx pod di k3s, Meilisearch + Martin akses PostGIS yang sama, Longhorn handle stateful workloads
- **Ops simpler dibanding alternatif** — k3s + Meilisearch + Longhorn semua optimized untuk small-medium team
- **No vendor lock-in** — semua open source, semua self-hostable
- **Future-proof** — Vite + React 18, TanStack Query, k3s semua aktif maintained dengan ecosystem besar
- **Migration paths jelas** — kalau kebutuhan grow, jalur upgrade ada (Meilisearch → ES, k3s → RKE2, NFS → Longhorn, dll.)

### Negative
- **Multiple smaller tools** vs single all-in-one (mis. Elasticsearch dapat handle search + log + analytics). Trade-off worth it karena cost ops smaller tools < cost ops 1 heavy tool
- **Self-hosted means more ops** secara umum vs SaaS. Tetap konsisten dengan ADR 0002 posture (on-prem mandate)
- **Team must learn 7 tools** instead of fewer. Mitigated via Ansible automation + runbook documentation

### Open Items / Phase 7-12 Revisit

- **Search engine:** revisit di Phase 12 / post-launch — kalau ada log analytics need, switch ke Elasticsearch/OpenSearch
- **Tile server:** kalau pihak ke-3 (KKKS, ESDM, Pertamina) butuh WMS/WFS untuk integrasi GIS legacy, tambah `pg_tileserv` side-by-side dengan Martin
- **Container orchestration:** kalau cluster > 10 nodes atau audit require strict CNCF/FIPS, switch ke RKE2
- **Persistent volumes:** evaluate Longhorn ops di dev (Phase 7 Week 3), fallback ke NFS jika ops burden tinggi

## Implementation Notes

### Order of Implementation (Phase 7-9)

| Phase | Item | Owner |
|---|---|---|
| Phase 7 W1 | k3s dev cluster bootstrap (Ansible) | DevOps |
| Phase 7 W1 | Self-hosted GH Actions runner provision | DevOps |
| Phase 7 W2 | Longhorn install di dev | DevOps |
| Phase 7 W2 | Meilisearch deploy di dev | DevOps + Backend |
| Phase 7 W2 | Martin tile server deploy di dev (proxy ke shared PostGIS) | DevOps + GIS |
| Phase 8 W1 | Vite + React + TS scaffold (migrate JSX prototype) | Frontend |
| Phase 8 W1 | TanStack Query + Zustand wiring | Frontend |
| Phase 9 W1 | NestJS scaffold dengan Meilisearch + BullMQ integration | Backend |

### Cross-Document References

Tech stack decisions di sini drive hardware sizing di [hardware-sizing-request.md](../infrastructure/hardware-sizing-request.md):
- Vite static output → minimal compute (served via nginx pod)
- Meilisearch → 4c/16G headroom
- Martin → 4c/8G replica 2
- Longhorn → factor 3 replication = 3x storage on k3s nodes
- Self-hosted runner → 1 dedicated VM 16c/32G

Network requirements di [network-requirements.md](../infrastructure/network-requirements.md) cover egress untuk:
- npm + PyPI + Docker Hub + GHCR (build artifacts)
- GitHub API (Actions runner polling)
- Let's Encrypt + Cloudflare (cert renewal untuk `*.ghanem.one`)

## References

- [ADR 0001 — Backend Framework Hybrid](./0001-backend-framework-hybrid.md)
- [ADR 0002 — Hosting On-Prem SKK Migas](./0002-hosting-on-prem-skk-migas.md)
- [ADR 0003 — SSO JIT Provisioning](./0003-sso-jit-provisioning.md)
- [Hardware Sizing Request](../infrastructure/hardware-sizing-request.md)
- [Network Requirements](../infrastructure/network-requirements.md)
- [DevOps agent definition](../../.claude/agents/devops-agent.md)
- [Frontend agent definition](../../.claude/agents/frontend-agent.md)
- [GIS agent definition](../../.claude/agents/gis-agent.md)
- [Phase 7-12 timeline](../../todolist.md)
