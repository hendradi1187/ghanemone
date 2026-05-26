/**
 * SavedQueryList — left-rail di Analytics page.
 *
 * Menampilkan saved queries (built-in + user-saved). Klik item → load ke
 * query builder via `onSelect`. User-saved queries punya tombol hapus
 * (built-in tidak — ditandai `id` prefix `sample-`).
 *
 * A11y:
 *   - `<ul role="list">` semantic
 *   - Setiap item adalah `<button>` (native semantics + keyboard)
 *   - Delete button: `aria-label` deskriptif, confirm dialog dipakai di parent
 */
import { Icon, type IconName } from '@ghanem/ui';
import type { AnalyticsChartType, SavedQuery } from '../../mocks/analytics';

const CHART_ICON: Record<AnalyticsChartType, IconName> = {
  line: 'activity',
  bar: 'chart',
  pie: 'pieChart',
  donut: 'pieChart',
};

const CHART_LABEL: Record<AnalyticsChartType, string> = {
  line: 'Line',
  bar: 'Bar',
  pie: 'Pie',
  donut: 'Donut',
};

export interface SavedQueryListProps {
  /** List saved queries (built-in + user-saved, sudah ter-merge). */
  items: SavedQuery[];
  /** Saved query id yang sedang aktif (selected) — untuk highlight. */
  activeId: string | null;
  /** Klik item → load ke builder. */
  onSelect: (q: SavedQuery) => void;
  /** Klik delete → caller open confirm dialog. */
  onRequestDelete: (q: SavedQuery) => void;
  /** Klik tombol "Query baru" — reset builder. */
  onNew: () => void;
  /** Loading state. */
  loading?: boolean;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function SavedQueryList({
  items,
  activeId,
  onSelect,
  onRequestDelete,
  onNew,
  loading = false,
}: SavedQueryListProps): JSX.Element {
  return (
    <aside
      aria-label="Saved queries"
      className="flex flex-col w-72 flex-none border-r border-line bg-surface min-h-0"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <h2 className="font-display font-semibold text-h3 text-ink m-0">Saved queries</h2>
        <button
          type="button"
          onClick={onNew}
          className={[
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-2',
            'text-xs font-semibold text-white bg-green-500',
            'hover:bg-green-600',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            'transition-colors duration-hf',
          ].join(' ')}
        >
          <Icon name="plus" size={12} aria-hidden /> Baru
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {loading ? (
          <div role="status" aria-live="polite" className="px-2 py-3">
            <span className="text-xs text-ink-4">Memuat…</span>
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-4 text-sm text-ink-4">
            Belum ada saved query. Bangun query lalu klik "Simpan".
          </p>
        ) : (
          <ul role="list" className="flex flex-col gap-1">
            {items.map((q) => {
              const isActive = q.id === activeId;
              const isBuiltin = q.id.startsWith('sample-');
              return (
                <li key={q.id}>
                  <div
                    className={[
                      'group flex items-start gap-2 rounded-2 px-2 py-2',
                      isActive
                        ? 'bg-green-50 border border-green-200'
                        : 'border border-transparent hover:bg-surface-2',
                      'transition-colors duration-hf',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(q)}
                      aria-current={isActive ? 'true' : undefined}
                      className={[
                        'flex-1 min-w-0 text-left',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                        'rounded-1 px-0.5',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name={CHART_ICON[q.chartType]}
                          size={12}
                          aria-hidden
                          className={isActive ? 'text-green-700' : 'text-ink-4'}
                        />
                        <span
                          className={[
                            'text-sm font-semibold truncate',
                            isActive ? 'text-green-700' : 'text-ink',
                          ].join(' ')}
                        >
                          {q.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-4 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{CHART_LABEL[q.chartType]}</span>
                        <span aria-hidden>·</span>
                        <span>{formatDate(q.createdAt)}</span>
                        {isBuiltin ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="text-green-700 font-medium">Built-in</span>
                          </>
                        ) : null}
                      </div>
                    </button>
                    {!isBuiltin ? (
                      <button
                        type="button"
                        onClick={() => onRequestDelete(q)}
                        aria-label={`Hapus saved query ${q.name}`}
                        title="Hapus saved query"
                        className={[
                          'flex-none inline-flex items-center justify-center w-6 h-6 rounded-1',
                          'text-ink-4 hover:text-red-500 hover:bg-red-100',
                          'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500',
                          'transition-opacity duration-hf',
                        ].join(' ')}
                      >
                        <Icon name="x" size={10} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
