/**
 * MapLayersPanel — floating panel di atas embedded map untuk toggle layer.
 *
 * Visual: card floating (bg-surface shadow rounded-lg) absolute positioning.
 * Default posisi: top-left map area, margin 12px dari edge.
 *
 * Layers sesuai referensi AlasBuana:
 *   - Working Area (WK)
 *   - Block / Contract Area
 *   - Field
 *   - Well
 *   - Pipeline
 *   - Facility
 *   - Seismic Data Coverage
 *   + Add Layer (no-op, future feature)
 *
 * URL state: ?layers=wk,blocks,field,well,pipeline,facility (comma-separated).
 * Default aktif: semua kecuali seismic.
 *
 * A11y:
 *   - role="group" + aria-labelledby untuk seluruh layer list
 *   - Collapsible: saat collapsed hanya tampil icon button
 *   - Keyboard navigable: Tab antara checkboxes
 *   - Escape/X untuk minimize ke icon
 */
import { useId, useState } from 'react';
import { Checkbox, Icon, toast } from '@ghanem/ui';

/* ─── Layer config ────────────────────────────────────────────────────── */

export type LayerId =
  | 'wk'
  | 'blocks'
  | 'field'
  | 'well'
  | 'pipeline'
  | 'facility'
  | 'seismic';

export const LAYER_CONFIGS: readonly { id: LayerId; label: string }[] = [
  { id: 'wk', label: 'Working Area (WK)' },
  { id: 'blocks', label: 'Block / Contract Area' },
  { id: 'field', label: 'Field' },
  { id: 'well', label: 'Well' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'facility', label: 'Facility' },
  { id: 'seismic', label: 'Seismic Data Coverage' },
] as const;

/** Layer aktif secara default (semua kecuali seismic). */
export const DEFAULT_ACTIVE_LAYERS: readonly LayerId[] = [
  'wk',
  'blocks',
  'field',
  'well',
  'pipeline',
  'facility',
];

/* ─── URL state helpers ─────────────────────────────────────────────── */

export function parseLayersParam(raw: string | null): LayerId[] {
  if (!raw) return [...DEFAULT_ACTIVE_LAYERS];
  const validIds = new Set(LAYER_CONFIGS.map((l) => l.id));
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is LayerId => validIds.has(s as LayerId));
}

export function serializeLayersParam(layers: LayerId[]): string {
  return layers.join(',');
}

/* ─── Props ─────────────────────────────────────────────────────────── */

export interface MapLayersPanelProps {
  /** Layer aktif saat ini — controlled dari parent (URL state). */
  activeLayers: LayerId[];
  /** Callback saat toggle layer. */
  onChange: (next: LayerId[]) => void;
  /** Posisi custom jika perlu override default. Default positioning via className. */
  className?: string;
}

/* ─── Component ─────────────────────────────────────────────────────── */

export function MapLayersPanel({
  activeLayers,
  onChange,
  className = '',
}: MapLayersPanelProps): JSX.Element {
  const headingId = useId();
  const [collapsed, setCollapsed] = useState(false);

  const toggleLayer = (id: LayerId): void => {
    const next = activeLayers.includes(id)
      ? activeLayers.filter((l) => l !== id)
      : [...activeLayers, id];
    onChange(next);
  };

  /* Panel collapsed — hanya ikon tombol */
  if (collapsed) {
    return (
      <div className={['absolute top-3 left-3 z-floating', className].join(' ')}>
        <button
          type="button"
          aria-label="Tampilkan panel layer peta"
          title="Map Layers"
          onClick={() => setCollapsed(false)}
          className={[
            'inline-flex items-center justify-center w-8 h-8 rounded-2',
            'bg-surface border border-line shadow-2',
            'text-ink-3 hover:bg-surface-2 hover:text-ink',
            'transition-colors duration-hf',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name="layers" size={14} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      className={[
        'absolute top-3 left-3 z-floating',
        'bg-surface border border-line rounded-3 shadow-3',
        'w-52 text-xs',
        className,
      ].join(' ')}
      role="group"
      aria-labelledby={headingId}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-line">
        <span
          id={headingId}
          className="text-[10.5px] font-bold uppercase tracking-widest text-ink-4"
        >
          MAP LAYERS
        </span>
        <button
          type="button"
          aria-label="Tutup panel layer"
          onClick={() => setCollapsed(true)}
          className={[
            'inline-flex items-center justify-center w-5 h-5 rounded-1',
            'text-ink-4 hover:text-ink hover:bg-surface-3',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
            'transition-colors duration-hf',
          ].join(' ')}
        >
          <Icon name="x" size={11} aria-hidden />
        </button>
      </div>

      {/* Checkbox list */}
      <div className="flex flex-col gap-px p-2">
        {LAYER_CONFIGS.map((layer) => (
          <div key={layer.id} className="py-0.5">
            <Checkbox
              id={`layer-${layer.id}`}
              size="sm"
              checked={activeLayers.includes(layer.id)}
              onCheckedChange={() => toggleLayer(layer.id)}
              label={layer.label}
            />
          </div>
        ))}
      </div>

      {/* Footer — Add Layer */}
      <div className="border-t border-line px-3 py-2">
        <button
          type="button"
          onClick={() => toast.info('Add Layer', { description: 'Fitur ini akan tersedia di Sprint berikutnya.' })}
          className={[
            'inline-flex items-center gap-1.5 text-xs font-semibold text-green-700',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
            'rounded-1',
          ].join(' ')}
        >
          <Icon name="plus" size={11} aria-hidden />
          Add Layer
        </button>
      </div>
    </div>
  );
}
