/**
 * BulkActionDialog — konfirmasi bulk approve/reject dengan preview + reason field.
 *
 * Behavior:
 *   - Warning banner di top body
 *   - Preview list: 5 item pertama, sisanya "+N lainnya"
 *   - Reason: required untuk reject, optional untuk approve
 *   - Submit: Promise.all parallel call per item; toast aggregate hasil
 *
 * Phase 9 considerations:
 *   - Untuk dataset >50 items, Phase 9 ganti dengan single bulk endpoint
 *     (POST /v1/compliance/datasets/bulk-action) supaya atomic + lebih efisien.
 *   - Sementara client-side Promise.all cukup untuk volume saat ini.
 */
import { useCallback, useState } from 'react';
import { Button, Dialog, Icon, Textarea, toast } from '@ghanem/ui';
import { approveDataset, rejectDataset } from '../../api/compliance';
import type { PendingDataset } from '../../mocks/compliance';
import { useAuth } from '../../hooks/use-auth';

export interface BulkActionDialogProps {
  action: 'approve' | 'reject';
  items: PendingDataset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const PREVIEW_COUNT = 5;

export function BulkActionDialog({
  action,
  items,
  open,
  onOpenChange,
  onComplete,
}: BulkActionDialogProps): JSX.Element {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isReject = action === 'reject';
  const total = items.length;
  const preview = items.slice(0, PREVIEW_COUNT);
  const overflow = total - PREVIEW_COUNT;

  const handleClose = useCallback(
    (next: boolean) => {
      if (!next) {
        setReason('');
        setError(null);
        setSubmitting(false);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error('Sesi tidak valid', { description: 'Silakan login ulang.' });
      return;
    }
    if (isReject && reason.trim().length < 3) {
      setError('Alasan penolakan wajib diisi minimal 3 karakter.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const trimmed = reason.trim();
    const results = await Promise.allSettled(
      items.map((item) =>
        isReject
          ? rejectDataset(item.id, user, trimmed)
          : approveDataset(item.id, user, trimmed || undefined),
      ),
    );
    const okCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = total - okCount;

    if (failCount === 0) {
      toast.success(
        isReject
          ? `${okCount} dataset berhasil ditolak`
          : `${okCount} dataset berhasil disetujui`,
      );
    } else if (okCount === 0) {
      toast.error('Semua aksi gagal', {
        description: 'Coba lagi atau hubungi admin.',
      });
    } else {
      toast.warning(
        `${okCount} berhasil, ${failCount} gagal`,
        { description: 'Beberapa aksi tidak dapat diproses.' },
      );
    }

    setSubmitting(false);
    setReason('');
    onComplete();
  }, [isReject, items, onComplete, reason, total, user]);

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content size="md">
        <Dialog.Header>
          <Dialog.Title>
            {isReject ? `Tolak ${total} Dataset` : `Setujui ${total} Dataset`}
          </Dialog.Title>
          <Dialog.Description>
            {isReject
              ? 'Tindakan ini akan menolak semua dataset terpilih dan mengirimkan notifikasi ke KKKS terkait.'
              : 'Tindakan ini akan menyetujui semua dataset terpilih dan mempublikasikannya ke katalog.'}
          </Dialog.Description>
        </Dialog.Header>

        <div className="mt-4 flex flex-col gap-3">
          {/* ── Warning banner ──────────────────────────────────── */}
          <div
            role="alert"
            className={[
              'flex items-start gap-2 p-2.5 rounded-2 border',
              isReject
                ? 'bg-red-100 border-red-100 text-red-500'
                : 'bg-amber-100 border-amber-100 text-amber-700',
            ].join(' ')}
          >
            <Icon name="warn" size={14} aria-hidden className="mt-0.5 flex-none" />
            <p className="text-xs m-0">
              {isReject
                ? 'Aksi ini tidak dapat dibatalkan. Pastikan alasan penolakan jelas — pengirim KKKS akan menerima notifikasi.'
                : 'Setelah disetujui, dataset akan publikasi otomatis dan tidak dapat di-unapprove. Pastikan validasi sudah lengkap.'}
            </p>
          </div>

          {/* ── Preview list ─────────────────────────────────────── */}
          <div>
            <p className="text-xs text-ink-4 uppercase tracking-cap font-medium mb-2">
              Daftar dataset
            </p>
            <ul className="flex flex-col gap-1.5 list-none m-0 p-0 max-h-48 overflow-y-auto border border-line rounded-2 bg-surface-2 p-2">
              {preview.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-xs px-2 py-1.5 rounded-1 bg-surface border border-line"
                >
                  <Icon
                    name="database"
                    size={11}
                    aria-hidden
                    className="text-ink-4 mt-0.5 flex-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink truncate">
                      {item.title}
                    </div>
                    <div className="text-[10.5px] text-ink-4">
                      {item.kkks} · {item.category}
                    </div>
                  </div>
                </li>
              ))}
              {overflow > 0 ? (
                <li className="text-[11px] text-ink-4 italic px-2 py-1">
                  …dan <span className="num font-semibold">{overflow}</span>{' '}
                  dataset lainnya
                </li>
              ) : null}
            </ul>
          </div>

          {/* ── Reason field ────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="bulk-reason"
              className="text-sm font-medium text-ink"
            >
              {isReject ? (
                <>
                  Alasan penolakan <span className="text-red-500">*</span>
                </>
              ) : (
                <>
                  Catatan persetujuan{' '}
                  <span className="text-ink-4 font-normal">(opsional)</span>
                </>
              )}
            </label>
            <Textarea
              id="bulk-reason"
              placeholder={
                isReject
                  ? 'Misalnya: validasi gagal untuk semua dataset, perbaiki dan submit ulang.'
                  : 'Catatan persetujuan opsional…'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              invalid={Boolean(error)}
              aria-describedby={error ? 'bulk-reason-error' : undefined}
              rows={3}
              disabled={submitting}
            />
            {error ? (
              <p
                id="bulk-reason-error"
                role="alert"
                className="text-xs text-red-500 m-0"
              >
                {error}
              </p>
            ) : null}
            <p className="text-[11px] text-ink-4">
              Alasan yang sama akan diterapkan untuk semua{' '}
              <span className="num font-semibold">{total}</span> dataset.
            </p>
          </div>
        </div>

        <Dialog.Footer>
          <Button
            variant="secondary"
            onClick={() => handleClose(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            variant={isReject ? 'danger' : 'primary'}
            leftIcon={isReject ? 'x' : 'check'}
            loading={submitting}
            onClick={() => void handleSubmit()}
          >
            {isReject ? `Tolak ${total} Dataset` : `Setujui ${total} Dataset`}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
