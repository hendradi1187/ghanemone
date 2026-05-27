/**
 * DataQualitySection — menampilkan informasi kualitas data dataset.
 *
 * Fields:
 *   - Completeness: progress bar + persentase
 *   - Positional Accuracy: badge (high/medium/low → green/amber/red)
 *   - Currency: label relatif waktu ("2 hari lalu", dll)
 *
 * Dipakai di:
 *   - DatasetSlideOver (slide-over panel kanan)
 *   - DatasetDetailPage (full page detail, Overview tab)
 *
 * A11y:
 *   - Progress bar dengan role="progressbar" + aria-valuenow + aria-valuemin/max
 *   - Badge accuracy dengan aria-label yang deskriptif
 *
 * Visual:
 *   - Compact mode (default): untuk slide-over — lebih ringkas
 *   - Full mode: untuk detail page — dengan label lengkap
 */
import type { DataQualityInfo } from '../../mocks/datasets';

export interface DataQualitySectionProps {
  dataQuality: DataQualityInfo;
  /** Compact = untuk slide-over, full = untuk detail page. Default 'compact'. */
  variant?: 'compact' | 'full';
}

const accuracyConfig = {
  high: {
    label: 'Tinggi',
    className: 'bg-green-100 text-green-700 border-green-200',
    ariaLabel: 'Akurasi posisional: Tinggi',
  },
  medium: {
    label: 'Sedang',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    ariaLabel: 'Akurasi posisional: Sedang',
  },
  low: {
    label: 'Rendah',
    className: 'bg-red-100 text-red-700 border-red-200',
    ariaLabel: 'Akurasi posisional: Rendah',
  },
} as const;

export function DataQualitySection({
  dataQuality,
  variant = 'compact',
}: DataQualitySectionProps): JSX.Element {
  const accuracy = accuracyConfig[dataQuality.positionalAccuracy];
  const isCompact = variant === 'compact';

  return (
    <section aria-labelledby="dq-heading" className="flex flex-col gap-3">
      <h3
        id="dq-heading"
        className={[
          'font-display font-semibold text-ink m-0',
          isCompact ? 'text-xs uppercase tracking-widest text-ink-4' : 'text-h3',
        ].join(' ')}
      >
        Data Quality
      </h3>

      <dl className="flex flex-col gap-2.5">
        {/* Completeness */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-medium text-ink-4">Completeness</dt>
            <dd className="text-xs font-semibold text-ink num m-0">
              {dataQuality.completeness}%
            </dd>
          </div>
          <div
            role="progressbar"
            aria-valuenow={dataQuality.completeness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Completeness data: ${dataQuality.completeness}%`}
            className="w-full h-1.5 rounded-pill bg-surface-3 overflow-hidden"
          >
            <div
              aria-hidden="true"
              className={[
                'h-full rounded-pill transition-all duration-slow',
                dataQuality.completeness >= 90
                  ? 'bg-green-500'
                  : dataQuality.completeness >= 75
                    ? 'bg-amber-500'
                    : 'bg-red-500',
              ].join(' ')}
              style={{ width: `${dataQuality.completeness}%` }}
            />
          </div>
        </div>

        {/* Positional Accuracy */}
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-4">Akurasi Posisional</dt>
          <dd className="m-0">
            <span
              aria-label={accuracy.ariaLabel}
              className={[
                'inline-flex items-center px-2 py-0.5 rounded-1 border',
                'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
                accuracy.className,
              ].join(' ')}
            >
              {accuracy.label}
            </span>
          </dd>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-4">Terakhir Diperbarui</dt>
          <dd className="text-xs text-ink-2 font-medium m-0">{dataQuality.currency}</dd>
        </div>
      </dl>
    </section>
  );
}
