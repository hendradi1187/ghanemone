# Runbook — GitHub Repository Setup (Manual Steps untuk Hendra)

> **Audience:** Hendra Dinata (repo owner)
> **When to run:** Sekali, di Phase 7 Week 1 (setelah scaffolding monorepo selesai).
> **Estimasi waktu:** 30-45 menit
> **Last updated:** 2026-05-19

Berikut step-by-step manual yang **harus dieksekusi Hendra langsung** di GitHub UI atau via
`gh` CLI. Semua step lain (CI/CD, kode, docs) sudah ada di repo.

---

## 1. Buat repository (jika belum ada)

### Opsi A — via `gh` CLI

```bash
# Asumsi: organization 'ghanem-tech' sudah ada. Kalau belum, buat dulu di github.com/organizations/new
gh repo create ghanem-tech/ghanemone \
  --private \
  --description "Ghanem.one — Spatial Intelligence Platform untuk hulu migas Indonesia" \
  --source=. \
  --remote=origin \
  --push
```

### Opsi B — via web UI

1. https://github.com/organizations/ghanem-tech/repositories/new
2. Repository name: `ghanemone`
3. Description: `Ghanem.one — Spatial Intelligence Platform untuk hulu migas Indonesia`
4. Visibility: **Private**
5. JANGAN init README/`.gitignore`/license (repo lokal sudah ada konten).
6. Setelah create, push dari lokal:
   ```bash
   cd D:/app/ghanemone/workspace
   git remote add origin git@github.com:ghanem-tech/ghanemone.git
   git branch -M main
   git push -u origin main
   git checkout -b dev
   git push -u origin dev
   ```

---

## 2. Setup teams (jika belum ada)

Di https://github.com/orgs/ghanem-tech/teams, buat teams berikut:

| Team slug | Description | Initial members |
|---|---|---|
| `tech-leads` | Tech leadership; approve PR ke main + infra | Hendra |
| `frontend` | apps/web, apps/admin, packages/ui maintainers | TBD |
| `backend` | apps/api maintainers | TBD |
| `gis` | apps/workers, geospatial code | TBD |
| `devops` | infra/, .github/workflows | Hendra (sementara) |
| `security` | auth, RBAC, secrets, compliance | TBD |
| `launch-sre` | runbooks, on-call, observability | TBD |

CLI cepat:
```bash
for team in tech-leads frontend backend gis devops security launch-sre; do
  gh api -X POST /orgs/ghanem-tech/teams -f name="$team" -f privacy='closed'
done
```

---

## 3. Branch protection rules

> Reference: [docs/branch-strategy.md](../branch-strategy.md) §3

### 3.1 Protect `main`

Settings → Branches → Add rule:

- **Branch name pattern:** `main`
- ✅ Require a pull request before merging
  - Required approving reviews: **2**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners
- ✅ Require status checks to pass before merging
  - Required checks:
    - `CI Success` (dari ci.yml — semua sub-job harus hijau)
    - `actionlint`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches → only `@ghanem-tech/tech-leads` + `@ghanem-tech/devops`
- ❌ Allow force pushes (DISABLED)
- ❌ Allow deletions (DISABLED)

### 3.2 Protect `dev`

Settings → Branches → Add rule:

- **Branch name pattern:** `dev`
- ✅ Require a pull request before merging
  - Required approving reviews: **1**
  - ✅ Require review from Code Owners (untuk file yang punya owner)
- ✅ Require status checks to pass before merging
  - Required checks: `CI Success`, `actionlint`
- ✅ Require branches to be up to date before merging
- ❌ Allow force pushes
- ❌ Allow deletions

### 3.3 Protect `release/*`

- **Branch name pattern:** `release/*`
- ✅ Require a pull request before merging
  - Required approving reviews: **2**
  - ✅ Require review from Code Owners
- ✅ Require status checks: `CI Success`
- ❌ Allow force pushes (setelah staging deploy)
- ❌ Allow deletions

### 3.4 Protect `hotfix/*`

- **Branch name pattern:** `hotfix/*`
- ✅ Require a pull request before merging
  - Required approving reviews: **2** (fast-track allowed: Tech Lead + Sec/DevOps)
- ✅ Require status checks: `CI Success`
- ❌ Allow force pushes setelah PR dibuka
- ❌ Allow deletions

---

## 4. GitHub Environments + Approval gates

Settings → Environments → New environment:

### 4.1 `dev`

- **Name:** `dev`
- **Deployment branches:** Selected branches → `dev`
- **Required reviewers:** none (auto-deploy)
- **Wait timer:** 0 menit
- **Environment secrets:** lihat §5

### 4.2 `staging`

- **Name:** `staging`
- **Deployment branches:** Selected branches → `release/*` + `main` (untuk dispatch)
- **Required reviewers:** 1 — Tech Lead atau DevOps
- **Wait timer:** 0 menit
- **Environment secrets:** lihat §5

### 4.3 `production`

- **Name:** `production`
- **Deployment branches:** Selected branches → `main` + `release/*` + `hotfix/*`
- **Required reviewers:** **2** — Tech Lead + (DevOps atau Security Lead)
- **Wait timer:** **5 menit** (cooldown supaya operator dapat batalkan kalau salah trigger)
- **Environment secrets:** lihat §5

---

## 5. Secrets configuration

### 5.1 Repository-level secrets (Settings → Secrets and variables → Actions)

| Secret name | Format | Sumber / cara generate |
|---|---|---|
| `GHCR_PULL_TOKEN` | PAT dengan `read:packages` | Optional — kalau ghcr.io butuh PAT terpisah dari `GITHUB_TOKEN` |

`GITHUB_TOKEN` otomatis tersedia per job, tidak perlu di-set manual.

### 5.2 Environment-specific secrets

#### `dev` environment

| Secret | Format | Sumber |
|---|---|---|
| `GHANEM_DEV_KUBECONFIG` | Base64-encoded kubeconfig | `cat ~/.kube/config-dev \| base64 -w0` (di runner / dev VM setelah k3s install) |

#### `staging` environment

| Secret | Format | Sumber |
|---|---|---|
| `GHANEM_STAGING_KUBECONFIG` | Base64-encoded kubeconfig | k3s staging cluster (Phase 9 W4-5) |
| `SKKMIGAS_OIDC_CLIENT_SECRET` | Plain text | SKK Migas IT (dapatkan saat IdP onboarding) |
| `CLOUDFLARE_API_TOKEN` | Token dari Cloudflare dashboard | Dashboard → API Tokens, scope: Zone DNS Edit untuk `ghanem.one` |

#### `production` environment

| Secret | Format | Sumber |
|---|---|---|
| `GHANEM_PROD_KUBECONFIG` | Base64-encoded kubeconfig | k3s prod cluster (Phase 10) |
| `SKKMIGAS_OIDC_CLIENT_SECRET` | Plain text | SKK Migas IT (prod IdP client) |
| `CLOUDFLARE_API_TOKEN` | Token | Sama scope, bisa shared dengan staging atau dedicated |
| `SENTRY_AUTH_TOKEN` | Token untuk upload source maps | Self-hosted Sentry → Auth Tokens → `project:releases` scope |
| `ANTHROPIC_API_KEY` | API key | Anthropic console (Phase 9 AI proxy) |
| `MINIO_ROOT_PASSWORD` | Plain text | Generate via `openssl rand -base64 32` saat MinIO bootstrap |
| `POSTGRES_REPLICATION_PASSWORD` | Plain text | Generate via `openssl rand -base64 32` |
| `BACKUP_ENCRYPTION_KEY` | 32-byte base64 | `openssl rand -base64 32` — store offline di password manager juga! |

> **Aturan secret:** semua secret prod **HARUS** dirotasi minimal **per 90 hari** (lihat
> [docs/runbooks/secret-rotation.md](./secret-rotation.md)).

---

## 6. Self-hosted runner registration

Self-hosted runners di SKK Migas network (per [ADR 0004 §6](../decisions/0004-tech-stack-finalize.md#6-cicd-runner--self-hosted-github-actions-runners)).

### 6.1 Dev environment (1 runner)

Pada `ghanem-dev-01.skkmigas.local`:

```bash
# Get registration token (expire 1 jam)
gh api -X POST /repos/ghanem-tech/ghanemone/actions/runners/registration-token

# Di VM dev:
sudo useradd -m gh-runner
sudo -u gh-runner bash <<'EOF'
cd ~
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz
tar xzf actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/ghanem-tech/ghanemone \
  --token <PASTE_TOKEN> \
  --name ghanem-dev-01 \
  --labels self-hosted,linux,skk-migas,ghanem-dev \
  --unattended
EOF

# Install as service
sudo /home/gh-runner/actions-runner/svc.sh install gh-runner
sudo /home/gh-runner/actions-runner/svc.sh start
```

### 6.2 Prod environment (2 runners HA)

Pada `ghanem-prod-runner-01.skkmigas.local` dan `ghanem-prod-runner-02.skkmigas.local`:

Same step, labels: `self-hosted,linux,skk-migas,ghanem-prod`.

> Otomatisasi via Ansible playbook `infra/ansible/roles/gh-runner/` (Task #4).

---

## 7. Repository settings tweaks

Settings → General:

- **Default branch:** `dev` (development integration; `main` adalah release source of truth)
- ✅ Allow merge commits (untuk release → main fast-forward)
- ✅ Allow squash merging (default untuk PR feature → dev)
- ❌ Allow rebase merging (DISABLED — keep history linear via squash atau ff merge)
- ✅ Automatically delete head branches (cleanup feature branches setelah merge)
- ✅ Always suggest updating pull request branches

Settings → Pull Requests:

- Default commit message format: **Pull request title**
- ✅ Require signed commits (kalau team sudah setup GPG; opsional)

Settings → Actions → General:

- **Actions permissions:** Allow `ghanem-tech` organization actions + selected actions
  - Allow specific actions: `actions/*`, `azure/setup-*`, `docker/*`, `rhysd/actionlint`, `dorny/paths-filter`
- **Workflow permissions:** Read repository contents permission (default) — write granted per job via `permissions:` block

---

## 8. Webhooks + integrations (opsional, Phase 7-8)

| Integration | Purpose | Phase |
|---|---|---|
| Sentry (self-hosted) | Source map upload + release tracking | Phase 9 |
| Slack / Teams / Lark | PR notifications, deploy events | Phase 8 |
| Uptime Kuma | External monitoring of repo health | Phase 10 |

---

## 9. Verification checklist

Setelah selesai semua step di atas:

- [ ] Repo `ghanem-tech/ghanemone` exists, private, default branch `dev`
- [ ] Teams `tech-leads`, `frontend`, `backend`, `gis`, `devops`, `security`, `launch-sre` exists
- [ ] Branch protection: `main`, `dev`, `release/*`, `hotfix/*` configured per §3
- [ ] Environments: `dev`, `staging`, `production` configured per §4
- [ ] Secrets di-set per §5 (minimal `GHANEM_DEV_KUBECONFIG` untuk Phase 7 W2)
- [ ] CODEOWNERS file (di repo) sudah ada — auto-pick reviewers per path
- [ ] Test PR: buat `feature/test-ci` → push → buka PR ke `dev` → verifikasi CI workflow jalan
- [ ] Self-hosted runner online (lihat di Settings → Actions → Runners)

---

## 10. Troubleshooting

### CI workflow tidak ter-trigger pada PR

- Cek Settings → Actions → General → **Allow all actions and reusable workflows** atau allowlist.
- Cek branch protection: pastikan PR target branch (`dev` atau `release/*`) match `on.pull_request.branches` di `ci.yml`.

### `Resource not accessible by integration` saat push image ke ghcr.io

- Tambah `permissions: packages: write` di workflow job.
- Di repo Settings → Actions → Workflow permissions, set "Read and write".

### Branch protection nge-block admin saat emergency

- Sebagai admin, kamu **bisa** bypass dengan check "Do not allow bypassing the above settings" **uncheck**ed.
- Untuk audit, lebih baik buat hotfix branch dan ikuti flow standar.

### Self-hosted runner status "Offline"

```bash
ssh gh-runner@ghanem-dev-01.skkmigas.local
sudo journalctl -u actions.runner.* -f
# Common causes: egress firewall block ke api.github.com, runner token expired (re-register)
```

---

## 11. References

- [docs/branch-strategy.md](../branch-strategy.md)
- [.github/workflows/](../../.github/workflows/) — CI/CD pipelines
- [.github/CODEOWNERS](../../.github/CODEOWNERS)
- [ADR 0004 §6 — Self-hosted GH Actions runners](../decisions/0004-tech-stack-finalize.md#6-cicd-runner--self-hosted-github-actions-runners)
- [GitHub Docs — Branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs — Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)
