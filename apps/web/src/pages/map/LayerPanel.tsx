/**
 * LayerPanel — left sidebar floating panel di MapPage.
 *
 * Sections:
 *   - Base layers (radio: OSM / Carto / Satellite / Topo)
 *   - Overlay layers (checkbox per kategori dataset + seismic)
 *
 * Collapsible: saat `collapsed=true`, render hanya icon button 40×40px.
 * Mirror pattern dari DatasetSidebar.tsx.
 *
 * Stateless: terima current state + handlers dari parent. Pakai @ghanem/ui
 * primitives untuk a11y (Checkbox + RadioGroup dari Radix).
 */
import { Icon, type BasemapId } from '@ghanem/ui';
import type { DatasetCategory } from '../../mocks/datasets';

interface BaseOption {
  id: BasemapId;
  label: string;
}

const BASE_OPTIONS: BaseOption[] = [
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'carto', label: 'Carto Positron' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'topo', label: 'Topographic' },
];

export interface CategoryToggle {
  id: DatasetCategory;
  label: string;
  color: string;
  count: number;
  enabled: boolean;
}

interface SubsurfaceState {
  seismicOn: boolean;
  showHorizons: boolean;
  showFaults: boolean;
}

export interface LayerPanelProps {
  basemap: BasemapId;
  onBasemapChange: (id: BasemapId) => void;
  categories: CategoryToggle[];
  onCategoryToggle: (id: DatasetCategory) => void;
  subsurface: SubsurfaceState;
  onSeismicToggle: () => void;
  onHorizonsToggle: () => void;
  onFaultsToggle: () => void;
  /** Collapsed state — saat true, tampilkan hanya icon button 40×40px. */
  collapsed?: boolean;
  /** Handler untuk toggle collapsed. */
  onToggleCollapse?: () => void;
}

export function LayerPanel({
  basemap,
  onBasemapChange,
  categories,
  onCategoryToggle,
  subsurface,
  onSeismicToggle,
  onHorizonsToggle,
  onFaultsToggle,
  collapsed = false,
  onToggleCollapse,
}: LayerPanelProps): JSX.Element {
  const activeCount =
    categories.filter((c) => c.enabled).length +
    (subsurface.seismicOn ? 1 : 0);

  // State collapsed: tampilkan hanya icon button 40×40px dengan badge aktif
  if (collapsed) {
    return (
      <div className="relative inline-flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Tampilkan panel layer"
          aria-expanded={false}
          title="Tampilkan layer"
          className={[
            'relative inline-flex items-center justify-center w-10 h-10',
            'bg-surface border border-line rounded-3 shadow-3',
            'text-ink-3 hover:text-ink hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-green-500 transition-all duration-hf ease-hf',
          ].join(' ')}
        >
          <Icon name="layers" size={16} aria-hidden />
          {/* Badge indikator jumlah layer aktif */}
          {activeCount > 0 ? (
            <span
              aria-label={`${activeCount} layer aktif`}
              className={[
                'absolute -top-1.5 -right-1.5',
                'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
                'rounded-full bg-green-500 text-white',
                'text-[9px] font-bold leading-none',
              ].join(' ')}
            >
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>
    );
  }

  // State expanded: render full panel
  return (
    <aside
      aria-label="Panel layer peta"
      className={[
        'bg-surface border border-line rounded-3 shadow-3',
        'w-[280px] max-h-[calc(100vh-160px)] flex flex-col overflow-hidden',
        'transition-all duration-hf ease-hf',
      ].join(' ')}
    >
      <header className="flex items-center justify-between px-3.5 py-3 border-b border-line">
        <h2 className="font-display font-semibold text-sm text-ink m-0">Layer</h2>
        <div className="flex items-center gap-2">
          <span
            className={[
              'inline-flex items-center px-2 py-0.5 rounded-pill',
              'text-[10.5px] font-semibold bg-green-50 text-green-700',
            ].join(' ')}
            aria-label={`${activeCount} layer aktif`}
          >
            {activeCount} aktif
          </span>
          {/* Tombol tutup/collapse panel */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Tutup panel layer"
            aria-expanded
            className={[
              'inline-flex items-center justify-center w-7 h-7 rounded-pill',
              'text-ink-3 hover:bg-surface-2',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-green-500',
            ].join(' ')}
          >
            <Icon name="x" size={12} aria-hidden />
          </button>
        </div>
      </header>

      <div className="px-3.5 py-3 overflow-y-auto flex flex-col gap-4">
        {/* Base layers (radio) */}
        <fieldset className="m-0 p-0 border-0 flex flex-col gap-1.5">
          <legend className="text-cap uppercase tracking-cap text-ink-4 font-semibold mb-1 px-0">
            Basemap
          </legend>
          {BASE_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={[
                'flex items-center gap-2 py-1 px-1 -mx-1 rounded-2 text-sm cursor-pointer',
                'hover:bg-surface-2',
                basemap === opt.id ? 'text-ink' : 'text-ink-3',
              ].join(' ')}
            >
              <input
                type="radio"
                name="basemap"
                value={opt.id}
                checked={basemap === opt.id}
                onChange={() => onBasemapChange(opt.id)}
                className="accent-green-500"
                aria-label={`Pilih basemap ${opt.label}`}
              />
              <span className="flex-1">{opt.label}</span>
            </label>
          ))}
        </fieldset>

        {/* Surface overlay (category checkboxes) */}
        <fieldset className="m-0 p-0 border-0 flex flex-col gap-0.5">
          <legend className="text-cap uppercase tracking-cap text-ink-4 font-semibold mb-1 px-0">
            Dataset Overlay
          </legend>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className={[
                'flex items-center gap-2 py-1.5 px-1 -mx-1 rounded-2 text-sm cursor-pointer',
                'hover:bg-surface-2',
                cat.enabled ? 'text-ink' : 'text-ink-3',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={cat.enabled}
                onChange={() => onCategoryToggle(cat.id)}
                style={{ accentColor: cat.color }}
                aria-label={`Toggle layer ${cat.label}`}
              />
              <span
                aria-hidden="true"
                className="inline-block w-2.5 h-2.5 rounded-1 flex-none"
                style={{ background: cat.color }}
              />
              <span className="flex-1 truncate">{cat.label}</span>
              <span className="num text-[11px] text-ink-4">{cat.count}</span>
            </label>
          ))}
        </fieldset>

        {/* Subsurface */}
        <fieldset className="m-0 p-0 border-0 flex flex-col gap-0.5">
          <legend className="text-cap uppercase tracking-cap text-ink-4 font-semibold mb-1 px-0">
            Subsurface
          </legend>
          <label
            className={[
              'flex items-center gap-2 py-1.5 px-1 -mx-1 rounded-2 text-sm cursor-pointer',
              'hover:bg-surface-2',
              subsurface.seismicOn ? 'text-ink' : 'text-ink-3',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={subsurface.seismicOn}
              onChange={onSeismicToggle}
              style={{ accentColor: '#7a5cb8' }}
              aria-label="Toggle Seismic 3D"
            />
            <span
              aria-hidden="true"
              className="inline-block w-2.5 h-2.5 rounded-1 flex-none"
              style={{ background: '#7a5cb8' }}
            />
            <span className="flex-1">Seismic 3D</span>
            <span className="num text-[11px] text-ink-4">42</span>
          </label>

          {subsurface.seismicOn ? (
            <div className="pl-5 mt-1 flex flex-col gap-0.5">
              <label className="flex items-center gap-2 py-1 text-xs text-ink-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subsurface.showHorizons}
                  onChange={onHorizonsToggle}
                  style={{ accentColor: '#2a5fb8' }}
                  aria-label="Toggle Horizon"
                />
                <span aria-hidden="true" className="inline-block w-3 h-0.5 bg-blue-500" />
                <span className="flex-1">Horizon</span>
                <span className="num text-[11px] text-ink-4">5</span>
              </label>
              <label className="flex items-center gap-2 py-1 text-xs text-ink-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subsurface.showFaults}
                  onChange={onFaultsToggle}
                  style={{ accentColor: '#cf3a2a' }}
                  aria-label="Toggle Fault"
                />
                <span aria-hidden="true" className="inline-block w-3 h-0.5 bg-red-500" />
                <span className="flex-1">Fault</span>
                <span className="num text-[11px] text-ink-4">2</span>
              </label>
            </div>
          ) : null}
        </fieldset>
      </div>

      <footer className="px-3.5 py-2 border-t border-line text-[10.5px] text-ink-4 flex items-center gap-1.5">
        <Icon name="map" size={11} aria-hidden />
        <span>Indonesia · EPSG:4326</span>
      </footer>
    </aside>
  );
}
