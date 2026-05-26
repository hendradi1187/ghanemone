# infra/ansible

Ansible playbooks untuk bootstrap on-prem infrastructure (k3s, OS baseline, Postgres,
MinIO, Redis Sentinel, self-hosted GH Actions runner).

**Status:** Placeholder. Diisi di **Task #4 — Ansible Playbooks** (Phase 7 Week 1-3).

## Rencana isi folder

```
infra/ansible/
├── inventory/
│   ├── dev.yml
│   ├── staging.yml
│   └── prod.yml
├── group_vars/
│   ├── all.yml
│   ├── k8s.yml
│   ├── db.yml
│   └── minio.yml
├── roles/
│   ├── os-baseline/         (hardening, time sync, monitoring agents)
│   ├── k3s-server/
│   ├── k3s-agent/
│   ├── postgres/            (PostgreSQL 15 + PostGIS 3.4)
│   ├── minio/               (distributed mode, EC 2+2 staging / 4+2 prod)
│   ├── redis-sentinel/
│   ├── longhorn/            (Helm install via kubectl)
│   └── gh-runner/           (self-hosted GitHub Actions runner)
├── playbooks/
│   ├── bootstrap-dev.yml
│   ├── bootstrap-staging.yml
│   ├── bootstrap-prod.yml
│   └── upgrade-k3s.yml
└── ansible.cfg
```

## References

- [ADR 0002 — Hosting On-Prem SKK Migas](../../docs/decisions/0002-hosting-on-prem-skk-migas.md)
- [ADR 0004 — Tech Stack Finalize](../../docs/decisions/0004-tech-stack-finalize.md)
- [Hardware Sizing Request](../../docs/infrastructure/hardware-sizing-request.md)
