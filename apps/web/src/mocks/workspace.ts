/**
 * Mock data Workspace — 5 projects + ~80-100 tasks total.
 *
 * Phase 8.12. Deterministic baseline. Mutasi (create/update/delete task)
 * di-persist ke localStorage di layer `api/workspace.ts` supaya state
 * survive antar reload.
 *
 * Phase 9 replace dengan `/v1/projects` + `/v1/tasks` (server).
 */

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type ProjectStatus = 'active' | 'archived';

export interface ProjectMember {
  id: string;
  fullName: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: ProjectMember[];
  /** ISO created timestamp. */
  createdAt: string;
  /** Accent color (Tailwind class atau hex untuk inline). */
  color: string;
  status: ProjectStatus;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** User id assignee. */
  assigneeId: string;
  /** Initials assignee (denormalized untuk render — Phase 9 lookup dari users). */
  assigneeInitials: string;
  labels: string[];
  /** ISO date string (just date, no time). */
  dueDate: string;
  createdAt: string;
}

/* ─── Members catalog ──────────────────────────────────────────────────── */

const MEMBERS: readonly ProjectMember[] = [
  { id: 'usr-andi', fullName: 'Andi Nugroho', initials: 'AN' },
  { id: 'usr-lina', fullName: 'Lina Marpaung', initials: 'LM' },
  { id: 'usr-budi', fullName: 'Budi Adi', initials: 'BA' },
  { id: 'usr-erina', fullName: 'Erina Fauzi', initials: 'EF' },
  { id: 'usr-rio', fullName: 'Rio Kusuma', initials: 'RK' },
  { id: 'usr-joko', fullName: 'Joko Darmawan', initials: 'JD' },
  { id: 'usr-putri', fullName: 'Putri Dewi', initials: 'PD' },
  { id: 'usr-hendra', fullName: 'Hendra Wijaya', initials: 'HW' },
];

export const WORKSPACE_MEMBERS: readonly ProjectMember[] = MEMBERS;

/* ─── Projects ─────────────────────────────────────────────────────────── */

// Named member references — MEMBERS array has exactly 8 elements (indices 0-7).
const M0 = MEMBERS[0] as ProjectMember;
const M1 = MEMBERS[1] as ProjectMember;
const M2 = MEMBERS[2] as ProjectMember;
const M3 = MEMBERS[3] as ProjectMember;
const M4 = MEMBERS[4] as ProjectMember;
const M5 = MEMBERS[5] as ProjectMember;
const M6 = MEMBERS[6] as ProjectMember;
const M7 = MEMBERS[7] as ProjectMember;

const PROJECTS_RAW: readonly Project[] = [
  {
    id: 'proj-sumatera-scoping',
    name: 'Sumatera Block Scoping',
    description:
      'Memetakan potensi Wilayah Kerja baru di Sumatera Utara berbasis data seismic terkini + production history block tetangga.',
    ownerId: 'usr-andi',
    members: [M0, M1, M2, M3],
    createdAt: '2026-03-15T08:00:00Z',
    color: '#2a5fb8',
    status: 'active',
  },
  {
    id: 'proj-mahakam-review',
    name: 'Mahakam Production Review',
    description:
      'Review produksi bulanan Mahakam — identifikasi sumur dengan decline rate anomali dan rekomendasi workover.',
    ownerId: 'usr-lina',
    members: [M1, M4, M6],
    createdAt: '2026-04-02T09:00:00Z',
    color: '#1f8a4a',
    status: 'active',
  },
  {
    id: 'proj-onwj-permit',
    name: 'ONWJ Permit Review',
    description:
      'Review permit baru ONWJ untuk drilling 3 sumur appraisal Q3 2026. Termasuk environmental impact dan boundary check.',
    ownerId: 'usr-budi',
    members: [M2, M5],
    createdAt: '2026-04-10T10:00:00Z',
    color: '#c2840d',
    status: 'active',
  },
  {
    id: 'proj-q1-reserve',
    name: 'Q1 Reserve Audit',
    description:
      'Audit cadangan kuartal pertama 2026 sesuai PRMS standard. Mendukung reporting tahunan ke SKK Migas.',
    ownerId: 'usr-erina',
    members: [M3, M5, M6, M7],
    createdAt: '2026-02-20T08:00:00Z',
    color: '#7a5cb8',
    status: 'archived',
  },
  {
    id: 'proj-pipeline-integrity',
    name: 'Pipeline Integrity 2026',
    description:
      'Inspection schedule + risk-based prioritization untuk pipeline nasional. Output: laporan triwulanan.',
    ownerId: 'usr-rio',
    members: [M4, M7],
    createdAt: '2026-01-10T09:00:00Z',
    color: '#cf3a2a',
    status: 'active',
  },
];

export const WORKSPACE_PROJECTS: readonly Project[] = Object.freeze(PROJECTS_RAW);

/* ─── Tasks (deterministic generator) ──────────────────────────────────── */

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

const TASK_TEMPLATES: Record<string, { title: string; labels: string[] }[]> = {
  'proj-sumatera-scoping': [
    { title: 'Kumpulkan seismic survey Sumatera Utara 2023-2025', labels: ['seismic', 'data-collection'] },
    { title: 'Map well locations adjacent blocks', labels: ['gis'] },
    { title: 'Review production history Bekasap field', labels: ['analysis'] },
    { title: 'Buat overlay seismic + production trend', labels: ['analysis', 'visualization'] },
    { title: 'Validasi boundary WK adjacent', labels: ['compliance'] },
    { title: 'Schedule meeting dengan SKK Migas regional', labels: ['meeting'] },
    { title: 'Draft executive summary v1', labels: ['report'] },
    { title: 'Review by Geologi Lead', labels: ['review'] },
    { title: 'Final presentation steering committee', labels: ['presentation', 'milestone'] },
    { title: 'Submit final report ke shareholders', labels: ['report', 'milestone'] },
    { title: 'Coordinate dengan vendor seismic reprocessing', labels: ['vendor'] },
    { title: 'Update model peta WK potensial', labels: ['gis'] },
    { title: 'Verifikasi dokumen PSC existing blocks', labels: ['compliance', 'document'] },
    { title: 'Buat decision tree go/no-go', labels: ['analysis'] },
    { title: 'Risk assessment matrix', labels: ['risk'] },
    { title: 'Konsultasi ahli geokimia', labels: ['analysis'] },
    { title: 'Compile lessons learned dari Q1 review', labels: ['retrospective'] },
    { title: 'Approval anggaran Phase 2', labels: ['budget', 'milestone'] },
  ],
  'proj-mahakam-review': [
    { title: 'Extract production data 12 bulan terakhir', labels: ['data'] },
    { title: 'Identifikasi sumur dengan decline > 15%', labels: ['analysis'] },
    { title: 'Run decline curve fitting per sumur', labels: ['analysis', 'forecast'] },
    { title: 'Cross-check dengan workover history', labels: ['analysis'] },
    { title: 'Buat heatmap performance sumur', labels: ['visualization'] },
    { title: 'Draft rekomendasi workover top-10', labels: ['report'] },
    { title: 'Review dengan operations manager', labels: ['review'] },
    { title: 'Approval rekomendasi workover', labels: ['milestone'] },
    { title: 'Monitor implementasi workover Phase 1', labels: ['monitoring'] },
    { title: 'Update forecast dengan data Mei', labels: ['forecast'] },
    { title: 'Compile monthly review presentation', labels: ['presentation'] },
    { title: 'Send report ke stakeholder', labels: ['report'] },
    { title: 'Schedule next review meeting', labels: ['meeting'] },
    { title: 'Update KPI dashboard', labels: ['visualization'] },
    { title: 'Document anomaly findings', labels: ['document'] },
  ],
  'proj-onwj-permit': [
    { title: 'Cek boundary 3 lokasi drilling target', labels: ['gis', 'compliance'] },
    { title: 'Verifikasi dokumen environmental impact', labels: ['compliance', 'document'] },
    { title: 'Submit permit application ke regulator', labels: ['milestone'] },
    { title: 'Follow-up status permit minggu 1', labels: ['follow-up'] },
    { title: 'Coordinate dengan drilling vendor', labels: ['vendor'] },
    { title: 'Review HSE clearance', labels: ['compliance'] },
    { title: 'Update Gantt chart drilling schedule', labels: ['planning'] },
    { title: 'Compile permit documentation package', labels: ['document'] },
    { title: 'Brief field team', labels: ['communication'] },
    { title: 'Setup monitoring dashboard', labels: ['monitoring'] },
    { title: 'Daily status standup', labels: ['meeting'] },
    { title: 'Final permit approval', labels: ['milestone'] },
    { title: 'Kick-off drilling operation', labels: ['milestone'] },
  ],
  'proj-q1-reserve': [
    { title: 'Compile data well log all fields', labels: ['data'] },
    { title: 'Run PRMS deterministic calculation', labels: ['analysis'] },
    { title: 'Stochastic P10/P50/P90 simulation', labels: ['analysis', 'forecast'] },
    { title: 'Cross-validate dengan production data', labels: ['analysis'] },
    { title: 'Internal review by reservoir lead', labels: ['review'] },
    { title: 'External auditor walkthrough', labels: ['review', 'audit'] },
    { title: 'Address auditor findings', labels: ['follow-up'] },
    { title: 'Final reserve number sign-off', labels: ['milestone'] },
    { title: 'Submit annual report ke SKK Migas', labels: ['report', 'milestone'] },
    { title: 'Archive working files', labels: ['document'] },
    { title: 'Lessons learned session', labels: ['retrospective'] },
    { title: 'Prepare next year template', labels: ['planning'] },
  ],
  'proj-pipeline-integrity': [
    { title: 'Compile ILI inspection report 2025', labels: ['data', 'inspection'] },
    { title: 'Run corrosion rate model', labels: ['analysis'] },
    { title: 'Prioritize pipeline segments risk-based', labels: ['analysis', 'risk'] },
    { title: 'Schedule on-site inspection Q2', labels: ['planning', 'inspection'] },
    { title: 'Coordinate dengan inspection vendor', labels: ['vendor'] },
    { title: 'Compile field findings minggu 1', labels: ['data'] },
    { title: 'Update GIS layer pipeline status', labels: ['gis'] },
    { title: 'Draft remediation plan high-risk segments', labels: ['report'] },
    { title: 'Review meeting dengan operations', labels: ['meeting'] },
    { title: 'Submit quarterly report', labels: ['report', 'milestone'] },
    { title: 'Plan inspection Q3', labels: ['planning'] },
    { title: 'Update emergency response procedure', labels: ['document'] },
  ],
};

function buildTasks(): Task[] {
  const tasks: Task[] = [];
  let counter = 1000;
  for (const project of PROJECTS_RAW) {
    const templates = TASK_TEMPLATES[project.id] ?? [];
    for (let i = 0; i < templates.length; i += 1) {
      const t = templates[i];
      if (!t) continue;
      const statusIdx = (i + counter) % STATUSES.length;
      const memberIdx = i % project.members.length;
      const assignee = project.members[memberIdx];
      if (!assignee) continue;
      const dueOffsetDays = (i * 5) % 60;
      const due = new Date(2026, 4, 1 + dueOffsetDays); // Mei + offset
      const created = new Date(2026, 3, (i % 28) + 1);
      tasks.push({
        id: `task-${counter}`,
        projectId: project.id,
        title: t.title,
        description: `Detail untuk: ${t.title}. Tambahkan deskripsi lebih lanjut sesuai progress.`,
        status: STATUSES[statusIdx] ?? 'todo',
        assigneeId: assignee.id,
        assigneeInitials: assignee.initials,
        labels: t.labels,
        dueDate: due.toISOString().slice(0, 10),
        createdAt: created.toISOString(),
      });
      counter += 1;
    }
  }
  return tasks;
}

export const WORKSPACE_TASKS_SEED: readonly Task[] = Object.freeze(buildTasks());

/* ─── Status metadata (untuk UI) ───────────────────────────────────────── */

export const TASK_STATUS_META: Record<TaskStatus, { label: string; color: string; accent: string }> = {
  todo: { label: 'To Do', color: 'bg-surface-3 text-ink-3', accent: 'border-line' },
  in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-600', accent: 'border-blue-500' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-700', accent: 'border-amber-500' },
  done: { label: 'Done', color: 'bg-green-50 text-green-700', accent: 'border-green-500' },
};

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
