/**
 * DatasetCard — clickable dataset row/tile untuk daftar dataset.
 *
 * Port dari `HfDatasetCard` (`hifi-components.jsx`) + `DsRowInteractive`
 * (`prototype-app.jsx`) — disatukan ke satu komponen dengan `variant` prop:
 *   - `list-row`: row horizontal, lebar penuh, prioritas info padat.
 *   - `grid-tile`: tile kotak, optimal untuk grid 2-3 kolom.
 *
 * Komponen ini stateless — caller decide visual selected/hover via prop
 * `selected`. Click handlers di-pass via `onClick` (entire card) atau
 * `onOpen` (button "Open details").
 *
 * A11y:
 *   - Wrapping element adalah `<article>` (semantic content)
 *   - Card aksi utama wrapping `<button>` (keyboard focusable, Enter/Space)
 *   - Focus visible ring green-500 (token)
 *   - Provider initials & badges: `aria-hidden` saat label tersedia
 *   - Kind badge berfungsi sebagai status indicator → tetap visible untuk SR
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../icon';

export type DatasetKind = 'LAYER' | 'VOLUME' | 'DOC';
export type DatasetStatus = 'public' | 'internal' | 'confidential';
export type DatasetCardVariant = 'list-row' | 'grid-tile';

/** Shape minimal dataset untuk render card. Subset dari Dataset di @ghanem/types. */
export interface DatasetCardData {
  /** Stable id — dipakai sebagai key + click handler param. */
  id: string;
  /** Judul dataset (1-2 baris truncated). */
  title: string;
  /** Deskripsi singkat (~2 baris). */
  description?: string;
  /** Kind badge — warna otomatis per kind. */
  kind: DatasetKind;
  /** Kategori bebas-teks ('Administrative', 'Seismic', ...). */
  category?: string;
  /** Format human-readable ('Vector · SHP, GeoJSON'). */
  format?: string;
  /** Provider/organisasi (KKKS). */
  provider: {
    name: string;
    initials: string;
    /** Token color (`var(--…)`) atau hex untuk avatar border. Default green. */
    color?: string;
  };
  /** Verified badge — Trusted Data. */
  verified?: boolean;
  /** Sensitivity status. */
  status?: DatasetStatus;
  /** Year vintage (untuk filter chip + display). */
  year?: number;
  /** Relative-time label, e.g. "2 hari lalu". */
  updatedLabel?: string;
  /** Stats footer [downloads, views, stars] — opsional. */
  stats?: {
    downloads?: number;
    views?: number;
    stars?: number;
  };
}

export interface DatasetCardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Data dataset. */
  dataset: DatasetCardData;
  /** Layout variant. Default `list-row`. */
  variant?: DatasetCardVariant;
  /** Visual selected state (highlight border + bg). */
  selected?: boolean;
  /** Handler card click. */
  onClick?: (dataset: DatasetCardData) => void;
  /** Handler "Open details" button (icon button, kanan-atas). */
  onOpen?: (dataset: DatasetCardData) => void;
  /** Custom right slot (mis. "Add to Map" button). */
  rightSlot?: ReactNode;
}

const kindColor: Record<DatasetKind, string> = {
  LAYER: 'bg-green-500 text-white',
  VOLUME: 'bg-purple-500 text-white',
  DOC: 'bg-blue-500 text-white',
};

const statusBadge: Record<DatasetStatus, { label: string; classes: string }> = {
  public: { label: 'Public', classes: 'bg-green-50 text-green-700 border-green-200' },
  internal: { label: 'Internal', classes: 'bg-amber-100 text-amber-700 border-amber-100' },
  confidential: { label: 'Confidential', classes: 'bg-red-100 text-red-700 border-red-100' },
};

export const DatasetCard = forwardRef<HTMLElement, DatasetCardProps>(function DatasetCard(
  {
    dataset,
    variant = 'list-row',
    selected = false,
    onClick,
    onOpen,
    rightSlot,
    className = '',
    ...rest
  },
  ref,
) {
  const isGrid = variant === 'grid-tile';
  const status = dataset.status ? statusBadge[dataset.status] : null;

  // a11y: pakai `<article>` semantic container. Wilayah klik utama adalah
  // `<button>` agar keyboard activatable; "Open details" adalah button anak.
  const handleCardClick = (): void => {
    onClick?.(dataset);
  };

  const handleOpenClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onOpen?.(dataset);
  };

  const containerClasses = [
    'group relative flex',
    isGrid ? 'flex-col gap-3 p-4' : 'flex-row gap-3 p-3',
    'bg-surface border border-line rounded-3',
    'transition-colors duration-hf ease-hf',
    'hover:border-line-2 hover:bg-surface-2',
    selected ? 'border-green-500 bg-green-50/40 shadow-focus' : '',
    'focus-within:border-green-500',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={ref}
      aria-selected={selected}
      data-dataset-id={dataset.id}
      className={containerClasses}
      {...rest}
    >
      {/* ── Provider avatar (kiri) ────────────────────────────────── */}
      <span
        aria-hidden="true"
        className={[
          'flex-none inline-flex items-center justify-center',
          'rounded-full border bg-surface text-xs font-bold leading-none',
          isGrid ? 'w-9 h-9' : 'w-9 h-9 mt-0.5',
        ].join(' ')}
        style={{
          borderColor: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
          color: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
        }}
      >
        {dataset.provider.initials}
      </span>

      {/* ── Konten utama ──────────────────────────────────────────── */}
      <div className={['flex-1 min-w-0 flex flex-col', isGrid ? 'gap-2' : 'gap-1'].join(' ')}>
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={[
              'inline-flex items-center px-1.5 py-0.5 rounded-1',
              'text-[9.5px] font-bold uppercase tracking-widest leading-none',
              kindColor[dataset.kind],
            ].join(' ')}
          >
            {dataset.kind}
          </span>
          {dataset.verified ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-green-700">
              <Icon name="check" size={10} aria-hidden />
              <span>Verified</span>
            </span>
          ) : null}
          {status ? (
            <span
              className={[
                'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                'text-[9.5px] font-semibold uppercase tracking-widest leading-none',
                status.classes,
              ].join(' ')}
            >
              {status.label}
            </span>
          ) : null}
          {dataset.year !== undefined ? (
            <span className="text-[10.5px] text-ink-4 font-medium ml-auto num">{dataset.year}</span>
          ) : null}
        </div>

        {/* Card title — pakai <button> sebagai aksi utama (a11y) */}
        <button
          type="button"
          onClick={handleCardClick}
          className={[
            'text-left p-0 m-0 bg-transparent border-0 cursor-pointer',
            'font-display font-semibold text-h3 text-ink',
            'leading-snug',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1',
            isGrid ? 'line-clamp-2' : 'line-clamp-2',
          ].join(' ')}
        >
          {dataset.title}
        </button>

        {dataset.description ? (
          <p className="text-sm text-ink-3 line-clamp-2 m-0">{dataset.description}</p>
        ) : null}

        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-ink-4 flex-wrap mt-0.5">
          <span className="font-semibold text-ink-2 truncate max-w-[12rem]">
            {dataset.provider.name}
          </span>
          {dataset.category ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{dataset.category}</span>
            </>
          ) : null}
          {dataset.format ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[14rem]">{dataset.format}</span>
            </>
          ) : null}
          {dataset.updatedLabel ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{dataset.updatedLabel}</span>
            </>
          ) : null}
        </div>

        {/* Stats row */}
        {dataset.stats ? (
          <div className="flex items-center gap-3 text-[11px] text-ink-4 mt-1">
            {dataset.stats.downloads !== undefined ? (
              <StatChip icon="download" value={dataset.stats.downloads} label="downloads" />
            ) : null}
            {dataset.stats.views !== undefined ? (
              <StatChip icon="eye" value={dataset.stats.views} label="views" />
            ) : null}
            {dataset.stats.stars !== undefined ? (
              <StatChip icon="star" value={dataset.stats.stars} label="stars" />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ── Aksi kanan ────────────────────────────────────────────── */}
      <div
        className={[
          'flex-none flex items-center',
          isGrid ? 'flex-row gap-2 justify-end mt-1' : 'flex-col gap-1.5',
        ].join(' ')}
      >
        {onOpen ? (
          <button
            type="button"
            onClick={handleOpenClick}
            aria-label={`Buka detail ${dataset.title}`}
            title="Buka detail"
            className={[
              'inline-flex items-center justify-center',
              'w-7 h-7 rounded-2',
              'border border-line bg-surface text-ink-3',
              'transition-colors duration-hf',
              'hover:bg-surface-3 hover:text-ink',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
          >
            <Icon name="arrowUpRight" size={13} aria-hidden />
          </button>
        ) : null}
        {rightSlot}
      </div>
    </article>
  );
});

interface StatChipProps {
  icon: IconName;
  value: number;
  label: string;
}

function StatChip({ icon, value, label }: StatChipProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} ${label}`}>
      <Icon name={icon} size={11} aria-hidden />
      <span className="num font-medium">{value.toLocaleString('id-ID')}</span>
    </span>
  );
}
