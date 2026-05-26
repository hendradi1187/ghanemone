# Ghanem.one — Runbooks Index

Operational runbooks untuk Ghanem.one. Tiap runbook = actionable steps dengan command
spesifik. Bukan teori — kalau on-call dapat alert, runbook ini harus cukup untuk
restore service tanpa harus dig ke source code.

---

## Setup runbooks (one-time)

| Runbook | Purpose | When to use |
|---|---|---|
| [github-setup.md](./github-setup.md) | Manual GitHub UI + `gh` CLI setup | Phase 7 W1 (setelah scaffolding) |

## Deployment runbooks

| Runbook | Purpose | When to use |
|---|---|---|
| [promotion.md](./promotion.md) | Promote build dev → staging → prod | Setiap release |
| [hotfix.md](./hotfix.md) | Emergency fix langsung ke prod | S1/S2 incident di prod |

## Incident response runbooks

| Runbook | Purpose | When to use |
|---|---|---|
| [rollback.md](./rollback.md) | Rollback aplikasi / DB / config / DNS | Post-deploy regression, prod outage |

## Maintenance runbooks

| Runbook | Purpose | When to use |
|---|---|---|
| [secret-rotation.md](./secret-rotation.md) | Rotasi secret per 90 hari (Vault) | Quarterly + on-demand setelah leak suspect |
| [db-migration-safety.md](./db-migration-safety.md) | Safe PostgreSQL migration patterns | Setiap PR yang touch `prisma/migrations/` |

## Belum ada (akan ditambah di phase berikutnya)

- `backup-verify.md` — restore drill mingguan (Phase 10)
- `dr-failover.md` — promote DR site jadi primary (Phase 10)
- `oncall-escalation.md` — escalation tree, paging policy (Phase 10)
- `observability-checklist.md` — dashboards yang harus dicek tiap incident (Phase 10)
- `certificate-renewal.md` — manual cert renewal kalau cert-manager fail (Phase 7 W4)

---

## Convention untuk authoring runbook baru

1. **Audience first** — di top doc, sebutkan siapa yang baca (Hendra, DevOps on-call, Backend dev).
2. **Estimasi waktu** — supaya pembaca tahu apakah ini 5-menit task atau 1-jam task.
3. **Prereq** — apa yang harus ready sebelum mulai (kubeconfig, akses ke Vault, dll.).
4. **Step-by-step** — copy-paste-able commands. Bukan "configure helm". Tulis: `helm upgrade --install ...`.
5. **Verification** — cara konfirmasi step berhasil sebelum lanjut.
6. **Rollback** — apa yang dilakukan kalau step ini gagal.
7. **Last updated + owner** — siapa yang maintain runbook ini.

Template skeleton:

```markdown
# Runbook — <Topic>

> **Audience:**
> **Estimasi waktu:**
> **Prereq:**
> **Last updated:**
> **Owner:**

## Konteks
## Steps
## Verification
## Rollback
## References
```
