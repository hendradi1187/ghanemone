/**
 * Compliance API — mock client untuk approval queue + audit log.
 *
 * Mutasi (approve/reject/request-changes) di-persist ke localStorage
 * supaya state survive refresh. Pending dataset yang sudah di-act akan
 * filter-out dari `getApprovalQueue` (lihat mocks/compliance.ts).
 */
import type { User } from '@ghanem/types';
import {
  appendPersistedAction,
  getApprovalQueue as readQueue,
  getAuditLog as readAudit,
  listPersistedActions,
  writePersistedActions,
  type ApprovalAction,
  type AuditEntry,
  type AuditFilters,
  type PendingDataset,
} from '../mocks/compliance';

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 120, max = 280): number {
  return min + Math.floor(Math.random() * (max - min));
}

export async function getApprovalQueue(): Promise<PendingDataset[]> {
  await sleep(jitter());
  return readQueue();
}

export async function getAuditLog(filters?: AuditFilters): Promise<AuditEntry[]> {
  await sleep(jitter());
  return readAudit(filters);
}

export interface MutationResult {
  ok: boolean;
  action: ApprovalAction;
  datasetId: string;
}

export async function approveDataset(
  id: string,
  actor: User,
  reason?: string,
): Promise<MutationResult> {
  await sleep(jitter(200, 500));
  appendPersistedAction({
    type: 'approve',
    datasetId: id,
    actor,
    timestamp: new Date().toISOString(),
    ...(reason ? { reason } : {}),
  });
  return { ok: true, action: 'approve', datasetId: id };
}

export async function rejectDataset(
  id: string,
  actor: User,
  reason: string,
): Promise<MutationResult> {
  await sleep(jitter(200, 500));
  appendPersistedAction({
    type: 'reject',
    datasetId: id,
    actor,
    timestamp: new Date().toISOString(),
    reason,
  });
  return { ok: true, action: 'reject', datasetId: id };
}

export async function requestChanges(
  id: string,
  actor: User,
  comments: string,
): Promise<MutationResult> {
  await sleep(jitter(200, 500));
  appendPersistedAction({
    type: 'request-changes',
    datasetId: id,
    actor,
    timestamp: new Date().toISOString(),
    reason: comments,
  });
  return { ok: true, action: 'request-changes', datasetId: id };
}

/**
 * Reset persisted actions — hanya dipakai di Storybook / debugging.
 * Phase 9 hilangkan endpoint ini.
 */
export function resetPersistedActions(): void {
  writePersistedActions([]);
}

export function getPersistedActionsCount(): number {
  return listPersistedActions().length;
}
