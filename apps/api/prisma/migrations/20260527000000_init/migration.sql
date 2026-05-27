-- =============================================================================
-- Migration: init
-- Sprint 9.1 — Ghanem.one Spatial Intelligence Platform
-- Owner: backend-agent (core tables) + gis-agent (geometry columns + GIS extras)
--
-- Creates ALL tables for Sprint 9.1 in execution order.
-- GIS extras (SRID constraints, topology validation trigger, FTS indexes)
-- are added in the NEXT migration: 20260528000000_add-geospatial-tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions (idempotent)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ---------------------------------------------------------------------------
-- 1. Enums — §BA domain
-- ---------------------------------------------------------------------------
CREATE TYPE "UserRole"          AS ENUM ('ADMIN', 'REGULATOR', 'KKKS_OPERATOR', 'ANALYST', 'PUBLIC');
CREATE TYPE "UserStatus"        AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
CREATE TYPE "OrganizationType"  AS ENUM ('REGULATOR', 'KKKS', 'CONTRACTOR', 'PUBLIC');

-- ---------------------------------------------------------------------------
-- 2. Enums — §GIS domain
-- ---------------------------------------------------------------------------
CREATE TYPE "WorkAreaStatus"  AS ENUM ('ACTIVE', 'EXPIRED', 'PENDING', 'TERMINATED');
CREATE TYPE "WellType"        AS ENUM ('EXPLORATION', 'APPRAISAL', 'DEVELOPMENT', 'PRODUCTION', 'INJECTION');
CREATE TYPE "WellStatus"      AS ENUM ('ACTIVE', 'ABANDONED', 'SUSPENDED', 'PLANNED');
CREATE TYPE "PipelineType"    AS ENUM ('OIL', 'GAS', 'MULTIPHASE', 'WATER', 'CONDENSATE');
CREATE TYPE "PipelineStatus"  AS ENUM ('ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'PLANNED');
CREATE TYPE "FacilityType"    AS ENUM ('PLATFORM', 'FPSO', 'REFINERY', 'STORAGE_TANK', 'COMPRESSOR_STATION', 'PROCESSING_PLANT', 'SUBSEA_MANIFOLD', 'METERING_STATION');
CREATE TYPE "FacilityStatus"  AS ENUM ('ACTIVE', 'STANDBY', 'DECOMMISSIONED', 'UNDER_CONSTRUCTION');
CREATE TYPE "DatasetCategory" AS ENUM ('SEISMIC', 'WELL_LOG', 'PRODUCTION', 'CONCESSION', 'GEOLOGY', 'DOCUMENT', 'INFRASTRUCTURE');
CREATE TYPE "SensitivityLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');
CREATE TYPE "DatasetStatus"   AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- ---------------------------------------------------------------------------
-- 3. Core identity tables (backend-agent)
-- ---------------------------------------------------------------------------

-- organizations
CREATE TABLE "organizations" (
    "id"         UUID               NOT NULL DEFAULT gen_random_uuid(),
    "name"       TEXT               NOT NULL,
    "slug"       TEXT               NOT NULL,
    "type"       "OrganizationType" NOT NULL,
    "logo_url"   TEXT,
    "created_at" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE        INDEX "organizations_slug_idx" ON "organizations"("slug");

-- users
CREATE TABLE "users" (
    "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
    "email"           TEXT          NOT NULL,
    "password_hash"   TEXT          NOT NULL,
    "name"            TEXT          NOT NULL,
    "role"            "UserRole"    NOT NULL DEFAULT 'ANALYST',
    "organization_id" UUID          NOT NULL,
    "status"          "UserStatus"  NOT NULL DEFAULT 'ACTIVE',
    "last_login_at"   TIMESTAMP(3),
    "created_at"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key"           ON "users"("email");
CREATE        INDEX "users_email_idx"           ON "users"("email");
CREATE        INDEX "users_organization_id_idx" ON "users"("organization_id");
ALTER TABLE "users"
    ADD CONSTRAINT "users_organization_id_fkey"
        FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- sessions
CREATE TABLE "sessions" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "user_id"       UUID         NOT NULL,
    "refresh_token" TEXT         NOT NULL,
    "user_agent"    TEXT,
    "ip_address"    TEXT,
    "expires_at"    TIMESTAMP(3) NOT NULL,
    "revoked_at"    TIMESTAMP(3),
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");
CREATE        INDEX "sessions_user_id_idx"        ON "sessions"("user_id");
CREATE        INDEX "sessions_refresh_token_idx"  ON "sessions"("refresh_token");
ALTER TABLE "sessions"
    ADD CONSTRAINT "sessions_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;

-- audit_logs
CREATE TABLE "audit_logs" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "user_id"     UUID,
    "action"      TEXT         NOT NULL,
    "entity"      TEXT,
    "entity_id"   TEXT,
    "metadata"    JSONB,
    "ip_address"  TEXT,
    "user_agent"  TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_user_id_idx"          ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");
CREATE INDEX "audit_logs_created_at_idx"       ON "audit_logs"("created_at");
ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

-- IMMUTABLE audit_logs trigger
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only: % is forbidden.', TG_OP
        USING ERRCODE = '23514';
    RETURN NULL;
END;
$$;
CREATE TRIGGER "audit_log_immutable"
    BEFORE UPDATE OR DELETE ON "audit_logs"
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- updated_at helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE TRIGGER "organizations_set_updated_at"
    BEFORE UPDATE ON "organizations"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER "users_set_updated_at"
    BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. GIS tables (gis-agent)
-- ---------------------------------------------------------------------------

-- work_areas
CREATE TABLE "work_areas" (
    "id"             UUID              NOT NULL DEFAULT gen_random_uuid(),
    "slug"           TEXT              NOT NULL,
    "name"           TEXT              NOT NULL,
    "operator"       TEXT              NOT NULL,
    "contract_start" TIMESTAMP(3)      NOT NULL,
    "contract_end"   TIMESTAMP(3)      NOT NULL,
    "status"         "WorkAreaStatus"  NOT NULL DEFAULT 'ACTIVE',
    "color"          TEXT,
    "bbox_json"      JSONB,
    "center_lat"     DOUBLE PRECISION,
    "center_lon"     DOUBLE PRECISION,
    "total_area_km2" DOUBLE PRECISION,
    "created_at"     TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "work_areas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "work_areas_slug_key"  ON "work_areas"("slug");
CREATE UNIQUE INDEX "work_areas_name_key"  ON "work_areas"("name");
CREATE        INDEX "work_areas_operator_idx" ON "work_areas"("operator");
CREATE        INDEX "work_areas_status_idx"   ON "work_areas"("status");
CREATE        INDEX "work_areas_slug_idx"     ON "work_areas"("slug");

SELECT AddGeometryColumn('public', 'work_areas', 'geometry', 4326, 'POLYGON', 2);
CREATE INDEX "work_areas_geometry_gist" ON "work_areas" USING GIST ("geometry");
ALTER TABLE "work_areas" ADD CONSTRAINT "work_areas_geometry_srid_check"
    CHECK ("geometry" IS NULL OR ST_SRID("geometry") = 4326);

CREATE TRIGGER "work_areas_set_updated_at"
    BEFORE UPDATE ON "work_areas"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- wells
CREATE TABLE "wells" (
    "id"             UUID          NOT NULL DEFAULT gen_random_uuid(),
    "uwi"            TEXT,
    "name"           TEXT          NOT NULL,
    "operator"       TEXT          NOT NULL,
    "work_area_id"   UUID,
    "type"           "WellType"    NOT NULL,
    "status"         "WellStatus"  NOT NULL DEFAULT 'ACTIVE',
    "latitude"       DOUBLE PRECISION NOT NULL,
    "longitude"      DOUBLE PRECISION NOT NULL,
    "total_depth_m"  DOUBLE PRECISION,
    "spud_date"      TIMESTAMP(3),
    "td_date"        TIMESTAMP(3),
    "kb_elevation_m" DOUBLE PRECISION,
    "formation"      TEXT,
    "reservoir"      TEXT,
    "created_at"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wells_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "wells_uwi_key"          ON "wells"("uwi");
CREATE        INDEX "wells_work_area_id_idx" ON "wells"("work_area_id");
CREATE        INDEX "wells_operator_idx"     ON "wells"("operator");
CREATE        INDEX "wells_status_idx"       ON "wells"("status");
CREATE        INDEX "wells_type_idx"         ON "wells"("type");
ALTER TABLE "wells"
    ADD CONSTRAINT "wells_work_area_id_fkey"
        FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

SELECT AddGeometryColumn('public', 'wells', 'point', 4326, 'POINT', 2);
CREATE INDEX "wells_point_gist" ON "wells" USING GIST ("point");

CREATE OR REPLACE FUNCTION sync_well_point()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$;
CREATE TRIGGER "wells_sync_point"
    BEFORE INSERT OR UPDATE OF latitude, longitude ON "wells"
    FOR EACH ROW EXECUTE FUNCTION sync_well_point();

CREATE TRIGGER "wells_set_updated_at"
    BEFORE UPDATE ON "wells"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- pipelines
CREATE TABLE "pipelines" (
    "id"            UUID             NOT NULL DEFAULT gen_random_uuid(),
    "name"          TEXT             NOT NULL,
    "operator"      TEXT             NOT NULL,
    "work_area_id"  UUID,
    "type"          "PipelineType"   NOT NULL,
    "status"        "PipelineStatus" NOT NULL DEFAULT 'ACTIVE',
    "length_km"     DOUBLE PRECISION,
    "diameter_in"   DOUBLE PRECISION,
    "pressure_bar"  DOUBLE PRECISION,
    "created_at"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pipelines_work_area_id_idx" ON "pipelines"("work_area_id");
CREATE INDEX "pipelines_operator_idx"     ON "pipelines"("operator");
CREATE INDEX "pipelines_status_idx"       ON "pipelines"("status");
ALTER TABLE "pipelines"
    ADD CONSTRAINT "pipelines_work_area_id_fkey"
        FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

SELECT AddGeometryColumn('public', 'pipelines', 'line', 4326, 'LINESTRING', 2);
CREATE INDEX "pipelines_line_gist" ON "pipelines" USING GIST ("line");

CREATE TRIGGER "pipelines_set_updated_at"
    BEFORE UPDATE ON "pipelines"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- facilities
CREATE TABLE "facilities" (
    "id"            UUID             NOT NULL DEFAULT gen_random_uuid(),
    "name"          TEXT             NOT NULL,
    "type"          "FacilityType"   NOT NULL,
    "operator"      TEXT             NOT NULL,
    "work_area_id"  UUID,
    "latitude"      DOUBLE PRECISION NOT NULL,
    "longitude"     DOUBLE PRECISION NOT NULL,
    "status"        "FacilityStatus" NOT NULL DEFAULT 'ACTIVE',
    "water_depth_m" DOUBLE PRECISION,
    "install_year"  INTEGER,
    "created_at"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "facilities_work_area_id_idx" ON "facilities"("work_area_id");
CREATE INDEX "facilities_operator_idx"     ON "facilities"("operator");
CREATE INDEX "facilities_type_idx"         ON "facilities"("type");
CREATE INDEX "facilities_status_idx"       ON "facilities"("status");
ALTER TABLE "facilities"
    ADD CONSTRAINT "facilities_work_area_id_fkey"
        FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

SELECT AddGeometryColumn('public', 'facilities', 'point', 4326, 'POINT', 2);
CREATE INDEX "facilities_point_gist" ON "facilities" USING GIST ("point");

CREATE OR REPLACE FUNCTION sync_facility_point()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$;
CREATE TRIGGER "facilities_sync_point"
    BEFORE INSERT OR UPDATE OF latitude, longitude ON "facilities"
    FOR EACH ROW EXECUTE FUNCTION sync_facility_point();

CREATE TRIGGER "facilities_set_updated_at"
    BEFORE UPDATE ON "facilities"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- datasets
CREATE TABLE "datasets" (
    "id"                UUID              NOT NULL DEFAULT gen_random_uuid(),
    "title"             TEXT              NOT NULL,
    "description"       TEXT,
    "category"          "DatasetCategory" NOT NULL,
    "format"            TEXT              NOT NULL,
    "sensitivity_level" "SensitivityLevel" NOT NULL DEFAULT 'INTERNAL',
    "status"            "DatasetStatus"   NOT NULL DEFAULT 'DRAFT',
    "verified"          BOOLEAN           NOT NULL DEFAULT false,
    "file_url"          TEXT,
    "file_size_bytes"   BIGINT,
    "bbox_json"         JSONB,
    "center_lat"        DOUBLE PRECISION,
    "center_lon"        DOUBLE PRECISION,
    "work_area_id"      UUID,
    "uploader_id"       UUID,
    "organization_id"   UUID,
    "data_quality"      JSONB,
    "metadata"          JSONB,
    "year"              INTEGER,
    "survey_year"       INTEGER,
    "download_count"    INTEGER           NOT NULL DEFAULT 0,
    "view_count"        INTEGER           NOT NULL DEFAULT 0,
    "created_at"        TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at"      TIMESTAMP(3),
    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "datasets_category_idx"        ON "datasets"("category");
CREATE INDEX "datasets_status_idx"          ON "datasets"("status");
CREATE INDEX "datasets_work_area_id_idx"    ON "datasets"("work_area_id");
CREATE INDEX "datasets_uploader_id_idx"     ON "datasets"("uploader_id");
CREATE INDEX "datasets_organization_id_idx" ON "datasets"("organization_id");
CREATE INDEX "datasets_verified_idx"        ON "datasets"("verified");
CREATE INDEX "datasets_year_idx"            ON "datasets"("year");
ALTER TABLE "datasets"
    ADD CONSTRAINT "datasets_work_area_id_fkey"
        FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "datasets"
    ADD CONSTRAINT "datasets_uploader_id_fkey"
        FOREIGN KEY ("uploader_id") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "datasets"
    ADD CONSTRAINT "datasets_organization_id_fkey"
        FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

SELECT AddGeometryColumn('public', 'datasets', 'bbox', 4326, 'POLYGON', 2);
CREATE INDEX "datasets_bbox_gist" ON "datasets" USING GIST ("bbox");

CREATE TRIGGER "datasets_set_updated_at"
    BEFORE UPDATE ON "datasets"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- seismic_coverages
CREATE TABLE "seismic_coverages" (
    "id"                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"                TEXT         NOT NULL,
    "survey_year"         INTEGER      NOT NULL,
    "survey_type"         TEXT         NOT NULL,
    "operator"            TEXT         NOT NULL,
    "bbox_json"           JSONB,
    "area_km2"            DOUBLE PRECISION,
    "bandwidth"           TEXT,
    "acquisition_method"  TEXT,
    "processing_vendor"   TEXT,
    "work_area_id"        UUID,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seismic_coverages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "seismic_coverages_work_area_id_idx" ON "seismic_coverages"("work_area_id");
CREATE INDEX "seismic_coverages_survey_year_idx"  ON "seismic_coverages"("survey_year");
CREATE INDEX "seismic_coverages_survey_type_idx"  ON "seismic_coverages"("survey_type");
CREATE INDEX "seismic_coverages_operator_idx"     ON "seismic_coverages"("operator");
ALTER TABLE "seismic_coverages"
    ADD CONSTRAINT "seismic_coverages_work_area_id_fkey"
        FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

SELECT AddGeometryColumn('public', 'seismic_coverages', 'area', 4326, 'POLYGON', 2);
CREATE INDEX "seismic_coverages_area_gist" ON "seismic_coverages" USING GIST ("area");

CREATE TRIGGER "seismic_coverages_set_updated_at"
    BEFORE UPDATE ON "seismic_coverages"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
