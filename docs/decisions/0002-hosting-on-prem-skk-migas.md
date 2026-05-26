# ADR 0002 — Hosting: On-Prem SKK Migas Data Center

**Status:** Accepted
**Date:** 2026-05-19
**Decision maker:** Hendra Dinata (hendra@pm.ghanemtech.co.id)
**Context:** Phase 7 — Infrastructure Setup, UU PDP compliance

## Konteks

UU PDP (Undang-Undang Perlindungan Data Pribadi) mengharuskan data pribadi WNI tersimpan di server di Indonesia. Selain itu, data hulu migas (well log, seismic, production data) klasifikasinya sensitif — SKK Migas regulator + KKKS operators tidak nyaman dengan public cloud untuk data primary.

## Keputusan

**Production deployment di on-prem SKK Migas data center.**
- Tightest data residency — fisik di gedung SKK Migas
- Direct integration dengan SKK Migas internal network untuk SSO + data ingestion dari KKKS
- Tidak ada outbound data transfer untuk data primary

## Alternatif yang Dipertimbangkan

| Alternatif | Pro | Kontra | Kenapa Tidak |
|---|---|---|---|
| **AWS Jakarta** | Managed services matang, scaling otomatis, ops minimal | Data secondary tersimpan di AWS (meski region ID, masih cloud provider asing) | Sensitivity data E&P + preferensi SKK Migas untuk on-prem |
| **Alibaba Cloud ID / Biznet** | Lokal, harga kompetitif | Managed services kurang mature dibanding AWS, vendor risk untuk infrastruktur kritikal | Tidak ada keunggulan dibanding on-prem dari sisi data residency |
| **On-prem** ✅ | Data residency maksimal, integrasi network SKK Migas mulus | Self-managed (lebih banyak ops work), procurement hardware long lead | Aligned dengan SKK Migas standard + UU PDP strictest interpretation |

## Konsekuensi

### Positive
- Compliance UU PDP terjamin (data tidak pernah leave SKK Migas fisik)
- Network latency rendah untuk integrasi internal SKK Migas (SSO, HR system, KKKS data feeds)
- Tidak ada bandwidth egress cost
- Audit & forensik lebih mudah (full physical control)

### Negative
- **Self-managed Kubernetes** — butuh DevOps engineer yang lebih berpengalaman dengan on-prem ops
- **Hardware procurement long lead** — VM/bare-metal allocation harus dikoordinasi dengan SKK Migas IT, bisa 4-8 minggu
- **Scaling tidak elastic** — perlu capacity planning lebih hati-hati, tidak ada auto-scale instan
- **Disaster recovery** lebih kompleks — perlu cold standby site di gedung berbeda
- **No managed services** — Postgres, Redis, Kafka semua self-host (vs RDS, ElastiCache, MSK di AWS)

## Tech Stack Choices (Driven oleh keputusan ini)

| Layer | Pilihan | Alasan |
|---|---|---|
| Orchestration | k3s atau RKE2 | Lighter than full k8s, ops simpler untuk small team |
| Storage | MinIO (S3-compatible) | Self-host, drop-in replacement untuk S3 |
| Volume | Longhorn atau NFS | Persistent volumes untuk DB, MinIO |
| Database | PostgreSQL 15 + PostGIS 3.4 | Self-managed dengan replication primary/standby |
| Cache | Redis 7 | Self-managed Sentinel untuk HA |
| Monitoring | Prometheus + Grafana + Loki | Self-hosted observability stack |
| Error tracking | Self-hosted Sentry | Tidak kirim error/stacktrace ke cloud provider |
| Backups | Encrypted off-site (AWS Glacier ID atau on-prem secondary site) | UU PDP mengizinkan encrypted backup outside ID region |
| OS | Likely RHEL/Rocky Linux | Asumsikan standard SKK Migas; konfirmasi |

## Network Requirements (Coordinate dengan SKK Migas IT)

Egress dibutuhkan ke:
- `github.com` (CI/CD)
- `registry.npmjs.org` (Node packages)
- `pypi.org` (Python packages)
- `docker.io` / `ghcr.io` (container images)
- `acme-v02.api.letsencrypt.org` (SSL via DNS-01 challenge)
- `*.cloudflare.com` (DNS API untuk DNS-01)
- `api.anthropic.com` (Claude AI proxy — Phase 8/9 feature)

**Action item:** Request firewall rules / proxy mirror dari SKK Migas IT di Phase 7 Week 1.

## Implementation Notes

- Phase 7 Week 1-2: Hardware allocation request + network firewall coordination + on-prem k3s cluster bootstrap (dev environment dulu)
- Phase 7 Week 2: Self-hosted GitHub Actions runners inside SKK Migas network untuk prod deploys
- Phase 7 ongoing: Ansible playbooks untuk OS baseline + k8s install + monitoring stack

## Migration Path (Future Flexibility)

Architecture decision **tidak menutup** kemungkinan multi-region di masa depan:
- API + workers stateless → bisa di-replicate ke AWS Jakarta sebagai DR atau burst capacity
- Database tetap on-prem (primary), AWS sebagai read replica untuk geographic distribution (jika diperlukan untuk KKKS di luar Jakarta)

## References

- DevOps agent: [.claude/agents/devops-agent.md](../../.claude/agents/devops-agent.md)
- Security agent: [.claude/agents/security-agent.md](../../.claude/agents/security-agent.md)
- Phase 7 + 10 timeline: [todolist.md](../../todolist.md)
