/**
 * ApprovalQueue — list pending datasets dengan filter + bulk action + review dialog.
 *
 * Fitur:
 *   - Filter: provider (KKKS) Select, risk flag chips multi-select, sort dropdown, search
 *   - Bulk selection: per-row checkbox + master checkbox; toolbar muncul saat ≥1 selected
 *   - Per-row "Tinjau →" button → open ReviewDialog
 *   - Empty / loading / error states
 *
 * URL state: tidak dipakai di sini (filter ephemeral) — Tab state di parent CompliancePage.
 *
 * Data: useQuery dengan key `['compliance', 'queue']` supaya invalidate setelah action.
 */
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  EmptyState,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ghanem/ui';
import { getApprovalQueue } from '../../api/compliance';
import { RISK_FLAG_META, type PendingDataset, type RiskFlag } from '../../mocks/compliance';
import { ReviewDialog } from './ReviewDialog';
import { BulkActionDialog } from './BulkActionDialog';

type SortMode = 'newest' | 'oldest' | 'risk';

const SORT_OPTIONS: ReadonlyArray<{ value: SortMode; label: string }> = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'risk', label: 'Prioritas risiko' },
];

const ALL_RISK_FLAGS: ReadonlyArray<RiskFlag> = [
  'contains-pii',
  'large-file',
  'sensitive-area',
  'incomplete-metadata',
];

/** Bobot risiko per flag — dipakai untuk sort `risk priority`. PII + incomplete = paling kritis. */
const RISK_WEIGHT: Record<RiskFlag, number> = {
  'contains-pii': 10,
  'incomplete-metadata': 8,
  'sensitive-area': 5,
  'large-file': 2,
};

function riskScore(item: PendingDataset): number {
  return item.riskFlags.reduce((sum, f) => sum + RISK_WEIGHT[f], 0);
}

/** Relative time formatter Bahasa Indonesia — "2 hari lalu", "30 menit lalu". */
function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'baru saja';
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} menit lalu`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)} jam lalu`;
  return `${Math.floor(ms / 86_400_000)} hari lalu`;
}

const RISK_CHIP_TONE: Record<'red' | 'amber' | 'blue', string> = {
  red: 'bg-red-100 text-red-500 border-red-100',
  amber: 'bg-amber-100 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
};

export function ApprovalQueue(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['compliance', 'queue'],
    queryFn: getApprovalQueue,
    staleTime: 10_000,
  });

  // ── Filter state ─────────────────────────────────────────────────────
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<ReadonlySet<RiskFlag>>(() => new Set());
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Selection state (bulk) ───────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

  // ── Dialog state ─────────────────────────────────────────────────────
  const [reviewItem, setReviewItem] = useState<PendingDataset | null>(null);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);

  // ── Derived: provider options ────────────────────────────────────────
  const providerOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of data ?? []) set.add(item.kkks);
    return Array.from(set).sort();
  }, [data]);

  // ── Derived: filtered + sorted list ──────────────────────────────────
  const filtered = useMemo(() => {
    let list = data ?? [];
    if (providerFilter !== 'all') {
      list = list.filter((item) => item.kkks === providerFilter);
    }
    if (riskFilter.size > 0) {
      list = list.filter((item) => item.riskFlags.some((f) => riskFilter.has(f)));
    }
    if (searchQuery.trim()) {
      const needle = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle) ||
          item.kkks.toLowerCase().includes(needle),
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortMode === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortMode === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      // risk priority — descending
      return riskScore(b) - riskScore(a);
    });
    return sorted;
  }, [data, providerFilter, riskFilter, searchQuery, sortMode]);

  // ── Selection helpers ────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every((item) => selectedIds.has(item.id));
  const someSelected = !allSelected && filtered.some((item) => selectedIds.has(item.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((item) => item.id)));
    }
  }, [allSelected, filtered]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleRiskFilter = useCallback((flag: RiskFlag) => {
    setRiskFilter((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }, []);

  const selectedItems = useMemo(
    () => (data ?? []).filter((item) => selectedIds.has(item.id)),
    [data, selectedIds],
  );

  const handleReviewAction = useCallback(() => {
    // Refetch queue + cleanup selection of acted item.
    if (reviewItem) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewItem.id);
        return next;
      });
    }
    void queryClient.invalidateQueries({ queryKey: ['compliance'] });
  }, [queryClient, reviewItem]);

  const handleBulkComplete = useCallback(() => {
    setSelectedIds(new Set());
    void queryClient.invalidateQueries({ queryKey: ['compliance'] });
  }, [queryClient]);

  // ── Render states ────────────────────────────────────────────────────
  if (isLoading && !data) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-center text-ink-4 py-10 text-sm"
      >
        Memuat antrian persetujuan…
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        variant="error"
        title="Gagal memuat antrian"
        description="Terjadi kesalahan saat mengambil data. Coba lagi dalam beberapa saat."
        action={{ label: 'Coba lagi', onClick: () => void refetch(), icon: 'refresh' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <section
        aria-label="Filter antrian persetujuan"
        className="bg-surface border border-line rounded-3 p-3 flex flex-col gap-3"
      >
        <div className="grid gap-3 grid-cols-1 md:grid-cols-[1fr_220px_180px]">
          <Input
            type="search"
            placeholder="Cari dataset, deskripsi, atau KKKS…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSlot={<Icon name="search" size={14} aria-hidden />}
            aria-label="Cari dataset"
          />
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger aria-label="Filter provider KKKS">
              <SelectValue placeholder="Semua KKKS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua KKKS</SelectItem>
              {providerOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger aria-label="Urut berdasarkan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-ink-4 font-medium uppercase tracking-cap mr-1">
            Risk flag:
          </span>
          {ALL_RISK_FLAGS.map((flag) => {
            const meta = RISK_FLAG_META[flag];
            const active = riskFilter.has(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleRiskFilter(flag)}
                aria-pressed={active}
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-semibold border',
                  'transition-colors duration-hf',
                  active
                    ? RISK_CHIP_TONE[meta.tone]
                    : 'bg-surface text-ink-3 border-line hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                {meta.label}
              </button>
            );
          })}
          {riskFilter.size > 0 ? (
            <button
              type="button"
              onClick={() => setRiskFilter(new Set())}
              className="text-[11px] text-ink-4 underline hover:text-ink ml-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1"
            >
              Reset
            </button>
          ) : null}
        </div>
      </section>

      {/* ── Bulk actions toolbar ──────────────────────────────────── */}
      {selectedIds.size > 0 ? (
        <div
          role="region"
          aria-label="Aksi massal"
          className={[
            'sticky top-0 z-10',
            'flex items-center justify-between gap-3 flex-wrap',
            'bg-green-50 border border-green-200 rounded-2 px-3 py-2',
          ].join(' ')}
        >
          <span className="text-sm text-green-700 font-semibold">
            <span className="num">{selectedIds.size}</span> dataset terpilih
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedIds(new Set())}
            >
              Batal pilih
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon="x"
              onClick={() => setBulkAction('reject')}
            >
              Tolak Terpilih ({selectedIds.size})
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon="check"
              onClick={() => setBulkAction('approve')}
            >
              Setujui Terpilih ({selectedIds.size})
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Table / list ──────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="no-data"
          icon="check"
          title="Antrian persetujuan kosong"
          description={
            data && data.length > 0
              ? 'Tidak ada dataset cocok dengan filter saat ini.'
              : 'Semua submission telah ditinjau. Hebat!'
          }
        />
      ) : (
        <div className="border border-line rounded-3 bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left">
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-2 w-10">
                  <Checkbox
                    id="queue-master-checkbox"
                    aria-label={allSelected ? 'Batal pilih semua' : 'Pilih semua dataset'}
                    checked={
                      allSelected ? true : someSelected ? 'indeterminate' : false
                    }
                    onCheckedChange={() => toggleAll()}
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
                >
                  Dataset
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
                >
                  KKKS
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
                >
                  Submission
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
                >
                  Risk flag
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 text-right"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const checked = selectedIds.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className={[
                      'border-b border-line last:border-b-0',
                      checked ? 'bg-green-50' : 'hover:bg-surface-2',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        id={`queue-checkbox-${item.id}`}
                        aria-label={`Pilih ${item.title}`}
                        checked={checked}
                        onCheckedChange={() => toggleOne(item.id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setReviewItem(item)}
                        className={[
                          'flex flex-col gap-0.5 text-left w-full',
                          'hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1',
                        ].join(' ')}
                      >
                        <span className="font-semibold text-sm text-ink leading-snug">
                          {item.title}
                        </span>
                        <span className="text-xs text-ink-4">
                          {item.category} · {item.kind} ·{' '}
                          <span className="num">{item.sizeMb.toLocaleString('id-ID')}</span>{' '}
                          MB
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={[
                          'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                          'text-[10.5px] font-semibold leading-none',
                          'bg-surface-3 text-ink-2 border-line',
                        ].join(' ')}
                      >
                        {item.kkks}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-ink-3">
                      <div className="flex items-center gap-1">
                        <Icon name="clock" size={11} aria-hidden />
                        {formatRelative(item.submittedAt)}
                      </div>
                      <div className="text-[10.5px] text-ink-4 mt-0.5">
                        {item.submittedBy.fullName ?? item.submittedBy.email}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.riskFlags.length === 0 ? (
                          <span className="text-[11px] text-ink-4 italic">
                            tidak ada
                          </span>
                        ) : (
                          item.riskFlags.map((flag) => {
                            const meta = RISK_FLAG_META[flag];
                            return (
                              <span
                                key={flag}
                                className={[
                                  'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                                  'text-[10px] font-semibold uppercase tracking-widest leading-none',
                                  RISK_CHIP_TONE[meta.tone],
                                ].join(' ')}
                              >
                                {meta.label}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        rightIcon="arrowR"
                        onClick={() => setReviewItem(item)}
                      >
                        Tinjau
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink-4">
        Menampilkan <span className="num font-medium">{filtered.length.toLocaleString('id-ID')}</span>{' '}
        dari <span className="num font-medium">{(data ?? []).length.toLocaleString('id-ID')}</span>{' '}
        dataset menunggu.
      </p>

      {/* ── Review dialog ─────────────────────────────────────────── */}
      {reviewItem ? (
        <ReviewDialog
          dataset={reviewItem}
          open={reviewItem !== null}
          onOpenChange={(open) => {
            if (!open) setReviewItem(null);
          }}
          onAction={handleReviewAction}
        />
      ) : null}

      {/* ── Bulk action dialog ───────────────────────────────────── */}
      {bulkAction && selectedItems.length > 0 ? (
        <BulkActionDialog
          action={bulkAction}
          items={selectedItems}
          open={bulkAction !== null}
          onOpenChange={(open) => {
            if (!open) setBulkAction(null);
          }}
          onComplete={() => {
            setBulkAction(null);
            handleBulkComplete();
          }}
        />
      ) : null}
    </div>
  );
}
