# Runbook — Rollback Procedures

> **Audience:** DevOps on-call, Backend on-call, Tech Lead
> **Estimasi waktu:** Application rollback < 5 menit, DB rollback bervariasi (5 menit - 1 jam)
> **Prereq:** kubeconfig prod, akses ke `infra/scripts/`, akses Cloudflare API token
> **Last updated:** 2026-05-19
> **Owner:** DevOps + Launch SRE

---

## 1. Decision tree — rollback tipe apa untuk symptom apa?

```
Symptom di production
│
├─► Error rate spike / 5xx surge / p95 latency 2x baseline
│   └─► Application rollback (§3)  ◄── default first step
│
├─► Pod CrashLoopBackOff
│   └─► Application rollback (§3)
│
├─► Auth flow broken (login success drop) tapi pod healthy
│   └─► Cek config change → Configuration rollback (§5)
│   └─► Kalau OIDC issuer down: contact SKK Migas IT, status page update
│
├─► DB query slow / timeout / locks
│   ├─► Recent migration applied? → DB migration rollback (§4)
│   └─► Tidak migration → cek query plan, vacuum, slow log; bukan rollback case
│
├─► Domain tidak resolve / SSL cert expired
│   └─► DNS / cert rollback (§6)
│
└─► Multiple symptoms / unknown cause
    └─► Application rollback dulu (fastest), lalu investigate
```

**Aturan emas:** rollback dulu, postmortem nanti. Restore service < 10 menit > root cause analysis.

---

## 2. Pre-rollback checklist (30 detik max)

Sebelum trigger rollback, konfirmasi cepat:

- [ ] Confirm impact bukan dari issue external (Cloudflare outage, SKK Migas network)
- [ ] Cek Grafana `ghanem-prod-overview` — pola terisolasi atau system-wide?
- [ ] Cek deployment history terakhir di GitHub Actions — kapan last deploy?
- [ ] Pastikan kamu punya akses tools yang dibutuhkan (kubeconfig, gh CLI)

Kalau ragu > 1 menit: **rollback dulu**. Cheap recovery.

---

## 3. Application rollback (Helm)

### Target waktu: < 5 menit

### 3.1 Quick rollback — semua app sekaligus

```bash
# Sumber kubeconfig
export KUBECONFIG=~/.kube/config-prod

# Cek revision history per app
for app in web admin api workers; do
  echo "=== ghanem-$app ==="
  helm history ghanem-$app -n ghanem-prod
done

# Rollback ke revision N-1 untuk setiap app
for app in web admin api workers; do
  helm rollback ghanem-$app -n ghanem-prod --wait --timeout 5m
done
```

`helm rollback` tanpa angka = rollback ke revision sebelumnya.

### 3.2 Rollback hanya 1 app (lebih surgical)

Kalau yakin issue hanya di `api` (misal):

```bash
helm history ghanem-api -n ghanem-prod
# Cari revision yang "OK" (biasanya N-1 atau N-2)

helm rollback ghanem-api 12 -n ghanem-prod --wait --timeout 5m
#                       ↑ angka revision
```

### 3.3 Rollback via script wrapper (akan ada di Task #6)

```bash
./infra/scripts/rollback.sh prod ghanem-api
./infra/scripts/rollback.sh prod --all
```

### 3.4 Verification

```bash
# Pod status
kubectl get pods -n ghanem-prod

# Konfirmasi image tag turun ke versi sebelumnya
kubectl get deployment -n ghanem-prod -o jsonpath='{range .items[*]}{.metadata.name}{": "}{.spec.template.spec.containers[0].image}{"\n"}{end}'

# Health endpoint
curl -fsS https://ghanem.one/health
curl -fsS https://api.ghanem.one/api/v1/health

# Sentry: konfirmasi error rate drop
# Grafana: konfirmasi p95 latency turun
```

### 3.5 Atomic deploy auto-rollback

Workflow `deploy-prod.yml` pakai `helm upgrade --atomic`. Jika upgrade gagal mid-flight
(probe fail), Helm **otomatis rollback** ke revision sebelumnya. Jadi failure di pipeline
deploy bisa berarti "sudah otomatis rolled back" — verify dengan `helm history`.

### 3.6 Communication

Setelah rollback verified GREEN:
```
[GHANEM PROD] Rollback executed
App: ghanem-api
From revision: 13 (sha-abc1234)
To revision: 12 (sha-def5678)
Reason: p95 latency spike 2.3x baseline at 14:23 WIB
Time to recover: 4m12s
Status: PROD GREEN
Postmortem: scheduled within 24h
```

---

## 4. Database migration rollback

### Target waktu: 5-60 menit (depending on migration complexity)

### 4.1 Decision: safe vs unsafe rollback

Prisma migrations **tidak punya auto-down**. Rollback DB = run **forward migration yang
reverse** semantik (additive: drop column tambahan; destructive: restore data dari backup).

| Migration type | Safe to rollback? | How |
|---|---|---|
| `ADD COLUMN NULL` | ✅ Yes | Forward migration: `ALTER TABLE x DROP COLUMN y;` |
| `ADD INDEX CONCURRENTLY` | ✅ Yes | Forward: `DROP INDEX CONCURRENTLY y;` |
| `CREATE TABLE` (no data) | ✅ Yes | Forward: `DROP TABLE x;` |
| `ALTER COLUMN type` (compatible) | ⚠️ Risky | Forward migration revert tipe, watch for data truncation |
| `DROP COLUMN` | ❌ NO | Data hilang. Restore dari backup (§4.4). |
| `DROP TABLE` | ❌ NO | Data hilang. Restore dari backup. |
| `RENAME COLUMN/TABLE` | ⚠️ Risky | Reverse rename — tapi app pakai nama baru, harus juga rollback app. |

Reference: [db-migration-safety.md](./db-migration-safety.md) untuk safe patterns.

### 4.2 Forward-revert migration (safe case)

```bash
# 1. Buat reverse migration di lokal
cd apps/api
npx prisma migrate dev --name revert_xxxxxx_add_y_column --create-only
# Edit file SQL yang dihasilkan supaya jadi reverse op (DROP COLUMN, dll.)

# 2. Test di staging dulu — JANGAN langsung prod
# (Push fix → release branch baru → staging deploy → verify)

# 3. Apply ke prod (via runner / scripts)
kubectl exec -n ghanem-prod -it deploy/ghanem-api -- npx prisma migrate deploy

# 4. Verify schema
kubectl exec -n ghanem-prod -it postgres-primary -- psql -U ghanem -d ghanem -c "\d datasets"
```

### 4.3 `prisma migrate resolve` — mark migration as rolled-back

Jika migration belum di-apply tapi sudah di Prisma history (failed mid-way):

```bash
# Mark sebagai rolled back tanpa execute SQL
npx prisma migrate resolve --rolled-back 20260519123000_add_y_column

# Kemudian apply forward migration yang correct
npx prisma migrate deploy
```

### 4.4 Restore dari backup (destructive case)

**Only escalate ke ini kalau forward-revert tidak feasible (DROP COLUMN, DROP TABLE).**

```bash
# 1. Identifikasi backup terakhir yang BEFORE migration broken
# Backup ada di MinIO bucket `ghanem-pg-backups/` (Phase 7 W4 setup)
mc alias set ghanem-prod-minio https://minio.ghanem.one $MINIO_ACCESS $MINIO_SECRET
mc ls ghanem-prod-minio/ghanem-pg-backups/ | tail -20

# 2. Down API + workers (avoid double-writes during restore)
kubectl scale deployment -n ghanem-prod ghanem-api --replicas=0
kubectl scale deployment -n ghanem-prod ghanem-workers --replicas=0

# 3. Restore (gunakan infra/scripts/db-restore.sh nanti)
mc cp ghanem-prod-minio/ghanem-pg-backups/ghanem-20260519-0300.sql.gz /tmp/
gunzip /tmp/ghanem-20260519-0300.sql.gz

# Restore ke DB primary (will DROP existing DB!)
PGPASSWORD=$PG_PASS psql -h ghanem-prod-db-01 -U ghanem -d postgres <<SQL
DROP DATABASE ghanem;
CREATE DATABASE ghanem;
SQL
PGPASSWORD=$PG_PASS psql -h ghanem-prod-db-01 -U ghanem -d ghanem -f /tmp/ghanem-20260519-0300.sql

# 4. Reapply Prisma history sampai migration yang OK
kubectl run prisma-restore --rm -it --image=ghcr.io/ghanem-tech/ghanem-api:sha-OLDOK \
  --env="DATABASE_URL=$DATABASE_URL" \
  --command -- npx prisma migrate deploy

# 5. Restart app + workers
kubectl scale deployment -n ghanem-prod ghanem-api --replicas=3
kubectl scale deployment -n ghanem-prod ghanem-workers --replicas=2

# 6. Verify + notify users tentang data loss window (3 jam dari backup ke restore)
```

### 4.5 RPO note

Backup schedule: **hourly** (Phase 10 target). Worst case data loss: 1 jam.
WAL streaming replication ke standby = RPO < 15 menit jika promote standby (lihat
DR failover runbook, Phase 10).

---

## 5. Configuration rollback (env vars, Helm values)

### Target waktu: < 10 menit

### 5.1 Symptom
- Pod healthy, tapi behavior salah (mis. salah OIDC issuer URL, salah feature flag).
- Recent PR yang merge ke `dev` atau `release/*` touch `infra/helm/*/values-<env>.yaml`.

### 5.2 Cara rollback

#### Opsi A — Revert PR

```bash
# Identifikasi commit yang introduce bug
git log --oneline infra/helm/ghanem-api/values-prod.yaml | head -5

# Revert
git revert <bad-sha> -m "revert: bad config commit"
git push origin <branch>

# PR baru → fast-track 2 approval → merge → trigger deploy workflow
```

#### Opsi B — Manual Helm override (emergency, < 5 menit)

```bash
helm upgrade ghanem-api infra/helm/ghanem-api \
  --namespace ghanem-prod \
  --values infra/helm/ghanem-api/values-prod.yaml \
  --set image.tag=<current-tag> \
  --set env.OIDC_ISSUER=https://sso.skkmigas.go.id/realms/main \
  --reuse-values \
  --wait
```

Manual override **harus** di-codify ke `values-prod.yaml` dalam 24 jam (audit trail).

### 5.3 ConfigMap / Secret rollback

```bash
# History
kubectl -n ghanem-prod rollout history configmap ghanem-api-config

# Edit langsung (last resort, biarkan PR fix yang authoritative)
kubectl -n ghanem-prod edit configmap ghanem-api-config

# Restart deployment supaya pick up new ConfigMap
kubectl -n ghanem-prod rollout restart deployment ghanem-api
```

---

## 6. DNS + SSL rollback (Cloudflare)

### Target waktu: 5-30 menit (DNS propagation dependent)

### 6.1 Symptom
- Domain tidak resolve (`*.ghanem.one`)
- SSL cert error di browser
- Recent change ke Cloudflare DNS atau cert-manager

### 6.2 DNS rollback (Cloudflare API)

```bash
# Asumsi: kamu punya CLOUDFLARE_API_TOKEN dengan Zone:DNS:Edit
ZONE_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=ghanem.one" | jq -r '.result[0].id')

# List recent DNS changes (audit log)
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/audit_logs" | jq '.result[0:5]'

# Identifikasi record yang salah → revert via API (PATCH dengan content lama)
# Atau via dashboard: cloudflare.com → ghanem.one → DNS → Audit Log → restore
```

### 6.3 SSL cert rollback (cert-manager)

cert-manager auto-renew lewat DNS-01 challenge (Let's Encrypt). Manual intervention rare:

```bash
# Cek cert status
kubectl get certificate -A
kubectl describe certificate -n ghanem-prod ghanem-tls

# Force renew kalau cert mendekati expire tapi auto-renew gagal
kubectl annotate certificate -n ghanem-prod ghanem-tls cert-manager.io/force-renew=$(date +%s) --overwrite

# Cek event
kubectl get events -n ghanem-prod --sort-by='.lastTimestamp' | grep -i certificate
```

Kalau Let's Encrypt rate limit hit:
- Switch ke staging issuer dulu (`letsencrypt-staging`) untuk testing.
- Wait 1-7 hari sebelum hit prod issuer lagi.
- Backup plan: deploy self-signed cert via Secret untuk maintenance window.

### 6.4 Fallback ke maintenance page

Kalau seluruh stack down dan butuh waktu > 30 menit recovery:

1. Cloudflare → ghanem.one zone → Rules → create custom rule:
   - When `URI Path` matches `^.*$` → Custom HTML response 503 dengan link ke status.ghanem.one
2. (Atau) update DNS A record ke maintenance IP (static page di MinIO public bucket).

---

## 7. Post-rollback actions (mandatory)

Setelah rollback selesai dan service GREEN:

1. **Confirm verification** (lihat §3.4 / §4.4 / §5/§6 per kasus).
2. **Communicate** — post di Slack/Teams + email kalau impact ≥ 30 menit.
3. **Schedule postmortem** — calendar block 24-48 jam dari incident.
4. **Update incident log** — append entry ke `docs/runbooks/incident-log.md` (TBD Phase 10).
5. **Create remediation issues** — bug ticket + preventive action ticket.
6. **Investigate root cause** — tanpa blame, fokus ke systemic fix.

---

## 8. Common failure modes + quick reference

| Failure | Likely cause | Fastest fix |
|---|---|---|
| Pod ImagePullBackOff | Image tag tidak ada di ghcr.io | `helm rollback` ke revision sebelumnya |
| Pod CrashLoopBackOff | Bad config / missing env var | `helm rollback` + cek `kubectl logs` |
| 503 dari ingress | Pod 0 ready, atau service selector mismatch | `kubectl get pods,svc` + rollback |
| Connection refused dari API ke DB | DB down, network policy, atau secret rotation tanpa restart | Cek DB pod + restart API |
| 401 surge | OIDC issuer down, atau secret tidak match | Cek `OIDC_ISSUER` reachable, validate `SKKMIGAS_OIDC_CLIENT_SECRET` |
| Slow query timeout | Recent migration tanpa index, atau bad query plan | `EXPLAIN ANALYZE`, add index, rollback migration kalau perlu |
| Tile server 502 | Martin pod OOM (large tile cache) | Scale up replicas + bump memory limit di Helm values |

---

## 9. References

- [docs/runbooks/promotion.md](./promotion.md)
- [docs/runbooks/db-migration-safety.md](./db-migration-safety.md)
- [docs/runbooks/hotfix.md](./hotfix.md)
- [ADR 0002 — Hosting On-Prem SKK Migas](../decisions/0002-hosting-on-prem-skk-migas.md)
- [Helm docs — Rollback](https://helm.sh/docs/helm/helm_rollback/)
- [Prisma docs — Migrate resolve](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#migrate-resolve)
