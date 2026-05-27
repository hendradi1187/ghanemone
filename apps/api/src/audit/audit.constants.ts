/**
 * Canonical audit action strings.
 * Keep alphabetically sorted within domain groups.
 * These are stored as plain strings in AuditLog.action — no DB enum needed.
 */
export const AuditAction = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',

  // ── Users ──────────────────────────────────────────────────────────────────
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',

  // ── Datasets ───────────────────────────────────────────────────────────────
  DATASET_CREATE: 'DATASET_CREATE',
  DATASET_UPDATE: 'DATASET_UPDATE',
  DATASET_DELETE: 'DATASET_DELETE',
  DATASET_APPROVE: 'DATASET_APPROVE',
  DATASET_REJECT: 'DATASET_REJECT',
  DATASET_DOWNLOAD: 'DATASET_DOWNLOAD',
  DATASET_VIEW: 'DATASET_VIEW',

  // ── Organizations ──────────────────────────────────────────────────────────
  ORG_CREATE: 'ORG_CREATE',
  ORG_UPDATE: 'ORG_UPDATE',
  ORG_DELETE: 'ORG_DELETE',

  // ── Search ─────────────────────────────────────────────────────────────────
  SEARCH_REINDEX: 'SEARCH_REINDEX',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
