-- Ghanem.one — PostgreSQL Initialization Script
-- Dijalankan sekali saat container pertama kali di-start (docker-entrypoint-initdb.d).
-- Jangan jalankan manual di production — gunakan Prisma migrations.

-- Aktifkan PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- pgcrypto dipakai untuk gen_random_uuid() di schema Prisma
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verifikasi PostGIS berhasil di-install
SELECT PostGIS_Version();
