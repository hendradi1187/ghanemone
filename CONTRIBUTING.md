# Contributing to Ghanem.one

Ghanem.one adalah Spatial Intelligence Platform untuk hulu migas Indonesia, dikembangkan untuk SKK Migas dan KKKS. Kontribusi yang baik membantu platform ini melayani lebih banyak engineer migas di Indonesia.

Dokumen ini mencakup cara setup lingkungan lokal, konvensi kode, dan proses PR.

---

## Daftar Isi

1. [Prerequisites](#1-prerequisites)
2. [Local Setup](#2-local-setup)
3. [Struktur Monorepo](#3-struktur-monorepo)
4. [Branch Strategy](#4-branch-strategy)
5. [Conventional Commits](#5-conventional-commits)
6. [Code Style](#6-code-style)
7. [Testing](#7-testing)
8. [Pull Request Process](#8-pull-request-process)
9. [Tanya Jawab](#9-tanya-jawab)

---

## 1. Prerequisites

Sebelum setup, pastikan tool berikut sudah terinstall:

| Tool | Versi minimum | Cara install |
|---|---|---|
| Node.js | 20.11.0 (LTS Iron) | [nvm](https://github.com/nvm-sh/nvm) atau [nvm-windows](https://github.com/coreybutler/nvm-windows) |
| npm | 10.0.0 | Bundled dengan Node 20+ |
| Docker + Docker Compose | 26.x / v2.x | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Git | 2.40+ | git-scm.com |
| Python | 3.12+ | Hanya untuk `apps/workers` (Poetry) |
| Poetry | 1.8+ | [python-poetry.org](https://python-poetry.org/docs/) |

Gunakan `.nvmrc` di root untuk pin versi Node:

```bash
nvm install   # baca .nvmrc, install 20.11.0
nvm use       # aktifkan 20.11.0
```

---

## 2. Local Setup

### Clone dan install dependensi

```bash
git clone https://github.com/ghanemtech/ghanemone.git
cd ghanemone
npm install
```

### Copy environment variables

Setiap app memiliki `.env.example`. Copy dan isi nilai yang diperlukan:

```bash
cp apps/web/.env.example      apps/web/.env.local
cp apps/api/.env.example      apps/api/.env
cp apps/admin/.env.example    apps/admin/.env.local
cp apps/workers/.env.example  apps/workers/.env
```

File `.env.local` dan `.env` sudah ada di `.gitignore` — **jangan commit file-file ini**.

### Spin up layanan infrastruktur lokal

PostgreSQL+PostGIS, Redis, MinIO, Meilisearch, dan Adminer tersedia via Docker Compose:

```bash
npm run dev:infra
```

Tunggu sampai semua container healthy (cek dengan `docker compose -f infra/docker-compose.dev.yml ps`).
Database akan di-initialize otomatis dengan PostGIS extension via `infra/postgres/init.sql`.

### Jalankan aplikasi

```bash
npm run dev
```

Perintah ini menjalankan semua apps via Turborepo secara paralel:

| App | URL |
|---|---|
| Web (Vite) | http://localhost:5173 |
| Admin (Vite) | http://localhost:5174 |
| API (NestJS) | http://localhost:3000 |
| MinIO Console | http://localhost:9001 |
| Adminer (DB) | http://localhost:8080 |

Untuk menjalankan app tertentu saja:

```bash
npm run dev --workspace=apps/web
```

---

## 3. Struktur Monorepo

```
ghanemone/
├── apps/
│   ├── web/           React 18 + Vite — user-facing SPA
│   ├── api/           NestJS — REST API + WebSocket gateway
│   ├── admin/         React 18 + Vite — internal ops tooling
│   └── workers/       Python + FastAPI — GIS processing workers
│
├── packages/
│   ├── ui/            Shared React component library (design system)
│   ├── types/         Shared TypeScript type definitions
│   └── config/        Shared ESLint, Prettier, TSConfig, Tailwind base configs
│
├── infra/
│   ├── docker-compose.dev.yml    Local dev infrastructure stack
│   ├── postgres/init.sql         PostGIS initialization
│   ├── terraform/                IaC modules per environment
│   ├── helm/                     Kubernetes Helm charts
│   ├── ansible/                  OS baseline + k3s provisioning
│   └── scripts/                  Backup, restore, migration helpers
│
├── docs/
│   ├── api-contract.md           OpenAPI 3.0 spec (narrative)
│   ├── data-model.md             PostgreSQL + PostGIS DDL
│   ├── auth-flow.md              OIDC + JIT provisioning (SKK Migas SSO)
│   ├── branch-strategy.md        Git workflow yang dipakai
│   ├── decisions/                Architecture Decision Records (ADR)
│   └── runbooks/                 On-call playbooks
│
└── .github/
    ├── workflows/                CI/CD GitHub Actions
    ├── ISSUE_TEMPLATE/           Bug report + feature request templates
    └── pull_request_template.md  PR checklist
```

---

## 4. Branch Strategy

Repo ini pakai **trunk-based development with release branches**.

Detail lengkap ada di [`docs/branch-strategy.md`](./docs/branch-strategy.md).

Ringkasan:

| Branch | Deploy ke | Protected? |
|---|---|---|
| `main` | (source of release) | Ya — no force push, 2 approval |
| `dev` | dev.ghanem.one | Ya — 1 approval |
| `feature/<scope>-<topic>` | PR preview (opsional) | Tidak |
| `release/v<X.Y.Z>` | staging.ghanem.one | Ya — 2 approval |
| `hotfix/<topic>` | prod (manual dispatch) | Ya (fast-track) |

Buat branch dari `dev` untuk fitur baru:

```bash
git checkout dev && git pull
git checkout -b feature/api-dataset-search
```

---

## 5. Conventional Commits

Semua commit message **wajib** mengikuti [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

Format:

```
<type>(<scope>): <subject>
```

Contoh:

```
feat(api): tambah endpoint GET /datasets dengan spatial filter
fix(web): perbaiki zoom jump saat klik marker di map
chore(deps): bump @nestjs/core ke 10.4.2
docs(adr): tambah ADR 0006 untuk caching strategy
test(api): tambah unit test DatasetService.findByBbox
ci: tambah eslint check ke ci.yml
```

Type yang valid: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`, `build`, `revert`.

Scope yang valid: `web`, `admin`, `api`, `workers`, `ui`, `types`, `config`, `infra`, `docs`, `ci`, `deps`.

Breaking change: tambah `!` setelah scope dan footer `BREAKING CHANGE:`:

```
feat(api)!: rename /datasets ke /datasets/v2

BREAKING CHANGE: /api/v1/datasets deprecated, migrate ke /api/v2/datasets.
```

Validasi commitlint akan di-add sebagai pre-push hook di Sprint 0 setup. Sampai saat itu reviewer akan cek secara manual.

---

## 6. Code Style

### TypeScript / JavaScript

- ESLint v9 flat config — setiap app/package memiliki `eslint.config.js` (atau `.mjs` untuk CommonJS apps).
- Shared rules ada di `packages/config/eslint-base.js` (semua TS) dan `packages/config/eslint-react.js` (React apps).
- Prettier dipakai untuk formatting — config ada di `packages/config/prettier-base.js`.

Jalankan lint di root (semua workspace via Turborepo):

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
# Format semua file
npm run format
```

Aturan kritis yang di-enforce:
- `@typescript-eslint/no-explicit-any: error` — gunakan `unknown` + type narrowing.
- `@typescript-eslint/no-unused-vars: error` — prefix dengan `_` kalau intentionally unused.
- `@typescript-eslint/consistent-type-imports: error` — gunakan `import type` untuk type-only imports.
- `react-hooks/rules-of-hooks: error` dan `react-hooks/exhaustive-deps: warn`.

### Python (apps/workers)

- Formatter: [Ruff](https://docs.astral.sh/ruff/) (menggantikan Black + isort).
- Linter: `ruff check` + `mypy` untuk type checking.
- Jalankan via `npm run lint --workspace=apps/workers` (memanggil `poetry run ruff check src tests`).

### Pre-commit hooks

Husky + lint-staged akan di-setup di Sprint 0 untuk auto-run ESLint + Prettier sebelum commit. Lihat task backlog.

---

## 7. Testing

### Unit tests

- **Web/Admin:** [Vitest](https://vitest.dev/) + jsdom. File test: `src/**/*.test.ts(x)`.
- **API:** [Jest](https://jestjs.io/) + ts-jest. File test: `src/**/*.spec.ts`.
- **Workers:** [pytest](https://pytest.org/). File test: `tests/`.

Jalankan semua tests:

```bash
npm run test
```

Jalankan tests di satu workspace:

```bash
npm run test --workspace=apps/api
```

### Requirement

Setiap modul baru **wajib** memiliki unit test untuk:
- Happy path
- Error/edge case utama
- Boundary conditions untuk fungsi spatial (bbox validity, CRS consistency, dll.)

Coverage threshold akan di-enforce di CI (target: 70% per package, dikecualikan untuk apps/workers sampai Phase 9).

### Type checking

```bash
npm run type-check
```

---

## 8. Pull Request Process

1. Pastikan branch up-to-date dengan `dev`:
   ```bash
   git fetch origin && git rebase origin/dev
   ```

2. Jalankan CI checks lokal sebelum push:
   ```bash
   npm run lint && npm run type-check && npm run test
   ```

3. Push dan buka PR ke `dev`. PR template di `.github/pull_request_template.md` akan auto-load — isi checklist.

4. CODEOWNERS akan auto-assign reviewer berdasarkan path yang diubah:
   - Perubahan di `apps/api/**` atau `infra/**` memerlukan review DevOps.
   - Perubahan di `packages/**` memerlukan review Tech Lead.
   - Perubahan di `docs/decisions/**` memerlukan review Tech Lead + DevOps.

5. CI harus hijau (lint + type-check + test + build) sebelum merge.

6. Gunakan **Squash and Merge** ke `dev`. Commit message harus mengikuti Conventional Commits.

7. Setelah merge, hapus branch feature.

---

## 9. Tanya Jawab

- **Slack:** Channel `#ghanem-dev` (placeholder — akan diisi setelah team onboard).
- **GitHub Discussions:** Diaktifkan untuk pertanyaan arsitektur dan desain.
- **Bug reports:** Gunakan template di `.github/ISSUE_TEMPLATE/bug_report.md`.
- **Feature request:** Gunakan template di `.github/ISSUE_TEMPLATE/feature_request.md`.

Untuk pertanyaan terkait security (potential vulnerability), lihat [SECURITY.md](./SECURITY.md).
