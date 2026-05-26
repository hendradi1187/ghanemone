# Runbook — Environment Promotion (dev → staging → prod)

> **Audience:** Tech Lead, DevOps, Release Manager
> **Estimasi waktu:** 15-30 menit operator time per env (ditambah test waktu)
> **Prereq:** akses GitHub repo (write), akses environment approvals (`staging`, `production`)
> **Last updated:** 2026-05-19
> **Owner:** DevOps

---

## 1. Konteks

Promotion flow Ghanem.one ikuti [docs/branch-strategy.md](../branch-strategy.md):

```
feature/foo ──► dev (auto)
                 │
                 ▼
       release/v0.2.0 ──► staging (auto, smoke + UAT)
                            │
                            ▼
                         production (manual dispatch, 2 approval)
                            │
                            ▼
                         main (fast-forward + tag)
```

Setiap step di bawah ini di-detail: **siapa approve**, **test apa yang harus pass**,
**kapan rollback wajib**.

---

## 2. Step 1 — feature/* → dev (auto on merge)

### Trigger
PR merged ke branch `dev`.

### Approver
- 1 reviewer (atau code owner kalau touch path di CODEOWNERS).
- Auto-merge **tidak diizinkan** untuk PR yang touch `/infra/` atau `/.github/`.

### Tests yang harus pass
- CI workflow `ci.yml`:
  - `js-checks` matrix (lint, type-check, test, build) untuk apps yang affected
  - `python-checks` matrix untuk workers (kalau apps/workers affected)
  - `actionlint` untuk YAML
- Manual PR review approve.

### Deployment
- Workflow `.github/workflows/deploy-dev.yml` ter-trigger otomatis.
- `paths-filter` deteksi apps mana yang berubah → hanya build + push image yang relevan.
- `helm upgrade --install` ke namespace `ghanem-dev` di k3s dev cluster.
- Smoke test (kalau `infra/scripts/smoke-test.sh` ada).

### Verification
```bash
# Cek pod status
kubectl --kubeconfig=~/.kube/config-dev get pods -n ghanem-dev

# Cek health endpoint
curl -fsS https://dev.ghanem.one/health
curl -fsS https://dev.ghanem.one/api/v1/health
```

### Rollback criteria (auto-revert PR?)
- Kalau deploy gagal (helm upgrade error / pod CrashLoopBackOff):
  - **Tidak auto-revert.** Dev env memang tempat eksperimen.
  - Engineer yang merge harus fix forward dalam 24 jam atau revert PR-nya.
- Kalau dev env terus broken > 4 jam: alert ke Slack `#ghanem-eng`, eskalasi ke Tech Lead.

---

## 3. Step 2 — dev → staging (cut release branch)

### Trigger
Tech Lead jalankan manual saat ready untuk release:

```bash
git checkout dev && git pull origin dev
# Verifikasi dev env hijau ≥ 24 jam (cek Grafana dashboard)
# Verifikasi tidak ada PR pending yang harus masuk release ini

git checkout -b release/v0.2.0
git push -u origin release/v0.2.0
```

Push ke `release/*` otomatis trigger `.github/workflows/deploy-staging.yml`.

### Approver
- Pembentukan branch `release/*`: Tech Lead (1 person).
- Approval workflow di GitHub environment `staging`: 1 reviewer (Tech Lead atau DevOps).

### Tests yang harus pass
- Build all apps (matrix, fail-fast).
- Push images ke `ghcr.io` dengan tag `sha-<short>`, `staging-latest`, `release/v0.2.0`.
- `helm upgrade` ke namespace `ghanem-staging`.
- Post-deploy:
  - **Smoke test wajib** (`infra/scripts/smoke-test.sh staging`):
    - `GET https://staging.ghanem.one/` returns 200
    - `GET https://staging.ghanem.one/api/v1/health` returns 200
    - `GET https://staging.ghanem.one/api/v1/datasets?limit=1` returns 200 dengan auth
    - Martin tile server: `GET tiles-staging.ghanem.one/datasets/0/0/0.pbf` returns 200
  - **Integration tests** (kalau ada di `infra/scripts/integration-test.sh`): E2E flow login + create dataset + search.

### UAT period
Setelah staging hijau, **minimum 24 jam UAT** sebelum dapat promote ke prod:
- QA team (Phase 10+ Launch SRE Agent) jalankan manual test sesuai test plan.
- Stakeholder SKK Migas dapat akses staging URL untuk preview.
- Sentry monitor: 0 unresolved error baru selama UAT window.
- Grafana dashboard: error rate < 0.1%, p95 latency < 500ms.

### Rollback criteria
- Helm upgrade gagal → workflow auto-fail.
- Smoke test gagal → workflow auto-fail, perlu fix sebelum lanjut.
- Selama UAT, jika critical bug ditemukan:
  - Fix di branch `feature/fix-...` → merge ke `dev`.
  - Cherry-pick fix ke `release/v0.2.0` (atau hapus release branch + cut new one).
  - Push ke `release/v0.2.0` trigger redeploy staging.

---

## 4. Step 3 — staging → production (manual dispatch + approval)

### Trigger
Manual via GitHub Actions UI atau `gh` CLI:

```bash
# Asumsi sudah verifikasi staging hijau + UAT pass + sign-off Tech Lead + SKK Migas stakeholder
gh workflow run deploy-prod.yml \
  --ref release/v0.2.0 \
  -f image_tag=sha-abc1234 \
  -f release_branch=release/v0.2.0
```

(`image_tag` harus = SHA short yang sudah deployed di staging dan verified.)

### Approver
GitHub Environment `production` rules (lihat [github-setup.md §4.3](./github-setup.md#43-production)):
- **2 required reviewers:** Tech Lead + (DevOps atau Security Lead)
- 5 menit wait timer (cooldown)
- Approver harus konfirmasi:
  - Staging UAT sign-off
  - Tidak ada incident aktif di prod
  - Deploy window OK (avoid Jumat sore, weekend, jam puncak SKK Migas)

### Tests yang harus pass (di workflow)
- `preflight` job:
  - Validate `image_tag` non-empty, `release_branch` mulai dengan `release/`.
  - Verify image ada di `ghcr.io` (`docker manifest inspect`).
- `deploy` job:
  - `helm upgrade --atomic` per app (atomic = auto-rollback kalau gagal).
  - `--wait --timeout 15m` per app.
  - Post-deploy smoke test (kecuali `skip_smoke=true` untuk hotfix manual).

### Verification (mandatory, gak boleh skip)
```bash
# 1. Pod status semua apps
kubectl --kubeconfig=~/.kube/config-prod get pods -n ghanem-prod -o wide

# 2. HPA + scaling
kubectl --kubeconfig=~/.kube/config-prod get hpa -n ghanem-prod

# 3. Ingress health
curl -fsS https://ghanem.one/
curl -fsS https://api.ghanem.one/api/v1/health
curl -fsS https://tiles.ghanem.one/health 2>/dev/null || true

# 4. Grafana check (5 menit observation window)
# - Error rate < 0.5%
# - p95 latency tidak naik > 20% vs baseline
# - No new Sentry events

# 5. Synthetic check via Uptime Kuma (status.ghanem.one)
```

### Post-deploy monitoring
**Minimum 30 menit observation** sebelum operator dapat tinggal:
- Watch Grafana dashboard `ghanem-prod-overview`.
- Watch Sentry untuk new issue.
- Tail logs sambil cek error pattern:
  ```bash
  kubectl --kubeconfig=~/.kube/config-prod logs -n ghanem-prod -l app=ghanem-api --tail=100 -f
  ```

### Rollback criteria (mandatory rollback)
Trigger rollback **immediately** kalau salah satu kondisi:

| Symptom | Threshold | Action |
|---|---|---|
| Error rate spike | > 5% sustained ≥ 2 menit | [rollback.md §App rollback](./rollback.md#3-application-rollback-helm) |
| p95 latency spike | > 2x baseline sustained ≥ 5 menit | App rollback |
| 5xx surge di api.ghanem.one | > 100 dalam 5 menit | App rollback |
| Pod CrashLoopBackOff | Any replica | App rollback (jika belum atomic auto-rollback) |
| Sentry critical issue baru | Any | App rollback |
| Auth flow broken | Login success rate drops > 50% | App rollback + page Security |
| DB error spike | Connection pool exhaust, deadlock surge | App rollback + investigate DB |

### Promote release ke main + tag
Setelah prod sehat ≥ 30 menit:

```bash
git checkout main && git pull origin main
git merge --ff-only release/v0.2.0
git tag -a v0.2.0 -m "Release v0.2.0 — $(date -u +%Y-%m-%d)"
git push origin main --tags

# Optional: hapus release branch
# git push origin --delete release/v0.2.0
```

### Notify stakeholders
- Post di Slack `#ghanem-releases` dengan changelog + monitoring link.
- Email SKK Migas IT contact untuk visibility (Phase 10 SOP).

---

## 5. Decision matrix — kapan harus block promote

| Kondisi | Block dev → staging? | Block staging → prod? |
|---|---|---|
| CI gagal | Yes | Yes |
| Dev env tidak hijau ≥ 24 jam | Recommended block | Yes |
| Staging UAT bug ditemukan (S1/S2) | n/a | Yes — fix dulu |
| Staging UAT bug (S3/S4) | n/a | Diskusi tim — opsional ship dengan known-issue note |
| Incident aktif di prod | Yes | **Absolute block** — selesaikan incident dulu |
| Deploy window invalid (Jumat sore, weekend, ramadan jam sahur, dll.) | No | Block kecuali emergency |
| Security finding outstanding (S1) | Yes | Yes |
| ADR baru belum di-merge | Diskusi | Diskusi — ADR seharusnya merge sebelum implement |

---

## 6. Communication template

### Pre-deploy (staging atau prod)

```
[GHANEM RELEASE] v0.2.0 — staging deploy in 10 min
Branch: release/v0.2.0
Changes: feat(web): tambah filter sensitivity; fix(api): null geometry handler
UAT contacts: @hendra, @uat-skkmigas
Expected duration: 15-20 min
```

### Post-deploy success

```
[GHANEM RELEASE] v0.2.0 — staging GREEN
Image tag: sha-abc1234
Deployed by: @operator
Smoke + integration tests: PASS
UAT window: 24 jam (until 2026-05-21 14:00 WIB)
Dashboard: https://grafana.ghanem.one/d/staging-overview
```

### Post-deploy failure

```
[GHANEM RELEASE] v0.2.0 — production deploy ROLLED BACK
Reason: p95 latency spike 2.3x baseline 3 menit setelah deploy
Action taken: helm rollback ghanem-api -n ghanem-prod ke revision N-1
Status: prod GREEN setelah rollback. Investigation in progress.
Postmortem ETA: 24 jam
```

---

## 7. References

- [docs/branch-strategy.md](../branch-strategy.md)
- [docs/runbooks/rollback.md](./rollback.md)
- [docs/runbooks/hotfix.md](./hotfix.md)
- [docs/runbooks/db-migration-safety.md](./db-migration-safety.md)
- [.github/workflows/deploy-dev.yml](../../.github/workflows/deploy-dev.yml)
- [.github/workflows/deploy-staging.yml](../../.github/workflows/deploy-staging.yml)
- [.github/workflows/deploy-prod.yml](../../.github/workflows/deploy-prod.yml)
