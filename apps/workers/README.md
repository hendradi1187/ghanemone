# @ghanem/workers — Python Spatial Workers

Spatial processing workers untuk Ghanem.one. Consume BullMQ jobs (Redis-backed) dari
NestJS API, process file SEG-Y / SHP / KML / raster, write hasil ke PostGIS + MinIO.

Reference: [ADR 0001 — Backend Framework Hybrid](../../docs/decisions/0001-backend-framework-hybrid.md).

## Tooling

- **Python 3.12** + **Poetry** untuk dependency management.
- Spatial libs: `segyio`, `GDAL`, `geopandas`, `rasterio`, `shapely`, `fiona`, `pyproj`.
- Queue: `bullmq` (Python client) atau direct Redis `BRPOPLPUSH` jika kompatibilitas
  versi bermasalah.
- DB: `SQLAlchemy 2.x` + `GeoAlchemy2` untuk akses PostGIS (read-only via reflection
  schema yang di-source dari Prisma).

## Layout

```
apps/workers/
├── pyproject.toml          Poetry manifest + ruff/mypy/pytest config
├── src/ghanem_workers/     Package utama
│   ├── __init__.py
│   └── main.py             Entrypoint — `poetry run ghanem-worker`
└── tests/                  Pytest suites (akan diisi di Phase 9 W3-4)
```

## Quick start (akan berlaku setelah dev VM ready, Phase 7 W2)

```bash
cd apps/workers
poetry install
poetry run ghanem-worker
```

## Turborepo integration

Workers di-orchestrate via Turborepo dengan npm script wrapper di `package.json`.
Berikut mapping:

| `npm run <task>` (root) | Actual command |
|---|---|
| `npm run dev` (turbo dev) | `poetry run ghanem-worker` |
| `npm run lint`            | `poetry run ruff check src tests` |
| `npm run type-check`      | `poetry run mypy src` |
| `npm run test`            | `poetry run pytest` |
| `npm run build`           | `poetry build` |

## CI integration

GitHub Actions workflow di `.github/workflows/ci.yml` install Python + Poetry,
restore cache `~/.cache/pip` + `~/.cache/pypoetry`, dan jalankan task di atas.

## Catatan deployment

- Container image: `python:3.12-slim` base, install GDAL system package via apt
  (`gdal-bin libgdal-dev`), Poetry install --without dev.
- Deployment target: dedicated worker VMs di prod (2× 32c/64G per hardware sizing),
  bukan k3s pod.
