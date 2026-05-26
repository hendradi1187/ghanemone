# Ghanem.one — Network Requirements (SKK Migas IT Coordination)

> **Audience:** SKK Migas IT — koordinasi firewall + DNS untuk Ghanem.one production environment
> **Owner:** Ghanem.one DevOps (devops@ghanemtech.co.id)
> **Date:** 2026-05-19
> **Status:** Draft — pending SKK Migas IT review
> **Phase:** 7 (Infrastructure Setup) — blocking item

---

## 1. Executive Summary

Ghanem.one akan di-host di on-prem SKK Migas data center (referensi: [ADR 0002](../decisions/0002-hosting-on-prem-skk-migas.md)). Untuk operasional CI/CD, SSL renewal, container registry pull, dan AI integration, beberapa egress firewall rules dibutuhkan. Dokumen ini adalah **checklist actionable** yang dapat di-tick oleh SKK Migas IT.

**Total ask:**
- 8 destinasi egress (semua HTTPS / port 443)
- 1 inbound public range (HTTPS/443 untuk 4 hostnames)
- Internal east-west traffic (intra-cluster) — informational
- DNS: split-horizon untuk `*.ghanem.one` + internal `*.skkmigas.local`

Jika direct egress tidak diizinkan policy SKK Migas, kami **request artifact mirror** (Nexus / Artifactory / proxy) — alternatif di Section 6.

---

## 2. Egress Firewall Rules (Outbound dari SKK Migas → Internet)

Semua trafik egress menggunakan **HTTPS/TCP 443**. Tidak ada egress yang membutuhkan port lain.

### 2.1 Tabel Ringkasan

| # | Destination Host | Port | Protocol | Tujuan | Frekuensi | Wajib? |
|---|---|---|---|---|---|---|
| 1 | `github.com` | 443 | HTTPS/TCP | Git fetch source code, CI/CD trigger | Per push + every 5 min poll | Wajib |
| 2 | `api.github.com` | 443 | HTTPS/TCP | GitHub Actions runner registration + job dispatch | Continuous (long-poll) | Wajib |
| 3 | `objects.githubusercontent.com` | 443 | HTTPS/TCP | GitHub artifacts/release download | Per CI build | Wajib |
| 4 | `registry.npmjs.org` | 443 | HTTPS/TCP | Node.js package download | Per build (cached) | Wajib |
| 5 | `pypi.org` | 443 | HTTPS/TCP | Python package metadata | Per build (cached) | Wajib |
| 6 | `files.pythonhosted.org` | 443 | HTTPS/TCP | Python package tarball/wheel download | Per build (cached) | Wajib |
| 7 | `registry-1.docker.io` | 443 | HTTPS/TCP | Docker Hub container pulls | Per deploy | Wajib |
| 8 | `auth.docker.io` | 443 | HTTPS/TCP | Docker Hub authentication | Per deploy | Wajib |
| 9 | `production.cloudflare.docker.com` | 443 | HTTPS/TCP | Docker layer storage CDN | Per deploy | Wajib |
| 10 | `ghcr.io` | 443 | HTTPS/TCP | GitHub Container Registry pulls (private images) | Per deploy | Wajib |
| 11 | `pkg-containers.githubusercontent.com` | 443 | HTTPS/TCP | GHCR layer storage | Per deploy | Wajib |
| 12 | `acme-v02.api.letsencrypt.org` | 443 | HTTPS/TCP | Let's Encrypt ACME API (cert issuance + renewal) | 1x / 60 hari per cert | Wajib |
| 13 | `api.cloudflare.com` | 443 | HTTPS/TCP | Cloudflare DNS API untuk DNS-01 challenge | Saat cert renewal | Wajib |
| 14 | `api.anthropic.com` | 443 | HTTPS/TCP | Claude AI proxy (AI-assisted features, Phase 8/9) | Per user query | Wajib |
| ~~15~~ | ~~`sentry.io`~~ | — | — | **DROPPED** — Sentry self-hosted di k3s (locked 2026-05-19) | — | Tidak dibutuhkan |

### 2.2 Checklist untuk SKK Migas IT

- [ ] Rule #1-3: GitHub (CI/CD source + artifacts)
- [ ] Rule #4: npm registry (Node.js packages)
- [ ] Rule #5-6: PyPI + Pythonhosted (Python packages)
- [ ] Rule #7-9: Docker Hub (base images, public containers)
- [ ] Rule #10-11: GitHub Container Registry (private app images)
- [ ] Rule #12-13: Let's Encrypt + Cloudflare DNS API (SSL via DNS-01)
- [ ] Rule #14: Anthropic API (Claude AI, Phase 8/9 — dapat ditunda hingga Phase 8)
- [x] ~~Rule #15: Sentry SaaS~~ — **DROPPED** (Sentry self-hosted di k3s, locked 2026-05-19)

### 2.3 Catatan Penting

- **Tidak ada egress untuk data primary.** Database, MinIO, dan data E&P tidak pernah meninggalkan SKK Migas network. Egress hanya untuk **artifact pulls** (kode, package, container) + **outbound API calls** (Let's Encrypt, Anthropic).
- **Wildcard subdomains:** GitHub menggunakan CDN dengan rotating IPs. Disarankan rule berbasis FQDN, bukan IP, atau gunakan SKK Migas internal proxy (Squid/MITM) yang dapat resolve FQDN dynamically.
- **Anthropic AI traffic** (Rule #14) akan diproxy melalui internal API gateway sehingga PII tidak dikirim verbatim — detail di [Security agent doc](../../.claude/agents/security-agent.md).
- **Sentry telemetry** (Rule #15): **DROPPED** — keputusan locked 2026-05-19 untuk self-host Sentry di k3s. Stack traces + breadcrumbs tidak leave SKK Migas network. Aligned dengan ADR-0002 (on-prem) + UU PDP strict interpretation.

---

## 3. Inbound Firewall Rules (Internet → SKK Migas DMZ)

Hanya 1 ingress IP perlu di-expose ke public internet — load balancer / reverse proxy yang terminating TLS.

### 3.1 Public-Facing Hostnames

| Hostname | Tujuan | Inbound Port | Catatan |
|---|---|---|---|
| `ghanem.one` | Web UI (React SPA) | TCP/443 | Static files served via nginx |
| `api.ghanem.one` | REST API (NestJS) | TCP/443 | JWT-authenticated, OIDC callback |
| `tiles.ghanem.one` | Map tile server (Martin) | TCP/443 | Public tiles untuk basemap; protected tiles via signed URL |
| `status.ghanem.one` | Uptime Kuma status page | TCP/443 | Public uptime page (read-only) |

### 3.2 Network Topology Request

```
Internet ──TCP/443──> SKK Migas DMZ LB (Public IP TBD)
                                │
                                ├── ghanem.one          → nginx (k3s ingress)
                                ├── api.ghanem.one      → NestJS API service
                                ├── tiles.ghanem.one    → Martin tile server
                                └── status.ghanem.one   → Uptime Kuma
```

### 3.3 Checklist

- [ ] Allocate 1 public IP (atau pakai existing SKK Migas DMZ LB)
- [ ] Forward TCP/443 dari public IP → ingress controller di k3s cluster (internal IP TBD)
- [ ] HTTP/80 tidak perlu inbound — SSL renewal pakai DNS-01 (no HTTP-01 challenge)
- [ ] WAF/IDS policy: izinkan websocket upgrade untuk `api.ghanem.one` (monitoring live updates)

---

## 4. Internal Network — East-West Traffic (Intra-Cluster)

Trafik antar service di dalam k3s cluster. Informational — biasanya intra-VLAN allowed by default; konfirmasi kalau ada micro-segmentation policy.

### 4.1 Service-to-Service Port Matrix

| Source | Destination | Port | Protocol | Tujuan |
|---|---|---|---|---|
| NestJS API | PostgreSQL primary | TCP/5432 | TCP | DB queries via Prisma |
| NestJS API | Redis Sentinel | TCP/6379, 26379 | TCP | Cache + BullMQ queue |
| NestJS API | MinIO | TCP/9000 | HTTP/HTTPS | Presigned URLs, file ops |
| NestJS API | Meilisearch | TCP/7700 | HTTP | Search queries |
| NestJS API | Martin tile server | TCP/3000 | HTTP | Internal tile metadata calls |
| Python workers | PostgreSQL primary | TCP/5432 | TCP | DB writes via SQLAlchemy |
| Python workers | Redis | TCP/6379 | TCP | BullMQ job consume |
| Python workers | MinIO | TCP/9000 | HTTP/HTTPS | Read raw uploads, write tiles |
| Martin | PostgreSQL primary | TCP/5432 | TCP | PostGIS spatial queries |
| Prometheus | All services | TCP/9100, 9187, 9121, varies | HTTP | Metrics scrape (node_exporter, postgres_exporter, redis_exporter, app /metrics) |
| Loki promtail | All services stdout | (logs via local socket) | — | Log aggregation |
| Grafana | Prometheus | TCP/9090 | HTTP | Query metrics |
| Grafana | Loki | TCP/3100 | HTTP | Query logs |
| cert-manager | Cloudflare DNS API | TCP/443 (egress) | HTTPS | DNS-01 challenge |
| GitHub Actions runner | k3s API server | TCP/6443 | HTTPS | Deploy via kubectl |
| PostgreSQL primary | PostgreSQL standby | TCP/5432 | TCP | Streaming replication |
| Redis Sentinel nodes | Each other | TCP/26379 | TCP | Sentinel gossip + failover |
| MinIO node N | MinIO node M | TCP/9000 | HTTP | Erasure coding traffic |

### 4.2 Checklist

- [ ] Konfirmasi: apakah ada micro-segmentation antar VLAN di SKK Migas DC?
- [ ] Kalau ya: minta allow-list untuk subnet `10.x.x.0/24` (k3s pod CIDR — TBD) → service VLAN
- [ ] Kalau tidak: intra-VLAN default-allow sudah cukup

---

## 5. DNS Requirements

### 5.1 Public DNS (Cloudflare)

Sudah managed via Cloudflare (akun Ghanem.one). Tidak ada action untuk SKK Migas IT.

| Record | Type | Target | TTL |
|---|---|---|---|
| `ghanem.one` | A | SKK Migas DMZ LB public IP (TBD) | 300 |
| `api.ghanem.one` | A | same as above | 300 |
| `tiles.ghanem.one` | A | same as above | 300 |
| `status.ghanem.one` | A | same as above | 300 |
| `_acme-challenge.*.ghanem.one` | TXT | (set dynamically by cert-manager) | 60 |

### 5.2 Internal DNS (SKK Migas DNS)

Untuk service-to-service resolution di dalam SKK Migas network — request SKK Migas IT untuk konfigurasi:

| Hostname | Type | Target | Tujuan |
|---|---|---|---|
| `ghanem-prod-k8s-01.skkmigas.local` ... `-05` | A | Allocated VM IPs (TBD) | k3s nodes (prod) |
| `ghanem-prod-db-01.skkmigas.local`, `-02` | A | DB VM IPs (TBD) | PostgreSQL primary + standby |
| `ghanem-prod-minio-01.skkmigas.local` ... `-06` | A | MinIO VM IPs | Object storage nodes |
| `ghanem-prod-redis-01.skkmigas.local` ... `-03` | A | Redis Sentinel VMs | Cache + queue |
| `ghanem-prod-runner-01.skkmigas.local` | A | GH Actions runner VM | CI/CD runner |
| `ghanem-staging-*.skkmigas.local` | A | Staging VMs | Staging environment |
| `ghanem-dev-*.skkmigas.local` | A | Dev VMs | Dev environment |

### 5.3 Split-Horizon DNS for `*.ghanem.one`

Saat resolve `api.ghanem.one` **dari dalam SKK Migas network**, kami ingin balikan ke **internal IP** (bypass DMZ LB) untuk:
- Mengurangi latency (no NAT hairpin)
- Kurangi load di DMZ LB
- Tetap valid certificate (SAN sudah cover hostnames)

**Request:** SKK Migas internal DNS resolver mereturn internal IP untuk `*.ghanem.one` kalau query datang dari subnet SKK Migas. Public DNS tetap return public IP.

### 5.4 Checklist

- [ ] Confirm zone `*.skkmigas.local` (atau zone serupa) dapat di-allocate untuk Ghanem.one hostnames
- [ ] Confirm naming schema `ghanem-{env}-{role}-{NN}.skkmigas.local` acceptable
- [ ] Implement split-horizon untuk `*.ghanem.one` (internal IP saat query dari LAN SKK Migas)
- [ ] Provide DNS server IPs untuk kami set sebagai upstream resolver di k3s CoreDNS

---

## 6. Alternative — Artifact Mirror (Jika Direct Egress Tidak Diizinkan)

Kalau policy SKK Migas tidak mengizinkan direct egress ke internet untuk artifact pulls, kami request **proxy/mirror** untuk repository berikut. Ini opsi yang **lebih aman** (centralized auditable, no direct outbound).

### 6.1 Mirror Requirements

| Upstream | Recommended Mirror | Catatan |
|---|---|---|
| `registry.npmjs.org` | Nexus / Verdaccio / Artifactory NPM proxy | Read-through cache |
| `pypi.org` | Nexus / devpi / Artifactory PyPI proxy | Read-through cache |
| `registry-1.docker.io` + `ghcr.io` | Harbor / Artifactory Docker proxy | Pull-through cache, scan-enabled |
| `github.com` (git fetch) | GitLab mirror atau internal git proxy | Optional — tetap perlu API access |

### 6.2 Checklist

- [ ] SKK Migas IT konfirmasi: ada existing artifact mirror (Nexus/Artifactory)?
- [ ] Kalau ada: berikan endpoint URL untuk kami konfigurasi `npm config`, `pip config`, dan k3s containerd registry mirror
- [ ] Kalau tidak ada: kami siap deploy Harbor + Verdaccio + devpi di SKK Migas DC (request kapasitas tambahan di [hardware sizing doc](./hardware-sizing-request.md))

---

## 7. Bandwidth Expectation

| Direction | Minimum | Recommended | Catatan |
|---|---|---|---|
| Internal east-west (intra-cluster) | 1 Gbps | 10 Gbps | DB replication + MinIO erasure coding |
| Egress to internet (CI/CD pulls) | 100 Mbps | 500 Mbps | Burst saat container pulls; cached artifacts kurangi traffic |
| Inbound from internet (user traffic) | 100 Mbps | 1 Gbps | Public web UI + tile serving |

---

## 8. Timeline + Action Items

| # | Item | Owner | Target | Status |
|---|---|---|---|---|
| 1 | Review + approve egress firewall rules | SKK Migas IT | Phase 7 Week 1 | [ ] |
| 2 | Allocate public IP + DMZ LB config | SKK Migas IT | Phase 7 Week 1 | [ ] |
| 3 | Allocate internal DNS zone + hostnames | SKK Migas IT | Phase 7 Week 1 | [ ] |
| 4 | Confirm artifact mirror availability (if applicable) | SKK Migas IT | Phase 7 Week 1 | [ ] |
| 5 | Confirm split-horizon DNS feasibility | SKK Migas IT | Phase 7 Week 2 | [ ] |
| 6 | Provide allocated IPs untuk hostnames di Section 5.2 | SKK Migas IT | Phase 7 Week 2 | [ ] |

---

## 9. Contact

| Pihak | Nama / Email |
|---|---|
| Ghanem.one DevOps lead | Hendra Dinata — hendra@pm.ghanemtech.co.id |
| Ghanem.one Security lead | TBD |
| SKK Migas IT counterpart | TBD (untuk diisi oleh SKK Migas) |

---

## 10. References

- [ADR 0002 — Hosting On-Prem SKK Migas](../decisions/0002-hosting-on-prem-skk-migas.md)
- [Hardware Sizing Request](./hardware-sizing-request.md)
- [ADR 0004 — Tech Stack Finalize](../decisions/0004-tech-stack-finalize.md)
- [DevOps agent definition](../../.claude/agents/devops-agent.md)
