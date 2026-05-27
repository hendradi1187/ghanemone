/**
 * ReviewDialog — modal review pending dataset dengan tabs + 3 action buttons.
 *
 * Tabs:
 *   1. Detail Dataset — metadata key-value
 *   2. File-file       — mock list file dengan name/size/format
 *   3. Hasil Validasi  — 4 mock checks (topology/schema/attributes/integrity)
 *   4. Catatan Pengirim — submitterNotes
 *
 * Actions: Tolak (danger) / Minta Perubahan (secondary amber) / Setujui (primary).
 * Setiap action membuka inline confirmation form (bukan nested Dialog — supaya
 * focus management lebih sederhana + tidak ada nested modal stacking issue).
 *
 * Setelah action sukses: toast + close dialog + onAction() callback ke parent
 * supaya parent bisa invalidate queue + clear selection.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  Icon,
  Tabs,
  Textarea,
  toast,
  type IconName,
} from '@ghanem/ui';
import {
  approveDataset,
  rejectDataset,
  requestChanges,
} from '../../api/compliance';
import { RISK_FLAG_META, type PendingDataset } from '../../mocks/compliance';
import { useAuth } from '../../hooks/use-auth';

type ActionKind = 'approve' | 'reject' | 'request-changes';

interface MockFile {
  name: string;
  sizeMb: number;
  format: string;
}

interface ValidationCheck {
  key: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

/** Mock files derived deterministically dari dataset (count + sizeMb). */
function buildMockFiles(item: PendingDataset): MockFile[] {
  const count = Math.min(Math.max(item.fileCount, 1), 5);
  const avgSize = item.sizeMb / item.fileCount;
  const formats: Record<PendingDataset['category'], readonly string[]> = {
    seismic: ['SEG-Y', 'SEG-Y', 'XML'],
    'well-log': ['LAS', 'CSV', 'JSON'],
    production: ['CSV', 'XLSX'],
    concession: ['SHP', 'GeoJSON', 'PRJ'],
    geology: ['CSV', 'JSON', 'PDF'],
    document: ['PDF', 'DOCX'],
  };
  const fmt = formats[item.category];
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
  return Array.from({ length: count }, (_, i) => ({
    name: `${slug}-${(i + 1).toString().padStart(2, '0')}.${(fmt[i % fmt.length] ?? 'dat').toLowerCase()}`,
    sizeMb: Math.max(0.1, avgSize * (0.7 + ((i % 3) * 0.2))),
    format: fmt[i % fmt.length] ?? 'DAT',
  }));
}

/** Mock validation checks — derived dari item.validationStatus + riskFlags. */
function buildValidationChecks(item: PendingDataset): ValidationCheck[] {
  const hasIncomplete = item.riskFlags.includes('incomplete-metadata');
  const isFail = item.validationStatus === 'fail';
  const isWarn = item.validationStatus === 'warning';

  return [
    {
      key: 'topology',
      label: 'Validasi Topologi',
      status: isFail && item.kind === 'LAYER' ? 'fail' : 'pass',
      message:
        isFail && item.kind === 'LAYER'
          ? 'Ditemukan 3 fitur self-intersect — perbaiki sebelum approve.'
          : 'Tidak ada self-intersect atau topologi error.',
    },
    {
      key: 'schema',
      label: 'Validasi Schema',
      status: hasIncomplete ? 'warn' : 'pass',
      message: hasIncomplete
        ? 'Beberapa kolom wajib (acquisition_date, vendor) kosong.'
        : 'Semua kolom wajib terisi sesuai schema KKKS.',
    },
    {
      key: 'attributes',
      label: 'Validasi Atribut',
      status: isWarn ? 'warn' : 'pass',
      message: isWarn
        ? 'Beberapa nilai atribut di luar range yang diharapkan.'
        : 'Atribut sesuai dengan domain values yang valid.',
    },
    {
      key: 'integrity',
      label: 'Integritas File',
      status: isFail ? 'fail' : 'pass',
      message: isFail
        ? 'Checksum file tidak cocok — kemungkinan corruption.'
        : 'Checksum cocok, file utuh.',
    },
  ];
}

const VALIDATION_TONE: Record<
  ValidationCheck['status'],
  { icon: IconName; cls: string; label: string }
> = {
  pass: { icon: 'check', cls: 'text-green-700 bg-green-50 border-green-200', label: 'Lulus' },
  warn: { icon: 'warn', cls: 'text-amber-700 bg-amber-100 border-amber-100', label: 'Peringatan' },
  fail: { icon: 'x', cls: 'text-red-500 bg-red-100 border-red-100', label: 'Gagal' },
};

const RISK_CHIP_TONE: Record<'red' | 'amber' | 'blue', string> = {
  red: 'bg-red-100 text-red-500 border-red-100',
  amber: 'bg-amber-100 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
};

function formatBytes(mb: number): string {
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  if (mb < 1024) return `${mb.toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
  return `${(mb / 1024).toLocaleString('id-ID', { maximumFractionDigits: 2 })} GB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export interface ReviewDialogProps {
  dataset: PendingDataset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback setelah salah satu action berhasil (approve/reject/request-changes). */
  onAction: () => void;
}

export function ReviewDialog({
  dataset,
  open,
  onOpenChange,
  onAction,
}: ReviewDialogProps): JSX.Element {
  const { user } = useAuth();
  const [tab, setTab] = useState<'detail' | 'files' | 'validation' | 'notes'>('detail');
  const [pendingAction, setPendingAction] = useState<ActionKind | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);

  const files = useMemo(() => buildMockFiles(dataset), [dataset]);
  const checks = useMemo(() => buildValidationChecks(dataset), [dataset]);

  const reset = useCallback(() => {
    setTab('detail');
    setPendingAction(null);
    setReasonText('');
    setReasonError(null);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const submitAction = useCallback(async () => {
    if (!user) {
      toast.error('Sesi tidak valid', { description: 'Silakan login ulang.' });
      return;
    }
    if (!pendingAction) return;

    // Reason required untuk reject + request-changes.
    if (pendingAction !== 'approve' && reasonText.trim().length < 3) {
      setReasonError('Alasan wajib diisi minimal 3 karakter.');
      return;
    }
    setReasonError(null);
    setSubmitting(true);
    try {
      if (pendingAction === 'approve') {
        await approveDataset(dataset.id, user, reasonText.trim() || undefined);
        toast.success('Dataset disetujui', { description: dataset.title });
      } else if (pendingAction === 'reject') {
        await rejectDataset(dataset.id, user, reasonText.trim());
        toast.success('Dataset ditolak', { description: dataset.title });
      } else {
        await requestChanges(dataset.id, user, reasonText.trim());
        toast.success('Permintaan perubahan dikirim', { description: dataset.title });
      }
      reset();
      onAction();
      onOpenChange(false);
    } catch (err) {
      void err;
      toast.error('Gagal memproses aksi', {
        description: 'Terjadi kesalahan. Coba lagi.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [dataset, onAction, onOpenChange, pendingAction, reasonText, reset, user]);

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content size="xl" className="max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
          <Dialog.Title>{dataset.title}</Dialog.Title>
          <Dialog.Description>
            <span className="inline-flex items-center gap-2 flex-wrap text-xs text-ink-4 mt-1">
              <span
                className={[
                  'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                  'text-[10px] font-semibold uppercase tracking-widest leading-none',
                  'bg-surface-3 text-ink-2 border-line',
                ].join(' ')}
              >
                {dataset.kkks}
              </span>
              <span aria-hidden>·</span>
              <span>{dataset.category}</span>
              <span aria-hidden>·</span>
              <span className="num">{dataset.sizeMb.toLocaleString('id-ID')} MB</span>
              <span aria-hidden>·</span>
              <span>{formatDate(dataset.submittedAt)}</span>
            </span>
          </Dialog.Description>
        </Dialog.Header>

        <div className="mt-4">
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <Tabs.List aria-label="Tab review dataset">
              <Tabs.Trigger value="detail">Detail Dataset</Tabs.Trigger>
              <Tabs.Trigger value="files">
                File-file{' '}
                <span className="text-ink-4 font-normal num">({files.length})</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="validation">
                Hasil Validasi{' '}
                <span className="text-ink-4 font-normal num">({checks.length})</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="notes">Catatan Pengirim</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="detail" className="pt-4">
              <DetailTab dataset={dataset} />
            </Tabs.Content>
            <Tabs.Content value="files" className="pt-4">
              <FilesTab files={files} />
            </Tabs.Content>
            <Tabs.Content value="validation" className="pt-4">
              <ValidationTab checks={checks} />
            </Tabs.Content>
            <Tabs.Content value="notes" className="pt-4">
              <NotesTab dataset={dataset} />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* ── Inline action confirm form ──────────────────────────── */}
        {pendingAction ? (
          <div
            role="region"
            aria-label="Konfirmasi aksi"
            className={[
              'mt-4 p-3 border rounded-2',
              pendingAction === 'approve'
                ? 'bg-green-50 border-green-200'
                : pendingAction === 'reject'
                  ? 'bg-red-100 border-red-100'
                  : 'bg-amber-100 border-amber-100',
            ].join(' ')}
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="action-reason"
                className="text-sm font-semibold text-ink"
              >
                {pendingAction === 'approve' ? (
                  <>
                    Setujui dataset ini?{' '}
                    <span className="text-ink-4 font-normal">
                      (catatan opsional)
                    </span>
                  </>
                ) : pendingAction === 'reject' ? (
                  <>
                    Alasan penolakan <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    Catatan perubahan yang diminta{' '}
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <Textarea
                id="action-reason"
                placeholder={
                  pendingAction === 'approve'
                    ? 'Misalnya: validasi lulus, metadata lengkap.'
                    : pendingAction === 'reject'
                      ? 'Jelaskan alasan penolakan secara jelas…'
                      : 'Jelaskan perubahan yang harus dilakukan KKKS…'
                }
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                invalid={Boolean(reasonError)}
                aria-describedby={reasonError ? 'action-reason-error' : undefined}
                rows={3}
              />
              {reasonError ? (
                <p
                  id="action-reason-error"
                  role="alert"
                  className="text-xs text-red-500 m-0"
                >
                  {reasonError}
                </p>
              ) : null}
              <div className="flex items-center justify-end gap-2 mt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPendingAction(null);
                    setReasonText('');
                    setReasonError(null);
                  }}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  variant={
                    pendingAction === 'approve'
                      ? 'primary'
                      : pendingAction === 'reject'
                        ? 'danger'
                        : 'secondary'
                  }
                  size="sm"
                  loading={submitting}
                  onClick={() => void submitAction()}
                >
                  {pendingAction === 'approve'
                    ? 'Setujui'
                    : pendingAction === 'reject'
                      ? 'Tolak'
                      : 'Kirim'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <Dialog.Footer>
          <Button
            variant="danger"
            leftIcon="x"
            onClick={() => {
              setPendingAction('reject');
              setReasonText('');
              setReasonError(null);
            }}
            disabled={submitting || pendingAction === 'reject'}
          >
            Tolak
          </Button>
          <Button
            variant="secondary"
            leftIcon="warn"
            onClick={() => {
              setPendingAction('request-changes');
              setReasonText('');
              setReasonError(null);
            }}
            disabled={submitting || pendingAction === 'request-changes'}
            className="border-amber-100 text-amber-700 bg-amber-100 hover:bg-amber-100"
          >
            Minta Perubahan
          </Button>
          <Button
            variant="primary"
            leftIcon="check"
            onClick={() => {
              setPendingAction('approve');
              setReasonText('');
              setReasonError(null);
            }}
            disabled={submitting || pendingAction === 'approve'}
          >
            Setujui
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/* ─── Tab: Detail ────────────────────────────────────────────────────── */

function DetailTab({ dataset }: { dataset: PendingDataset }): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-2 m-0">{dataset.description}</p>
      <dl className="grid gap-x-6 gap-y-2 grid-cols-1 sm:grid-cols-2 bg-surface-2 border border-line rounded-2 p-3">
        <MetaRow label="ID submission" value={dataset.id} mono />
        <MetaRow label="Kategori" value={dataset.category} />
        <MetaRow label="Tipe data" value={dataset.kind} mono />
        <MetaRow
          label="Ukuran total"
          value={`${dataset.sizeMb.toLocaleString('id-ID')} MB`}
          mono
        />
        <MetaRow label="Jumlah file" value={dataset.fileCount.toString()} mono />
        <MetaRow label="Status validasi" value={dataset.validationStatus} />
        <MetaRow label="Provider" value={dataset.kkks} />
        <MetaRow
          label="Disubmit"
          value={new Date(dataset.submittedAt).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
          mono
        />
      </dl>
      <div>
        <p className="text-xs text-ink-4 uppercase tracking-cap font-medium mb-1.5">
          Pengirim
        </p>
        <div className="text-sm text-ink-2">
          <b>{dataset.submittedBy.fullName ?? dataset.submittedBy.email}</b>
          <br />
          <span className="text-ink-4 text-xs">
            {dataset.submittedBy.email} · {dataset.submittedBy.organization ?? '—'}
          </span>
        </div>
      </div>
      {dataset.riskFlags.length > 0 ? (
        <div>
          <p className="text-xs text-ink-4 uppercase tracking-cap font-medium mb-1.5">
            Risk flag
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            {dataset.riskFlags.map((flag) => {
              const meta = RISK_FLAG_META[flag];
              return (
                <span
                  key={flag}
                  className={[
                    'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                    'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
                    RISK_CHIP_TONE[meta.tone],
                  ].join(' ')}
                >
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): JSX.Element {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <dt className="text-xs text-ink-4 font-medium uppercase tracking-cap flex-none w-32">
        {label}
      </dt>
      <dd className={['text-sm text-ink-2 truncate m-0', mono ? 'font-mono' : ''].join(' ')}>
        {value}
      </dd>
    </div>
  );
}

/* ─── Tab: Files ─────────────────────────────────────────────────────── */

function FilesTab({ files }: { files: MockFile[] }): JSX.Element {
  return (
    <div className="border border-line rounded-2 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left">
          <tr className="border-b border-line">
            <th
              scope="col"
              className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
            >
              Nama file
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3"
            >
              Format
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 text-right"
            >
              Ukuran
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f.name} className="border-b border-line last:border-b-0">
              <td className="px-3 py-2 font-mono text-xs text-ink truncate max-w-[20rem]">
                {f.name}
              </td>
              <td className="px-3 py-2">
                <span
                  className={[
                    'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                    'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
                    'bg-surface-3 text-ink-3 border-line',
                  ].join(' ')}
                >
                  {f.format}
                </span>
              </td>
              <td className="px-3 py-2 num text-ink-2 text-right">
                {formatBytes(f.sizeMb)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Validation ────────────────────────────────────────────────── */

function ValidationTab({ checks }: { checks: ValidationCheck[] }): JSX.Element {
  return (
    <ul className="flex flex-col gap-2 list-none m-0 p-0">
      {checks.map((c) => {
        const tone = VALIDATION_TONE[c.status];
        return (
          <li
            key={c.key}
            className={['flex items-start gap-3 p-3 border rounded-2', tone.cls].join(' ')}
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-8 h-8 rounded-pill bg-surface flex-none"
            >
              <Icon name={tone.icon} size={16} aria-hidden />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink m-0">{c.label}</h3>
                <span className="text-[10.5px] font-semibold uppercase tracking-widest leading-none">
                  {tone.label}
                </span>
              </div>
              <p className="text-xs text-ink-2 m-0 mt-1">{c.message}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Tab: Notes ─────────────────────────────────────────────────────── */

function NotesTab({ dataset }: { dataset: PendingDataset }): JSX.Element {
  return (
    <div className="bg-surface-2 border border-line rounded-2 p-3">
      <p className="text-xs text-ink-4 uppercase tracking-cap font-medium mb-1.5">
        Catatan dari {dataset.submittedBy.fullName ?? dataset.submittedBy.email}
      </p>
      {dataset.submitterNotes ? (
        <p className="text-sm text-ink m-0 whitespace-pre-wrap">{dataset.submitterNotes}</p>
      ) : (
        <p className="text-sm text-ink-4 italic m-0">
          Pengirim tidak menyertakan catatan tambahan.
        </p>
      )}
    </div>
  );
}
