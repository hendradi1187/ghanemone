/**
 * Prisma seed script — Ghanem.one development seed data.
 * Run: npx prisma db seed
 *
 * Seeds:
 *   - 10 organizations (1 REGULATOR + 8 KKKS + 1 contractor)
 *   - 4 users (admin, regulator, kkks_operator, analyst)
 *   [Sprint 9.5 additions]
 *   - 4 projects (3 ACTIVE + 1 ARCHIVED)
 *   - 12 tasks distributed across statuses
 *   - 18 pipeline runs across last 7 days
 *   - 7 alerts (mixed severity)
 *
 * All passwords: "Demo123!" (bcrypt-hashed)
 *
 * IMPORTANT: This script is IDEMPOTENT — re-running will not create duplicates.
 * It uses upsert on unique fields (email, slug, name).
 */

import {
  AlertSeverity,
  MonitoringPipelineType,
  OrganizationType,
  PipelineRunStatus,
  PrismaClient,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo123!';
const BCRYPT_ROUNDS = 10;

interface OrgSeed {
  name: string;
  slug: string;
  type: OrganizationType;
}

const ORGANIZATIONS: OrgSeed[] = [
  { name: 'SKK Migas', slug: 'skk-migas', type: OrganizationType.REGULATOR },
  { name: 'PHE ONWJ', slug: 'phe-onwj', type: OrganizationType.KKKS },
  { name: 'Pertamina Hulu Mahakam', slug: 'pertamina-hulu-mahakam', type: OrganizationType.KKKS },
  { name: 'Medco E&P', slug: 'medco-ep', type: OrganizationType.KKKS },
  { name: 'PT Pertamina Hulu Saka (PSN)', slug: 'psn', type: OrganizationType.KKKS },
  { name: 'Harbour Energy Indonesia', slug: 'harbour-energy', type: OrganizationType.KKKS },
  { name: 'Premier Oil Indonesia', slug: 'premier-oil', type: OrganizationType.KKKS },
  { name: 'Pertamina Hulu Rokan', slug: 'pertamina-hulu-rokan', type: OrganizationType.KKKS },
  { name: 'VICO Indonesia', slug: 'vico-indonesia', type: OrganizationType.KKKS },
  { name: 'Ghanem Tech', slug: 'ghanemtech', type: OrganizationType.CONTRACTOR },
];

interface UserSeed {
  email: string;
  name: string;
  role: UserRole;
  orgSlug: string;
}

const USERS: UserSeed[] = [
  {
    email: 'admin@ghanemtech.co.id',
    name: 'Admin Ghanem',
    role: UserRole.ADMIN,
    orgSlug: 'ghanemtech',
  },
  {
    email: 'regulator@skkmigas.go.id',
    name: 'Regulator SKK Migas',
    role: UserRole.REGULATOR,
    orgSlug: 'skk-migas',
  },
  {
    email: 'operator@phe-onwj.co.id',
    name: 'Operator PHE ONWJ',
    role: UserRole.KKKS_OPERATOR,
    orgSlug: 'phe-onwj',
  },
  {
    email: 'analyst@ghanemtech.co.id',
    name: 'Analyst Ghanem',
    role: UserRole.ANALYST,
    orgSlug: 'ghanemtech',
  },
];

// ---------------------------------------------------------------------------
// Sprint 9.5 — Projects seed data
// ---------------------------------------------------------------------------
interface ProjectSeed {
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  color: string;
  ownerEmail: string;
  orgSlug: string;
}

const PROJECTS: ProjectSeed[] = [
  {
    name: 'Q1 2026 Compliance Audit',
    slug: 'q1-2026-compliance-audit',
    description: 'Quarterly compliance audit for all active KKKS operators covering data submission requirements.',
    status: ProjectStatus.ACTIVE,
    color: '#2a5fb8',
    ownerEmail: 'admin@ghanemtech.co.id',
    orgSlug: 'ghanemtech',
  },
  {
    name: 'Data Pipeline Refactor',
    slug: 'data-pipeline-refactor',
    description: 'Refactor the data ingestion pipeline to support new SEG-Y v2 format and improve throughput by 40%.',
    status: ProjectStatus.ACTIVE,
    color: '#1f8a4a',
    ownerEmail: 'admin@ghanemtech.co.id',
    orgSlug: 'ghanemtech',
  },
  {
    name: 'KKKS Onboarding Q2',
    slug: 'kkks-onboarding-q2',
    description: 'Onboarding 3 new KKKS operators to the Ghanem.one platform in Q2 2026.',
    status: ProjectStatus.ACTIVE,
    color: '#c2840d',
    ownerEmail: 'admin@ghanemtech.co.id',
    orgSlug: 'ghanemtech',
  },
  {
    name: 'Archived Legacy Migration',
    slug: 'archived-legacy-migration',
    description: 'Migration of legacy datasets from the old on-premise system. Completed Q4 2025.',
    status: ProjectStatus.ARCHIVED,
    color: '#5b667e',
    ownerEmail: 'admin@ghanemtech.co.id',
    orgSlug: 'ghanemtech',
  },
];

// ---------------------------------------------------------------------------
// Sprint 9.5 — Tasks seed data (keyed by project slug)
// ---------------------------------------------------------------------------
interface TaskSeed {
  projectSlug: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
}

const TASKS: TaskSeed[] = [
  // Q1 2026 Compliance Audit
  {
    projectSlug: 'q1-2026-compliance-audit',
    title: 'Collect PHE ONWJ Q1 submission documents',
    description: 'Request and collect all mandatory Q1 submission documents from PHE ONWJ coordinator.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    order: 0,
  },
  {
    projectSlug: 'q1-2026-compliance-audit',
    title: 'Validate Medco E&P dataset completeness',
    status: TaskStatus.TODO,
    priority: TaskPriority.MED,
    order: 1,
  },
  {
    projectSlug: 'q1-2026-compliance-audit',
    title: 'Review SKK Migas audit checklist',
    description: 'Cross-reference submitted data against the official SKK Migas 2026 checklist.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    order: 0,
  },
  {
    projectSlug: 'q1-2026-compliance-audit',
    title: 'Generate compliance summary report',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.HIGH,
    order: 0,
  },
  {
    projectSlug: 'q1-2026-compliance-audit',
    title: 'Archive Q4 2025 audit documents',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    order: 0,
  },
  // Data Pipeline Refactor
  {
    projectSlug: 'data-pipeline-refactor',
    title: 'Research SEG-Y v2 spec changes',
    description: 'Review SEG-Y v2 specification document and identify breaking changes.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    order: 0,
  },
  {
    projectSlug: 'data-pipeline-refactor',
    title: 'Implement SEG-Y v2 reader in Python worker',
    description: 'Update the segyio-based reader to handle v2 extended trace headers.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    order: 0,
  },
  {
    projectSlug: 'data-pipeline-refactor',
    title: 'Write integration tests for new pipeline',
    status: TaskStatus.TODO,
    priority: TaskPriority.MED,
    order: 0,
  },
  // KKKS Onboarding Q2
  {
    projectSlug: 'kkks-onboarding-q2',
    title: 'Prepare onboarding documentation for Harbour Energy',
    status: TaskStatus.TODO,
    priority: TaskPriority.MED,
    order: 0,
  },
  {
    projectSlug: 'kkks-onboarding-q2',
    title: 'Schedule kickoff meeting with Premier Oil',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    order: 0,
  },
  {
    projectSlug: 'kkks-onboarding-q2',
    title: 'Configure SSO integration for new operators',
    description: 'Set up OIDC config for 3 new operator organizations.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    order: 0,
  },
  {
    projectSlug: 'kkks-onboarding-q2',
    title: 'Review user access levels for onboarded operators',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.MED,
    order: 0,
  },
];

// ---------------------------------------------------------------------------
// Sprint 9.5 — PipelineRuns seed data
// ---------------------------------------------------------------------------
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

interface PipelineRunSeed {
  name: string;
  type: MonitoringPipelineType;
  status: PipelineRunStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  recordCount: number | null;
  errorMessage: string | null;
  orgSlug: string;
}

const PIPELINE_RUNS: PipelineRunSeed[] = [
  {
    name: 'Daily Ingestion — PHE ONWJ',
    type: MonitoringPipelineType.INGESTION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(0),
    finishedAt: new Date(Date.now() - 25 * 60 * 1000),
    durationMs: 1500000,
    recordCount: 2450,
    errorMessage: null,
    orgSlug: 'phe-onwj',
  },
  {
    name: 'Daily Ingestion — Pertamina Hulu Mahakam',
    type: MonitoringPipelineType.INGESTION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(0),
    finishedAt: new Date(Date.now() - 20 * 60 * 1000),
    durationMs: 1200000,
    recordCount: 1850,
    errorMessage: null,
    orgSlug: 'pertamina-hulu-mahakam',
  },
  {
    name: 'Validation — Mahakam Wells Update',
    type: MonitoringPipelineType.VALIDATION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(1),
    finishedAt: new Date(daysAgo(1).getTime() + 8 * 60 * 1000),
    durationMs: 480000,
    recordCount: 25,
    errorMessage: null,
    orgSlug: 'pertamina-hulu-mahakam',
  },
  {
    name: 'Validation — Medco E&P Seismic Data',
    type: MonitoringPipelineType.VALIDATION,
    status: PipelineRunStatus.FAILED,
    startedAt: daysAgo(1),
    finishedAt: new Date(daysAgo(1).getTime() + 3 * 60 * 1000),
    durationMs: 180000,
    recordCount: null,
    errorMessage: 'Schema validation failed: missing mandatory SEGY trace headers (TRACL, TRACR)',
    orgSlug: 'medco-ep',
  },
  {
    name: 'Transform — ONWJ Seismic 3D to GeoTIFF',
    type: MonitoringPipelineType.TRANSFORM,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(2),
    finishedAt: new Date(daysAgo(2).getTime() + 45 * 60 * 1000),
    durationMs: 2700000,
    recordCount: 1,
    errorMessage: null,
    orgSlug: 'phe-onwj',
  },
  {
    name: 'Export — SKK Migas Monthly Report',
    type: MonitoringPipelineType.EXPORT,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(2),
    finishedAt: new Date(daysAgo(2).getTime() + 12 * 60 * 1000),
    durationMs: 720000,
    recordCount: 45,
    errorMessage: null,
    orgSlug: 'skk-migas',
  },
  {
    name: 'Indexing — Full Meilisearch Reindex',
    type: MonitoringPipelineType.INDEXING,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(3),
    finishedAt: new Date(daysAgo(3).getTime() + 5 * 60 * 1000),
    durationMs: 300000,
    recordCount: 45,
    errorMessage: null,
    orgSlug: 'ghanemtech',
  },
  {
    name: 'Daily Ingestion — VICO Indonesia',
    type: MonitoringPipelineType.INGESTION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(3),
    finishedAt: new Date(daysAgo(3).getTime() + 18 * 60 * 1000),
    durationMs: 1080000,
    recordCount: 1200,
    errorMessage: null,
    orgSlug: 'vico-indonesia',
  },
  {
    name: 'Validation — Rokan Block Well Logs',
    type: MonitoringPipelineType.VALIDATION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(3),
    finishedAt: new Date(daysAgo(3).getTime() + 6 * 60 * 1000),
    durationMs: 360000,
    recordCount: 8,
    errorMessage: null,
    orgSlug: 'pertamina-hulu-rokan',
  },
  {
    name: 'Ingestion — PSN Production Data',
    type: MonitoringPipelineType.INGESTION,
    status: PipelineRunStatus.FAILED,
    startedAt: daysAgo(4),
    finishedAt: new Date(daysAgo(4).getTime() + 2 * 60 * 1000),
    durationMs: 120000,
    recordCount: null,
    errorMessage: 'Connection to PSN SFTP server timed out after 120s. Retry scheduled.',
    orgSlug: 'psn',
  },
  {
    name: 'Transform — PHE ONWJ Well Deviation Survey',
    type: MonitoringPipelineType.TRANSFORM,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(4),
    finishedAt: new Date(daysAgo(4).getTime() + 15 * 60 * 1000),
    durationMs: 900000,
    recordCount: 25,
    errorMessage: null,
    orgSlug: 'phe-onwj',
  },
  {
    name: 'Export — GeoJSON Spatial Bundle',
    type: MonitoringPipelineType.EXPORT,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(5),
    finishedAt: new Date(daysAgo(5).getTime() + 8 * 60 * 1000),
    durationMs: 480000,
    recordCount: 149,
    errorMessage: null,
    orgSlug: 'ghanemtech',
  },
  {
    name: 'Ingestion — Harbour Energy Well Data',
    type: MonitoringPipelineType.INGESTION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(5),
    finishedAt: new Date(daysAgo(5).getTime() + 22 * 60 * 1000),
    durationMs: 1320000,
    recordCount: 940,
    errorMessage: null,
    orgSlug: 'harbour-energy',
  },
  {
    name: 'Validation — Premier Oil Seismic Coverage',
    type: MonitoringPipelineType.VALIDATION,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(6),
    finishedAt: new Date(daysAgo(6).getTime() + 4 * 60 * 1000),
    durationMs: 240000,
    recordCount: 3,
    errorMessage: null,
    orgSlug: 'premier-oil',
  },
  {
    name: 'Indexing — Incremental Dataset Index',
    type: MonitoringPipelineType.INDEXING,
    status: PipelineRunStatus.SUCCESS,
    startedAt: daysAgo(6),
    finishedAt: new Date(daysAgo(6).getTime() + 90 * 1000),
    durationMs: 90000,
    recordCount: 5,
    errorMessage: null,
    orgSlug: 'ghanemtech',
  },
  {
    name: 'Daily Ingestion — PHE ONWJ (running)',
    type: MonitoringPipelineType.INGESTION,
    status: PipelineRunStatus.RUNNING,
    startedAt: hoursAgo(1),
    finishedAt: null,
    durationMs: null,
    recordCount: null,
    errorMessage: null,
    orgSlug: 'phe-onwj',
  },
  {
    name: 'Validation — Medco E&P Retry',
    type: MonitoringPipelineType.VALIDATION,
    status: PipelineRunStatus.RUNNING,
    startedAt: hoursAgo(0),
    finishedAt: null,
    durationMs: null,
    recordCount: null,
    errorMessage: null,
    orgSlug: 'medco-ep',
  },
  {
    name: 'Export — Quarterly Compliance Bundle',
    type: MonitoringPipelineType.EXPORT,
    status: PipelineRunStatus.QUEUED,
    startedAt: new Date(Date.now() + 30 * 60 * 1000),
    finishedAt: null,
    durationMs: null,
    recordCount: null,
    errorMessage: null,
    orgSlug: 'skk-migas',
  },
];

// ---------------------------------------------------------------------------
// Sprint 9.5 — Alerts seed data
// ---------------------------------------------------------------------------
interface AlertSeed {
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  sourceId?: string;
}

const ALERTS: AlertSeed[] = [
  {
    severity: AlertSeverity.CRITICAL,
    title: 'Pipeline ingestion failure — PSN',
    message:
      'Ingestion pipeline for PT Pertamina Hulu Saka (PSN) failed 3 consecutive times. Manual intervention required. Connection to SFTP server timed out.',
    source: 'PipelineRun',
  },
  {
    severity: AlertSeverity.ERROR,
    title: 'Schema validation failed — Medco E&P Seismic',
    message:
      'Validation pipeline rejected Medco E&P seismic dataset: missing mandatory SEGY trace headers (TRACL, TRACR). Dataset returned to DRAFT status.',
    source: 'ValidationService',
  },
  {
    severity: AlertSeverity.ERROR,
    title: 'Storage quota at 85% — MinIO bucket ghanem-uploads',
    message:
      'The MinIO upload bucket is at 85% capacity (850 GB / 1 TB). Scale storage or archive old datasets to prevent upload failures.',
    source: 'StorageService',
  },
  {
    severity: AlertSeverity.WARNING,
    title: 'High API latency detected',
    message:
      'p99 latency for /api/v1/spatial/within exceeded 800ms over the last 15 minutes. Current: 1.2s. Threshold: 500ms.',
    source: 'MonitoringService',
  },
  {
    severity: AlertSeverity.WARNING,
    title: 'User login anomaly — 15 failed attempts',
    message:
      'IP address 103.45.67.89 attempted 15 failed logins in the past hour. Account operator@phe-onwj.co.id temporarily locked.',
    source: 'AuthService',
  },
  {
    severity: AlertSeverity.WARNING,
    title: 'Meilisearch index lag detected',
    message:
      'Dataset search index is 6 hours behind. 12 new datasets are not yet searchable. Indexing worker may have stalled.',
    source: 'SearchService',
  },
  {
    severity: AlertSeverity.INFO,
    title: 'Scheduled maintenance window — 2026-06-01 02:00 UTC',
    message:
      'Planned database maintenance window scheduled for 2026-06-01 02:00-04:00 UTC. API will be in read-only mode during this period.',
    source: 'SystemService',
  },
  {
    severity: AlertSeverity.INFO,
    title: 'New KKKS operator onboarded — Harbour Energy',
    message:
      'Harbour Energy Indonesia has been successfully onboarded. 3 new users created. First dataset submission expected within 7 days.',
    source: 'UsersService',
  },
];

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('Seeding organizations...');
  const orgMap = new Map<string, string>(); // slug -> id

  for (const org of ORGANIZATIONS) {
    const upserted = await prisma.organization.upsert({
      where: { slug: org.slug },
      update: { name: org.name, type: org.type },
      create: { name: org.name, slug: org.slug, type: org.type },
    });
    orgMap.set(upserted.slug, upserted.id);
    console.log(`  org: ${upserted.name} [${upserted.id}]`);
  }

  console.log('\nSeeding users...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const userMap = new Map<string, string>(); // email -> id

  for (const user of USERS) {
    const orgId = orgMap.get(user.orgSlug);
    if (!orgId) {
      throw new Error(`Organization slug '${user.orgSlug}' not found in seed`);
    }

    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, organizationId: orgId },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
        organizationId: orgId,
        status: UserStatus.ACTIVE,
      },
    });
    userMap.set(upserted.email, upserted.id);
    console.log(`  user: ${upserted.email} [${upserted.role}] [${upserted.id}]`);
  }

  // ---------------------------------------------------------------------------
  // Sprint 9.5 — Seed Projects
  // ---------------------------------------------------------------------------
  console.log('\nSeeding projects (Sprint 9.5)...');
  const projectMap = new Map<string, string>(); // slug -> id

  for (const proj of PROJECTS) {
    const ownerId = userMap.get(proj.ownerEmail);
    const orgId = orgMap.get(proj.orgSlug);
    if (!ownerId || !orgId) {
      throw new Error(`Owner or org not found for project '${proj.slug}'`);
    }

    const existing = await prisma.project.findUnique({ where: { slug: proj.slug } });
    if (existing) {
      await prisma.project.update({
        where: { slug: proj.slug },
        data: { name: proj.name, description: proj.description, status: proj.status, color: proj.color },
      });
      projectMap.set(proj.slug, existing.id);
      console.log(`  project (updated): ${proj.name} [${existing.id}]`);
    } else {
      const created = await prisma.project.create({
        data: {
          name: proj.name,
          slug: proj.slug,
          description: proj.description,
          status: proj.status,
          color: proj.color,
          ownerId,
          organizationId: orgId,
        },
      });
      projectMap.set(proj.slug, created.id);
      console.log(`  project (created): ${proj.name} [${created.id}]`);
    }
  }

  // ---------------------------------------------------------------------------
  // Sprint 9.5 — Seed Tasks
  // ---------------------------------------------------------------------------
  console.log('\nSeeding tasks (Sprint 9.5)...');
  const adminUserId = userMap.get('admin@ghanemtech.co.id');

  for (const task of TASKS) {
    const projectId = projectMap.get(task.projectSlug);
    if (!projectId) continue;

    // Idempotent: check if a task with same title+projectId already exists
    const existing = await prisma.task.findFirst({
      where: { projectId, title: task.title },
    });

    if (!existing) {
      const created = await prisma.task.create({
        data: {
          projectId,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          order: task.order,
          assigneeId: adminUserId ?? null,
        },
      });
      console.log(`  task (created): [${created.status}] ${task.title}`);
    } else {
      console.log(`  task (exists): [${task.status}] ${task.title}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Sprint 9.5 — Seed PipelineRuns
  // ---------------------------------------------------------------------------
  console.log('\nSeeding pipeline runs (Sprint 9.5)...');
  let runsCreated = 0;

  for (const run of PIPELINE_RUNS) {
    const orgId = orgMap.get(run.orgSlug);
    if (!orgId) continue;

    // Idempotent: check by name + startedAt (approximate)
    const startWindow = new Date(run.startedAt.getTime() - 60 * 1000);
    const endWindow = new Date(run.startedAt.getTime() + 60 * 1000);

    const existing = await prisma.pipelineRun.findFirst({
      where: {
        name: run.name,
        startedAt: { gte: startWindow, lte: endWindow },
      },
    });

    if (!existing) {
      await prisma.pipelineRun.create({
        data: {
          name: run.name,
          type: run.type,
          status: run.status,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          durationMs: run.durationMs,
          recordCount: run.recordCount,
          errorMessage: run.errorMessage,
          organizationId: orgId,
        },
      });
      runsCreated++;
    }
  }
  console.log(`  Pipeline runs seeded: ${runsCreated} (${PIPELINE_RUNS.length} total defined)`);

  // ---------------------------------------------------------------------------
  // Sprint 9.5 — Seed Alerts
  // ---------------------------------------------------------------------------
  console.log('\nSeeding alerts (Sprint 9.5)...');
  let alertsCreated = 0;

  for (const alert of ALERTS) {
    const existing = await prisma.alert.findFirst({
      where: { title: alert.title },
    });

    if (!existing) {
      await prisma.alert.create({
        data: {
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          source: alert.source,
          sourceId: alert.sourceId ?? null,
          acknowledged: false,
        },
      });
      alertsCreated++;
    }
  }
  console.log(`  Alerts seeded: ${alertsCreated} (${ALERTS.length} total defined)`);

  console.log('\nSeed completed.');
  console.log(`  Organizations: ${ORGANIZATIONS.length}`);
  console.log(`  Users: ${USERS.length}`);
  console.log(`  Projects: ${PROJECTS.length}`);
  console.log(`  Tasks: ${TASKS.length}`);
  console.log(`  Pipeline runs: ${PIPELINE_RUNS.length}`);
  console.log(`  Alerts: ${ALERTS.length}`);
  console.log(`  Demo password: ${DEMO_PASSWORD}`);
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
