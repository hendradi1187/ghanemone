-- =============================================================================
-- Migration: add-sprint-9-5-tables
-- Sprint 9.5 — Workspace (Projects + Tasks) + Monitoring (PipelineRuns + Alerts)
-- Owner: backend-agent
--
-- Adds:
--   1. Enums: ProjectStatus, TaskStatus, TaskPriority
--   2. Tables: projects, tasks
--   3. Enums: MonitoringPipelineType, PipelineRunStatus, AlertSeverity
--   4. Tables: pipeline_runs, alerts
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enums — Workspace domain (idempotent via DO blocks)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MED', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. Enums — Monitoring domain (idempotent)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "MonitoringPipelineType" AS ENUM ('INGESTION', 'VALIDATION', 'TRANSFORM', 'EXPORT', 'INDEXING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PipelineRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 3. projects table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "projects" (
  "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"            TEXT        NOT NULL,
  "slug"            TEXT        NOT NULL,
  "description"     TEXT,
  "status"          "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  "color"           TEXT,
  "owner_id"        UUID        NOT NULL,
  "organization_id" UUID        NOT NULL,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "projects_slug_key" UNIQUE ("slug"),
  CONSTRAINT "projects_owner_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "projects_org_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "projects_owner_id_idx"        ON "projects" ("owner_id");
CREATE INDEX "projects_organization_id_idx" ON "projects" ("organization_id");
CREATE INDEX "projects_status_idx"          ON "projects" ("status");

-- ---------------------------------------------------------------------------
-- 4. tasks table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "tasks" (
  "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
  "project_id"  UUID          NOT NULL,
  "title"       TEXT          NOT NULL,
  "description" TEXT,
  "status"      "TaskStatus"  NOT NULL DEFAULT 'TODO',
  "priority"    "TaskPriority" NOT NULL DEFAULT 'MED',
  "assignee_id" UUID,
  "due_date"    TIMESTAMPTZ,
  "order"       INTEGER       NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updated_at"  TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT "tasks_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "tasks_project_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tasks_assignee_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "tasks_project_id_idx"  ON "tasks" ("project_id");
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" ("assignee_id");
CREATE INDEX "tasks_status_idx"      ON "tasks" ("status");

-- ---------------------------------------------------------------------------
-- 5. pipeline_runs table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pipeline_runs" (
  "id"              UUID                     NOT NULL DEFAULT gen_random_uuid(),
  "name"            TEXT                     NOT NULL,
  "type"            "MonitoringPipelineType" NOT NULL,
  "status"          "PipelineRunStatus"      NOT NULL,
  "started_at"      TIMESTAMPTZ              NOT NULL,
  "finished_at"     TIMESTAMPTZ,
  "duration_ms"     INTEGER,
  "record_count"    INTEGER,
  "error_message"   TEXT,
  "dataset_id"      UUID,
  "organization_id" UUID                     NOT NULL,
  "metadata"        JSONB,
  "created_at"      TIMESTAMPTZ              NOT NULL DEFAULT now(),

  CONSTRAINT "pipeline_runs_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "pipeline_runs_dataset_fk" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "pipeline_runs_org_fk"  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "pipeline_runs_organization_id_idx" ON "pipeline_runs" ("organization_id");
CREATE INDEX "pipeline_runs_dataset_id_idx"      ON "pipeline_runs" ("dataset_id");
CREATE INDEX "pipeline_runs_status_idx"          ON "pipeline_runs" ("status");
CREATE INDEX "pipeline_runs_started_at_idx"      ON "pipeline_runs" ("started_at");

-- ---------------------------------------------------------------------------
-- 6. alerts table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "alerts" (
  "id"                 UUID            NOT NULL DEFAULT gen_random_uuid(),
  "severity"           "AlertSeverity" NOT NULL,
  "title"              TEXT            NOT NULL,
  "message"            TEXT            NOT NULL,
  "source"             TEXT            NOT NULL,
  "source_id"          TEXT,
  "acknowledged"       BOOLEAN         NOT NULL DEFAULT false,
  "acknowledged_at"    TIMESTAMPTZ,
  "acknowledged_by_id" UUID,
  "metadata"           JSONB,
  "created_at"         TIMESTAMPTZ     NOT NULL DEFAULT now(),

  CONSTRAINT "alerts_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "alerts_ack_by_fk" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "alerts_acknowledged_idx" ON "alerts" ("acknowledged");
CREATE INDEX "alerts_severity_idx"     ON "alerts" ("severity");
CREATE INDEX "alerts_created_at_idx"   ON "alerts" ("created_at");
