# Data Model — Ghanem.one

> **Status:** PROPOSED — ratify dengan backend + GIS specialist sebelum Phase 9.
> DDL berikut diturunkan **purely dari shape data yang dikonsumsi UI**
> (`prototype-app.jsx`, `hifi-*.jsx`). Tidak ada field yang ditambahkan tanpa
> dukungan dari prototype.

Target: **PostgreSQL 16+** dengan **PostGIS 3.4+**.

---

## 1. Extension setup

```sql
-- Run once per database
CREATE EXTENSION IF NOT EXISTS postgis;          -- core spatial types + functions
CREATE EXTENSION IF NOT EXISTS postgis_topology; -- topology validation untuk SHP intake
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- trigram indexes untuk fuzzy search
CREATE EXTENSION IF NOT EXISTS btree_gin;        -- multi-column GIN indexes
CREATE EXTENSION IF NOT EXISTS pgcrypto;         -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;           -- case-insensitive email
```

Default tablespace: gunakan **separate filesystem** untuk PostGIS data
(rekomendasi DevOps), karena geometry blob bisa membengkak (SHP intake ribuan
features).

---

## 2. Enum types

```sql
CREATE TYPE dataset_kind         AS ENUM ('LAYER', 'VOLUME', 'DOC');
CREATE TYPE dataset_theme        AS ENUM ('admin', 'well', 'seismic', 'pipe', 'facility', 'doc');
CREATE TYPE sensitivity_level    AS ENUM ('public', 'internal', 'confidential');
CREATE TYPE user_role            AS ENUM ('regulator', 'compliance_officer', 'kkks_operator', 'public_analyst');
CREATE TYPE approval_status      AS ENUM ('pending', 'review', 'approved', 'rejected');
CREATE TYPE validation_status    AS ENUM ('ok', 'warn', 'err');
CREATE TYPE risk_level           AS ENUM ('low', 'med', 'high');
CREATE TYPE pipeline_status      AS ENUM ('ok', 'warn', 'err', 'idle');
CREATE TYPE alert_severity       AS ENUM ('ok', 'warn', 'err');
CREATE TYPE task_status          AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority        AS ENUM ('low', 'med', 'high');
CREATE TYPE lineage_step         AS ENUM ('source', 'connector', 'validated', 'published');
CREATE TYPE upload_status        AS ENUM ('initiated', 'uploading', 'uploaded', 'validating', 'completed', 'aborted', 'failed');
```

Rationale: Enums lebih aman dari free-text status karena cocokkan literal
yang sudah ada di UI (lihat referensi `path:line` per-enum di api-contract.md).

---

## 3. Tables

### 3.1 Tenants & users

`org` di UI mengelompokkan user — KKKS atau regulator. Kita pisahkan jadi
tabel `organizations` agar row-level security mudah (`WHERE org_id = current_user_org`).

```sql
-- Source: hifi-components.jsx:77 (default user has org+role+initials)
CREATE TABLE organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,           -- e.g., 'skkmigas', 'phe-onwj'
  name            text NOT NULL,                  -- 'SKK Migas', 'PHE ONWJ'
  initials        text NOT NULL CHECK (length(initials) BETWEEN 1 AND 3),
  org_type        text NOT NULL CHECK (org_type IN ('regulator', 'kkks', 'vendor')),
  color_hex       text,                           -- optional brand color
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Source: hifi-auxiliary.jsx:88-92 (SSO providers: SKK Migas, Pertamina, Azure AD)
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext NOT NULL UNIQUE,
  name            text NOT NULL,
  initials        text NOT NULL CHECK (length(initials) BETWEEN 1 AND 3),
  org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  role            user_role NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX users_org_role_idx ON users (org_id, role);

-- Source: auth-flow.md — OIDC identities (one user can have many SSO sources)
CREATE TABLE user_oidc_identities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issuer          text NOT NULL,                  -- 'skkmigas', 'pertamina', 'azure'
  subject         text NOT NULL,                  -- 'sub' claim from IdP
  email           citext,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issuer, subject)
);
```

### 3.2 Categories & themes

```sql
-- Source: prototype-app.jsx:143-150 (THEMES const) + hifi-components.jsx:138-148
CREATE TABLE categories (
  id              text PRIMARY KEY,               -- matches dataset_theme value
  label           text NOT NULL,                  -- 'Administrative', 'Well & Drilling', ...
  color_token     text NOT NULL,                  -- CSS token, e.g., 'var(--hf-green-500)'
  display_order   smallint NOT NULL DEFAULT 100,
  is_active       boolean NOT NULL DEFAULT true
);

-- Seed
INSERT INTO categories (id, label, color_token, display_order) VALUES
  ('admin',    'Administrative',  'var(--hf-green-500)',  10),
  ('well',     'Well & Drilling', 'var(--hf-amber-500)',  20),
  ('seismic',  'Seismic',         'var(--hf-purple-500)', 30),
  ('pipe',     'Pipeline',        'var(--hf-green-500)',  40),
  ('facility', 'Facilities',      'var(--hf-red-500)',    50),
  ('doc',      'Documents',       'var(--hf-blue-500)',   60);
```

### 3.3 Datasets (core resource)

Bentuk diturunkan langsung dari `CATALOG` di `prototype-app.jsx:8-141`.

```sql
CREATE TABLE datasets (
  id                  text PRIMARY KEY,                -- human-readable slug, e.g., 'wk-onwj'
  title               text NOT NULL,
  kind                dataset_kind NOT NULL,
  type                text NOT NULL,                   -- free-text discipline: 'Administrative', 'Seismic', 'Well & Drilling', 'Document', 'Infrastructure', 'Facilities'
  format_label        text NOT NULL,                   -- human-readable: 'Vector · SHP, GeoJSON', 'Volume · SEG-Y', 'PDF · 2.4 MB'
  theme               text NOT NULL REFERENCES categories(id),
  description         text NOT NULL,
  provider_id         uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  owner_user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  is_verified         boolean NOT NULL DEFAULT false,
  sensitivity         sensitivity_level NOT NULL DEFAULT 'internal',
  license             text,                            -- e.g., 'internal-spektrum', 'cc-by-4.0'
  crs                 text NOT NULL DEFAULT 'EPSG:4326',
  -- Bounding box (precomputed for fast spatial filter, lon/lat)
  bbox                geometry(Polygon, 4326),
  -- Aggregates (denormalized for cheap read; backfilled by triggers/jobs)
  download_count      integer NOT NULL DEFAULT 0,
  view_count          integer NOT NULL DEFAULT 0,
  star_count          integer NOT NULL DEFAULT 0,
  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  last_validated_at   timestamptz,
  deleted_at          timestamptz                       -- soft delete
);

-- Indexes
CREATE INDEX datasets_provider_idx        ON datasets (provider_id) WHERE deleted_at IS NULL;
CREATE INDEX datasets_theme_idx           ON datasets (theme)       WHERE deleted_at IS NULL;
CREATE INDEX datasets_kind_idx            ON datasets (kind)        WHERE deleted_at IS NULL;
CREATE INDEX datasets_updated_at_idx      ON datasets (updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX datasets_sensitivity_idx     ON datasets (sensitivity) WHERE deleted_at IS NULL;

-- GIST spatial index untuk bbox filter (?bbox=… in /datasets)
CREATE INDEX datasets_bbox_gist           ON datasets USING GIST (bbox) WHERE deleted_at IS NULL;

-- Trigram untuk fuzzy title/description search (cheap fallback if Meilisearch is down)
CREATE INDEX datasets_title_trgm          ON datasets USING GIN (title gin_trgm_ops);
CREATE INDEX datasets_desc_trgm           ON datasets USING GIN (description gin_trgm_ops);
```

### 3.4 Dataset attributes (key-value list)

Bentuk dari `attrs` array di `prototype-app.jsx:19-28`. Ini display-only metadata
(ordered list of pairs), bukan structured columns. Kalau backend ingin
query by attribute, **tambahkan column terpisah** — jangan parse JSON.

```sql
CREATE TABLE dataset_attributes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  key             text NOT NULL,                   -- 'Total Area', 'CRS', 'Status'
  value           text NOT NULL,
  display_order   smallint NOT NULL DEFAULT 100,
  UNIQUE (dataset_id, key)
);

CREATE INDEX dataset_attributes_ds_idx ON dataset_attributes (dataset_id, display_order);
```

### 3.5 Quality scores

Bentuk dari `quality` array di `prototype-app.jsx:29-35`.

```sql
CREATE TABLE dataset_quality_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  label           text NOT NULL,                   -- 'Completeness', 'Positional accuracy', ...
  score           smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
  measured_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset_id, label)
);

CREATE INDEX dataset_quality_scores_ds_idx ON dataset_quality_scores (dataset_id);
```

### 3.6 Geometries (spatial payload per dataset)

LAYER datasets punya geometry payload — vector. Kita simpan **denormalized
feature collection** dengan satu row per feature (paling fleksibel: punya
attrs FK ke parent dataset, dan masing-masing punya geometry GIST-indexable).

Bentuk dari `REAL_LAYERS` di `prototype-realmap.jsx:9-77` — mix polygon, points,
lines.

```sql
CREATE TABLE dataset_features (
  id              bigserial PRIMARY KEY,
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  -- Geometry — flexible, supports Polygon/MultiPolygon/Point/LineString/MultiLineString
  geom            geometry(Geometry, 4326) NOT NULL,
  -- Per-feature attributes (e.g., well_label='ONWJ-A-12', kind='Production')
  properties      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- GIST is the canonical PostGIS spatial index
CREATE INDEX dataset_features_geom_gist   ON dataset_features USING GIST (geom);
CREATE INDEX dataset_features_ds_idx      ON dataset_features (dataset_id);
-- GIN on properties enables filter by feature attribute (e.g., well kind)
CREATE INDEX dataset_features_props_gin   ON dataset_features USING GIN (properties);
```

### 3.7 Seismic-specific metadata

Bentuk dari `hifi-pages-2.jsx:339-356` (Seismic Information table) +
`:374-389` (Horizon depth table).

```sql
CREATE TABLE seismic_volumes (
  dataset_id          text PRIMARY KEY REFERENCES datasets(id) ON DELETE CASCADE,
  survey_name         text NOT NULL,                  -- 'SUMATRA_3D_VOL_01'
  survey_type         text NOT NULL,                  -- '3D Seismic', '2D Seismic'
  inline_min          integer,                        -- 1001
  inline_max          integer,                        -- 1850
  xline_min           integer,                        -- 2001
  xline_max           integer,                        -- 2850
  sample_interval_ms  numeric(6,2),                   -- 2.0
  bin_size_x_m        numeric(6,2),                   -- 12.5
  bin_size_y_m        numeric(6,2),                   -- 12.5
  vertical_min_ms     integer DEFAULT 0,
  vertical_max_ms     integer,                        -- 8000
  phase               text,                           -- 'Full Stack'
  storage_uri         text NOT NULL                   -- s3://bucket/seismic/sumatra3d_01.segy
);

CREATE TABLE seismic_horizons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name            text NOT NULL,                      -- 'Top Reservoir'
  color_hex       text NOT NULL,                      -- '#f0c419'
  depth_tvdss_m   numeric(8,2),                       -- 2650.00
  display_order   smallint NOT NULL DEFAULT 100
);

CREATE INDEX seismic_horizons_ds_idx ON seismic_horizons (dataset_id, display_order);

CREATE TABLE seismic_faults (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  fault_type      text NOT NULL CHECK (fault_type IN ('major', 'minor')),
  color_hex       text NOT NULL,
  geom            geometry(LineString, 4326),         -- 2D trace on surface (if available)
  trace_2d        jsonb                                -- optional cross-section path (x,y in section coords)
);

CREATE INDEX seismic_faults_geom_gist ON seismic_faults USING GIST (geom);
CREATE INDEX seismic_faults_ds_idx    ON seismic_faults (dataset_id);
```

### 3.8 Wells

Bentuk dari `hifi-pages-2.jsx:309-318` (well details table) + `well-loc.points`
di `prototype-realmap.jsx:35-52`.

```sql
CREATE TABLE wells (
  id                  text PRIMARY KEY,                -- 'GWN-01', 'ONWJ-A-12'
  name                text NOT NULL,
  well_type           text NOT NULL CHECK (well_type IN ('Exploration', 'Production', 'Appraisal', 'Injection')),
  operator_org_id     uuid REFERENCES organizations(id),
  spud_date           date,
  td_date             date,
  total_depth_m       numeric(8,2),
  status              text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Abandoned')),
  field               text,
  formation           text,
  reservoir           text,
  location            geometry(Point, 4326) NOT NULL,
  -- Optional cross-section position when shown inside a seismic volume
  parent_seismic_id   text REFERENCES datasets(id),
  cross_section_x_ratio numeric(4,3),                  -- 0.000..1.000
  last_updated_at     timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wells_location_gist        ON wells USING GIST (location);
CREATE INDEX wells_operator_idx         ON wells (operator_org_id);
CREATE INDEX wells_parent_seismic_idx   ON wells (parent_seismic_id) WHERE parent_seismic_id IS NOT NULL;
```

### 3.9 Lineage

Bentuk dari `prototype-app.jsx:815-836` (Lineage tab).

```sql
CREATE TABLE dataset_lineage_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  step            lineage_step NOT NULL,           -- source/connector/validated/published
  label           text NOT NULL,                   -- 'PHE ONWJ GIS', 'SPARK v2.4', '2024-08-09', '2024-08-09'
  actor           text,                            -- 'system' or user email
  occurred_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dataset_lineage_ds_idx ON dataset_lineage_events (dataset_id, occurred_at);
```

### 3.10 Uploads & approvals

Bentuk dari `hifi-auxiliary.jsx:159-378` (HfUpload wizard) + `:383-541` (HfCompliance queue).

```sql
CREATE TABLE upload_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id),
  org_id              uuid NOT NULL REFERENCES organizations(id),
  filename            text NOT NULL,
  size_bytes          bigint NOT NULL,
  content_type        text,
  declared_kind       dataset_kind,
  storage_uri         text,                            -- s3://bucket/uploads/<id>
  status              upload_status NOT NULL DEFAULT 'initiated',
  bytes_uploaded      bigint NOT NULL DEFAULT 0,
  expires_at          timestamptz NOT NULL,            -- TTL for resumable upload
  created_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz
);

CREATE INDEX upload_sessions_user_idx     ON upload_sessions (user_id, created_at DESC);
CREATE INDEX upload_sessions_status_idx   ON upload_sessions (status) WHERE status IN ('initiated','uploading','validating');

CREATE TABLE upload_chunks (
  upload_id           uuid NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  chunk_index         integer NOT NULL,
  size_bytes          integer NOT NULL,
  checksum_sha256     text,
  received_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (upload_id, chunk_index)
);

CREATE TABLE approval_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id           uuid REFERENCES upload_sessions(id) ON DELETE SET NULL,
  dataset_id          text REFERENCES datasets(id) ON DELETE SET NULL,
  submitter_user_id   uuid NOT NULL REFERENCES users(id),
  submitter_org_id    uuid NOT NULL REFERENCES organizations(id),
  status              approval_status NOT NULL DEFAULT 'pending',
  validation          validation_status,
  risk                risk_level NOT NULL DEFAULT 'low',
  urgent              boolean NOT NULL DEFAULT false,
  reviewer_user_id    uuid REFERENCES users(id),
  decided_at          timestamptz,
  decision_note       text,
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  -- SLA tracking
  sla_deadline        timestamptz                     -- now() + 72h on insert
);

CREATE INDEX approval_items_status_idx        ON approval_items (status, submitted_at DESC);
CREATE INDEX approval_items_org_idx           ON approval_items (submitter_org_id, status);
CREATE INDEX approval_items_reviewer_idx      ON approval_items (reviewer_user_id) WHERE reviewer_user_id IS NOT NULL;
```

### 3.11 Audit log (immutable)

Bentuk dari `hifi-auxiliary.jsx:511-535` (Audit Trail panel). Must be insert-only.

```sql
CREATE TABLE audit_log (
  id              bigserial PRIMARY KEY,
  actor_user_id   uuid REFERENCES users(id),       -- nullable for 'system' actions
  actor_label     text NOT NULL,                   -- 'citra@skkmigas', 'system'
  verb            text NOT NULL,                   -- 'approved', 'rejected', 'started review', 'commented', 'validated', 'downloaded', 'uploaded', 'published'
  target_type     text NOT NULL,                   -- 'dataset', 'approval', 'user', 'ai_query'
  target_id       text,                            -- references vary by type
  category        text NOT NULL,                   -- 'approval', 'ai_usage', 'data_access', 'config'
  detail          jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  ip_address      inet,
  user_agent      text
);

-- Append-only: revoke UPDATE/DELETE from app role
-- REVOKE UPDATE, DELETE ON audit_log FROM app_role;

CREATE INDEX audit_log_target_idx     ON audit_log (target_type, target_id, occurred_at DESC);
CREATE INDEX audit_log_actor_idx      ON audit_log (actor_user_id, occurred_at DESC);
CREATE INDEX audit_log_category_idx   ON audit_log (category, occurred_at DESC);
-- Partial index for fast "recent activity" feed (last 30 days, hot data)
CREATE INDEX audit_log_recent_idx     ON audit_log (occurred_at DESC) WHERE occurred_at > now() - interval '30 days';
```

### 3.12 Monitoring (pipelines + alerts)

Bentuk dari `hifi-pages.jsx:503-555`.

```sql
CREATE TABLE pipeline_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name        text NOT NULL,                   -- 'Harvest · WK Boundary'
  provider_org_id uuid REFERENCES organizations(id),
  status          pipeline_status NOT NULL DEFAULT 'idle',
  progress_pct    smallint NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  started_at      timestamptz,
  ended_at        timestamptz,
  duration_label  text,                            -- denormalized cache: '04:12', '12 min', '1 hr'
  log_uri         text                             -- s3://logs/<id>.log
);

CREATE INDEX pipeline_runs_status_idx     ON pipeline_runs (status, started_at DESC);
CREATE INDEX pipeline_runs_provider_idx   ON pipeline_runs (provider_org_id, started_at DESC);

CREATE TABLE alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity        alert_severity NOT NULL,
  title           text NOT NULL,
  source          text NOT NULL,                   -- 'Pipeline Network · PHE', 'System Health'
  related_pipeline_id uuid REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  related_dataset_id  text REFERENCES datasets(id) ON DELETE SET NULL,
  ack_by_user_id      uuid REFERENCES users(id),
  ack_at              timestamptz,
  resolved_by_user_id uuid REFERENCES users(id),
  resolved_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX alerts_unresolved_idx    ON alerts (created_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX alerts_severity_idx      ON alerts (severity, created_at DESC) WHERE resolved_at IS NULL;
```

### 3.13 Workspace (projects + tasks)

Bentuk dari `hifi-pages-2.jsx:841-987`.

```sql
CREATE TABLE projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  owner_user_id   uuid NOT NULL REFERENCES users(id),
  is_shared       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_owner_idx ON projects (owner_user_id, updated_at DESC);

CREATE TABLE project_members (
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission      text NOT NULL CHECK (permission IN ('viewer', 'editor', 'owner')),
  added_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX project_members_user_idx ON project_members (user_id);

CREATE TABLE project_datasets (
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  dataset_id      text NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  added_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, dataset_id)
);

CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title           text NOT NULL,
  status          task_status NOT NULL DEFAULT 'todo',
  priority        task_priority NOT NULL DEFAULT 'low',
  comment_count   integer NOT NULL DEFAULT 0,
  created_by      uuid NOT NULL REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_project_status_idx ON tasks (project_id, status);

CREATE TABLE task_assignees (
  task_id         uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);

CREATE INDEX task_assignees_user_idx ON task_assignees (user_id);
```

### 3.14 Apps marketplace

Bentuk dari `hifi-pages-2.jsx:993-1002`.

```sql
CREATE TABLE apps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL,
  category        text NOT NULL,                   -- 'Visualization', 'Analytics', ...
  vendor_org_id   uuid REFERENCES organizations(id),
  vendor_label    text NOT NULL,                   -- 'PHE Tech', 'AlasBuana', 'SPEKTRUM'
  icon            text NOT NULL,                   -- icon name from hifi-components.jsx __ICON_PATHS
  color_hex       text NOT NULL,
  rating          numeric(3,2) CHECK (rating BETWEEN 0 AND 5),
  install_count   integer NOT NULL DEFAULT 0,
  featured        boolean NOT NULL DEFAULT false,
  verified        boolean NOT NULL DEFAULT false,
  description     text,
  beta            boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX apps_category_idx  ON apps (category);
CREATE INDEX apps_featured_idx  ON apps (featured DESC, rating DESC);
```

### 3.15 AI sessions

Bentuk dari `prototype-app.jsx:1059-1090` (AiAssistant messages).

```sql
CREATE TABLE ai_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  context         jsonb NOT NULL DEFAULT '{}'::jsonb,   -- {page, datasetId}
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_active_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_sessions_user_idx ON ai_sessions (user_id, last_active_at DESC);

CREATE TABLE ai_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text NOT NULL,
  tokens_used     integer,
  latency_ms      integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_messages_session_idx ON ai_messages (session_id, created_at);
```

---

## 4. Row-level security (RLS)

Multi-tenant: KKKS Operator sees only datasets owned by their `org_id` plus
public datasets. Regulator sees everything. Public_analyst sees only `sensitivity='public'`.

```sql
-- Enable RLS
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_items ENABLE ROW LEVEL SECURITY;

-- Helper: current user context (set by API on each connection)
-- SET LOCAL ghanem.user_id = '<uuid>';
-- SET LOCAL ghanem.org_id  = '<uuid>';
-- SET LOCAL ghanem.role    = 'regulator';

CREATE POLICY datasets_select ON datasets FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    -- Regulator sees all
    current_setting('ghanem.role', true) IN ('regulator', 'compliance_officer')
    OR sensitivity = 'public'
    OR provider_id = current_setting('ghanem.org_id', true)::uuid
  )
);

CREATE POLICY datasets_modify ON datasets FOR ALL
USING (
  current_setting('ghanem.role', true) IN ('regulator')
  OR (
    current_setting('ghanem.role', true) = 'kkks_operator'
    AND provider_id = current_setting('ghanem.org_id', true)::uuid
  )
);

CREATE POLICY uploads_self ON upload_sessions FOR ALL
USING (
  current_setting('ghanem.role', true) = 'regulator'
  OR user_id = current_setting('ghanem.user_id', true)::uuid
);

CREATE POLICY approvals_visibility ON approval_items FOR SELECT
USING (
  current_setting('ghanem.role', true) IN ('regulator', 'compliance_officer')
  OR submitter_org_id = current_setting('ghanem.org_id', true)::uuid
);
```

---

## 5. Index strategy summary

| Pattern | Strategy |
|---|---|
| Spatial `WHERE ST_Intersects(bbox, …)` | GIST on `datasets.bbox` and `dataset_features.geom`, `wells.location` |
| Text search "title contains …" | trigram (`pg_trgm`) GIN on `datasets.title`, `description`. Production: route via Meilisearch index. |
| Filter by enum (status, kind, sensitivity) | btree on the enum column |
| Multi-tenant filter (`org_id`) | btree partial index `WHERE deleted_at IS NULL` for soft-deletes |
| Recent activity feed | partial btree index with `WHERE occurred_at > now() - interval 'X days'` (refresh periodically as materialized view if needed) |
| JSONB queries (feature properties) | GIN on `properties` |

### Why GIST and not SP-GIST / BRIN?

- **GIST**: standard PostGIS index. Supports `&&` (intersects bbox), `<->` (kNN), all spatial ops. Use for general-purpose spatial.
- **SP-GIST**: faster for point clouds (e.g., wells). Consider if `wells.location` table grows to > 1M rows.
- **BRIN**: only for very large append-only tables ordered by space (rare in OLTP). Not recommended here.

---

## 6. Seed data (10 sample datasets)

Untuk dev environment, seed langsung dari `CATALOG` prototype:

```sql
-- Seed organizations
INSERT INTO organizations (slug, name, initials, org_type, color_hex) VALUES
  ('skkmigas',     'SKK Migas',                'SM',  'regulator', '#2a5fb8'),
  ('phe-onwj',     'PHE ONWJ',                 'PH',  'kkks',      '#c2840d'),
  ('phm',          'Pertamina Hulu Mahakam',   'PHM', 'kkks',      '#1f8a4a'),
  ('pertamina-sub','Pertamina Subsurface',     'PSN', 'kkks',      '#2a5fb8'),
  ('medco',        'Medco E&P',                'ME',  'kkks',      '#2a5fb8'),
  ('harbour',      'Harbour Energy',           'HE',  'kkks',      '#7a5cb8'),
  ('premier',      'Premier Oil',              'PO',  'kkks',      '#cf3a2a');

-- Seed dataset wk-onwj (paste of prototype-app.jsx:9-36)
INSERT INTO datasets (id, title, kind, type, format_label, theme, description,
                      provider_id, is_verified, sensitivity, crs, bbox,
                      download_count, view_count, star_count)
SELECT
  'wk-onwj',
  'Working Area (WK) Boundary — ONWJ',
  'LAYER',
  'Administrative',
  'Vector · SHP, GeoJSON',
  'admin',
  'Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini.',
  o.id, true, 'internal', 'EPSG:4326',
  ST_MakeEnvelope(106.20, -6.55, 108.40, -5.45, 4326),
  128, 3247, 12
FROM organizations o WHERE o.slug = 'phe-onwj';

-- Seed its actual polygon feature
INSERT INTO dataset_features (dataset_id, geom)
VALUES (
  'wk-onwj',
  ST_GeomFromText(
    'POLYGON((106.20 -5.45, 108.20 -5.45, 108.40 -5.95, 108.35 -6.45, 107.85 -6.55, 107.20 -6.40, 106.55 -6.10, 106.20 -5.80, 106.20 -5.45))',
    4326
  )
);

-- (...repeat for: seismic-3d-nsumatra, well-loc, psc-rokan, pipeline-network, facility)
-- Full coordinates available in prototype-realmap.jsx:9-77
```

Lihat repo `apps/api/src/db/seed.ts` (akan di-create di Phase 7) untuk script
penuh yang mem-port semua 6 dataset dari prototype.

---

## 7. Migration strategy

- Tool: **Prisma Migrate** (Node) atau **Alembic** (Python).
- Convention: timestamp prefix (`20260601_001_init.sql`), append-only.
- Never edit existing migration; selalu create new migration untuk perubahan.
- **PostGIS extension** harus di-CREATE oleh `superuser` sebelum migration pertama; document di `apps/api/README.md`.
- Untuk Phase 11 (Testing), gunakan **test database snapshots** (`pg_dump`) — rebuild GIST index dari snapshot lebih cepat daripada re-seed.

---

## 8. Performance notes

1. **`bbox` di `datasets`** adalah denormalized cache dari `ST_Envelope(ST_Union(geom))` di `dataset_features`. Refresh via trigger on insert/update/delete di `dataset_features`.
2. **Aggregates** (`download_count`, `view_count`, `star_count`) update lewat trigger atau scheduled job (debounce 5 menit) — jangan inkrement langsung tiap request.
3. **Audit log** akan tumbuh cepat (estimate: 10K events/hari). Plan **partitioning by month** sejak day 1:
   ```sql
   CREATE TABLE audit_log (...) PARTITION BY RANGE (occurred_at);
   CREATE TABLE audit_log_2026_05 PARTITION OF audit_log FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
   ```
4. **Vacuum strategy**: enable autovacuum dengan `autovacuum_vacuum_scale_factor = 0.05` untuk `datasets`, `audit_log`, `pipeline_runs` (high churn).
5. **Connection pool**: app pakai **PgBouncer** transaction mode, target 200 concurrent app connections → 30 backend Postgres connections.
