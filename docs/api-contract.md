# API Contract — Ghanem.one

> **Status:** PROPOSED — ratify dengan backend team sebelum implementasi Phase 9.
>
> Dokumen ini diturunkan dari **UI prototype** (`prototype-app.jsx`, `hifi-*.jsx`).
> Setiap endpoint mencantumkan `derived from: path:line` agar mudah cross-check.
> Tidak ada endpoint yang invented — semua keluar dari data shape yang dikonsumsi UI.

OpenAPI 3.0 spec lengkap ada di [§ 12 OpenAPI 3.0 document](#12-openapi-30-document).
Section di atasnya adalah ringkasan + rationale untuk reviewer.

---

## 1. Conventions

- **Base URL:** `https://api.ghanem.one/v1`
- **Auth:** `Authorization: Bearer <jwt>` untuk semua endpoint kecuali `/auth/*`. Detail OIDC flow di [auth-flow.md](./auth-flow.md).
- **Format:** `application/json` (default), `application/geo+json` untuk endpoint geospasial yang mengembalikan FeatureCollection.
- **Pagination:** cursor-based — `?cursor=<opaque>&limit=20` (default 20, max 100). Response wraps `{ items, nextCursor, total }`.
- **Filtering:** query params (lihat per-endpoint).
- **Errors:** RFC 7807 (Problem Details). Lihat [§ 11 Error model](#11-error-model).
- **Rate limit:** per user (authenticated) 600 req/min; per IP (anonymous) 60 req/min. Response header `X-RateLimit-Remaining`.
- **Versioning:** URI versioning (`/v1`). Breaking changes → `/v2`. Deprecation: `Sunset` header (RFC 8594), minimum 90 hari.
- **Timestamps:** ISO 8601 UTC (`2024-08-09T10:48:00Z`).
- **CRS:** Semua geometry default `EPSG:4326` (WGS84 lon/lat). Endpoint yang return non-4326 wajib include `crs` field.
- **CORS:** `https://ghanem.one`, `https://*.ghanem.one`.

---

## 2. Resource map

```
/auth                   OIDC SSO + session
/users                  User profile & RBAC (Regulator/KKKS Operator/Public)
/datasets               Dataset CRUD (LAYER, VOLUME, DOC)
/datasets/:id/geojson   Geospatial export (PostGIS-backed)
/datasets/:id/quality   Quality scores
/datasets/:id/lineage   Source → connector → validated → published
/providers              Data providers (KKKS, SKK Migas, etc)
/categories             Theme categories (admin, well, seismic, …)
/search                 Cross-resource full-text + filter
/uploads                Multipart, chunked, resumable
/approvals              Approval queue (Regulator)
/audit                  Immutable audit log
/monitoring             Pipelines + alerts (WS for live)
/ai/ask                 Claude proxy (rate-limited, logged)
/seismic/:id/...        Volume metadata, horizons, cross-section
/workspace/projects     Personal projects + Kanban
/apps                   Marketplace
```

---

## 3. Datasets — primary resource

### Shape (canonical Dataset)

Direct mapping dari `CATALOG` di `prototype-app.jsx:8-141`:

```json
{
  "id": "wk-onwj",
  "title": "Working Area (WK) Boundary — ONWJ",
  "kind": "LAYER",
  "type": "Administrative",
  "format": "Vector · SHP, GeoJSON",
  "theme": "admin",
  "description": "Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini.",
  "provider": {
    "id": "phe-onwj",
    "name": "PHE ONWJ",
    "initials": "PH"
  },
  "verified": true,
  "stats": {
    "downloads": 128,
    "views": 3247,
    "stars": 12
  },
  "attributes": [
    { "key": "Total Area", "value": "13,978.45 km²" },
    { "key": "Status", "value": "Active" },
    { "key": "Operator", "value": "PHE ONWJ" },
    { "key": "Contract Start", "value": "2018-08-09" },
    { "key": "Contract End", "value": "2048-08-08" },
    { "key": "CRS", "value": "EPSG:4326" },
    { "key": "Geometry", "value": "MultiPolygon (1)" }
  ],
  "quality": [
    { "label": "Completeness", "score": 98 },
    { "label": "Positional accuracy", "score": 92 },
    { "label": "Attribute accuracy", "score": 88 },
    { "label": "Currency", "score": 85 },
    { "label": "Topology", "score": 96 }
  ],
  "crs": "EPSG:4326",
  "bbox": [106.20, -6.55, 108.40, -5.45],
  "sensitivity": "internal",
  "license": "internal-spektrum",
  "createdAt": "2024-08-09T00:00:00Z",
  "updatedAt": "2024-08-09T00:00:00Z",
  "lastValidatedAt": "2024-08-09T00:00:00Z"
}
```

### Enums

- `kind`: `LAYER` | `VOLUME` | `DOC` — derived from prototype-app.jsx:11,42,84 (and matching `kindColor` styling).
- `theme`: `admin` | `well` | `seismic` | `pipe` | `facility` | `doc` — full list di `THEMES` const, `prototype-app.jsx:143-150`.
- `sensitivity`: `public` | `internal` | `confidential` — derived from todolist.md Phase 10 §"Data sensitivity classification".
- `provider.initials`: 2–3 char code (see `hifi-components.jsx:150-155`).

### Endpoints

| Method | Path | Purpose | UI source |
|---|---|---|---|
| GET | `/datasets` | List + filter + paginate | `prototype-app.jsx:411-415` (filter logic) |
| GET | `/datasets/{id}` | Single dataset detail | `prototype-app.jsx:660` (PageDetail) |
| GET | `/datasets/{id}/geojson` | GeoJSON FeatureCollection (bounded by `?bbox=`) | `prototype-app.jsx:843` (API tab) |
| POST | `/datasets` | Create draft (KKKS only) | `hifi-auxiliary.jsx:159+` (HfUpload) |
| PATCH | `/datasets/{id}` | Update metadata (owner KKKS or Regulator) | implied by metadata step `hifi-auxiliary.jsx:189` |
| DELETE | `/datasets/{id}` | Soft-delete (Regulator only) | implied; not in UI |
| GET | `/datasets/{id}/quality` | Quality detail | `prototype-app.jsx:797-810` (Quality tab) |
| GET | `/datasets/{id}/lineage` | Lineage events | `prototype-app.jsx:815-836` (Lineage tab) |
| POST | `/datasets/{id}/star` | Star/unstar | implied; `d.stats[2]` is star count |
| POST | `/datasets/{id}/download` | Audit + signed-URL response | `hifi-pages.jsx:711` (Download button) |

### Query params (`GET /datasets`)

| Param | Type | Notes | Source |
|---|---|---|---|
| `q` | string | Full-text on title + type + provider + description | `prototype-app.jsx:411-415` |
| `theme` | string (repeatable) | Multi-select theme filter | `prototype-app.jsx:412` (`filters.themes` is a Set) |
| `kind` | enum | LAYER/VOLUME/DOC | sidebar Browse (`prototype-app.jsx:330-336`) |
| `provider` | string | provider id | sidebar provider list |
| `verified` | bool | `true` filters verified only | `d.verified` flag |
| `bbox` | string `"minLon,minLat,maxLon,maxLat"` | Spatial filter | implied by Map page coupling |
| `sort` | enum `relevance \| updated \| downloads` | Default `relevance` | `prototype-app.jsx:497` (Sort dropdown) |
| `cursor` | string | Pagination | conv. |
| `limit` | int | 1..100 (default 20) | conv. |

---

## 4. Providers & Categories

Static-ish reference data — small enough to cache aggressively (Redis 1h TTL).

### `GET /providers`

Returns list. Item shape (from `hifi-components.jsx:149-155`):

```json
{
  "id": "phm",
  "name": "Pertamina Hulu Mahakam",
  "initials": "PHM",
  "datasetCount": 245,
  "weight": 78,
  "colorToken": "var(--hf-green-500)"
}
```

`weight` adalah relative bar-fill di Dashboard top-providers chart (`hifi-pages.jsx:125-142`).

### `GET /categories`

Returns array of `{ id, label, color }`. Source: `prototype-app.jsx:143-150` and
`hifi-components.jsx:138-148`. Backend keeps the canonical list; UI does not
hard-code beyond initial bootstrap.

---

## 5. Search

### `GET /search`

Global cross-resource search (datasets + providers + documents). Source: TopNav
quick-search in `prototype-app.jsx:240-294`.

```
GET /search?q=onwj&limit=5
→ 200 OK
{
  "items": [
    { "type": "dataset", "id": "wk-onwj", "title": "…", "subtitle": "PHE ONWJ · Administrative", "kind": "LAYER" },
    { "type": "provider", "id": "phe-onwj", "title": "PHE ONWJ", "subtitle": "183 datasets" }
  ],
  "total": 12
}
```

Backend: Meilisearch atau Elasticsearch index. Index documents on dataset
create/update/delete (queue job).

---

## 6. Uploads (KKKS submission flow)

Lihat `hifi-auxiliary.jsx:159-378` (HfUpload). Wizard 6-step:
1. Pilih jenis data
2. Upload file (chunked, multiple files)
3. Metadata & attribute
4. Validasi otomatis
5. Review & submit
6. Approval SKK Migas (out-of-band, queue handled by `/approvals`)

### Endpoints

| Method | Path | Purpose | Source |
|---|---|---|---|
| POST | `/uploads/init` | Start session. Returns `uploadId`, chunk size, target URL. | `hifi-auxiliary.jsx:246` (dropzone) |
| PUT | `/uploads/{uploadId}/chunks/{n}` | Stream chunk (multipart, supports resume) | progress bar shape `hifi-auxiliary.jsx:264-291` |
| POST | `/uploads/{uploadId}/complete` | Finalize. Triggers async validation pipeline. | implied |
| POST | `/uploads/{uploadId}/abort` | Cancel | "Clear all" `hifi-auxiliary.jsx:258` |
| GET | `/uploads/{uploadId}/status` | Poll status (also pushed via WS `/monitoring`) | progress states `'Uploaded'`, `'Uploading'` line 264 |

Supported formats (from dropzone hint, `hifi-auxiliary.jsx:251`):
`SHP, GeoJSON, KML, SEG-Y, LAS, CSV, PDF, XLSX, GeoTIFF`. Max 5 GB per file.

### Validation outcomes

After `/uploads/{uploadId}/complete` the pipeline emits validation results.
Tokens used by Compliance UI (`hifi-auxiliary.jsx:392`):

| Status | Pill | Action |
|---|---|---|
| `ok` | green dot "OK" | Auto-publish if KKKS opts in, else queue |
| `warn` | amber dot "Warning" | Queue with warning flag |
| `err` | red dot "Failed" | Block submission; report to KKKS for fix |

Risk classification (`hifi-auxiliary.jsx:393`): `low` | `med` | `high` (high = urgent flag).

---

## 7. Approvals (Regulator workflow)

Lihat `hifi-auxiliary.jsx:383-541` (HfCompliance).

### `GET /approvals?status=pending|review|approved|rejected&kkks=<id>`

Returns queue items:

```json
{
  "id": "sub_abc123",
  "dataset": { "filename": "WK_Boundary_ONWJ_2024.shp", "type": "Layer" },
  "kkks": "PHE ONWJ",
  "submittedAt": "2024-09-21T08:00:00Z",
  "validation": "ok",
  "risk": "low",
  "urgent": true
}
```

### Actions

- `POST /approvals/{id}/approve` — body optional `{ note }`. Source: `hifi-auxiliary.jsx:471`.
- `POST /approvals/{id}/reject` — body `{ reason }`. Source: `hifi-auxiliary.jsx:473`.
- `POST /approvals/{id}/comment` — body `{ text }`. Used by reviewers. Implied by audit feed verbs `commented` (`hifi-auxiliary.jsx:519`).

### KPI aggregates (`GET /approvals/kpi?period=30d`)

```json
{
  "pendingReview": 14,
  "approvedCount": 186,
  "rejectedCount": 7,
  "avgApprovalHours": 57.6,
  "slaHours": 72,
  "complianceRate": 0.96
}
```

Source: KPI strip `hifi-auxiliary.jsx:415-420`.

### Compliance per KKKS

`GET /approvals/compliance-per-kkks?period=30d` → array `{ kkksId, kkksName, complianceScore (0-100), approved, pending, rejected, review }`.
Source: `hifi-auxiliary.jsx:487-503`.

---

## 8. Monitoring (real-time)

Lihat `hifi-pages.jsx:448-590` (HfMonitoring) dan KPI strip + pipeline table + alerts list.

### REST

| Method | Path | Purpose |
|---|---|---|
| GET | `/monitoring/kpi?period=24h` | System health, active jobs, failed, warnings, freshness |
| GET | `/monitoring/pipelines?status=ok\|warn\|err\|idle` | Active pipeline list (max 100) |
| GET | `/monitoring/alerts?cursor=…` | Paged alert log |
| POST | `/monitoring/alerts/{id}/ack` | Acknowledge alert |
| POST | `/monitoring/alerts/{id}/resolve` | Mark resolved with note |

### Shapes

Pipeline (from `hifi-pages.jsx:503-509`):

```json
{
  "id": "pipe_001",
  "job": "Harvest · WK Boundary",
  "provider": "PHE ONWJ",
  "status": "ok",
  "durationLabel": "04:12",
  "progress": 78,
  "startedAt": "2024-09-21T12:00:00Z"
}
```

Alert (from `hifi-pages.jsx:550-556`):

```json
{
  "id": "alert_001",
  "severity": "err",
  "title": "Pipeline harvest failed",
  "source": "Pipeline Network · PHE",
  "createdAt": "2024-09-21T12:44:00Z",
  "ackBy": null,
  "resolvedBy": null
}
```

### WebSocket: `WSS /monitoring/stream`

Authenticated WS endpoint. Server pushes JSON events:

```json
{ "type": "pipeline.update",  "data": { "id": "pipe_001", "status": "ok", "progress": 92 } }
{ "type": "alert.created",    "data": { …Alert } }
{ "type": "kpi.snapshot",     "data": { …KPIs } }
```

Heartbeat ping setiap 30 detik. Client harus reconnect on close dengan
exponential backoff.

---

## 9. AI Assistant (Claude proxy)

Lihat `prototype-app.jsx:1057-1200` (AiAssistant) — prototype memanggil
`window.claude.complete(prompt)` langsung. Production **wajib** proxy via backend
agar API key tidak bocor + audit log + rate limit.

### `POST /ai/ask`

Request:
```json
{
  "sessionId": "sess_abc",
  "context": {
    "page": "detail",
    "datasetId": "wk-onwj"
  },
  "messages": [
    { "role": "user", "content": "Berapa sumur aktif di area ini?" }
  ]
}
```

Response (streaming SSE atau JSON):
```json
{
  "reply": "Area ONWJ punya 23 sumur aktif berdasarkan data Q3 2024.",
  "tokensUsed": 142,
  "latencyMs": 820,
  "messageId": "msg_xyz"
}
```

Constraints:
- Rate limit: 30 req/min per user.
- Max response tokens: 800.
- Log full prompt + reply to `audit_log` table (lihat data-model.md) with `category='ai_usage'`.
- Refuse jika `context.datasetId` user tidak punya akses (RBAC check sebelum forward ke Claude).

### `GET /ai/sessions/{sessionId}`

History recall — last 50 messages. Used untuk pertahankan conversation saat user re-open AI panel.

---

## 10. Seismic (specialized subsurface)

Lihat `hifi-pages-2.jsx:283-394` (WellDetailsPanel) dan `:399-585` (SeismicCrossSection).

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/seismic/{datasetId}/metadata` | Inline range, Xline range, sample interval, bin size, phase |
| GET | `/seismic/{datasetId}/horizons` | List horizons dengan depth (TVDSS) |
| GET | `/seismic/{datasetId}/faults` | List faults (major/minor) |
| GET | `/seismic/{datasetId}/cross-section?wells=…&width=1100` | Pre-rendered SVG/PNG **atau** raw amplitude grid (decide Phase 9) |
| GET | `/seismic/{datasetId}/wells` | Wells intersecting volume |

Horizon shape (from `hifi-pages-2.jsx:374-380`):
```json
{ "id": "h_reservoir", "name": "Top Reservoir", "color": "#f0c419", "depthTvdss": 2650 }
```

Well shape (from `hifi-pages-2.jsx:309-318`):
```json
{
  "id": "GWN-01",
  "name": "GWN-01",
  "type": "Exploration",
  "operator": "PT. Ghanem Energy",
  "spudDate": "2022-01-12",
  "totalDepthM": 3250,
  "status": "Active",
  "tdDate": "2022-04-28",
  "field": "Ghanem Field",
  "formation": "Bekasap Formation",
  "reservoir": "Sandstone",
  "lastUpdatedAt": "2024-05-20T00:00:00Z",
  "location": { "lat": -5.85, "lng": 107.10 }
}
```

---

## 11. Workspace & Apps

### `GET /workspace/projects`

Lihat `hifi-pages-2.jsx:853-859`. Shape:

```json
{
  "id": "proj_sumut",
  "name": "Eksplorasi Sumatra Utara",
  "description": "Studi pra-eksplorasi cekungan Sumatra Utara — Q4 2024 / Q1 2025.",
  "datasetCount": 12,
  "members": [
    { "userId": "u_sm", "initials": "SM" },
    { "userId": "u_ar", "initials": "AR" }
  ],
  "isShared": false,
  "createdBy": "u_sm",
  "updatedAt": "2024-09-21T10:00:00Z"
}
```

Kanban tasks per project (from `hifi-pages-2.jsx:940-944`):

```json
{
  "id": "task_001",
  "projectId": "proj_sumut",
  "title": "Cek data seismik area Lhokseumawe",
  "status": "todo",
  "priority": "high",
  "assignees": ["u_sm", "u_ar"],
  "commentCount": 2,
  "createdAt": "…",
  "updatedAt": "…"
}
```

Status enum: `todo` | `in_progress` | `review` | `done` (from column labels `hifi-pages-2.jsx:940-944`).
Priority enum: `low` | `med` | `high` (only `high`/`med` rendered as pill in UI).

### `GET /apps` (marketplace)

Lihat `hifi-pages-2.jsx:993-1002`. Shape:

```json
{
  "id": "app_map_builder",
  "name": "Map Builder Studio",
  "category": "Authoring",
  "vendor": "AlasBuana",
  "icon": "layers",
  "colorHex": "#c2840d",
  "rating": 4.9,
  "installs": 12000,
  "featured": true,
  "verified": true
}
```

`GET /apps/{id}` returns extended info (description, screenshots, permissions).
`POST /apps/{id}/install` — body `{}` (no payload), idempotent. Returns updated install count.

---

## 12. Error model

All non-2xx responses use [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807):

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://api.ghanem.one/errors/dataset-validation-failed",
  "title": "Dataset gagal validasi",
  "status": 422,
  "detail": "Geometri WK_Boundary_ONWJ_2024.shp memiliki self-intersection di feature[7].",
  "instance": "/v1/uploads/up_abc/complete",
  "traceId": "01HZQ8…",
  "errors": [
    { "field": "geometry", "code": "TOPOLOGY_SELF_INTERSECT", "featureIndex": 7 }
  ]
}
```

### Common error codes

| HTTP | Code | When |
|---|---|---|
| 400 | `INVALID_QUERY` | Malformed param (bbox not 4 numbers, etc) |
| 401 | `UNAUTHENTICATED` | Missing/expired JWT |
| 403 | `FORBIDDEN_RBAC` | Authenticated but role lacks permission |
| 403 | `FORBIDDEN_SENSITIVITY` | Tried accessing confidential without clearance |
| 404 | `NOT_FOUND` | Resource missing or soft-deleted |
| 409 | `CONFLICT_VERSION` | Optimistic-lock fail (etag mismatch) |
| 413 | `PAYLOAD_TOO_LARGE` | Upload chunk > limit |
| 422 | `DATASET_VALIDATION_FAILED` | Topology/schema validation error |
| 422 | `METADATA_REQUIRED` | Mandatory field missing |
| 429 | `RATE_LIMITED` | Exceeded per-user or per-IP quota |
| 500 | `INTERNAL` | Generic server fault |
| 503 | `DEPENDENCY_DOWN` | PostGIS/Redis/Meili offline |

### Frontend mapping (from `prototype-app.jsx:1086-1088`)

User-friendly message untuk error: `"Maaf, saya tidak dapat memproses permintaan saat ini."`
For non-AI errors: pass `problem.title` to `ErrorState` component (`prototype-states.jsx:112`).

---

## 13. OpenAPI 3.0 document

```yaml
openapi: 3.0.3
info:
  title: Ghanem.one API
  description: |
    REST API untuk platform data geospasial hulu migas Indonesia.
    Status: PROPOSED — ratify before Phase 9.
  version: 1.0.0-draft
  contact:
    name: Ghanem.one Engineering
servers:
  - url: https://api.ghanem.one/v1
    description: Production
  - url: https://api.staging.ghanem.one/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Local dev

security:
  - bearerAuth: []

tags:
  - name: Auth
  - name: Users
  - name: Datasets
  - name: Providers
  - name: Categories
  - name: Search
  - name: Uploads
  - name: Approvals
  - name: Monitoring
  - name: AI
  - name: Seismic
  - name: Workspace
  - name: Apps

paths:

  /auth/oidc/login:
    get:
      tags: [Auth]
      summary: Initiate OIDC login (redirect to IdP)
      parameters:
        - { name: provider, in: query, required: true, schema: { type: string, enum: [skkmigas, pertamina, azure] } }
        - { name: redirect_uri, in: query, required: true, schema: { type: string, format: uri } }
      responses:
        '302': { description: Redirect to IdP authorize endpoint }
      security: []

  /auth/oidc/callback:
    get:
      tags: [Auth]
      summary: OIDC callback — exchange code → session
      parameters:
        - { name: code, in: query, required: true, schema: { type: string } }
        - { name: state, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          description: Session created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Session' }
        '401': { $ref: '#/components/responses/Unauthorized' }
      security: []

  /auth/logout:
    post:
      tags: [Auth]
      summary: Revoke session
      responses:
        '204': { description: Logged out }

  /users/me:
    get:
      tags: [Users]
      summary: Current user profile
      responses:
        '200':
          content: { application/json: { schema: { $ref: '#/components/schemas/User' } } }

  /datasets:
    get:
      tags: [Datasets]
      summary: List datasets with filter + pagination
      parameters:
        - { name: q, in: query, schema: { type: string } }
        - { name: theme, in: query, style: form, explode: true, schema: { type: array, items: { type: string } } }
        - { name: kind, in: query, schema: { type: string, enum: [LAYER, VOLUME, DOC] } }
        - { name: provider, in: query, schema: { type: string } }
        - { name: verified, in: query, schema: { type: boolean } }
        - { name: bbox, in: query, description: "minLon,minLat,maxLon,maxLat", schema: { type: string } }
        - { name: sort, in: query, schema: { type: string, enum: [relevance, updated, downloads], default: relevance } }
        - { name: cursor, in: query, schema: { type: string } }
        - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  items: { type: array, items: { $ref: '#/components/schemas/Dataset' } }
                  nextCursor: { type: string, nullable: true }
                  total: { type: integer }
    post:
      tags: [Datasets]
      summary: Create dataset draft (KKKS Operator)
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/DatasetCreate' }
      responses:
        '201':
          content: { application/json: { schema: { $ref: '#/components/schemas/Dataset' } } }
        '403': { $ref: '#/components/responses/Forbidden' }

  /datasets/{id}:
    parameters:
      - { name: id, in: path, required: true, schema: { type: string } }
    get:
      tags: [Datasets]
      responses:
        '200': { content: { application/json: { schema: { $ref: '#/components/schemas/Dataset' } } } }
        '404': { $ref: '#/components/responses/NotFound' }
    patch:
      tags: [Datasets]
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/DatasetUpdate' }
      responses:
        '200': { content: { application/json: { schema: { $ref: '#/components/schemas/Dataset' } } } }
    delete:
      tags: [Datasets]
      responses:
        '204': { description: Soft-deleted }
        '403': { $ref: '#/components/responses/Forbidden' }

  /datasets/{id}/geojson:
    parameters:
      - { name: id, in: path, required: true, schema: { type: string } }
      - { name: bbox, in: query, schema: { type: string } }
      - { name: simplify, in: query, description: "Douglas-Peucker tolerance in degrees", schema: { type: number } }
    get:
      tags: [Datasets]
      summary: Get GeoJSON FeatureCollection
      responses:
        '200':
          content:
            application/geo+json:
              schema: { type: object, description: "RFC 7946 FeatureCollection" }

  /datasets/{id}/quality:
    parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
    get:
      tags: [Datasets]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/QualityScore' } }

  /datasets/{id}/lineage:
    parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
    get:
      tags: [Datasets]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/LineageEvent' }

  /providers:
    get:
      tags: [Providers]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/Provider' } }

  /categories:
    get:
      tags: [Categories]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/Category' } }

  /search:
    get:
      tags: [Search]
      parameters:
        - { name: q, in: query, required: true, schema: { type: string } }
        - { name: limit, in: query, schema: { type: integer, default: 10 } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  items: { type: array, items: { $ref: '#/components/schemas/SearchHit' } }
                  total: { type: integer }

  /uploads/init:
    post:
      tags: [Uploads]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                filename: { type: string }
                sizeBytes: { type: integer, format: int64 }
                contentType: { type: string }
                kind: { type: string, enum: [LAYER, VOLUME, DOC] }
              required: [filename, sizeBytes]
      responses:
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  uploadId: { type: string }
                  chunkSizeBytes: { type: integer }
                  expiresAt: { type: string, format: date-time }

  /uploads/{uploadId}/chunks/{n}:
    parameters:
      - { name: uploadId, in: path, required: true, schema: { type: string } }
      - { name: n, in: path, required: true, schema: { type: integer } }
    put:
      tags: [Uploads]
      requestBody:
        required: true
        content:
          application/octet-stream:
            schema: { type: string, format: binary }
      responses:
        '204': { description: Chunk accepted }
        '413': { $ref: '#/components/responses/PayloadTooLarge' }

  /uploads/{uploadId}/complete:
    parameters: [{ name: uploadId, in: path, required: true, schema: { type: string } }]
    post:
      tags: [Uploads]
      responses:
        '202':
          description: Validation pipeline queued
          content:
            application/json:
              schema:
                type: object
                properties:
                  datasetId: { type: string }
                  approvalId: { type: string }

  /approvals:
    get:
      tags: [Approvals]
      parameters:
        - { name: status, in: query, schema: { type: string, enum: [pending, review, approved, rejected] } }
        - { name: kkks, in: query, schema: { type: string } }
        - { name: cursor, in: query, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  items: { type: array, items: { $ref: '#/components/schemas/ApprovalItem' } }
                  nextCursor: { type: string, nullable: true }

  /approvals/{id}/approve:
    parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
    post:
      tags: [Approvals]
      requestBody:
        content:
          application/json:
            schema: { type: object, properties: { note: { type: string } } }
      responses:
        '200': { content: { application/json: { schema: { $ref: '#/components/schemas/ApprovalItem' } } } }
        '403': { $ref: '#/components/responses/Forbidden' }

  /approvals/{id}/reject:
    parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
    post:
      tags: [Approvals]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties: { reason: { type: string } }
              required: [reason]
      responses:
        '200': { content: { application/json: { schema: { $ref: '#/components/schemas/ApprovalItem' } } } }

  /approvals/kpi:
    get:
      tags: [Approvals]
      parameters: [{ name: period, in: query, schema: { type: string, default: 30d } }]
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApprovalKpi' }

  /monitoring/kpi:
    get:
      tags: [Monitoring]
      parameters: [{ name: period, in: query, schema: { type: string, default: 24h } }]
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/MonitoringKpi' }

  /monitoring/pipelines:
    get:
      tags: [Monitoring]
      parameters:
        - { name: status, in: query, schema: { type: string, enum: [ok, warn, err, idle] } }
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/Pipeline' } }

  /monitoring/alerts:
    get:
      tags: [Monitoring]
      parameters: [{ name: cursor, in: query, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  items: { type: array, items: { $ref: '#/components/schemas/Alert' } }
                  nextCursor: { type: string, nullable: true }

  /ai/ask:
    post:
      tags: [AI]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/AiAskRequest' }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AiAskResponse' }
            text/event-stream:
              schema: { type: string, description: "SSE stream of partial replies" }
        '429': { $ref: '#/components/responses/RateLimited' }

  /seismic/{datasetId}/metadata:
    parameters: [{ name: datasetId, in: path, required: true, schema: { type: string } }]
    get:
      tags: [Seismic]
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SeismicMetadata' }

  /seismic/{datasetId}/horizons:
    parameters: [{ name: datasetId, in: path, required: true, schema: { type: string } }]
    get:
      tags: [Seismic]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/Horizon' } }

  /seismic/{datasetId}/cross-section:
    parameters:
      - { name: datasetId, in: path, required: true, schema: { type: string } }
      - { name: wells, in: query, style: form, explode: false, schema: { type: array, items: { type: string } } }
      - { name: width, in: query, schema: { type: integer, default: 1100 } }
    get:
      tags: [Seismic]
      responses:
        '200':
          content:
            image/png: { schema: { type: string, format: binary } }
            application/json:
              schema: { $ref: '#/components/schemas/CrossSection' }

  /workspace/projects:
    get:
      tags: [Workspace]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/Project' } }
    post:
      tags: [Workspace]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
                description: { type: string }
              required: [name]
      responses:
        '201': { content: { application/json: { schema: { $ref: '#/components/schemas/Project' } } } }

  /workspace/projects/{projectId}/tasks:
    parameters: [{ name: projectId, in: path, required: true, schema: { type: string } }]
    get:
      tags: [Workspace]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/Task' } }
    post:
      tags: [Workspace]
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/TaskCreate' }
      responses:
        '201': { content: { application/json: { schema: { $ref: '#/components/schemas/Task' } } } }

  /apps:
    get:
      tags: [Apps]
      parameters:
        - { name: category, in: query, schema: { type: string } }
        - { name: q, in: query, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/App' } }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  responses:
    Unauthorized:
      description: Missing/invalid token
      content: { application/problem+json: { schema: { $ref: '#/components/schemas/Problem' } } }
    Forbidden:
      description: RBAC denial
      content: { application/problem+json: { schema: { $ref: '#/components/schemas/Problem' } } }
    NotFound:
      description: Resource not found
      content: { application/problem+json: { schema: { $ref: '#/components/schemas/Problem' } } }
    PayloadTooLarge:
      description: Chunk too large
      content: { application/problem+json: { schema: { $ref: '#/components/schemas/Problem' } } }
    RateLimited:
      description: Quota exceeded
      headers:
        X-RateLimit-Remaining: { schema: { type: integer } }
        Retry-After: { schema: { type: integer, description: seconds } }
      content: { application/problem+json: { schema: { $ref: '#/components/schemas/Problem' } } }

  schemas:
    Problem:
      type: object
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        instance: { type: string }
        traceId: { type: string }
        errors:
          type: array
          items:
            type: object
            properties:
              field: { type: string }
              code: { type: string }

    Session:
      type: object
      properties:
        accessToken: { type: string, description: JWT }
        refreshToken: { type: string }
        expiresAt: { type: string, format: date-time }
        user: { $ref: '#/components/schemas/User' }

    User:
      type: object
      properties:
        id: { type: string }
        email: { type: string, format: email }
        name: { type: string }
        initials: { type: string, maxLength: 3 }
        org: { type: string, description: "e.g., 'SKK Migas' or 'PHE ONWJ'" }
        orgId: { type: string }
        role: { type: string, enum: [regulator, compliance_officer, kkks_operator, public_analyst] }
        createdAt: { type: string, format: date-time }

    Dataset:
      type: object
      required: [id, title, kind, type, format, theme, provider, verified, stats, attributes, quality, crs, sensitivity, createdAt, updatedAt]
      properties:
        id: { type: string }
        title: { type: string }
        kind: { type: string, enum: [LAYER, VOLUME, DOC] }
        type: { type: string, description: "e.g., Administrative, Seismic, Well & Drilling" }
        format: { type: string, description: "Human-readable, e.g., 'Vector · SHP, GeoJSON'" }
        theme: { type: string, enum: [admin, well, seismic, pipe, facility, doc] }
        description: { type: string }
        provider: { $ref: '#/components/schemas/Provider' }
        verified: { type: boolean }
        stats: { $ref: '#/components/schemas/DatasetStats' }
        attributes:
          type: array
          items:
            type: object
            properties:
              key: { type: string }
              value: { type: string }
        quality:
          type: array
          items: { $ref: '#/components/schemas/QualityScore' }
        crs: { type: string, example: "EPSG:4326" }
        bbox:
          type: array
          minItems: 4
          maxItems: 4
          items: { type: number }
          description: "[minLon, minLat, maxLon, maxLat] (4326)"
        sensitivity: { type: string, enum: [public, internal, confidential] }
        license: { type: string }
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }
        lastValidatedAt: { type: string, format: date-time, nullable: true }

    DatasetCreate:
      type: object
      required: [title, kind, type, theme]
      properties:
        title: { type: string }
        kind: { type: string, enum: [LAYER, VOLUME, DOC] }
        type: { type: string }
        theme: { type: string }
        description: { type: string }
        sensitivity: { type: string, enum: [public, internal, confidential], default: internal }

    DatasetUpdate:
      type: object
      properties:
        title: { type: string }
        description: { type: string }
        sensitivity: { type: string, enum: [public, internal, confidential] }
        attributes:
          type: array
          items:
            type: object
            properties:
              key: { type: string }
              value: { type: string }

    DatasetStats:
      type: object
      properties:
        downloads: { type: integer }
        views: { type: integer }
        stars: { type: integer }

    QualityScore:
      type: object
      properties:
        label: { type: string, example: Completeness }
        score: { type: integer, minimum: 0, maximum: 100 }
        threshold: { type: string, enum: [excellent, good, warn, fail], description: "Computed from score" }

    LineageEvent:
      type: object
      properties:
        step: { type: string, enum: [source, connector, validated, published] }
        label: { type: string }
        actor: { type: string }
        at: { type: string, format: date-time }

    Provider:
      type: object
      required: [id, name, initials, datasetCount]
      properties:
        id: { type: string }
        name: { type: string }
        initials: { type: string, maxLength: 3 }
        datasetCount: { type: integer }
        weight: { type: integer, description: "0-100, relative bar size" }

    Category:
      type: object
      properties:
        id: { type: string }
        label: { type: string }
        color: { type: string, description: "CSS color or token name" }

    SearchHit:
      type: object
      properties:
        type: { type: string, enum: [dataset, provider, app, document] }
        id: { type: string }
        title: { type: string }
        subtitle: { type: string }
        kind: { type: string, nullable: true }

    ApprovalItem:
      type: object
      properties:
        id: { type: string }
        dataset:
          type: object
          properties:
            id: { type: string, nullable: true }
            filename: { type: string }
            type: { type: string }
        kkks: { type: string }
        submittedAt: { type: string, format: date-time }
        validation: { type: string, enum: [ok, warn, err] }
        risk: { type: string, enum: [low, med, high] }
        urgent: { type: boolean }
        status: { type: string, enum: [pending, review, approved, rejected] }
        reviewerId: { type: string, nullable: true }
        decidedAt: { type: string, format: date-time, nullable: true }

    ApprovalKpi:
      type: object
      properties:
        pendingReview: { type: integer }
        approvedCount: { type: integer }
        rejectedCount: { type: integer }
        avgApprovalHours: { type: number }
        slaHours: { type: number }
        complianceRate: { type: number, minimum: 0, maximum: 1 }

    MonitoringKpi:
      type: object
      properties:
        systemHealth: { type: number, description: "0-1, e.g., 0.984" }
        activeJobs: { type: integer }
        runningJobs: { type: integer }
        queuedJobs: { type: integer }
        failed24h: { type: integer }
        warnings24h: { type: integer }
        dataFreshnessMinutes: { type: integer }

    Pipeline:
      type: object
      properties:
        id: { type: string }
        job: { type: string }
        provider: { type: string }
        status: { type: string, enum: [ok, warn, err, idle] }
        durationLabel: { type: string }
        progress: { type: integer, minimum: 0, maximum: 100 }
        startedAt: { type: string, format: date-time, nullable: true }

    Alert:
      type: object
      properties:
        id: { type: string }
        severity: { type: string, enum: [ok, warn, err] }
        title: { type: string }
        source: { type: string }
        createdAt: { type: string, format: date-time }
        ackBy: { type: string, nullable: true }
        resolvedBy: { type: string, nullable: true }

    AiAskRequest:
      type: object
      required: [sessionId, messages]
      properties:
        sessionId: { type: string }
        context:
          type: object
          properties:
            page: { type: string }
            datasetId: { type: string }
        messages:
          type: array
          items:
            type: object
            properties:
              role: { type: string, enum: [user, assistant] }
              content: { type: string }

    AiAskResponse:
      type: object
      properties:
        reply: { type: string }
        messageId: { type: string }
        tokensUsed: { type: integer }
        latencyMs: { type: integer }

    SeismicMetadata:
      type: object
      properties:
        surveyName: { type: string, example: SUMATRA_3D_VOL_01 }
        type: { type: string, example: 3D Seismic }
        inlineRange: { type: string, example: "1001 – 1850" }
        xlineRange: { type: string, example: "2001 – 2850" }
        sampleIntervalMs: { type: number, example: 2 }
        binSize: { type: string, example: "12.5m × 12.5m" }
        verticalRangeMs: { type: string, example: "0 – 8000" }
        phase: { type: string, example: "Full Stack" }

    Horizon:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        color: { type: string }
        depthTvdss: { type: number }

    CrossSection:
      type: object
      properties:
        width: { type: integer }
        height: { type: integer }
        wells:
          type: array
          items:
            type: object
            properties:
              id: { type: string }
              xRatio: { type: number, minimum: 0, maximum: 1 }
        horizons:
          type: array
          items: { $ref: '#/components/schemas/Horizon' }

    Project:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        description: { type: string }
        datasetCount: { type: integer }
        members:
          type: array
          items:
            type: object
            properties:
              userId: { type: string }
              initials: { type: string }
        isShared: { type: boolean }
        createdBy: { type: string }
        updatedAt: { type: string, format: date-time }

    Task:
      type: object
      properties:
        id: { type: string }
        projectId: { type: string }
        title: { type: string }
        status: { type: string, enum: [todo, in_progress, review, done] }
        priority: { type: string, enum: [low, med, high] }
        assignees: { type: array, items: { type: string } }
        commentCount: { type: integer }
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }

    TaskCreate:
      type: object
      required: [title]
      properties:
        title: { type: string }
        status: { type: string, enum: [todo, in_progress, review, done], default: todo }
        priority: { type: string, enum: [low, med, high], default: low }
        assignees: { type: array, items: { type: string } }

    App:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        category: { type: string }
        vendor: { type: string }
        icon: { type: string }
        colorHex: { type: string }
        rating: { type: number, minimum: 0, maximum: 5 }
        installs: { type: integer }
        featured: { type: boolean }
        verified: { type: boolean }
```

---

## 14. Coverage check vs UI

| UI Page | File | Endpoint(s) covered |
|---|---|---|
| Explore Data list + sidebar | `prototype-app.jsx:395-575` | GET /datasets, /providers, /categories, /search |
| Detail Dataset (tabs) | `prototype-app.jsx:658-854` | GET /datasets/:id, .../quality, .../lineage, .../geojson |
| Map page + layers | `prototype-app.jsx:859-1052` | GET /datasets, /datasets/:id/geojson |
| AI Assistant (pill+chat) | `prototype-app.jsx:1057-1200` | POST /ai/ask, GET /ai/sessions/:id |
| Dashboard | `hifi-pages.jsx:6-219` | GET /datasets aggregates, /providers, /monitoring/kpi |
| Monitoring | `hifi-pages.jsx:448-590` | GET /monitoring/*, WS /monitoring/stream |
| Compliance / Approvals | `hifi-auxiliary.jsx:383-541` | GET /approvals, POST /approvals/:id/{approve,reject}, /audit |
| Upload wizard | `hifi-auxiliary.jsx:159-378` | POST /uploads/* |
| Workspace + Kanban | `hifi-pages-2.jsx:841-987` | GET/POST /workspace/projects, /tasks |
| Analytics | `hifi-pages-2.jsx:590-840` | GET /datasets, derived analytics (Phase 9 — likely client-computed initially) |
| Apps marketplace | `hifi-pages-2.jsx:992-1136` | GET /apps |
| Seismic cross-section | `hifi-pages-2.jsx:283-585` | GET /seismic/:id/{metadata,horizons,faults,wells,cross-section} |
| Login + SSO | `hifi-auxiliary.jsx:6-154` | GET /auth/oidc/login, /callback (see auth-flow.md) |

100% of UI-needed endpoints have a corresponding entry above.
