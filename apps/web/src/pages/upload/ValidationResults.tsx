/**
 * ValidationResults — Step 4: run 4 validation checks (mock) lalu render list.
 *
 * 4 checks (semua mock client-side; Phase 9 ganti dengan API call):
 *   1. Topology check     — geometri valid, tidak self-intersect
 *   2. Schema validation  — atribut wajib tersedia
 *   3. Attribute complete — kolom kritikal tidak null
 *   4. File integrity     — ukuran + checksum konsisten
 *
 * Distribusi probabilistik:
 *   - 70% all pass
 *   - 25% 1 warning random
 *   - 5%  1 fail random
 *
 * Block next kalau ada `fail`. Warning prompts confirm dialog sebelum allow next.
 *
 * UX:
 *   - "Jalankan Validasi" kalau belum run
 *   - "Coba Lagi" kalau ada warning/fail (re-run)
 *   - Disabled "Lanjut" sampai pass / setelah konfirmasi warning
 */
import { useCallback, useMemo, useState } from 'react';
import { Button, Dialog, Icon } from '@ghanem/ui';
import type { ValidationSeverity } from '../../mocks/upload';
import {
  useUploadWizardStore,
  type ValidationCheckResult,
} from '../../stores/upload-wizard';

type CheckKey = 'topology' | 'schema' | 'attributes' | 'integrity';

interface CheckDef {
  key: CheckKey;
  label: string;
  /** Default message kalau lulus. */
  okMessage: string;
  warnMessages: string[];
  failMessages: string[];
}

const CHECKS: ReadonlyArray<CheckDef> = [
  {
    key: 'topology',
    label: 'Topology check',
    okMessage: 'Geometri valid — tidak ada self-intersection atau duplicate vertex.',
    warnMessages: [
      'Ditemukan 2 polygon dengan duplicate vertex — direkomendasikan di-clean.',
      'Beberapa geometri memiliki sliver polygon kecil (<0.001 km²).',
    ],
    failMessages: [
      'Self-intersection terdeteksi pada beberapa polygon. Fix sebelum upload.',
      'Geometri kosong (NULL) ditemukan pada record tertentu.',
    ],
  },
  {
    key: 'schema',
    label: 'Schema validation',
    okMessage: 'Semua kolom wajib hadir dan bertipe sesuai schema referensi.',
    warnMessages: [
      'Kolom "operator" hilang — akan di-derive dari metadata provider.',
      'Tipe "date" pada kolom "spud_date" memakai string format, akan di-parse otomatis.',
    ],
    failMessages: [
      'Kolom wajib "geometry" tidak ditemukan. Tidak bisa diupload.',
      'Tipe data tidak konsisten antar baris pada kolom "depth_m".',
    ],
  },
  {
    key: 'attributes',
    label: 'Attribute completeness',
    okMessage: 'Semua attribute non-nullable terisi penuh.',
    warnMessages: [
      'Sekitar 3% baris memiliki nilai NULL pada kolom yang seharusnya wajib.',
      'Kolom "remarks" 40% kosong — pertimbangkan menambah catatan.',
    ],
    failMessages: [
      'Kolom kritikal "well_id" memiliki >10% NULL. Tidak bisa diupload.',
    ],
  },
  {
    key: 'integrity',
    label: 'File integrity',
    okMessage: 'Checksum cocok, ukuran konsisten, tidak ada byte corruption.',
    warnMessages: [
      'Ukuran file mendekati batas 100 MB; upload mungkin lebih lambat.',
    ],
    failMessages: [
      'Checksum tidak cocok dengan header file. File mungkin korup.',
    ],
  },
];

/* ─── Severity icon styling ──────────────────────────────────────────── */

function severityIcon(severity: ValidationSeverity): {
  icon: 'check' | 'warn' | 'x';
  bg: string;
  fg: string;
  border: string;
} {
  if (severity === 'pass') {
    return { icon: 'check', bg: 'bg-green-50', fg: 'text-green-700', border: 'border-green-200' };
  }
  if (severity === 'warning') {
    return { icon: 'warn', bg: 'bg-amber-100', fg: 'text-amber-700', border: 'border-amber-300' };
  }
  return { icon: 'x', bg: 'bg-red-100', fg: 'text-red-500', border: 'border-red-100' };
}

function pickRandom<T>(arr: ReadonlyArray<T>): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Run mock validation — return aggregated ValidationCheckResult. */
async function runMockValidation(): Promise<ValidationCheckResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));

  const roll = Math.random();
  const allPass = roll < 0.7;
  const oneWarning = !allPass && roll < 0.95;
  const oneFail = !allPass && !oneWarning;

  const result: ValidationCheckResult = {
    topology: 'pass',
    schema: 'pass',
    attributes: 'pass',
    integrity: 'pass',
    messages: {
      topology: CHECKS[0]!.okMessage,
      schema: CHECKS[1]!.okMessage,
      attributes: CHECKS[2]!.okMessage,
      integrity: CHECKS[3]!.okMessage,
    },
    perFile: [],
    ranAt: Date.now(),
  };

  if (oneWarning || oneFail) {
    const targetIdx = Math.floor(Math.random() * CHECKS.length);
    const target = CHECKS[targetIdx]!;
    const severity: ValidationSeverity = oneFail ? 'fail' : 'warning';
    const messages = oneFail ? target.failMessages : target.warnMessages;
    result[target.key] = severity;
    result.messages[target.key] = pickRandom(messages) ?? (oneFail ? 'Validasi gagal' : 'Peringatan');
  }

  return result;
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function ValidationResults(): JSX.Element {
  const validationResults = useUploadWizardStore((s) => s.validationResults);
  const setValidationResults = useUploadWizardStore((s) => s.setValidationResults);
  const goToStep = useUploadWizardStore((s) => s.goToStep);
  const selectedFiles = useUploadWizardStore((s) => s.selectedFiles);

  const [running, setRunning] = useState(false);
  const [warningPrompt, setWarningPrompt] = useState(false);

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      const res = await runMockValidation();
      setValidationResults(res);
    } finally {
      setRunning(false);
    }
  }, [setValidationResults]);

  const aggregate = useMemo<ValidationSeverity | null>(() => {
    if (!validationResults) return null;
    const values: ValidationSeverity[] = [
      validationResults.topology,
      validationResults.schema,
      validationResults.attributes,
      validationResults.integrity,
    ];
    if (values.includes('fail')) return 'fail';
    if (values.includes('warning')) return 'warning';
    return 'pass';
  }, [validationResults]);

  const handleNext = useCallback(() => {
    if (!aggregate) return;
    if (aggregate === 'fail') return;
    if (aggregate === 'warning') {
      setWarningPrompt(true);
      return;
    }
    goToStep(5);
  }, [aggregate, goToStep]);

  const confirmContinueWithWarnings = useCallback(() => {
    setWarningPrompt(false);
    goToStep(5);
  }, [goToStep]);

  if (selectedFiles.length === 0) {
    return (
      <div role="status" className="text-center text-ink-4 py-10 text-sm">
        Belum ada file untuk divalidasi. Kembali ke step 1.
      </div>
    );
  }

  /* ── Initial state — belum run ───────────────────────────────────── */
  if (!validationResults && !running) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="flex flex-col items-center text-center gap-3 p-8 border border-dashed border-line rounded-3 bg-surface">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-14 h-14 rounded-pill bg-green-50 text-green-600"
          >
            <Icon name="shield" size={26} aria-hidden />
          </span>
          <div>
            <p className="font-display font-semibold text-h3 text-ink m-0">
              Siap menjalankan validasi
            </p>
            <p className="text-sm text-ink-4 mt-1 m-0">
              Empat pemeriksaan akan dijalankan: topology, schema, kelengkapan atribut, dan
              integritas file.
            </p>
          </div>
          <Button variant="primary" leftIcon="bolt" onClick={() => void handleRun()}>
            Jalankan Validasi
          </Button>
        </div>
        <Footer onBack={() => goToStep(3)} onNext={handleNext} canNext={false} />
      </div>
    );
  }

  /* ── Running state ────────────────────────────────────────────────── */
  if (running) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center text-center gap-3 p-8 border border-line rounded-3 bg-surface"
        >
          <span
            aria-hidden="true"
            className="inline-block w-10 h-10 border-2 border-green-200 border-t-green-500 rounded-pill animate-spin"
          />
          <p className="text-sm text-ink-3 m-0">Menjalankan 4 pemeriksaan validasi…</p>
        </div>
        <Footer onBack={() => goToStep(3)} onNext={handleNext} canNext={false} />
      </div>
    );
  }

  /* ── Hasil ───────────────────────────────────────────────────────── */
  if (!validationResults) return <></>;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {CHECKS.map((c) => {
          const severity = validationResults[c.key];
          const sevCfg = severityIcon(severity);
          const message = validationResults.messages[c.key];
          return (
            <li
              key={c.key}
              className={[
                'flex items-start gap-3 p-3 rounded-2 border bg-surface',
                sevCfg.border,
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'inline-flex items-center justify-center w-9 h-9 rounded-2 flex-none',
                  sevCfg.bg,
                  sevCfg.fg,
                ].join(' ')}
              >
                <Icon name={sevCfg.icon} size={16} aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-ink">{c.label}</span>
                  <span
                    className={[
                      'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                      'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
                      sevCfg.bg,
                      sevCfg.fg,
                      sevCfg.border,
                    ].join(' ')}
                  >
                    {severity === 'pass' ? 'Lulus' : severity === 'warning' ? 'Peringatan' : 'Gagal'}
                  </span>
                </div>
                <p className={['text-xs mt-1 m-0', sevCfg.fg].join(' ')}>{message}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
        <p className="text-xs text-ink-4 m-0">
          Dijalankan{' '}
          {new Date(validationResults.ranAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
          .
        </p>
        <Button variant="secondary" leftIcon="refresh" onClick={() => void handleRun()}>
          Coba Lagi
        </Button>
      </div>

      <Footer onBack={() => goToStep(3)} onNext={handleNext} canNext={aggregate !== 'fail'} />

      {/* Warning confirm dialog */}
      <Dialog.Root open={warningPrompt} onOpenChange={setWarningPrompt}>
        <Dialog.Content size="sm">
          <Dialog.Header>
            <Dialog.Title>Lanjutkan dengan peringatan?</Dialog.Title>
            <Dialog.Description>
              Beberapa pemeriksaan menghasilkan warning. Dataset tetap bisa diunggah, tapi
              kualitas mungkin dipertanyakan oleh reviewer.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary" type="button">
                Batal
              </Button>
            </Dialog.Close>
            <Button variant="primary" onClick={confirmContinueWithWarnings}>
              Ya, lanjutkan
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

interface FooterProps {
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}

function Footer({ onBack, onNext, canNext }: FooterProps): JSX.Element {
  return (
    <div className="flex justify-between gap-2 pt-2 flex-wrap">
      <Button variant="secondary" onClick={onBack} leftIcon="chevL">
        Kembali
      </Button>
      <Button variant="primary" onClick={onNext} rightIcon="arrowR" disabled={!canNext}>
        Lanjut ke Review
      </Button>
    </div>
  );
}
