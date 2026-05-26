/**
 * ExploreFilters — sidebar filter panel untuk ExplorePage.
 *
 * Feature-specific (di apps/web/src/pages/explore, BUKAN di @ghanem/ui)
 * karena bentuk panelnya tightly-coupled ke ExplorePage URL state.
 *
 * Sections:
 *   - Kategori (multi-checkbox)
 *   - Provider (multi-checkbox)
 *   - Status sensitivity (multi-checkbox)
 *   - Year range (dual range slider, fallback ke 2 number input)
 *   - Reset all
 *
 * A11y:
 *   - Section dirender sebagai `<fieldset>` + `<legend>` supaya SR
 *     mengumumkan grouping.
 *   - Checkbox memakai @ghanem/ui Checkbox (Radix — built-in a11y).
 *   - Range slider memakai 2 native `<input type="range">` dengan label.
 */
import { useId } from 'react';
import {
  Checkbox,
  Icon,
  Stack,
  type DatasetStatus,
} from '@ghanem/ui';
import {
  CATEGORIES,
  DATASET_YEAR_RANGE,
  PROVIDERS,
  type DatasetCategory,
} from '../../mocks/datasets';

export interface ExploreFilterValues {
  categories: DatasetCategory[];
  providers: string[];
  statuses: DatasetStatus[];
  yearMin: number;
  yearMax: number;
}

export interface ExploreFiltersProps {
  values: ExploreFilterValues;
  onChange: (next: ExploreFilterValues) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: ReadonlyArray<{ id: DatasetStatus; label: string; description: string }> = [
  { id: 'public', label: 'Public', description: 'Akses terbuka — semua user' },
  { id: 'internal', label: 'Internal', description: 'Internal organisasi' },
  { id: 'confidential', label: 'Confidential', description: 'Restricted (perlu izin)' },
];

export function ExploreFilters({ values, onChange, onReset }: ExploreFiltersProps): JSX.Element {
  const yearMinId = useId();
  const yearMaxId = useId();
  const [defaultMin, defaultMax] = DATASET_YEAR_RANGE;

  const toggleArray = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const handleCategoryToggle = (id: DatasetCategory): void => {
    onChange({ ...values, categories: toggleArray(values.categories, id) });
  };

  const handleProviderToggle = (id: string): void => {
    onChange({ ...values, providers: toggleArray(values.providers, id) });
  };

  const handleStatusToggle = (id: DatasetStatus): void => {
    onChange({ ...values, statuses: toggleArray(values.statuses, id) });
  };

  const setYearMin = (n: number): void => {
    const clamped = Math.min(Math.max(n, defaultMin), values.yearMax);
    onChange({ ...values, yearMin: clamped });
  };
  const setYearMax = (n: number): void => {
    const clamped = Math.max(Math.min(n, defaultMax), values.yearMin);
    onChange({ ...values, yearMax: clamped });
  };

  const hasFilters =
    values.categories.length > 0 ||
    values.providers.length > 0 ||
    values.statuses.length > 0 ||
    values.yearMin > defaultMin ||
    values.yearMax < defaultMax;

  return (
    <aside
      aria-label="Filter dataset"
      className="w-72 flex-none border-r border-line bg-surface-2 overflow-y-auto"
    >
      <div className="p-4 flex items-center justify-between border-b border-line">
        <h2 className="font-display font-semibold text-h3 text-ink m-0">Filter</h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={onReset}
            className={[
              'inline-flex items-center gap-1',
              'text-xs font-semibold text-green-700',
              'hover:text-green-500',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              'rounded-1 px-1.5 py-0.5',
            ].join(' ')}
          >
            <Icon name="refresh" size={11} aria-hidden />
            Reset
          </button>
        ) : null}
      </div>

      <Stack direction="col" gap="6" className="p-4">
        <FilterSection title="Kategori">
          <Stack direction="col" gap="2">
            {CATEGORIES.map((cat) => (
              <Checkbox
                key={cat.id}
                id={`filter-cat-${cat.id}`}
                checked={values.categories.includes(cat.id)}
                onCheckedChange={() => handleCategoryToggle(cat.id)}
                label={
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block w-2.5 h-2.5 rounded-pill"
                      style={{ background: cat.color }}
                    />
                    {cat.label}
                  </span>
                }
              />
            ))}
          </Stack>
        </FilterSection>

        <FilterSection title="Provider (KKKS)">
          <Stack direction="col" gap="2">
            {PROVIDERS.map((prov) => (
              <Checkbox
                key={prov.id}
                id={`filter-prov-${prov.id}`}
                checked={values.providers.includes(prov.id)}
                onCheckedChange={() => handleProviderToggle(prov.id)}
                label={prov.name}
              />
            ))}
          </Stack>
        </FilterSection>

        <FilterSection title="Status Sensitivitas">
          <Stack direction="col" gap="2">
            {STATUS_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                id={`filter-status-${opt.id}`}
                checked={values.statuses.includes(opt.id)}
                onCheckedChange={() => handleStatusToggle(opt.id)}
                label={
                  <span className="inline-flex flex-col gap-px">
                    <span>{opt.label}</span>
                    <span className="text-[11px] text-ink-4">{opt.description}</span>
                  </span>
                }
              />
            ))}
          </Stack>
        </FilterSection>

        <FilterSection title="Tahun Vintage">
          <Stack direction="col" gap="2">
            <div className="flex items-center gap-2 text-xs text-ink-3">
              <span className="num font-semibold">{values.yearMin}</span>
              <span className="flex-1 h-px bg-line" aria-hidden="true" />
              <span className="num font-semibold">{values.yearMax}</span>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={yearMinId} className="text-xs text-ink-4">
                Dari tahun
                <input
                  id={yearMinId}
                  type="range"
                  min={defaultMin}
                  max={defaultMax}
                  value={values.yearMin}
                  onChange={(e) => setYearMin(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
              </label>
              <label htmlFor={yearMaxId} className="text-xs text-ink-4">
                Sampai tahun
                <input
                  id={yearMaxId}
                  type="range"
                  min={defaultMin}
                  max={defaultMax}
                  value={values.yearMax}
                  onChange={(e) => setYearMax(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
              </label>
            </div>
          </Stack>
        </FilterSection>
      </Stack>
    </aside>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps): JSX.Element {
  return (
    <fieldset className="m-0 p-0 border-0">
      <legend className="text-[10.5px] font-bold uppercase tracking-widest text-ink-4 mb-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
