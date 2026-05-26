/**
 * AuditLogTable — read-only log seluruh approval action.
 *
 * Fitur:
 *   - Filter: action multi-select, actor search, date range, dataset search
 *   - Sortable columns: timestamp (default newest first), actor, dataset
 *   - Click row → expand inline dengan full reason + before/after
 *   - Export CSV — serialize filtered results ke blob download
 *
 * Data: useQuery dengan key `['compliance', 'audit', filters]`. Refetch otomatis
 * setelah action di ReviewDialog/BulkActionDialog (parent invalidate ['compliance']).
 */
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  EmptyState,
  Icon,
  Input,
  toast,
  type IconName,
} from '@ghanem/ui';
import { getAuditLog } from '../../api/compliance';
import type { ApprovalAction, AuditEntry } from '../../mocks/compliance';

const ACTION_OPTIONS: ReadonlyArray<{
  value: ApprovalAction;
  label: string;
  icon: IconName;
  cls: string;
}> = [
  { value: 'submit', label: 'Submit', icon: 'upload', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  { value: 'approve', label: 'Setujui', icon: 'check', cls: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'reject', label: 'Tolak', icon: 'x', cls: 'bg-red-100 text-red-500 border-red-100' },
  { value: 'request-changes', label: 'Minta Perubahan', icon: 'warn', cls: 'bg-amber-100 text-amber-700 border-amber-100' },
  { value: 'archive', label: 'Arsip', icon: 'database', cls: 'bg-surface-3 text-ink-3 border-line' },
];

const ACTION_META: Record<ApprovalAction, { label: string; icon: IconName; cls: string }> =
  ACTION_OPTIONS.reduce(
    (acc, opt) => {
      acc[opt.value] = { label: opt.label, icon: opt.icon, cls: opt.cls };
      return acc;
    },
    {} as Record<ApprovalAction, { label: string; icon: IconName; cls: string }>,
  );

type SortField = 'timestamp' | 'actor' | 'dataset';
type SortDir = 'asc' | 'desc';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function truncate(str: string, max = 50): string {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1)}…`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function entriesToCsv(entries: AuditEntry[]): string {
  const header = ['timestamp', 'action', 'actor_name', 'actor_email', 'dataset_id', 'dataset_title', 'reason'];
  const rows = entries.map((e) =>
    [
      e.timestamp,
      e.action,
      e.actor.fullName ?? '',
      e.actor.email,
      e.datasetId,
      e.datasetTitle,
      e.reason ?? '',
    ]
      .map((v) => csvEscape(String(v)))
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

export function AuditLogTable(): JSX.Element {
  // ── Filter state (controlled local) ──────────────────────────────────
  const [actionFilters, setActionFilters] = useState<ReadonlySet<ApprovalAction>>(
    () => new Set(),
  );
  const [actorQuery, setActorQuery] = useState('');
  const [datasetQuery, setDatasetQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ── Sort state ────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Expanded row state ────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Query (un-filtered — kita filter di client supaya UI snappy) ──────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['compliance', 'audit'],
    queryFn: () => getAuditLog(),
    staleTime: 10_000,
  });

  const toggleActionFilter = useCallback((value: ApprovalAction) => {
    setActionFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir(field === 'timestamp' ? 'desc' : 'asc');
      }
    },
    [sortField],
  );

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (actionFilters.size > 0) {
      list = list.filter((e) => actionFilters.has(e.action));
    }
    if (actorQuery.trim()) {
      const needle = actorQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          (e.actor.fullName ?? '').toLowerCase().includes(needle) ||
          e.actor.email.toLowerCase().includes(needle),
      );
    }
    if (datasetQuery.trim()) {
      const needle = datasetQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.datasetTitle.toLowerCase().includes(needle) ||
          e.datasetId.toLowerCase().includes(needle),
      );
    }
    if (fromDate) {
      const min = new Date(fromDate).getTime();
      if (!Number.isNaN(min)) {
        list = list.filter((e) => new Date(e.timestamp).getTime() >= min);
      }
    }
    if (toDate) {
      // To-date inclusive end-of-day.
      const max = new Date(toDate).getTime() + 24 * 60 * 60_000 - 1;
      if (!Number.isNaN(max)) {
        list = list.filter((e) => new Date(e.timestamp).getTime() <= max);
      }
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'timestamp') {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'actor') {
        cmp = (a.actor.fullName ?? a.actor.email).localeCompare(
          b.actor.fullName ?? b.actor.email,
        );
      } else {
        cmp = a.datasetTitle.localeCompare(b.datasetTitle);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [data, actionFilters, actorQuery, datasetQuery, fromDate, toDate, sortField, sortDir]);

  const resetFilters = useCallback(() => {
    setActionFilters(new Set());
    setActorQuery('');
    setDatasetQuery('');
    setFromDate('');
    setToDate('');
  }, []);

  const handleExportCsv = useCallback(() => {
    if (filtered.length === 0) {
      toast.warning('Tidak ada data untuk diekspor');
      return;
    }
    try {
      const csv = entriesToCsv(filtered);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Audit log diekspor', {
        description: `${filtered.length} baris CSV diunduh.`,
      });
    } catch (err) {
      void err;
      toast.error('Gagal ekspor CSV');
    }
  }, [filtered]);

  // ── Render states ────────────────────────────────────────────────────
  if (isLoading && !data) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-center text-ink-4 py-10 text-sm"
      >
        Memuat log audit…
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        variant="error"
        title="Gagal memuat log audit"
        description="Terjadi kesalahan saat mengambil data. Coba lagi."
        action={{ label: 'Coba lagi', onClick: () => void refetch(), icon: 'refresh' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <section
        aria-label="Filter log audit"
        className="bg-surface border border-line rounded-3 p-3 flex flex-col gap-3"
      >
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Input
            type="search"
            placeholder="Cari actor (nama / email)…"
            value={actorQuery}
            onChange={(e) => setActorQuery(e.target.value)}
            leftSlot={<Icon name="user" size={14} aria-hidden />}
            aria-label="Cari actor"
          />
          <Input
            type="search"
            placeholder="Cari dataset…"
            value={datasetQuery}
            onChange={(e) => setDatasetQuery(e.target.value)}
            leftSlot={<Icon name="database" size={14} aria-hidden />}
            aria-label="Cari dataset"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="audit-from" className="text-xs text-ink-4 flex-none">
              Dari
            </label>
            <Input
              id="audit-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="Tanggal mulai"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="audit-to" className="text-xs text-ink-4 flex-none">
              Sampai
            </label>
            <Input
              id="audit-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              aria-label="Tanggal selesai"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-ink-4 font-medium uppercase tracking-cap mr-1">
            Aksi:
          </span>
          {ACTION_OPTIONS.map((opt) => {
            const active = actionFilters.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleActionFilter(opt.value)}
                aria-pressed={active}
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-semibold border',
                  'transition-colors duration-hf',
                  active
                    ? opt.cls
                    : 'bg-surface text-ink-3 border-line hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                <Icon name={opt.icon} size={10} aria-hidden />
                {opt.label}
              </button>
            );
          })}
          {(actionFilters.size > 0 ||
            actorQuery ||
            datasetQuery ||
            fromDate ||
            toDate) ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-ink-4 underline hover:text-ink ml-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1"
            >
              Reset filter
            </button>
          ) : null}
        </div>
      </section>

      {/* ── Summary + export ─────────────────────────────────────── */}
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="text-sm text-ink-3 m-0">
          Menampilkan{' '}
          <span className="num font-semibold text-ink">
            {filtered.length.toLocaleString('id-ID')}
          </span>{' '}
          dari{' '}
          <span className="num font-semibold text-ink">
            {(data ?? []).length.toLocaleString('id-ID')}
          </span>{' '}
          entri.
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="download"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
        >
          Ekspor CSV
        </Button>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="Tidak ada entri yang cocok"
          description="Coba ubah atau hapus sebagian filter."
          action={{ label: 'Reset filter', onClick: resetFilters, icon: 'refresh' }}
        />
      ) : (
        <div className="border border-line rounded-3 bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left">
              <tr className="border-b border-line">
                <SortHeader
                  label="Waktu"
                  field="timestamp"
                  active={sortField}
                  dir={sortDir}
                  onToggle={toggleSort}
                />
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
                >
                  Aksi
                </th>
                <SortHeader
                  label="Actor"
                  field="actor"
                  active={sortField}
                  dir={sortDir}
                  onToggle={toggleSort}
                />
                <SortHeader
                  label="Dataset"
                  field="dataset"
                  active={sortField}
                  dir={sortDir}
                  onToggle={toggleSort}
                />
                <th
                  scope="col"
                  className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
                >
                  Alasan
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const meta = ACTION_META[e.action];
                const expanded = expandedId === e.id;
                const reasonShort = e.reason ? truncate(e.reason, 50) : '—';
                return (
                  <Fragment key={e.id}>
                    <tr
                      className={[
                        'border-b border-line last:border-b-0 cursor-pointer',
                        expanded ? 'bg-green-50' : 'hover:bg-surface-2',
                      ].join(' ')}
                      onClick={() => setExpandedId(expanded ? null : e.id)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.preventDefault();
                          setExpandedId(expanded ? null : e.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={expanded}
                      aria-label={`Detail audit ${e.id}`}
                    >
                      <td className="px-3 py-2 text-xs text-ink-3 font-mono whitespace-nowrap">
                        {formatDateTime(e.timestamp)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-1 border',
                            'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
                            meta.cls,
                          ].join(' ')}
                        >
                          <Icon name={meta.icon} size={10} aria-hidden />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="font-semibold text-ink">
                          {e.actor.fullName ?? e.actor.email}
                        </div>
                        <div className="text-[10.5px] text-ink-4">
                          {e.actor.organization ?? e.actor.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="font-semibold text-ink truncate max-w-[20rem]">
                          {e.datasetTitle}
                        </div>
                        <div className="text-[10.5px] text-ink-4 font-mono">
                          {e.datasetId}
                        </div>
                      </td>
                      <td
                        className="px-3 py-2 text-xs text-ink-2"
                        title={e.reason ?? ''}
                      >
                        {reasonShort}
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="border-b border-line bg-surface-2">
                        <td colSpan={5} className="px-3 py-3">
                          <div className="flex flex-col gap-2 text-xs">
                            <div>
                              <span className="text-ink-4 font-medium uppercase tracking-cap text-[10px]">
                                Alasan lengkap
                              </span>
                              <p className="text-sm text-ink m-0 mt-1 whitespace-pre-wrap">
                                {e.reason ?? (
                                  <span className="italic text-ink-4">
                                    Tidak ada alasan tercatat.
                                  </span>
                                )}
                              </p>
                            </div>
                            {e.before || e.after ? (
                              <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mt-1">
                                {e.before ? (
                                  <div>
                                    <span className="text-ink-4 font-medium uppercase tracking-cap text-[10px]">
                                      Sebelum
                                    </span>
                                    <p className="text-xs text-ink m-0 mt-1 font-mono whitespace-pre-wrap">
                                      {e.before}
                                    </p>
                                  </div>
                                ) : null}
                                {e.after ? (
                                  <div>
                                    <span className="text-ink-4 font-medium uppercase tracking-cap text-[10px]">
                                      Sesudah
                                    </span>
                                    <p className="text-xs text-ink m-0 mt-1 font-mono whitespace-pre-wrap">
                                      {e.after}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                            <div className="text-[10.5px] text-ink-4 mt-1">
                              ID audit: <span className="font-mono">{e.id}</span> · Email
                              actor:{' '}
                              <span className="font-mono">{e.actor.email}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  active: SortField;
  dir: SortDir;
  onToggle: (field: SortField) => void;
}

function SortHeader({ label, field, active, dir, onToggle }: SortHeaderProps): JSX.Element {
  const isActive = active === field;
  const ariaSort: 'ascending' | 'descending' | 'none' = isActive
    ? dir === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 whitespace-nowrap"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(field);
        }}
        className={[
          'inline-flex items-center gap-1 cursor-pointer',
          'hover:text-ink transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-0.5',
          isActive ? 'text-ink' : 'text-ink-3',
        ].join(' ')}
      >
        {label}
        <Icon
          name={isActive ? (dir === 'asc' ? 'arrowUp' : 'arrowDown') : 'chevron'}
          size={10}
          aria-hidden
          className={isActive ? '' : 'opacity-40'}
        />
      </button>
    </th>
  );
}

