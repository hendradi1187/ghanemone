/**
 * DatasetSlideOver — slide-over panel detail dataset untuk ExplorePage.
 *
 * Dibuka saat klik card dataset di explore. URL param `?selected=dataset-id`
 * dipakai sebagai trigger open/close supaya shareable + back-button friendly.
 *
 * Konten sesuai referensi AlasBuana "DATA INFORMATION":
 *   - Header: nama dataset + X close + Verified badge
 *   - Provider: avatar + nama + status Active
 *   - Format line: "Category · Format (kind)"
 *   - Deskripsi pendek
 *   - Action row: [View Details] + [Add to Map]
 *   - Section ATTRIBUTES: Total Area, Status, Operator, Contract Start, Contract End
 *   - Section DATA QUALITY: Completeness, Positional Accuracy, Currency
 *   - Section RELATED DATA: link terkait
 *
 * A11y:
 *   - focus trap via Radix (SlideOver primitive)
 *   - ESC menutup via Radix
 *   - aria-modal + role="dialog" via Radix
 *   - Keyboard-accessible action buttons
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlideOver, Icon, toast } from '@ghanem/ui';
import type { DatasetRecord } from '../../mocks/datasets';
import { DataQualitySection } from '../dataset/DataQualitySection';

export interface DatasetSlideOverProps {
  /** Dataset yang sedang ditampilkan, atau null saat tertutup. */
  dataset: DatasetRecord | null;
  /** Open state — dikontrol dari parent via URL param ?selected. */
  open: boolean;
  /** Callback close — parent akan hapus ?selected dari URL. */
  onClose: () => void;
  /** Callback "Add to Map" — optional, default show toast. */
  onAddToMap?: (dataset: DatasetRecord) => void;
}

export function DatasetSlideOver({
  dataset,
  open,
  onClose,
  onAddToMap,
}: DatasetSlideOverProps): JSX.Element {
  const navigate = useNavigate();

  const handleViewDetails = useCallback(() => {
    if (!dataset) return;
    navigate(`/datasets/${encodeURIComponent(dataset.id)}`);
  }, [dataset, navigate]);

  const handleAddToMap = useCallback(() => {
    if (!dataset) return;
    if (onAddToMap) {
      onAddToMap(dataset);
    } else {
      toast.success('Ditambahkan ke peta', {
        description: `${dataset.title} — layer aktif di map view.`,
      });
    }
  }, [dataset, onAddToMap]);

  return (
    <SlideOver.Root
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose();
      }}
    >
      <SlideOver.Content
        title={dataset?.title ?? 'Detail Dataset'}
        width="md"
        // Jangan tutup saat klik di luar — supaya interaksi map/list tetap bisa
        // (user klik map, marker, atau card lain tanpa menutup panel ini)
        onInteractOutside={(e: Event) => e.preventDefault()}
      >
        {dataset ? (
          <DatasetSlideOverBody
            dataset={dataset}
            onViewDetails={handleViewDetails}
            onAddToMap={handleAddToMap}
            onClose={onClose}
          />
        ) : (
          // Placeholder saat dataset null tapi panel sedang animasi close
          <div className="p-4 flex items-center justify-center h-32">
            <span className="text-sm text-ink-4">Memuat…</span>
          </div>
        )}
      </SlideOver.Content>
    </SlideOver.Root>
  );
}

/* ─── Body content ─────────────────────────────────────────────────────── */

interface DatasetSlideOverBodyProps {
  dataset: DatasetRecord;
  onViewDetails: () => void;
  onAddToMap: () => void;
  onClose: () => void;
}

function DatasetSlideOverBody({
  dataset,
  onViewDetails,
  onAddToMap,
}: DatasetSlideOverBodyProps): JSX.Element {
  const kindColors: Record<string, string> = {
    LAYER: 'bg-green-500',
    VOLUME: 'bg-purple-500',
    DOC: 'bg-blue-500',
  };
  const kindColor = kindColors[dataset.kind] ?? 'bg-green-500';

  return (
    <div className="flex flex-col gap-0 pb-6">
      {/* ── Provider + format ────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-line">
        {/* Provider row */}
        <div className="flex items-center gap-2 mb-2">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 text-[10px] font-bold leading-none flex-none"
            style={{
              borderColor: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
              color: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
            }}
          >
            {dataset.provider.initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink m-0 leading-tight">{dataset.provider.name}</p>
            <p className="text-xs text-green-600 font-medium m-0">Active</p>
          </div>
          {dataset.verified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 flex-none">
              <Icon name="check" size={11} aria-hidden />
              Verified
            </span>
          ) : null}
        </div>

        {/* Category · Format line */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            aria-hidden="true"
            className={[
              'inline-flex items-center px-1.5 py-px rounded-1',
              'text-[9px] font-bold uppercase tracking-widest leading-none text-white',
              kindColor,
            ].join(' ')}
          >
            {dataset.kind}
          </span>
          <span className="text-xs text-ink-4">
            {dataset.category}
            {dataset.format ? ` · ${dataset.format}` : ''}
          </span>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      {dataset.description ? (
        <div className="px-4 py-3 border-b border-line">
          <p className="text-sm text-ink-3 m-0 leading-relaxed line-clamp-4">
            {dataset.description}
          </p>
        </div>
      ) : null}

      {/* ── Action row ────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-line flex items-center gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className={[
            'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2 border border-line bg-surface',
            'text-sm font-semibold text-ink-2',
            'hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            'transition-colors duration-hf',
          ].join(' ')}
        >
          <Icon name="arrowUpRight" size={13} aria-hidden />
          Lihat Detail
        </button>
        <button
          type="button"
          onClick={onAddToMap}
          className={[
            'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2',
            'bg-green-500 text-white font-semibold text-sm shadow-1',
            'hover:bg-green-600',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            'transition-colors duration-hf',
          ].join(' ')}
        >
          <Icon name="plus" size={13} aria-hidden />
          Add to Map
        </button>
      </div>

      {/* ── ATTRIBUTES section ────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-line">
        <h3 className="text-[10.5px] font-bold uppercase tracking-widest text-ink-4 m-0 mb-2.5">
          Attributes
        </h3>
        <dl className="grid grid-cols-1 gap-2">
          {dataset.categoryId === 'concession' ? (
            <>
              <AttributeRow
                label="Total Area"
                value={
                  dataset.attributes.find((a) => a.name === 'area_km2')?.example
                    ? `${dataset.attributes.find((a) => a.name === 'area_km2')?.example} km²`
                    : '—'
                }
              />
              <AttributeRow
                label="Status"
                value={dataset.status ? dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1) : '—'}
              />
              <AttributeRow
                label="Operator"
                value={dataset.provider.name}
              />
              <AttributeRow
                label="Contract Start"
                value={dataset.attributes.find((a) => a.name === 'contract_start')?.example ?? '—'}
              />
              <AttributeRow
                label="Contract End"
                value={dataset.attributes.find((a) => a.name === 'contract_end')?.example ?? '—'}
              />
            </>
          ) : (
            <>
              <AttributeRow label="Kategori" value={dataset.category ?? '—'} />
              <AttributeRow label="Provider" value={dataset.provider.name} />
              <AttributeRow
                label="Status"
                value={dataset.status ? dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1) : '—'}
              />
              <AttributeRow label="Tahun" value={dataset.year !== undefined ? String(dataset.year) : '—'} />
              <AttributeRow label="Format" value={dataset.format ?? '—'} />
            </>
          )}
        </dl>
      </div>

      {/* ── DATA QUALITY section ─────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-line">
        <DataQualitySection dataQuality={dataset.dataQuality} variant="compact" />
      </div>

      {/* ── RELATED DATA section ─────────────────────────────────────── */}
      <div className="px-4 py-3">
        <h3 className="text-[10.5px] font-bold uppercase tracking-widest text-ink-4 m-0 mb-2.5">
          Related Data
        </h3>
        <div className="flex flex-col gap-1">
          {dataset.lineage.upstream.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1 text-sm"
            >
              <Icon name="arrowUpRight" size={11} className="text-ink-5 flex-none" aria-hidden />
              <span className="text-green-700 font-medium truncate">{item.name}</span>
            </div>
          ))}
          {dataset.lineage.downstream.slice(0, 1).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1 text-sm"
            >
              <Icon name="arrowDown" size={11} className="text-ink-5 flex-none" aria-hidden />
              <span className="text-blue-500 font-medium truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── AttributeRow helper ───────────────────────────────────────────────── */

function AttributeRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <dt className="text-[10.5px] font-medium text-ink-4 uppercase tracking-cap flex-none w-28 truncate">
        {label}
      </dt>
      <dd className="text-xs text-ink-2 font-medium m-0 truncate flex-1">{value}</dd>
    </div>
  );
}
