-- =============================================================================
-- Migration: add-geospatial-tables (GIS extras)
-- Sprint 9.1 — Ghanem.one Spatial Intelligence Platform
-- Owner: gis-agent
--
-- This migration runs AFTER 20260527000000_init which creates all base tables
-- and GIST indexes (via backend-agent + gis-agent coordination).
--
-- This file adds the PostGIS extras that Prisma cannot generate:
--   1. SRID CHECK constraints on all geometry columns (init only added work_areas)
--   2. Topology validation + auto-repair trigger
--   3. pg_trgm extension + full-text GIN index on datasets.title
--   4. BRIN index on datasets.created_at (time-series optimization)
--
-- Run: npx prisma migrate deploy
-- Or directly: npm run prisma:migrate:geo (uses prisma db execute)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SRID CHECK constraints — init migration only added work_areas constraint.
--    Enforce SRID=4326 on all remaining geometry columns.
-- ---------------------------------------------------------------------------
ALTER TABLE "wells"
  DROP CONSTRAINT IF EXISTS "wells_srid_check";
ALTER TABLE "wells"
  ADD CONSTRAINT "wells_srid_check"
  CHECK (point IS NULL OR ST_SRID("point") = 4326);

ALTER TABLE "pipelines"
  DROP CONSTRAINT IF EXISTS "pipelines_srid_check";
ALTER TABLE "pipelines"
  ADD CONSTRAINT "pipelines_srid_check"
  CHECK (line IS NULL OR ST_SRID("line") = 4326);

ALTER TABLE "facilities"
  DROP CONSTRAINT IF EXISTS "facilities_srid_check";
ALTER TABLE "facilities"
  ADD CONSTRAINT "facilities_srid_check"
  CHECK (point IS NULL OR ST_SRID("point") = 4326);

ALTER TABLE "datasets"
  DROP CONSTRAINT IF EXISTS "datasets_srid_check";
ALTER TABLE "datasets"
  ADD CONSTRAINT "datasets_srid_check"
  CHECK (bbox IS NULL OR ST_SRID("bbox") = 4326);

ALTER TABLE "seismic_coverages"
  DROP CONSTRAINT IF EXISTS "seismic_coverages_srid_check";
ALTER TABLE "seismic_coverages"
  ADD CONSTRAINT "seismic_coverages_srid_check"
  CHECK (area IS NULL OR ST_SRID("area") = 4326);

-- ---------------------------------------------------------------------------
-- 2. Topology validation and auto-repair trigger
--    ST_IsValid check on every INSERT/UPDATE of geometry columns.
--    On failure: attempt ST_MakeValid. If still invalid, set NULL and log.
--    NOTICE messages appear in pg_log for monitoring.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_and_repair_geometry()
RETURNS TRIGGER AS $$
DECLARE
  v_col   TEXT;
  v_geom  GEOMETRY;
  v_fixed GEOMETRY;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'work_areas'        THEN v_col := 'geometry'; v_geom := NEW.geometry;
    WHEN 'wells'             THEN v_col := 'point';    v_geom := NEW.point;
    WHEN 'pipelines'         THEN v_col := 'line';     v_geom := NEW.line;
    WHEN 'facilities'        THEN v_col := 'point';    v_geom := NEW.point;
    WHEN 'datasets'          THEN v_col := 'bbox';     v_geom := NEW.bbox;
    WHEN 'seismic_coverages' THEN v_col := 'area';     v_geom := NEW.area;
    ELSE RETURN NEW;
  END CASE;

  IF v_geom IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT ST_IsValid(v_geom) THEN
    v_fixed := ST_MakeValid(v_geom);
    IF v_fixed IS NOT NULL AND ST_IsValid(v_fixed) THEN
      CASE v_col
        WHEN 'geometry' THEN NEW.geometry := v_fixed;
        WHEN 'point'    THEN NEW.point    := v_fixed;
        WHEN 'line'     THEN NEW.line     := v_fixed;
        WHEN 'bbox'     THEN NEW.bbox     := v_fixed;
        WHEN 'area'     THEN NEW.area     := v_fixed;
      END CASE;
      RAISE NOTICE 'TOPOLOGY_REPAIRED table=% id=% col=%', TG_TABLE_NAME, NEW.id, v_col;
    ELSE
      RAISE WARNING 'TOPOLOGY_INVALID_UNFIXABLE table=% id=% col=% geometry set NULL',
        TG_TABLE_NAME, NEW.id, v_col;
      CASE v_col
        WHEN 'geometry' THEN NEW.geometry := NULL;
        WHEN 'point'    THEN NEW.point    := NULL;
        WHEN 'line'     THEN NEW.line     := NULL;
        WHEN 'bbox'     THEN NEW.bbox     := NULL;
        WHEN 'area'     THEN NEW.area     := NULL;
      END CASE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER "work_areas_geom_validate"
    BEFORE INSERT OR UPDATE OF geometry ON "work_areas"
    FOR EACH ROW EXECUTE FUNCTION validate_and_repair_geometry();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "wells_geom_validate"
    BEFORE INSERT OR UPDATE OF point ON "wells"
    FOR EACH ROW EXECUTE FUNCTION validate_and_repair_geometry();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "pipelines_geom_validate"
    BEFORE INSERT OR UPDATE OF line ON "pipelines"
    FOR EACH ROW EXECUTE FUNCTION validate_and_repair_geometry();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "facilities_geom_validate"
    BEFORE INSERT OR UPDATE OF point ON "facilities"
    FOR EACH ROW EXECUTE FUNCTION validate_and_repair_geometry();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "datasets_geom_validate"
    BEFORE INSERT OR UPDATE OF bbox ON "datasets"
    FOR EACH ROW EXECUTE FUNCTION validate_and_repair_geometry();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "seismic_coverages_geom_validate"
    BEFORE INSERT OR UPDATE OF area ON "seismic_coverages"
    FOR EACH ROW EXECUTE FUNCTION validate_and_repair_geometry();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Full-text search infrastructure on datasets
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on tsvector of title for fast @@ operator queries
CREATE INDEX IF NOT EXISTS "datasets_title_tsvector_gin"
  ON "datasets" USING GIN (to_tsvector('english', "title"));

-- Trigram index on title for ILIKE / similarity queries
CREATE INDEX IF NOT EXISTS "datasets_title_trgm_gin"
  ON "datasets" USING GIN ("title" gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 4. BRIN index on time-series columns (100-1000x smaller than B-tree)
--    Effective for append-mostly tables with sequential timestamps.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "datasets_created_at_brin"
  ON "datasets" USING BRIN ("created_at");

CREATE INDEX IF NOT EXISTS "datasets_published_at_brin"
  ON "datasets" USING BRIN ("published_at");

CREATE INDEX IF NOT EXISTS "seismic_coverages_survey_year_brin"
  ON "seismic_coverages" USING BRIN ("survey_year");
