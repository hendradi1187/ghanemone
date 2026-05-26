# Runbook — Database Migration Safety

> **Audience:** Backend engineers, DevOps
> **When to use:** Setiap PR yang touch `apps/api/prisma/migrations/`
> **Last updated:** 2026-05-19
> **Owner:** Backend Lead + DevOps

---

## 1. Konteks

Ghanem.one pakai PostgreSQL 15 + PostGIS 3.4. Schema source of truth: **Prisma**
(`apps/api/prisma/schema.prisma`), migration di `apps/api/prisma/migrations/`.

Spatial workers (Python) **read** schema via SQLAlchemy reflection (no DDL ownership).

Migration di prod itu **risky**: 1 broken migration dapat:
- Lock table → API timeout
- Drop column → data loss permanent
- Add NOT NULL column without default → seluruh INSERT gagal
- Long-running transaction → block other queries

Doc ini mendefinisikan **safe patterns** + **anti-patterns** + **2-phase deploy** untuk
breaking schema change.

---

## 2. Decision tree — apa pattern yang dipakai?

```
Schema change yang dibutuhkan
│
├─► ADD column (NULL atau dengan default value)
│   └─► Safe pattern (§3.1) — single-phase deploy OK
│
├─► ADD index
│   └─► CREATE INDEX CONCURRENTLY (§3.2) — single-phase, tapi outside Prisma migrate
│
├─► ADD table
│   └─► Safe pattern (§3.1) — single-phase deploy OK
│
├─► RENAME column / table
│   └─► 2-phase deploy (§4) — add new, dual-write, switch, drop old
│
├─► DROP column / table
│   └─► 2-phase deploy (§4) — soft-deprecate, dual-read, drop di release berikutnya
│
├─► ALTER column type
│   ├─► Compatible widening (varchar(50) → varchar(100))? Safe single-phase
│   └─► Lossy (text → varchar(50))? 2-phase + data validation
│
├─► ADD NOT NULL constraint ke existing column
│   └─► 2-phase: tambah default → backfill → drop default → add NOT NULL
│
├─► ADD foreign key
│   └─► NOT VALID + VALIDATE pattern (§5)
│
└─► CHANGE primary key
    └─► AVOID. Jika benar-benar perlu: 2-phase + downtime window di-koordinasi
```

---

## 3. Safe single-phase patterns

### 3.1 ADD column (nullable atau dengan default)

```sql
-- apps/api/prisma/migrations/20260519_add_dataset_owner_email/migration.sql

-- Nullable: aman untuk existing rows (NULL by default)
ALTER TABLE datasets ADD COLUMN owner_email TEXT;

-- ATAU dengan default ringan (PG 11+ optimize ini sebagai metadata-only, no rewrite)
ALTER TABLE datasets ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0;
```

**Catatan:**
- PG 11+ optimize `ADD COLUMN ... DEFAULT <const>` jadi metadata-only — table tidak di-rewrite.
- Untuk PG ≤ 10 atau default non-constant (e.g., `DEFAULT now()`): table di-rewrite, lock berat → gunakan 2-phase.

### 3.2 ADD index — pakai CONCURRENTLY (avoid Prisma migrate)

Prisma migrate jalankan migration dalam transaction → tidak bisa `CREATE INDEX CONCURRENTLY`.

**Workaround:** apply manual SQL via psql, lalu mark Prisma migration as applied:

```sql
-- File: apps/api/prisma/migrations/20260519_idx_datasets_org/migration.sql
-- NOTE: Apply manually via psql, then `prisma migrate resolve --applied 20260519_idx_datasets_org`
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_datasets_kkks_org_id
  ON datasets (kkks_org_id)
  WHERE deleted_at IS NULL;
```

```bash
# Prod apply steps
ssh ghanem-prod-db-01.skkmigas.local
psql -U ghanem -d ghanem -f migration.sql  # Run ~minutes, no lock

# Mark Prisma as applied (idempotent)
kubectl --kubeconfig=~/.kube/config-prod exec -n ghanem-prod -it deploy/ghanem-api -- \
  npx prisma migrate resolve --applied 20260519_idx_datasets_org
```

Alternatif: pakai library seperti `prisma-migrate-rollout` (community) atau split migration.

### 3.3 ADD table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
```

Safe karena table baru tidak ada existing data; no lock pada table existing.

---

## 4. 2-phase deploy patterns

Pattern dasar: **expand → contract**. Add new without breaking old, then drop old after
all consumers migrate.

### 4.1 RENAME column

❌ **Anti-pattern (single-phase):**
```sql
ALTER TABLE datasets RENAME COLUMN owner_name TO owner_fullname;
```
Issue: app code lama yang masih reference `owner_name` akan crash pas deploy mid-flight.

✅ **Safe 2-phase:**

**Release N (expand):**
```sql
-- Step 1: Add new column
ALTER TABLE datasets ADD COLUMN owner_fullname TEXT;

-- Step 2: Backfill
UPDATE datasets SET owner_fullname = owner_name WHERE owner_fullname IS NULL;

-- Step 3: Add trigger untuk dual-write (atau handle di app layer)
CREATE OR REPLACE FUNCTION sync_owner_name_to_fullname() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_name IS NOT NULL AND NEW.owner_fullname IS NULL THEN
    NEW.owner_fullname := NEW.owner_name;
  END IF;
  IF NEW.owner_fullname IS NOT NULL AND NEW.owner_name IS NULL THEN
    NEW.owner_name := NEW.owner_fullname;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_owner_name BEFORE INSERT OR UPDATE ON datasets
  FOR EACH ROW EXECUTE FUNCTION sync_owner_name_to_fullname();
```

App layer (release N):
- Write ke kedua field (via trigger, atau eksplisit di app)
- Read tetap dari `owner_name` (tidak ada client migration yet)

**Release N+1 (switch):**
- App layer: read dari `owner_fullname`, write tetap dual.
- Verifikasi via shadow read: `owner_name == owner_fullname` selalu true.

**Release N+2 (contract):**
```sql
-- Drop trigger + old column
DROP TRIGGER trg_sync_owner_name ON datasets;
DROP FUNCTION sync_owner_name_to_fullname();
ALTER TABLE datasets DROP COLUMN owner_name;
```

### 4.2 DROP column (no rename)

**Release N (deprecate):**
- Mark column as deprecated di Prisma schema dengan comment: `// @deprecated remove di v0.3.0`
- App layer: stop writing ke column (read masih OK kalau ada legacy data).

**Release N+1 (cleanup):**
- App layer: stop reading dari column.
- Verifikasi via Sentry / log: no reference selama 7 hari.

**Release N+2 (drop):**
```sql
ALTER TABLE datasets DROP COLUMN deprecated_field;
```

### 4.3 ADD NOT NULL ke existing column

❌ **Anti-pattern:**
```sql
ALTER TABLE users ADD COLUMN role TEXT NOT NULL;
```
Crash kalau ada row tanpa role.

✅ **Safe:**
```sql
-- Step 1: ADD nullable dengan default
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'analyst';

-- Step 2: Backfill (sudah otomatis via default)
UPDATE users SET role = 'analyst' WHERE role IS NULL;

-- Step 3 (release N+1): Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;  -- optional
```

---

## 5. Adding foreign key — NOT VALID + VALIDATE

ADD FK pada existing table dengan banyak rows lock berat. Pakai 2-step:

```sql
-- Step 1: Add constraint as NOT VALID (no full table scan, no lock)
ALTER TABLE datasets ADD CONSTRAINT fk_datasets_kkks_org
  FOREIGN KEY (kkks_org_id) REFERENCES organizations(id)
  NOT VALID;

-- Step 2: Validate existing rows (lock per row, can be cancelled & retry)
ALTER TABLE datasets VALIDATE CONSTRAINT fk_datasets_kkks_org;
```

Step 2 dapat dijalankan separate, di luar deploy window.

---

## 6. Migration testing checklist (sebelum merge PR)

- [ ] Migration jalan di local dev DB tanpa error
- [ ] Migration ber-rollback semantically (write reverse SQL di PR description, tidak commit)
- [ ] Test data dengan volume realistic (paling tidak 10k rows untuk simulate prod scale)
- [ ] `EXPLAIN ANALYZE` query yang paling sering pakai column yang diubah — tidak ada regression
- [ ] Migration < 30 detik pada local DB; kalau lebih lama, evaluasi pakai CONCURRENTLY pattern
- [ ] Tidak ada `DROP COLUMN` / `DROP TABLE` dalam single-phase migration (lihat §4.2)
- [ ] Tidak ada `ADD NOT NULL` tanpa default ke existing column
- [ ] Schema di-update via Prisma `prisma db pull` lokal — file `schema.prisma` sync
- [ ] PR description sebutkan kalau ini 2-phase; link ke PR phase berikutnya

---

## 7. Migration deploy steps (prod)

Workflow `deploy-prod.yml` **tidak otomatis** apply migration. Manual step (atau Phase 9
nanti via init container).

```bash
# 1. Pre-flight: backup DB
ssh ghanem-prod-db-01.skkmigas.local
pg_dump -U ghanem -d ghanem -Fc -f /backups/pre-migration-$(date +%Y%m%d-%H%M).dump

# 2. Deploy app pakai image yang sudah handle dual-write (release N case)
gh workflow run deploy-prod.yml --ref main -f image_tag=v0.2.0 -f release_branch=release/v0.2.0

# 3. Apply migration via Prisma
kubectl --kubeconfig=~/.kube/config-prod exec -n ghanem-prod -it deploy/ghanem-api -- \
  npx prisma migrate deploy

# 4. Verify
kubectl --kubeconfig=~/.kube/config-prod exec -n ghanem-prod -it ghanem-prod-db-01 -- \
  psql -U ghanem -d ghanem -c "SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;"

# 5. Monitor 30 menit — slow query, deadlock, error rate
```

---

## 8. Anti-patterns reference

| Anti-pattern | Why bad | Use instead |
|---|---|---|
| `ALTER TABLE x ADD COLUMN y NOT NULL` | Crash kalau ada existing row | §4.3 |
| `ALTER TABLE x RENAME COLUMN ...` single-phase | App mid-deploy crash | §4.1 |
| `DROP COLUMN` di release pertama | Data loss + crash app version lama yang masih running | §4.2 |
| `CREATE INDEX` (non-CONCURRENTLY) di prod | Lock table sampai index selesai (jam-jam untuk big table) | §3.2 |
| Long migration di single transaction (> 30s) | Lock semua, block writes | Split jadi chunks, atau pakai pg_repack |
| Update large table dalam 1 statement | Long lock + WAL bloat | Batch UPDATE dengan LIMIT + loop |
| Migration depending on app code (e.g., `SELECT ... FROM my_app_function()`) | Cross-coupling, hard to rollback | Migration harus self-contained SQL |
| Skip backup pre-migration | Tidak ada recovery option | Always backup, retain 7 hari |

---

## 9. References

- [docs/runbooks/rollback.md §4 — DB migration rollback](./rollback.md#4-database-migration-rollback)
- [docs/data-model.md](../data-model.md)
- [Prisma docs — Migrations](https://www.prisma.io/docs/orm/prisma-migrate)
- [PostgreSQL docs — ALTER TABLE](https://www.postgresql.org/docs/15/sql-altertable.html)
- [GitLab — Migration Style Guide](https://docs.gitlab.com/ee/development/migration_style_guide.html) (good reference patterns)
- [Strong Migrations gem (Ruby)](https://github.com/ankane/strong_migrations) — anti-pattern checklist sumber inspirasi
