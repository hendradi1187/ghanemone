/**
 * UploadPage — `/upload` route (Phase 8.15).
 *
 * Wizard 5-step untuk KKKS Operator submit dataset baru.
 * Hanya role `kkks_operator` yang boleh akses; lainnya dapat EmptyState error.
 *
 * State management: `useUploadWizardStore` (Zustand) — persistent ke sessionStorage.
 *
 * Step rendering:
 *   1. UploadDropZone   — pilih file
 *   2. MetadataForm     — RHF + Zod
 *   3. SchemaPreview    — auto-detected attributes
 *   4. ValidationResults — 4 checks
 *   5. ReviewSummary    — submit-ready review
 *
 * Layout:
 *   - Header (title + provider chip)
 *   - UploadStepper (5 dots)
 *   - Step content area (switch by currentStep)
 *   - Footer Prev/Next/Submit
 *
 * NOTE: Tombol Prev/Next/Submit di-render oleh setiap step (mereka tahu cara
 * validate sendiri). UploadPage hanya kasih kerangka.
 */
import { EmptyState } from '@ghanem/ui';
import { useAuth } from '../hooks/use-auth';
import {
  useUploadWizardStore,
  type WizardStep,
} from '../stores/upload-wizard';
import { UploadStepper } from './upload/UploadStepper';
import { UploadDropZone } from './upload/UploadDropZone';
import { MetadataForm } from './upload/MetadataForm';
import { SchemaPreview } from './upload/SchemaPreview';
import { ValidationResults } from './upload/ValidationResults';
import { ReviewSummary } from './upload/ReviewSummary';

export function UploadPage(): JSX.Element {
  const { user } = useAuth();
  const currentStep = useUploadWizardStore((s) => s.currentStep);
  const goToStep = useUploadWizardStore((s) => s.goToStep);

  /* ── Role guard ──────────────────────────────────────────────────── */
  if (user?.role !== 'kkks_operator') {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <EmptyState
          variant="error"
          title="Akses ditolak"
          description="Hanya KKKS Operator yang dapat upload dataset."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <header className="px-6 pt-6 pb-3 bg-surface border-b border-line">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
              SPEKTRUM · Upload
            </p>
            <h1 className="font-display font-bold text-h1 text-ink m-0">Upload Dataset</h1>
            <p className="text-sm text-ink-4 mt-1 max-w-2xl">
              Submit dataset baru atas nama organisasi Anda. Wizard memandu lima tahapan
              singkat — draft akan tersimpan otomatis sampai tab ditutup.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 h-9 rounded-pill border border-line bg-surface-2 text-sm">
            <span className="text-ink-4 text-xs uppercase tracking-cap font-semibold">
              Organisasi
            </span>
            <span className="font-semibold text-ink">{user.organization ?? '—'}</span>
          </div>
        </div>

        <div className="mt-5">
          <UploadStepper currentStep={currentStep} onStepClick={(s) => goToStep(s as WizardStep)} />
        </div>
      </header>

      <div className="px-6 py-6 flex-1">
        <StepContent currentStep={currentStep} />
      </div>
    </div>
  );
}

function StepContent({ currentStep }: { currentStep: WizardStep }): JSX.Element {
  switch (currentStep) {
    case 1:
      return <UploadDropZone />;
    case 2:
      return <MetadataForm />;
    case 3:
      return <SchemaPreview />;
    case 4:
      return <ValidationResults />;
    case 5:
      return <ReviewSummary />;
    default:
      // reason: WizardStep is union 1..5, default unreachable — defensive fallback.
      return <UploadDropZone />;
  }
}

export default UploadPage;
