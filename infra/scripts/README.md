# infra/scripts

Maintenance + deploy helper scripts (bash + python).

**Status:** Placeholder. Diisi di **Task #6 — Operations Scripts** (Phase 7 Week 3-4).

## Rencana isi folder

```
infra/scripts/
├── deploy.sh                Wrapper untuk `helm upgrade --install` per env
├── rollback.sh              Wrapper untuk `helm rollback` (lihat runbooks/rollback.md)
├── db-backup.sh             pg_dump → MinIO + off-site Glacier
├── db-restore.sh            Restore dari MinIO snapshot (drill: weekly)
├── db-migrate.sh            Apply Prisma migrations (wraps prisma migrate deploy)
├── minio-replicate.sh       Manual replication trigger ke DR site
├── cert-renew.sh            Force renew Let's Encrypt cert via cert-manager
├── seed-dev-data.sh         Insert seed data ke dev env (lihat docs/data-model.md §Seeds)
├── verify-backup.py         Verify pg_dump integrity (restore ke ephemeral DB → checksum)
└── smoke-test.sh            Post-deploy smoke test (curl /health, /api/v1/datasets?limit=1)
```

## Convention

- **Bash strict mode** wajib: `set -euo pipefail` di top setiap script.
- **No hardcoded secrets** — semua via env var atau Vault lookup.
- **Idempotent** — re-run aman, tidak corrupting state.
- **Logging** — script log structured (JSON kalau memungkinkan) ke stdout supaya
  dapat di-pipe ke Loki via journald.

## References

- [Promotion runbook](../../docs/runbooks/promotion.md)
- [Rollback runbook](../../docs/runbooks/rollback.md)
- [DB migration safety](../../docs/runbooks/db-migration-safety.md)
