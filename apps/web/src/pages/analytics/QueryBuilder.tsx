/**
 * QueryBuilder — form-style chart builder.
 *
 * Field selectors (semua controlled via parent state, di-sync ke URL):
 *   - Dataset dropdown (52 dataset di catalog)
 *   - X axis (categorical/temporal attributes)
 *   - Y axis (numeric attributes, atau any kalau aggregation = count)
 *   - Aggregation (count/sum/avg/min/max)
 *   - Chart type (line/bar/pie/donut) — button group dengan icon
 *
 * Validation visual:
 *   - Required field belum di-set → border merah + hint kecil
 *   - Y harus numeric kecuali aggregation = count → hint
 *
 * Memilih pakai native `<select>` (bukan @ghanem/ui Select / Radix) supaya:
 *   - Field cukup banyak (50+ datasets) — native select OS-handled performant
 *   - Mobile-friendly default
 *   - Tidak menambah bundle weight dari Radix portal trees
 *
 * A11y:
 *   - Setiap `<label htmlFor>` ↔ field id
 *   - Required indicator: asterisk + `aria-required`
 *   - Hint via `aria-describedby`
 *   - Chart type button group: `role="radiogroup"` + `aria-checked`
 */
import { useMemo } from 'react';
import { Icon, type IconName } from '@ghanem/ui';
import { MOCK_CATALOG } from '../../mocks/datasets';
import type {
  AnalyticsAggregation,
  AnalyticsChartType,
  AnalyticsQuery,
} from '../../mocks/analytics';

const AGGREGATIONS: readonly { value: AnalyticsAggregation; label: string }[] = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

const CHART_TYPES: readonly {
  value: AnalyticsChartType;
  label: string;
  icon: IconName;
}[] = [
  { value: 'line', label: 'Line', icon: 'activity' },
  { value: 'bar', label: 'Bar', icon: 'chart' },
  { value: 'pie', label: 'Pie', icon: 'pieChart' },
  { value: 'donut', label: 'Donut', icon: 'pieChart' },
];

export interface QueryBuilderProps {
  /** Current query draft state. */
  value: Partial<AnalyticsQuery>;
  /** Patch query state. */
  onChange: (next: Partial<AnalyticsQuery>) => void;
}

export function QueryBuilder({ value, onChange }: QueryBuilderProps): JSX.Element {
  const dataset = useMemo(
    () => (value.datasetId ? MOCK_CATALOG.find((d) => d.id === value.datasetId) : undefined),
    [value.datasetId],
  );

  const xCandidates = useMemo(() => {
    if (!dataset) return [];
    // X axis cocok untuk categorical / date (avoid geometry).
    return dataset.attributes.filter((a) => a.type === 'string' || a.type === 'date');
  }, [dataset]);

  const yCandidates = useMemo(() => {
    if (!dataset) return [];
    // Y axis: kalau aggregation = count, attribute apapun valid (kecuali geometry).
    // Selain itu hanya numeric.
    if (value.aggregation === 'count') {
      return dataset.attributes.filter((a) => a.type !== 'geometry');
    }
    return dataset.attributes.filter((a) => a.type === 'number');
  }, [dataset, value.aggregation]);

  const showXError = !value.xAxis;
  const showYError = !value.yAxis;
  const showDatasetError = !value.datasetId;

  return (
    <section
      aria-label="Query builder"
      className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-4"
    >
      <div>
        <h2 className="font-display font-semibold text-h3 text-ink m-0">Query builder</h2>
        <p className="text-xs text-ink-4 mt-0.5">
          Pilih dataset dan atribut untuk membangun chart. Field bertanda{' '}
          <span className="text-red-500" aria-hidden>
            *
          </span>{' '}
          wajib diisi.
        </p>
      </div>

      {/* Dataset selector */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="qb-dataset" className="text-xs font-semibold text-ink-2">
          Dataset{' '}
          <span className="text-red-500" aria-hidden>
            *
          </span>
        </label>
        <select
          id="qb-dataset"
          aria-required="true"
          aria-invalid={showDatasetError || undefined}
          aria-describedby="qb-dataset-hint"
          value={value.datasetId ?? ''}
          onChange={(e) => onChange({ datasetId: e.target.value, xAxis: undefined, yAxis: undefined })}
          className={[
            'h-9 px-3 rounded-2 bg-surface text-sm text-ink',
            'border outline-none transition-colors duration-hf',
            'focus-visible:border-green-500',
            showDatasetError ? 'border-red-500' : 'border-line',
          ].join(' ')}
        >
          <option value="" disabled>
            — Pilih dataset —
          </option>
          {MOCK_CATALOG.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <p id="qb-dataset-hint" className="text-[11px] text-ink-4">
          {dataset
            ? `${dataset.attributes.length} atribut tersedia · ${dataset.category ?? 'dataset'}.`
            : 'Pilih salah satu dari 52 dataset di catalog SPEKTRUM.'}
        </p>
      </div>

      {/* Field grid: X / Y / Aggregation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FieldSelect
          id="qb-x"
          label="X axis"
          required
          invalid={showXError}
          value={value.xAxis ?? ''}
          onChange={(v) => onChange({ xAxis: v })}
          disabled={!dataset}
          placeholder={dataset ? '— Pilih atribut —' : 'Pilih dataset dulu'}
          options={xCandidates.map((a) => ({ value: a.name, label: `${a.name} (${a.type})` }))}
          hint="Atribut kategorikal atau temporal."
        />
        <FieldSelect
          id="qb-y"
          label="Y axis"
          required
          invalid={showYError}
          value={value.yAxis ?? ''}
          onChange={(v) => onChange({ yAxis: v })}
          disabled={!dataset}
          placeholder={dataset ? '— Pilih atribut —' : 'Pilih dataset dulu'}
          options={yCandidates.map((a) => ({ value: a.name, label: `${a.name} (${a.type})` }))}
          hint={
            value.aggregation === 'count'
              ? 'Count: semua atribut bisa dipakai.'
              : 'Sum/avg/min/max: hanya atribut numeric.'
          }
        />
        <FieldSelect
          id="qb-agg"
          label="Agregasi"
          required={false}
          invalid={false}
          value={value.aggregation ?? 'count'}
          onChange={(v) => onChange({ aggregation: v as AnalyticsAggregation, yAxis: undefined })}
          disabled={!dataset}
          placeholder=""
          options={AGGREGATIONS.map((a) => ({ value: a.value, label: a.label }))}
          hint="Operasi agregasi yang diterapkan ke Y."
        />
      </div>

      {/* Chart type */}
      <div>
        <p id="qb-chart-type-label" className="text-xs font-semibold text-ink-2 mb-1.5">
          Tipe chart
        </p>
        <div
          role="radiogroup"
          aria-labelledby="qb-chart-type-label"
          className="inline-flex items-center gap-1 p-1 bg-surface-3 rounded-2 border border-line"
        >
          {CHART_TYPES.map((t) => {
            const isActive = value.chartType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange({ chartType: t.value })}
                className={[
                  'inline-flex items-center gap-1.5 px-2.5 h-7 rounded-1 text-xs font-medium',
                  isActive ? 'bg-surface shadow-1 text-ink' : 'text-ink-4 hover:text-ink',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
                  'transition-colors duration-hf',
                ].join(' ')}
              >
                <Icon name={t.icon} size={12} aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── FieldSelect (internal) ─────────────────────────────────────────── */

interface FieldSelectProps {
  id: string;
  label: string;
  required: boolean;
  invalid: boolean;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  hint?: string;
}

function FieldSelect({
  id,
  label,
  required,
  invalid,
  value,
  onChange,
  disabled,
  placeholder,
  options,
  hint,
}: FieldSelectProps): JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink-2">
        {label}{' '}
        {required ? (
          <span className="text-red-500" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={hintId}
        className={[
          'h-9 px-3 rounded-2 bg-surface text-sm text-ink',
          'border outline-none transition-colors duration-hf',
          'disabled:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:border-green-500',
          invalid ? 'border-red-500' : 'border-line',
        ].join(' ')}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="text-[11px] text-ink-4">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
