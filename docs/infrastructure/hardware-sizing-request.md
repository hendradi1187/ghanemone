# Ghanem.one — Hardware Sizing Request (SKK Migas Procurement)

> **Audience:** SKK Migas IT + Procurement — coordinated VM/bare-metal allocation untuk 3 environments
> **Owner:** Ghanem.one DevOps (devops@ghanemtech.co.id)
> **Date:** 2026-05-19
> **Status:** Draft — pending SKK Migas IT confirmation + procurement quote
> **Phase:** 7 (Infrastructure Setup) — blocking item for Phase 8/9 timeline

---

## 1. Executive Summary

Ghanem.one dijalankan di **3 environment** (dev, staging, prod) sesuai best practice. Dokumen ini merinci kebutuhan compute, storage, dan network bandwidth per environment, untuk diserahkan ke SKK Migas Procurement.

**Total VM count across 3 environments: 30 VMs.**

| Env | VM Count | Total vCPU | Total RAM | Total Storage | Tujuan |
|---|---|---|---|---|---|
| **Dev** | 1 | 8 | 32 GB | 0.5 TB SSD | Integration testing, ephemeral data |
| **Staging** | 9 | 56 | 224 GB | ~19.5 TB (mixed) | Prod-like rehearsal, UAT |
| **Prod** | 20 | 268 | 1,024 GB | ~67 TB (mixed) | Production HA cluster (HA CI runner) |
| **Grand total** | **30** | **332** | **1,280 GB** | **~87 TB** | |

> **Locked decisions (2026-05-19):** dev = single-VM all-in-one, staging = full 9-VM prod parity, Sentry = self-hosted (in k3s), GitHub Actions runner = 2 VMs HA di prod (primary + standby).

**Critical asks:**
1. **Dev environment ASAP** — dibutuhkan paling lambat Phase 7 Week 2 untuk Phase 8/9 dapat start parallel
2. **Staging + Prod** — lead time 4-8 minggu, target online Phase 10 (pre-launch)
3. **OS preference:** RHEL 9 atau Rocky Linux 9 (konfirmasi standard SKK Migas)
4. **Storage tiering:** NVMe SSD untuk DB hot path, SATA SSD untuk app, HDD untuk MinIO bulk + backup

---

## 2. Sizing Rationale (Why These Numbers)

### Workload Characteristics

Ghanem.one mengkombinasikan:
- **IO-bound REST API** — moderate CPU, latency-sensitive (NestJS) — referensi [ADR 0001](../decisions/0001-backend-framework-hybrid.md)
- **CPU-heavy spatial workers** — SEG-Y reading (GB-scale files), raster tiling, SHP import (Python)
- **Spatial database** — PostGIS dengan large geometries, spatial indexes, query planner berat
- **Object storage** — TB-scale untuk geophysics raw files (SEG-Y khususnya bisa 5-50 GB per file)
- **Map tile serving** — Martin tile server, CPU-light tetapi cache-heavy
- **Search** — Meilisearch in-memory index untuk dataset metadata

### Sizing Method

Numbers below berbasis:
- Estimasi 200-500 concurrent users (50-100 internal SKK Migas + 100-400 KKKS operators)
- Storage growth: ~2 TB/tahun untuk metadata + tiles, ~10-20 TB/tahun untuk raw uploads
- 3-year capacity planning horizon untuk prod
- Reference: similar deployments (GeoPlatform AS, USGS Energy Atlas) sized similarly

---

## 3. Dev Environment (Single-Node, Low-Budget)

**Tujuan:** Developer integration testing, ephemeral data, restart-friendly. Tidak HA. Data bisa di-wipe weekly.

### 3.1 Spec

| Role | Count | vCPU | RAM | Storage | Network |
|---|---|---|---|---|---|
| Dev all-in-one node | 1 | 8 | 32 GB | 500 GB SSD (single disk) | 1 Gbps |

### 3.2 What Runs Here

- k3s single-node (control + worker)
- PostgreSQL 15 + PostGIS (containerized, single instance, no replication)
- Redis (single instance, no Sentinel)
- MinIO (single-node, no erasure coding — only for testing)
- Meilisearch
- Martin tile server
- NestJS API + Python workers (1 replica each)
- Prometheus + Grafana + Loki (minimal retention 7 days)

### 3.3 Rationale

- 8 vCPU cukup untuk semua services bersamaan saat low concurrency (1-5 devs)
- 32 GB RAM: PostgreSQL ~4 GB, Redis ~1 GB, MinIO ~2 GB, Meilisearch ~2 GB, sisanya untuk k3s + apps + headroom
- 500 GB SSD: ~100 GB OS+k3s images, ~200 GB DB+MinIO, sisanya buffer
- Single disk acceptable — kalau crash, dev rebuild via Ansible (no production data loss)

### 3.4 Checklist

- [ ] 1 VM provisioned (target: Phase 7 Week 2)
- [ ] OS install (RHEL 9 / Rocky Linux 9)
- [ ] Network: internal IP, hostname `ghanem-dev-01.skkmigas.local`
- [ ] SSH access via SKK Migas jump host (bastion)
- [ ] Egress firewall rules ([network-requirements.md](./network-requirements.md)) applied

---

## 4. Staging Environment (3-Node k3s, Prod-Like)

**Tujuan:** UAT, smoke test sebelum prod release, DR drill rehearsal. Mirror struktur prod tetapi smaller scale (lower disk, lower replica count untuk MinIO).

### 4.1 Spec

| Role | Count | vCPU each | RAM each | Storage each | Network |
|---|---|---|---|---|---|
| k3s HA control + worker | 3 | 8 | 32 GB | 500 GB SSD | 1 Gbps |
| PostgreSQL primary | 1 | 16 | 64 GB | 2 TB NVMe SSD | 1 Gbps |
| PostgreSQL standby | 1 | 16 | 64 GB | 2 TB NVMe SSD | 1 Gbps |
| MinIO distributed nodes | 4 | 4 | 16 GB | 4 TB HDD | 1 Gbps |
| **Total staging** | **9** | **56** | **224 GB** | **~19.5 TB mixed** | |

### 4.2 What Runs Where

- k3s nodes (3): all k8s workloads — NestJS, Python workers, Martin, Meilisearch, Redis (containerized Sentinel), Grafana, Prometheus, Loki, Sentry, Uptime Kuma
- PostgreSQL: dedicated VMs (NOT inside k8s) — performance + ops isolation
- MinIO: dedicated VMs, 4 nodes minimum untuk erasure coding (EC 2+2)

### 4.3 Rationale

- 3 nodes k3s = HA control plane minimum (etcd quorum needs odd number ≥ 3)
- Postgres dedicated VM: spatial queries can saturate I/O; bare-metal-style placement
- Postgres standby: streaming replication target — same spec sebagai primary supaya bisa promote tanpa rebuild
- MinIO 4-node: minimum untuk distributed mode dengan erasure coding. Storage 4×4 TB = 16 TB raw, ~8 TB usable (EC 2+2).

### 4.4 Cost-Saving Alternative (Konsolidasi)

Kalau procurement constraint ketat, staging bisa di-konsolidasi:
- Run PostgreSQL standby di salah satu k3s node (tradeoff: ops complexity)
- MinIO co-located di k3s nodes (tradeoff: I/O contention dengan apps)
- Total bisa turun ke 3 VMs (k3s 8c/32G/2TB SSD + 4TB HDD secondary disk)

**Default proposal: 9 VMs separated.** Konsolidasi opsional kalau budget ketat — diskusi dengan procurement.

### 4.5 Checklist

- [ ] 3 k3s VMs (target: Phase 9 Week 4 — staging needed for first integration test)
- [ ] 2 PostgreSQL VMs (with NVMe SSD)
- [ ] 4 MinIO VMs (with HDD bulk storage)
- [ ] Hostnames assigned per Section 6 schema
- [ ] Internal DNS records created
- [ ] Network: VLAN dengan internal IPs, intra-VLAN allow-all

---

## 5. Prod Environment (HA, Full-Scale)

**Tujuan:** Production deployment. HA across all tiers. 99.9% uptime target. 3-year capacity horizon.

### 5.1 Spec

| Role | Count | vCPU each | RAM each | Storage each | Network |
|---|---|---|---|---|---|
| k3s control + worker (HA) | 5 | 16 | 64 GB | 1 TB NVMe SSD | 1 Gbps (10 Gbps preferred) |
| PostgreSQL primary | 1 | 32 | 128 GB | 4 TB NVMe SSD | 10 Gbps |
| PostgreSQL standby | 1 | 32 | 128 GB | 4 TB NVMe SSD | 10 Gbps |
| MinIO distributed nodes | 6 | 8 | 32 GB | 8 TB HDD | 10 Gbps |
| Redis Sentinel | 3 | 4 | 16 GB | 100 GB SSD | 1 Gbps |
| Python spatial workers (dedicated) | 2 | 32 | 64 GB | 500 GB NVMe SSD | 1 Gbps |
| GitHub Actions self-hosted runners (HA) | 2 | 16 | 32 GB | 200 GB SSD | 1 Gbps |
| **Total prod** | **20** | **268** | **1,024 GB** | **~67 TB mixed** | |

### 5.2 What Runs Where

- **k3s (5 nodes):** API gateway, NestJS API replicas, Martin, Meilisearch, monitoring stack, Sentry, Uptime Kuma, light workers. 5 nodes = 3 control + 2 worker, atau 5 stacked control+worker (RKE2 style).
- **PostgreSQL (2 VMs):** primary + standby dengan streaming replication. Tidak di-host di k3s — dedicated untuk spatial workload performance.
- **MinIO (6 nodes):** 6× 8 TB = 48 TB raw, ~32 TB usable (EC 4+2). Headroom untuk growth 3 tahun.
- **Redis Sentinel (3 nodes):** dedicated VMs (NOT containerized) — Sentinel quorum needs 3, performance-sensitive untuk BullMQ.
- **Python workers (2 VMs):** dedicated bare-metal-style placement karena CPU-intensive SEG-Y / raster processing yang dapat saturate k3s nodes. Horizontal scale by adding more VMs jika beban naik.
- **GitHub Actions runners (2 VMs, HA):** 1 primary + 1 standby. Isolated dari workload supaya CI tidak ganggu prod traffic. HA penting: kalau primary down saat insiden prod, hotfix tetap bisa di-ship via standby. Bisa scale lebih banyak saat heavy parallel CI.

### 5.3 Rationale per Sizing

| Item | Justification |
|---|---|
| 5× k3s 16c/64G | Survive 1 node loss (rolling upgrade, hw failure) with 4 nodes carrying load. 16c = enough untuk multiple API replicas + side cars. 64G = headroom untuk JVM-less stack + observability. |
| Postgres 32c/128G/4TB NVMe | PostGIS spatial queries CPU + memory heavy. shared_buffers = 32 GB, work_mem aggressive, NVMe untuk index scan + vacuum. 4 TB = 3-year metadata + spatial data. |
| MinIO 6× 8c/32G/8TB | EC 4+2 = 2 failure tolerance. 48 TB raw cukup untuk ~10 TB metadata + 20 TB raw geophysics uploads + 18 TB headroom + tile cache. |
| Redis 3× 4c/16G | Sentinel quorum + BullMQ queue depth. 16 GB RAM cukup untuk 10M jobs in-flight + cache. |
| Python workers 2× 32c/64G | SEG-Y file read benefits dari parallel threading. 32c memungkinkan parallel raster tiling. 2 VMs = redundancy + horizontal scale unit. |
| GH runner 2× 16c/32G | Docker builds, npm install, pytest. 16c untuk parallel test runs. HA: primary + standby supaya CI tidak SPOF saat prod incident. |

### 5.4 Checklist

- [ ] 5 k3s VMs
- [ ] 2 PostgreSQL VMs
- [ ] 6 MinIO VMs
- [ ] 3 Redis Sentinel VMs
- [ ] 2 Python worker VMs
- [ ] 2 GitHub Actions runner VMs (HA: primary + standby)
- [ ] All hostnames per schema, internal DNS configured
- [ ] Target: online by Phase 10 (pre-launch)

---

## 6. Hostname + IP Allocation Schema

Specific IPs TBD oleh SKK Migas IT. Berikut **schema hostname** yang request kami terapkan:

```
ghanem-{env}-{role}-{NN}.skkmigas.local
```

- `{env}`: `dev`, `staging`, `prod`
- `{role}`: `k8s`, `db`, `minio`, `redis`, `worker`, `runner`
- `{NN}`: 2-digit zero-padded (01-99)

### Examples

| Hostname | Env | Role | Index |
|---|---|---|---|
| `ghanem-dev-01.skkmigas.local` | dev | (all-in-one) | 01 |
| `ghanem-staging-k8s-01.skkmigas.local` | staging | k8s | 01 |
| `ghanem-staging-db-01.skkmigas.local` | staging | db primary | 01 |
| `ghanem-staging-db-02.skkmigas.local` | staging | db standby | 02 |
| `ghanem-staging-minio-01..04.skkmigas.local` | staging | minio | 01-04 |
| `ghanem-prod-k8s-01..05.skkmigas.local` | prod | k8s | 01-05 |
| `ghanem-prod-db-01..02.skkmigas.local` | prod | db | 01-02 |
| `ghanem-prod-minio-01..06.skkmigas.local` | prod | minio | 01-06 |
| `ghanem-prod-redis-01..03.skkmigas.local` | prod | redis | 01-03 |
| `ghanem-prod-worker-01..02.skkmigas.local` | prod | worker | 01-02 |
| `ghanem-prod-runner-01..02.skkmigas.local` | prod | runner (primary + standby) | 01-02 |

**Action item:** SKK Migas IT, please assign internal IPs (preferably contiguous /28 atau /29 ranges per env).

---

## 7. Storage Tiering

Storage tier per workload class:

| Tier | Media | Use Case | Where |
|---|---|---|---|
| **Tier 0 — Hot DB** | NVMe SSD (≥ 1 GB/s read, ≥ 500 MB/s write) | PostgreSQL data dir, WAL, spatial indexes | DB primary, standby |
| **Tier 1 — App + tile cache** | SATA/SAS SSD | k3s node OS + container images, Redis dump, Python worker scratch | k3s nodes, worker, runner |
| **Tier 2 — Bulk** | HDD (7200 RPM, capacity-focused) | MinIO object storage (uploaded files, tile cache that doesn't fit Tier 1) | MinIO nodes |
| **Tier 3 — Backup** | HDD atau tape | Encrypted off-site backup | Secondary site (different building) |

---

## 8. Network Bandwidth

| Segment | Minimum | Recommended |
|---|---|---|
| Intra-cluster (east-west) | 1 Gbps | 10 Gbps |
| DB primary ↔ standby (replication) | 1 Gbps | 10 Gbps (NVMe sustained throughput) |
| MinIO inter-node (erasure coding) | 1 Gbps | 10 Gbps |
| Egress to internet (CI/CD) | 100 Mbps | 500 Mbps |
| Inbound from internet (users) | 100 Mbps | 1 Gbps |

---

## 9. OS Preference

- **Primary:** RHEL 9 atau Rocky Linux 9
- **Why:** SKK Migas standard (asumsi — please confirm), enterprise support, SELinux available, long support cycle
- **Kernel:** ≥ 5.14 (default in RHEL 9)
- **Bake into Ansible:** OS baseline playbook (hardening, time sync, monitoring agents) consistent across env

Konfirmasi yang dibutuhkan:
- [ ] RHEL 9 (paid subscription) atau Rocky Linux 9 (free, binary compatible)?
- [ ] Apakah ada SKK Migas-standard OS image (golden image)?

---

## 10. Lead Time + Procurement Timeline

| Phase | Need | Target Date | Critical? |
|---|---|---|---|
| Phase 7 Week 1 | Network firewall approval | Per [network doc](./network-requirements.md) | **Critical** |
| Phase 7 Week 2 | **Dev VM ready** | ~2 weeks from procurement start | **Critical — gates Phase 8/9** |
| Phase 7 Week 3-4 | Staging procurement order placed | — | High |
| Phase 9 Week 4-5 | **Staging VMs ready** | ~6-8 weeks lead time | High — needed for integration testing |
| Phase 10 Week 1 | Prod procurement order placed | — | High |
| Phase 10 Week 6-8 | **Prod VMs ready** | ~8-10 weeks lead time | **Critical — gates launch** |

**Highest priority:** Dev VM ready ASAP. Phase 8 (Frontend) dan Phase 9 (Backend) tidak bisa start parallel tanpa dev environment untuk smoke test integrations.

---

## 11. Cost Estimate

Cost estimation **omitted** karena bergantung pada SKK Migas internal procurement contracts + existing capacity. Document ini cukup detail untuk procurement team minta quote dari vendor.

Untuk reference cost ballpark (informational only, di-luar SKK Migas):
- Dev (8c/32G/500GB): ~Rp 50-80 jt 3-yr amortized (jika beli baru)
- Staging (9 VMs total): ~Rp 600-900 jt
- Prod (19 VMs total): ~Rp 2-3 M
- (Estimasi berbasis Dell PowerEdge R650/R750 + Pure/NetApp storage class hardware)

---

## 12. Action Items + Checklist Summary

### Critical Path (Phase 7 Week 1-2)

- [ ] Approval untuk procurement (3 environments)
- [ ] Dev VM ready oleh end of Phase 7 Week 2
- [ ] OS preference confirmed (RHEL 9 vs Rocky 9)
- [ ] Internal DNS zone + hostname schema confirmed
- [ ] Network firewall rules ([network doc](./network-requirements.md)) approved

### Standard Path (Phase 7-10)

- [ ] Staging procurement order placed
- [ ] Prod procurement order placed
- [ ] All hostnames + IPs allocated
- [ ] Storage tier confirmed (NVMe + HDD availability)
- [ ] Network bandwidth provisioned (10 Gbps preferred for prod east-west)
- [ ] Backup target location identified (secondary SKK Migas building)

---

## 13. Open Items (Need SKK Migas IT Clarification)

1. **OS:** RHEL 9 paid subscription, Rocky Linux 9, or other SKK Migas standard?
2. **Hypervisor:** VMware vSphere, KVM, atau bare-metal preferred?
3. **Storage:** SAN-backed VMs (vSAN/Pure) atau local-disk VMs? Performance considerations untuk PostgreSQL berbeda significantly.
4. **VLAN topology:** apakah 3 environments terpisah VLAN, atau shared VLAN dengan firewall rules?
5. **Bastion/jump host:** existing SKK Migas bastion atau provision baru untuk Ghanem.one?
6. **Backup target:** lokasi sekunder mana yang available untuk off-site backup?

---

## 14. References

- [ADR 0002 — Hosting On-Prem SKK Migas](../decisions/0002-hosting-on-prem-skk-migas.md)
- [ADR 0004 — Tech Stack Finalize](../decisions/0004-tech-stack-finalize.md)
- [Network Requirements](./network-requirements.md)
- [DevOps agent definition](../../.claude/agents/devops-agent.md)
- [Phase 7 timeline](../../todolist.md)
