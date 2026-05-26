/**
 * UploadStepper — 5-step horizontal progress indicator.
 *
 * Behavior:
 *   - Current step highlighted (green) + scale 1.05
 *   - Completed steps clickable (go back) — future steps not clickable
 *   - Each step: numbered circle (atau check icon kalau completed) + label
 *
 * Responsive:
 *   - Desktop: horizontal row dengan connector lines
 *   - Mobile (< sm): vertical stack tanpa connector (compact)
 *
 * A11y:
 *   - `<ol>` semantic (ordered progression)
 *   - `aria-current="step"` di current
 *   - Button untuk completed steps (keyboard-nav-able)
 *   - Future steps rendered sebagai `<span>` non-interactive
 */
import { Icon } from '@ghanem/ui';
import type { WizardStep } from '../../stores/upload-wizard';

interface StepDef {
  id: WizardStep;
  label: string;
}

const STEPS: ReadonlyArray<StepDef> = [
  { id: 1, label: 'File' },
  { id: 2, label: 'Metadata' },
  { id: 3, label: 'Schema' },
  { id: 4, label: 'Validasi' },
  { id: 5, label: 'Review' },
];

export interface UploadStepperProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  /** Optional: kalau true, semua step boleh diklik (mis. dari review back). */
  allowForwardJump?: boolean;
}

export function UploadStepper({
  currentStep,
  onStepClick,
  allowForwardJump = false,
}: UploadStepperProps): JSX.Element {
  return (
    <nav aria-label="Tahapan upload">
      <ol className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
        {STEPS.map((step, idx) => {
          const status: 'completed' | 'current' | 'future' =
            step.id < currentStep ? 'completed' : step.id === currentStep ? 'current' : 'future';
          const canClick = status === 'completed' || (allowForwardJump && status !== 'future');
          const isLast = idx === STEPS.length - 1;

          return (
            <li
              key={step.id}
              className="flex sm:flex-1 items-center gap-2 sm:gap-0 min-w-0"
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <StepNode
                step={step}
                status={status}
                canClick={canClick}
                onClick={() => onStepClick(step.id)}
              />
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={[
                    'hidden sm:block flex-1 h-0.5 mx-2',
                    status === 'completed' ? 'bg-green-500' : 'bg-line',
                  ].join(' ')}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface StepNodeProps {
  step: StepDef;
  status: 'completed' | 'current' | 'future';
  canClick: boolean;
  onClick: () => void;
}

function StepNode({ step, status, canClick, onClick }: StepNodeProps): JSX.Element {
  const circleBase =
    'inline-flex items-center justify-center w-8 h-8 rounded-pill text-xs font-semibold border transition-colors duration-hf';
  const circleClasses =
    status === 'current'
      ? 'bg-green-500 text-white border-green-600 scale-[1.05]'
      : status === 'completed'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-surface text-ink-4 border-line';

  const labelClasses =
    status === 'current'
      ? 'text-ink font-semibold'
      : status === 'completed'
        ? 'text-ink-2'
        : 'text-ink-5';

  const content = (
    <>
      <span className={[circleBase, circleClasses].join(' ')}>
        {status === 'completed' ? (
          <Icon name="check" size={14} aria-hidden />
        ) : (
          <span className="num">{step.id}</span>
        )}
      </span>
      <span className={['text-sm whitespace-nowrap', labelClasses].join(' ')}>{step.label}</span>
    </>
  );

  if (canClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          'inline-flex items-center gap-2',
          'rounded-2 px-1 py-0.5',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          'hover:opacity-90 cursor-pointer',
        ].join(' ')}
        aria-label={`Kembali ke langkah ${step.id}: ${step.label}`}
      >
        {content}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-1 py-0.5" aria-disabled="true">
      {content}
    </span>
  );
}
