# Ghanem.one — Branch Strategy

> **Audience:** semua kontributor Ghanem.one
> **Status:** Locked (Phase 7)
> **Owner:** Tech Lead + DevOps
> **Updated:** 2026-05-19

---

## 1. Ringkasan

Ghanem.one pakai **trunk-based development with release branches** — variant dari GitFlow
yang lebih ringan, optimized untuk team kecil (≤ 10 engineers) + monorepo.

```
                ┌────── feature/<topic> ─────┐
                │                            │
   main ───────●─────────●──────────●────────●──────────────●─────────●──── (production)
                                    │                       │         │
                                    │                       │         hotfix/<topic>
                                    └── release/v0.2.0 ─────●
                                                            │
                                                            ●── staging deploy
   dev  ───●────●────●────●────●────●────●────●────●────●────●────●──── (integration)
            ↑    ↑    ↑    ↑
            feat feat feat feat
```

### Branch types

| Branch | Lifetime | Protected? | Deploy target | Merge dari | Merge ke |
|---|---|---|---|---|---|
| `main` | Permanent | **Yes** (locked) | n/a (source of release/hotfix) | `release/*` (fast-forward) atau `hotfix/*` | `release/*` (cherry-pick), `hotfix/*` |
| `dev` | Permanent | Yes (1 approval) | **Dev env** (auto) | `feature/*`, `bugfix/*` | `release/*` (cut release) |
| `feature/<topic>` | Short (≤ 5 hari ideal) | No | PR preview (opsional) | `dev` (rebase) | `dev` |
| `bugfix/<topic>` | Short | No | PR preview | `dev` | `dev` |
| `release/v<X.Y.Z>` | Medium (~1-2 minggu) | Yes (2 approval) | **Staging env** (auto) | `dev` (initial cut) | `main` (after prod sign-off) |
| `hotfix/<topic>` | Very short (jam-hari) | Yes (fast-track) | **Prod env** (manual dispatch) | `main` (branched dari) | `main` + `dev` + active `release/*` |

---

## 2. Promotion flow

```
feature/foo
   │  merge PR (1 approval, CI hijau)
   ▼
  dev  ──► auto-deploy ke dev.ghanem.one
   │
   │  cut release branch saat ready (manual; tech lead)
   ▼
release/v0.2.0  ──► auto-deploy ke staging.ghanem.one
   │
   │  staging sign-off (smoke + UAT)
   │  manual workflow_dispatch + environment approval
   ▼
production  ──► ghanem.one
   │
   │  merge back release/v0.2.0 → main (fast-forward)
   ▼
  main  (tagged v0.2.0)
```

Detail per step ada di [docs/runbooks/promotion.md](./runbooks/promotion.md).

---

## 3. PR review requirements

| Target branch | Required approvals | Required checks | Code owner approval? |
|---|---|---|---|
| `dev` (dari `feature/*`, `bugfix/*`) | **1** | CI Success | Hanya kalau touch `/infra/`, `/.github/`, `/docs/decisions/` |
| `release/*` (dari `dev`) | **2** | CI Success + manual staging smoke | Yes — DevOps + Tech Lead |
| `main` (dari `release/*`) | **2** | CI Success + prod deploy success | Yes — Tech Lead |
| `main` (dari `hotfix/*`) | **2** (fast-track) | CI Success | Yes — Tech Lead atau Sec Lead |

Branch protection rules harus dikonfigurasi di GitHub UI sesuai [docs/runbooks/github-setup.md](./runbooks/github-setup.md).

---

## 4. Commit message convention — Conventional Commits

Mengikuti [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<scope>): <subject>

<body — optional>

<footer — optional>
```

### Types yang dipakai

| Type | Kapan dipakai | Contoh |
|---|---|---|
| `feat` | Fitur baru (user-visible) | `feat(web): tambah filter sensitivity di Explore page` |
| `fix` | Bug fix (user-visible) | `fix(api): handle null geometry di /datasets POST` |
| `chore` | Maintenance, deps update, refactor internal | `chore(deps): bump @nestjs/core ke 10.4.2` |
| `refactor` | Refactor tanpa user-visible change | `refactor(workers): extract segy reader ke modul` |
| `docs` | Hanya dokumentasi | `docs(adr): tambah ADR 0005 untuk i18n strategy` |
| `test` | Tambah/update tests | `test(api): tambah unit test untuk DatasetService.search` |
| `perf` | Performance improvement | `perf(api): index ke datasets.kkks_org_id` |
| `ci` | CI / GH Actions changes | `ci: tambah actionlint job ke ci.yml` |
| `build` | Build system / dependency manager | `build: pin Node ke 20.11.0 di .nvmrc` |
| `revert` | Revert commit sebelumnya | `revert: feat(web): filter sensitivity di Explore` |

### Scope yang dipakai

`web`, `admin`, `api`, `workers`, `ui`, `types`, `config`, `infra`, `docs`, `ci`, `deps`.

### Breaking change

Tambah `!` setelah type/scope, dan footer `BREAKING CHANGE:` dengan deskripsi.

```
feat(api)!: rename endpoint /datasets ke /datasets/v2

BREAKING CHANGE: /api/v1/datasets di-deprecate, akan dihapus di v0.4.0.
Client harus migrate ke /api/v2/datasets.
```

### Validasi

Commit message divalidasi via `commitlint` (akan di-add di Task #6 sebagai pre-push hook
+ CI check). Sementara, reviewer manual cek di PR.

---

## 5. Release cadence

- **Phase 7-10 (pre-launch):** release per **2-3 minggu** per phase milestone.
- **Phase 11+ (post-launch):** release **bi-weekly** by default, ad-hoc untuk hotfix.
- **Versioning:** [Semantic Versioning 2.0.0](https://semver.org/).
  - `MAJOR` (1.x → 2.x): breaking API change atau major UX redesign
  - `MINOR` (0.2.x → 0.3.x): new features, additive non-breaking
  - `PATCH` (0.2.0 → 0.2.1): bug fix only

### Cara cut release

1. Di branch `dev`, pastikan semua feature merged + CI hijau + dev env stable ≥ 24 jam.
2. Tech Lead jalankan:
   ```bash
   git checkout dev && git pull
   git checkout -b release/v0.2.0
   git push -u origin release/v0.2.0
   ```
3. Push ke `release/v0.2.0` otomatis trigger `deploy-staging.yml`.
4. Tunggu staging deploy hijau + UAT 1-3 hari.
5. Manual trigger `deploy-prod.yml` dengan input `image_tag=sha-<short>` + `release_branch=release/v0.2.0`.
6. Setelah prod sehat ≥ 30 menit, merge `release/v0.2.0` → `main` (fast-forward) + tag `v0.2.0`:
   ```bash
   git checkout main && git merge --ff-only release/v0.2.0
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin main --tags
   ```
7. Hapus `release/v0.2.0` setelah merged (atau biarkan untuk audit; cleanup quarterly).

### Tagging

- Tag format: `v<MAJOR>.<MINOR>.<PATCH>` (e.g., `v0.2.0`)
- Pre-release: `v0.2.0-rc.1`, `v0.2.0-beta.1`
- Tag dibuat **hanya** dari `main`. Tidak pernah dari `release/*` atau `dev`.

---

## 6. Hotfix flow

> Lihat juga [docs/runbooks/hotfix.md](./runbooks/hotfix.md) untuk detail step-by-step.

Ketika ada bug critical di prod:

```
main ●─────────────────────●─────────●─────── (production)
      │                     │         │
      │                     │         tag v0.2.1 (after hotfix merged)
      │                     ▼
      │              hotfix/critical-auth-bug
      │              fix + minimal change
      │                     │
      │                     │ PR ke main (fast-track, 2 approval)
      │                     ▼
      └────────────── merged ke main + cherry-pick ke release/v0.3.0 (jika sedang aktif)
                              + cherry-pick ke dev
```

**Aturan:**
- Hotfix branched dari **`main`** (bukan `dev`), supaya tidak include feature yang belum di-stage.
- Minimal change scope — fix issue + test. No refactor, no unrelated cleanup.
- Setelah merged ke `main`, manual trigger `deploy-prod.yml` dengan tag baru `v0.2.1`.
- Cherry-pick ke `dev` + active `release/*` supaya tidak hilang di release berikutnya.
- Kalau risk tinggi: deploy dengan **feature flag off** dulu, enable bertahap.

---

## 7. Force-push policy

- **`main`:** force-push **DILARANG** (branch protection). Kalau perlu rewrite, contact DevOps + Tech Lead.
- **`dev`:** force-push dilarang juga. Kalau perlu revert, pakai `git revert` (forward commit), bukan rewrite history.
- **`release/*`:** force-push **dilarang** setelah staging deploy berjalan. Sebelum itu OK kalau hanya branch maintainer + sebelum di-share.
- **`feature/*`, `bugfix/*`:** force-push **diizinkan** (rebase workflow). Coordinate dengan reviewer kalau PR sudah review-in-progress.
- **`hotfix/*`:** force-push dilarang setelah PR dibuka (audit trail penting).

---

## 8. Branch naming convention

Pakai kebab-case + scope prefix:

```
feature/<scope>-<short-description>
  feature/web-explore-filter
  feature/api-auth-jit-provisioning
  feature/workers-segy-import

bugfix/<scope>-<issue>
  bugfix/web-map-zoom-jump
  bugfix/api-null-geometry-500

hotfix/<short-description>
  hotfix/auth-token-leak
  hotfix/prod-db-connection-pool

release/v<X.Y.Z>
  release/v0.2.0
  release/v0.2.0-rc.1
```

**Hindari:**
- Personal prefix tanpa scope: `hendra/fix-thing` ❌ → `bugfix/api-fix-thing` ✓
- Long descriptions: `feature/add-new-explore-filter-with-debounce-and-clear-button` ❌

---

## 9. Repo permissions matrix

| Role | Read | Write `feature/*` | Approve PR ke `dev` | Approve PR ke `main` | Manual deploy prod |
|---|---|---|---|---|---|
| Engineer | ✓ | ✓ | ✓ (jika code owner) | — | — |
| Senior Engineer | ✓ | ✓ | ✓ | ✓ (1 of 2) | — |
| Tech Lead | ✓ | ✓ | ✓ | ✓ (1 of 2) | ✓ |
| DevOps | ✓ | ✓ | ✓ | ✓ (1 of 2) | ✓ |
| Security Lead | ✓ | ✓ | ✓ | ✓ (security paths) | — |
| External Contributor | ✓ (public) | via fork PR | — | — | — |

Konfigurasi via GitHub teams + branch protection rules — lihat [docs/runbooks/github-setup.md](./runbooks/github-setup.md).

---

## 10. References

- [docs/runbooks/promotion.md](./runbooks/promotion.md) — flow promosi dev → staging → prod
- [docs/runbooks/rollback.md](./runbooks/rollback.md) — rollback procedures
- [docs/runbooks/hotfix.md](./runbooks/hotfix.md) — detail hotfix flow
- [docs/runbooks/github-setup.md](./runbooks/github-setup.md) — manual setup GitHub UI
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning 2.0.0](https://semver.org/)
