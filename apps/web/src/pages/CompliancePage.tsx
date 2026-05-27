/**
 * CompliancePage — `/compliance` route (Phase 8.16).
 *
 * Regulator-only workspace untuk approve/reject submission dataset dari KKKS,
 * plus audit log read-only view. Dua tab utama:
 *   1. Antrian Persetujuan — list pending datasets dengan bulk actions + review dialog
 *   2. Log Audit — read-only log seluruh approval action, filterable + exportable
 *
 * Role guard: hanya `regulator` yang boleh akses. Akun selain itu → EmptyState error.
 *
 * URL state: `?tab=queue|audit` via useSearchParams (shareable, history-friendly).
 *
 * Phase 9 mapping (lihat apps/web/src/mocks/compliance.ts header):
 *   - GET  /v1/compliance/queue                      → ApprovalQueue
 *   - GET  /v1/compliance/audit-log                  → AuditLogTable
 *   - POST /v1/compliance/datasets/:id/approve       → ReviewDialog + BulkActionDialog
 *   - POST /v1/compliance/datasets/:id/reject        → ReviewDialog + BulkActionDialog
 *   - POST /v1/compliance/datasets/:id/request-changes → ReviewDialog
 */
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, Tabs } from '@ghanem/ui';
import { useAuth } from '../hooks/use-auth';
import { getApprovalQueue } from '../api/compliance';
import { ApprovalQueue } from './compliance/ApprovalQueue';
import { AuditLogTable } from './compliance/AuditLogTable';

type ComplianceTab = 'queue' | 'audit';
const VALID_TABS: readonly ComplianceTab[] = ['queue', 'audit'];

function parseTab(raw: string | null): ComplianceTab {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) return raw as ComplianceTab;
  return 'queue';
}

export function CompliancePage(): JSX.Element {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = parseTab(searchParams.get('tab'));

  const setTab = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === 'queue') params.delete('tab');
          else params.set('tab', next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Pending count untuk header — kita pre-fetch supaya counter di header + tab badge sync.
  // Stale-time pendek karena queue suka berubah saat user act dari ReviewDialog.
  const queueQuery = useQuery({
    queryKey: ['compliance', 'queue'],
    queryFn: getApprovalQueue,
    staleTime: 10_000,
    // Hanya enabled kalau user adalah regulator — hindari fetch sia-sia saat role guard fail.
    enabled: user?.role === 'regulator',
  });

  // ── Role guard ────────────────────────────────────────────────────────
  if (user?.role !== 'regulator') {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <EmptyState
          variant="error"
          title="Akses ditolak"
          description={
            <>
              Halaman <b>Compliance & Approval</b> hanya tersedia untuk Regulator
              SKK Migas. Akun Anda terdaftar sebagai <i>{user?.role ?? 'tamu'}</i>.
            </>
          }
        />
      </div>
    );
  }

  const pendingCount = queueQuery.data?.length ?? 0;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <header className="px-6 pt-6 pb-3 bg-surface border-b border-line">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
              SPEKTRUM · Compliance
            </p>
            <h1 className="font-display font-bold text-h1 text-ink m-0">
              Compliance & Approval
            </h1>
            <p className="text-sm text-ink-4 mt-1 max-w-2xl">
              Tinjau, setujui, atau tolak submission dataset dari KKKS. Semua
              tindakan tercatat di log audit dengan jejak penuh.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill',
                'bg-amber-100 border border-amber-100 text-amber-700',
                'text-sm font-semibold',
              ].join(' ')}
              aria-label={`${pendingCount} dataset menunggu persetujuan`}
            >
              <span className="num">{pendingCount}</span>
              <span>menunggu persetujuan</span>
            </span>
          </div>
        </div>
      </header>

      <div className="px-6 py-5 flex-1">
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List aria-label="Compliance sections">
            <Tabs.Trigger value="queue">
              Antrian Persetujuan{' '}
              <span className="text-ink-4 font-normal num">({pendingCount})</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="audit">Log Audit</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="queue" className="pt-5">
            <ApprovalQueue />
          </Tabs.Content>

          <Tabs.Content value="audit" className="pt-5">
            <AuditLogTable />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

export default CompliancePage;
