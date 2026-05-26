# ADR 0001 — Backend Framework: Hybrid (NestJS + Python Workers)

**Status:** Accepted
**Date:** 2026-05-19
**Decision maker:** Hendra Dinata (hendra@pm.ghanemtech.co.id)
**Context:** Phase 7 — Tech Stack Selection

## Konteks

Ghanem.one membutuhkan backend yang melayani:
1. **REST APIs** untuk dataset CRUD, auth, search, RBAC — workload IO-bound, banyak request kecil
2. **Heavy spatial processing** — SEG-Y file reading (gigabytes), SHP/KML import, raster tiling, topology validation — workload CPU-bound

Ekosistem library terbaik untuk masing-masing workload berbeda:
- IO-bound: Node.js / NestJS (async non-blocking, mature middleware)
- Spatial: Python (segyio, GDAL via Fiona, geopandas, rasterio — semua native Python, library JS jauh tertinggal)

## Keputusan

**Hybrid architecture:**
- **NestJS (Node.js + TypeScript)** untuk REST API layer, auth, business logic, websocket gateway
- **Python workers** untuk spatial processing — consume jobs dari BullMQ queue
- **Shared database** PostgreSQL + PostGIS, accessed via Prisma (NestJS) dan SQLAlchemy (Python)
- **Queue:** BullMQ (Redis-backed), NestJS enqueues, Python workers dequeue via `bullmq-python` atau direct Redis BRPOPLPUSH

## Alternatif yang Dipertimbangkan

| Alternatif | Pro | Kontra | Kenapa Tidak |
|---|---|---|---|
| **NestJS only** | Single language, tim FE bisa kontribusi BE | Library spatial Node.js tertinggal jauh (no equivalent of segyio, geopandas) | SEG-Y processing akan jadi nightmare maintain |
| **FastAPI only** | Ideal untuk spatial workload | Context switch antara FE (TS) ↔ BE (Python) tinggi, async OIDC tooling kurang mature | API surface area besar (40+ endpoints) akan butuh banyak boilerplate di Python |
| **Hybrid** ✅ | Best tool per job: NestJS untuk API ergonomics, Python untuk spatial libs | Operational complexity (2 runtimes, 2 deployment pipelines) | Acceptable cost — spatial workload jelas terisolasi di queue workers |

## Konsekuensi

### Positive
- API development cepat dengan NestJS decorators + class-validator + Swagger auto-gen
- Spatial library access penuh: segyio, GDAL/OGR, geopandas, rasterio, scipy
- Workers bisa scaling independent dari API (CPU-heavy bisa scale horizontal)
- Tim FE (TypeScript) bisa kontribusi NestJS layer tanpa belajar Python

### Negative
- 2 runtime environments di-deploy (Node.js + Python)
- Shared types harus sync manual antara NestJS DTOs (Zod/class-validator) dan Python Pydantic models — atau pakai OpenAPI spec sebagai contract dan generate client di sisi Python
- Monorepo structure: `apps/api/` (NestJS), `apps/workers/` (Python), `packages/types/` (TS) + `packages/types-py/` (Python via codegen dari OpenAPI)
- DB migrations harus single-sourced (Prisma migrate jalankan, SQLAlchemy reflect)

### Migration Plan
- Phase 9 Week 1-2: NestJS scaffold + auth + simple CRUD endpoints
- Phase 9 Week 3-4: Python worker scaffold + first job (SHP import) end-to-end
- Phase 9 Week 5-6: SEG-Y + raster tiling workers
- Phase 9 Week 7-8: Polish, monitoring, queue dashboards

## Implementation Notes

- Single source of truth untuk DB schema: Prisma. Python pakai `sqlalchemy.orm.declarative_base` dengan reflection atau manual mirror dari Prisma schema
- Shared error codes via OpenAPI spec
- Auth: JWT verified di NestJS sebelum enqueue job. Workers tidak verify auth — trust queue contents (workers tidak public-exposed)
- Logging: structured JSON ke stdout, aggregated via Loki

## References

- Backend agent definition: [.claude/agents/backend-agent.md](../../.claude/agents/backend-agent.md)
- GIS agent definition: [.claude/agents/gis-agent.md](../../.claude/agents/gis-agent.md)
- Phase 9 timeline: [todolist.md](../../todolist.md)
