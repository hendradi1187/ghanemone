/**
 * FilterPillBar — horizontal row filter pills untuk ExplorePage.
 *
 * Setiap pill membuka Popover dengan checkbox list. State filter disync
 * ke URL search params via `useSearchParams` (dipassing sebagai callback
 * dari parent agar tetap single source of truth di ExplorePage).
 *
 * Pills:
 *   - Data Type ▾
 *   - Theme ▾
 *   - Provider ▾
 *   - Domain / WK ▾
 *   - Format ▾
 *   - More Filters (buka ExploreFilters drawer, dihandle parent)
 *
 * A11y:
 *   - Setiap pill: `<button>` dengan aria-expanded + aria-haspopup="listbox"
 *   - Popover content: role="group" dengan legend
 *   - Checkbox items: label + htmlFor terhubung
 *   - "Clear" button: aria-label deskriptif
 *
 * Visual rules (sesuai referensi):
 *   - Inactive pill: bg-surface border border-line rounded-lg text-ink-3
 *   - Active pill: border-green-500 bg-green-50 text-green-700
 *   - Counter badge di label bila ada selection: "Provider (3)"
 *   - "More Filters" pill dengan filter icon
 *   - "Clear all" link paling kanan saat ada filter aktif
 */
import { useId } from 'react';
import { Checkbox, Icon, Popover } from '@ghanem/ui';
import { CATEGORIES, PROVIDERS } from '../../mocks/datasets';

/* ─── Tipe public ──────────────────────────────────────────────────── */

export type FilterPillKey = 'type' | 'theme' | 'provider' | 'domain' | 'format';

export interface FilterPillBarValues {
  /** Array id type filter yang aktif. */
  types: string[];
  /** Array id theme filter yang aktif. */
  themes: string[];
  /** Array id provider yang aktif. */
  providers: string[];
  /** Array id domain/WK yang aktif. */
  domains: string[];
  /** Array format yang aktif. */
  formats: string[];
}

export interface FilterPillBarProps {
  /** Nilai filter saat ini — controlled dari parent (URL state). */
  values: FilterPillBarValues;
  /** Callback saat nilai berubah. */
  onChange: (next: FilterPillBarValues) => void;
  /** Callback tombol "More Filters" — parent buka drawer/modal ExploreFilters. */
  onMoreFilters: () => void;
  /** Callback reset semua filter. */
  onClear: () => void;
}

/* ─── Static option lists ──────────────────────────────────────────── */

const TYPE_OPTIONS: readonly { id: string; label: string }[] = [
  { id: 'layer', label: 'Layer (Vector)' },
  { id: 'volume', label: 'Volume (Seismic)' },
  { id: 'document', label: 'Document' },
  { id: 'raster', label: 'Raster' },
];

const THEME_OPTIONS: readonly { id: string; label: string }[] = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
}));

const PROVIDER_OPTIONS: readonly { id: string; label: string }[] = PROVIDERS.map((p) => ({
  id: p.id,
  label: p.name,
}));

// Domain / WK — TODO Sprint 3: ambil dari GET /v1/domains.
const DOMAIN_OPTIONS: readonly { id: string; label: string }[] = [
  { id: 'wk-onwj', label: 'WK Offshore NW Java' },
  { id: 'wk-mahakam', label: 'WK Mahakam' },
  { id: 'wk-masela', label: 'WK Masela' },
  { id: 'wk-rokan', label: 'WK Rokan' },
  { id: 'wk-cepu', label: 'WK Cepu' },
  { id: 'wk-corridor', label: 'WK Corridor' },
];

const FORMAT_OPTIONS: readonly { id: string; label: string }[] = [
  { id: 'geojson', label: 'GeoJSON' },
  { id: 'shapefile', label: 'Shapefile (SHP)' },
  { id: 'geopackage', label: 'GeoPackage' },
  { id: 'segy', label: 'SEG-Y' },
  { id: 'geotiff', label: 'GeoTIFF' },
  { id: 'csv', label: 'CSV' },
  { id: 'pdf', label: 'PDF' },
];

/* ─── Pill config ──────────────────────────────────────────────────── */

interface PillConfig {
  key: FilterPillKey;
  label: string;
  options: readonly { id: string; label: string }[];
  selected: (values: FilterPillBarValues) => string[];
  setSelected: (values: FilterPillBarValues, next: string[]) => FilterPillBarValues;
}

const PILLS: PillConfig[] = [
  {
    key: 'type',
    label: 'Data Type',
    options: TYPE_OPTIONS,
    selected: (v) => v.types,
    setSelected: (v, next) => ({ ...v, types: next }),
  },
  {
    key: 'theme',
    label: 'Theme',
    options: THEME_OPTIONS,
    selected: (v) => v.themes,
    setSelected: (v, next) => ({ ...v, themes: next }),
  },
  {
    key: 'provider',
    label: 'Provider',
    options: PROVIDER_OPTIONS,
    selected: (v) => v.providers,
    setSelected: (v, next) => ({ ...v, providers: next }),
  },
  {
    key: 'domain',
    label: 'Domain / WK',
    options: DOMAIN_OPTIONS,
    selected: (v) => v.domains,
    setSelected: (v, next) => ({ ...v, domains: next }),
  },
  {
    key: 'format',
    label: 'Format',
    options: FORMAT_OPTIONS,
    selected: (v) => v.formats,
    setSelected: (v, next) => ({ ...v, formats: next }),
  },
];

/* ─── Helper ────────────────────────────────────────────────────────── */

function hasAnyActive(values: FilterPillBarValues): boolean {
  return (
    values.types.length > 0 ||
    values.themes.length > 0 ||
    values.providers.length > 0 ||
    values.domains.length > 0 ||
    values.formats.length > 0
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */

export function FilterPillBar({
  values,
  onChange,
  onMoreFilters,
  onClear,
}: FilterPillBarProps): JSX.Element {
  const anyActive = hasAnyActive(values);

  return (
    <div
      role="group"
      aria-label="Filter dataset"
      className="flex items-center gap-2 flex-wrap"
    >
      {PILLS.map((pill) => (
        <FilterPill
          key={pill.key}
          config={pill}
          values={values}
          onChange={onChange}
        />
      ))}

      {/* More Filters pill */}
      <button
        type="button"
        onClick={onMoreFilters}
        aria-label="Buka semua filter"
        className={[
          'inline-flex items-center gap-1.5',
          'h-8 px-3 rounded-lg border',
          'text-xs font-medium',
          'transition-colors duration-hf',
          'bg-surface border-line text-ink-3',
          'hover:border-ink-5 hover:text-ink-2',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
        ].join(' ')}
      >
        <Icon name="filter" size={12} aria-hidden />
        <span>More Filters</span>
      </button>

      {/* Clear all — tampil hanya kalau ada filter aktif */}
      {anyActive ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Hapus semua filter aktif"
          className={[
            'ml-auto text-xs font-semibold text-green-700',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            'rounded-1 px-1.5 py-0.5',
          ].join(' ')}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

/* ─── FilterPill — single pill dengan Popover ───────────────────────── */

interface FilterPillProps {
  config: PillConfig;
  values: FilterPillBarValues;
  onChange: (next: FilterPillBarValues) => void;
}

function FilterPill({ config, values, onChange }: FilterPillProps): JSX.Element {
  const groupId = useId();
  const selected = config.selected(values);
  const isActive = selected.length > 0;

  const toggleOption = (id: string): void => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(config.setSelected(values, next));
  };

  const pillLabel = isActive ? `${config.label} (${selected.length})` : config.label;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={undefined} // Radix Popover mengelola ini via data-state
          className={[
            'inline-flex items-center gap-1.5',
            'h-8 px-3 rounded-lg border',
            'text-xs font-medium',
            'transition-colors duration-hf',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            isActive
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'bg-surface border-line text-ink-3 hover:border-ink-5 hover:text-ink-2',
          ].join(' ')}
        >
          <span>{pillLabel}</span>
          <Icon name="chevron" size={11} aria-hidden />
        </button>
      </Popover.Trigger>

      <Popover.Content align="start" className="w-56 p-0">
        <div
          role="group"
          aria-labelledby={`${groupId}-heading`}
          className="flex flex-col"
        >
          {/* Header popover */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-line">
            <span
              id={`${groupId}-heading`}
              className="text-[10.5px] font-bold uppercase tracking-widest text-ink-4"
            >
              {config.label}
            </span>
            {isActive ? (
              <button
                type="button"
                onClick={() => onChange(config.setSelected(values, []))}
                className={[
                  'text-[10.5px] font-semibold text-green-700',
                  'hover:text-green-500',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
                  'rounded-1 px-1',
                ].join(' ')}
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Checkbox list */}
          <div className="flex flex-col gap-px p-2 max-h-56 overflow-y-auto">
            {config.options.map((opt) => (
              <Checkbox
                key={opt.id}
                id={`${groupId}-${opt.id}`}
                checked={selected.includes(opt.id)}
                onCheckedChange={() => toggleOption(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
