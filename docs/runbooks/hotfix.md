# Runbook — Hotfix Flow

> **Audience:** On-call engineer, Tech Lead, Security Lead
> **When to use:** Critical bug di prod (S1/S2) yang tidak bisa tunggu siklus release normal
> **Estimasi waktu:** 30 menit - 4 jam (depending on complexity)
> **Prereq:** akses repo write, akses GH environment `production` approval
> **Last updated:** 2026-05-19
> **Owner:** Tech Lead + DevOps

---

## 1. Konteks

Hotfix flow = jalur cepat fix prod tanpa harus tunggu next release. Trade-off: tested less,
risk higher → mitigasi via **minimal scope**, **fast-track review**, **feature flag** kalau risky.

> **Aturan utama:** Hotfix branch dari `main` (bukan `dev`), supaya tidak include feature
> yang belum di-stage di staging.

---

## 2. When to use hotfix vs normal release

| Scenario | Use hotfix? |
|---|---|
| Auth bypass / data leak | **Yes** (immediate) |
| Prod down / data corruption | **Yes** |
| Major feature broken untuk > 50% user | **Yes** |
| Minor bug, workaround exists | **No** — wait for next release |
| Performance regression < 20% | **No** — wait |
| New feature request | **No** — normal flow |
| Security advisory CVSS ≥ 7.0 | **Yes** |
| Compliance violation (UU PDP) | **Yes** |

Kalau ragu: konsultasi Tech Lead. Default ke normal flow karena hotfix carries risk.

---

## 3. Step-by-step

### Step 0 — Triage + decision (5-10 menit)

```bash
# On-call dapat alert (Sentry, Uptime Kuma, Slack, atau user report)
# 1. Acknowledge alert
# 2. Cek Grafana untuk konfirmasi impact
# 3. Cek deployment history terakhir
# 4. Decision: rollback dulu? Atau hotfix forward?
```

**Decision tree:**
- Apakah revisi sebelumnya OK? → **Rollback dulu** ([rollback.md](./rollback.md)), lalu hotfix di tenang.
- Bug di semua revisi (existing issue baru di-trigger)? → **Hotfix langsung**.
- Bug di config? → **Configuration rollback** ([rollback.md §5](./rollback.md#5-configuration-rollback-env-vars-helm-values)).

### Step 1 — Branch dari main

```bash
git checkout main
git pull origin main
git checkout -b hotfix/short-description
# contoh: hotfix/auth-token-leak, hotfix/api-pool-exhaust
```

### Step 2 — Fix dengan minimal scope

**Aturan:**
- Hanya touch file yang perlu untuk fix.
- **No refactor**, no unrelated cleanup, no "while I'm here" changes.
- Tambah test untuk regression prevention (kalau test infrastructure mendukung quick add).
- Kalau bug di module yang sudah-akan-di-refactor di feature branch: tetap fix di hotfix
  dengan minimal patch; refactor terpisah.

```bash
# Edit file → commit
git add <files>
git commit -m "fix(scope): short description

Fix bug X yang menyebabkan Y. Root cause: Z.
Test: added regression test di <file>.

Refs #<issue-number>"
```

### Step 3 — Push + open PR ke main (fast-track)

```bash
git push -u origin hotfix/short-description
gh pr create --base main --head hotfix/short-description \
  --title "hotfix: short description" \
  --label "hotfix,priority/critical" \
  --body "$(cat <<'EOF'
## Hotfix

**Issue:** <link to issue / Sentry event>
**Impact:** S1/S2 di prod
**Root cause:** <1-2 kalimat>
**Fix:** <1-2 kalimat>
**Risk:** Low/Medium/High
**Rollback plan:** helm rollback ke revision N-1

## Test plan
- [ ] Manual test di local
- [ ] Will test di staging via release/v0.2.1
- [ ] Smoke test pada prod setelah deploy
EOF
)"
```

### Step 4 — Fast-track review (2 approval, target < 30 menit)

Branch protection `main` butuh 2 approval. Untuk hotfix:
- **Primary reviewer:** Tech Lead atau Security Lead (kalau security-related)
- **Secondary reviewer:** DevOps atau Senior Engineer

CI WAJIB hijau — JANGAN bypass meski emergency. Kalau CI break karena unrelated flaky test,
fix CI dulu (cepat, parallel).

### Step 5 — Merge ke main

```bash
# Setelah 2 approval + CI hijau
gh pr merge <pr-number> --merge --delete-branch
# Pakai --merge (bukan squash/rebase) supaya history hotfix dapat di-trace
```

### Step 6 — Cut tag patch version

```bash
git checkout main && git pull
# Cek tag terakhir
git tag --sort=-v:refname | head -3
# Mis. terakhir v0.2.0 → hotfix jadi v0.2.1

git tag -a v0.2.1 -m "Hotfix v0.2.1 — <short description>"
git push origin --tags
```

### Step 7 — Build image dengan tag

Hotfix berarti **bypass staging promotion** — ship direct ke prod. Tapi tetap pakai image yang ter-build.

#### Opsi A — Re-trigger build via release branch sementara (recommended)

```bash
git checkout -b release/v0.2.1
git push -u origin release/v0.2.1
# Trigger deploy-staging.yml → smoke test di staging (10-20 menit)
# Verify staging GREEN
```

#### Opsi B — Skip staging (true emergency, butuh sign-off)

Image tag di-build manual:

```bash
# Build + push image manual dari main
SHORT_SHA=$(git rev-parse --short main)
for app in web admin api workers; do
  docker buildx build --platform linux/amd64 \
    -t ghcr.io/ghanem-tech/ghanem-$app:hotfix-$SHORT_SHA \
    -t ghcr.io/ghanem-tech/ghanem-$app:v0.2.1 \
    -f apps/$app/Dockerfile --push .
done
```

Opsi B **butuh sign-off Tech Lead + Security Lead** dan harus di-document di postmortem.

### Step 8 — Deploy ke prod (manual dispatch)

```bash
gh workflow run deploy-prod.yml \
  --ref main \
  -f image_tag=v0.2.1 \
  -f release_branch=release/v0.2.1 \
  -f skip_smoke=false
# (Atau via GH Actions UI)
```

Environment `production` approval gate akan minta 2 reviewer. Untuk hotfix, reviewer
seharusnya sudah standby — coordinate via Slack `#ghanem-incident`.

### Step 9 — Verify + monitor 60 menit

```bash
# Standar post-deploy verification (lihat promotion.md §4)
curl -fsS https://ghanem.one/health
kubectl --kubeconfig=~/.kube/config-prod get pods -n ghanem-prod

# Watch Grafana, Sentry, dashboards
# Tail logs aktif untuk error pattern
```

Hotfix monitoring window = **60 menit minimum** (lebih lama dari normal release 30 menit
karena tested less).

### Step 10 — Cherry-pick ke dev + active release branch

Supaya fix tidak hilang di release berikutnya:

```bash
# Cherry-pick ke dev
git checkout dev && git pull
git cherry-pick <hotfix-merge-sha>
# Resolve conflict kalau ada
git push origin dev

# Cherry-pick ke active release (kalau ada release/v0.3.0 sedang stabilisasi di staging)
git checkout release/v0.3.0 && git pull
git cherry-pick <hotfix-merge-sha>
git push origin release/v0.3.0
```

Skip kalau hotfix dipush via release branch yang sama (Opsi A di Step 7 — release/v0.2.1
nanti di-merge ke main, dan cherry-pick ke dev/release tetap perlu).

### Step 11 — Postmortem (≤ 48 jam)

Mandatory untuk semua hotfix S1/S2:
- Apa yang terjadi (timeline)
- Root cause
- Apa yang berhasil (detection, response)
- Apa yang tidak berhasil
- Action items (preventive, detective, corrective)

Template `docs/runbooks/postmortem-template.md` akan dibuat di Phase 10 (Launch SRE Agent).

---

## 4. Feature flag pattern untuk hotfix risky

Kalau fix complex atau touch banyak path, pakai **feature flag** supaya bisa toggle off
tanpa redeploy:

```typescript
// apps/api/src/modules/<x>/<x>.service.ts
const HOTFIX_ENABLE_NEW_AUTH_PATH = process.env.FEATURE_NEW_AUTH_PATH === 'true';

if (HOTFIX_ENABLE_NEW_AUTH_PATH) {
  // new code (the fix)
} else {
  // old code (existing behavior)
}
```

Deploy dengan `FEATURE_NEW_AUTH_PATH=false` dulu (no-op), lalu enable bertahap:
1. Enable di 5% traffic via header / random sampling (10 menit).
2. Enable di 50% (1 jam observation).
3. Enable 100%.
4. Setelah 1 minggu stable: cleanup flag, hapus old branch.

Phase 10 nanti deploy LaunchDarkly self-hosted atau Unleash untuk feature flag management.

---

## 5. Anti-patterns to avoid

| Anti-pattern | Why bad | Do instead |
|---|---|---|
| Hotfix dari `dev` branch | Include unmerged feature yang risky | Branch dari `main` |
| Skip CI ("emergency") | Hotfix sendiri jadi sumber bug | Wait 5-10 menit untuk CI, lebih cepat dari postmortem |
| Multiple fixes dalam 1 hotfix | Hard to revert, hard to test | Satu hotfix per issue. Multiple hotfix paralel OK. |
| Tidak cherry-pick ke dev | Fix hilang di next release, regression | Always cherry-pick |
| Tidak tag versi | Audit trail hilang, hard to rollback | Tag setiap hotfix (v0.2.1, v0.2.2, dst) |
| Refactor sambil hotfix | Tidak fokus, harder to review | Refactor di separate feature branch nanti |
| Skip postmortem ("we're busy") | Same bug recur, learning hilang | Postmortem ≤ 48 jam, no blame |

---

## 6. Communication templates

### Incident open (di Slack `#ghanem-incident`)

```
[INCIDENT S1] Auth bypass di prod
Detected: 2026-05-19 14:23 WIB via Sentry
Impact: ~5% login requests bypass authorization check
Status: investigating
On-call: @hendra
War room: <link>
Updates every 15 min
```

### Hotfix shipped

```
[INCIDENT S1] RESOLVED via hotfix v0.2.1
Time to detect: 4 min
Time to mitigate: 12 min (rollback)
Time to resolve: 47 min (hotfix deployed)
Root cause: <1 sentence>
Postmortem: scheduled 2026-05-21 10:00 WIB
```

---

## 7. References

- [docs/branch-strategy.md §6 — Hotfix flow](../branch-strategy.md#6-hotfix-flow)
- [docs/runbooks/rollback.md](./rollback.md)
- [docs/runbooks/promotion.md](./promotion.md)
- [docs/runbooks/db-migration-safety.md](./db-migration-safety.md)
- Atlassian — [Hotfix branching](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow#hotfix-branch)
