/**
 * DatasetSidebar — right sidebar floating panel di MapPage.
 *
 * Tampilkan dataset list — caller filter dulu sesuai map bbox / category
 * filters. Click row → fly-to + highlight via callback.
 *
 * Collapsible: caller pass `collapsed` + handler. Saat collapsed hanya header
 * thin bar (toggleable).
 */
import { DatasetCard, Icon } from '@ghanem/ui';
import type { DatasetRecord } from '../../mocks/datasets';

interface DatasetSidebarProps {
  /** Datasets yang visible (already filtered by parent). */
  visible: DatasetRecord[];
  /** Total dataset di catalog (untuk "X dari Y"). */
  total: number;
  /** Highlight id aktif. */
  highlightId: string | null;
  onSelect: (dataset: DatasetRecord) => void;
  /** Collapsed state. */
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function DatasetSidebar({
  visible,
  total,
  highlightId,
  onSelect,
  collapsed,
  onToggleCollapse,
}: DatasetSidebarProps): JSX.Element {
  return (
    <aside
      aria-label="Daftar dataset"
      className={[
        'bg-surface border border-line rounded-3 shadow-3',
        'flex flex-col overflow-hidden transition-all duration-hf ease-hf',
        collapsed ? 'w-12' : 'w-[320px]',
        'max-h-[calc(100vh-160px)]',
      ].join(' ')}
    >
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-line">
        {!collapsed ? (
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-sm text-ink m-0">Dataset di Area</h2>
            <p className="text-xs text-ink-4 m-0 mt-0.5 num">
              Menampilkan {visible.length.toLocaleString('id-ID')} dari {total.toLocaleString('id-ID')} dataset
            </p>
          </div>
        ) : (
          <Icon name="list" size={14} aria-hidden className="text-ink-3" />
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Buka panel dataset' : 'Tutup panel dataset'}
          aria-expanded={!collapsed}
          className={[
            'inline-flex items-center justify-center w-7 h-7 rounded-pill',
            'text-ink-3 hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name={collapsed ? 'chevL' : 'chevR'} size={12} aria-hidden />
        </button>
      </header>

      {!collapsed ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 flex flex-col gap-2">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center text-sm text-ink-4 py-8 text-center px-3">
              <Icon name="map" size={28} aria-hidden className="text-ink-5 mb-2" />
              <p className="m-0">Tidak ada dataset di area ini.</p>
              <p className="m-0 mt-1 text-xs">Coba perbesar/pindahkan map atau aktifkan layer kategori lain.</p>
            </div>
          ) : (
            visible.map((d) => (
              <DatasetCard
                key={d.id}
                dataset={d}
                variant="list-row"
                selected={d.id === highlightId}
                onClick={() => onSelect(d)}
              />
            ))
          )}
        </div>
      ) : null}
    </aside>
  );
}
