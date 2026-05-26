/**
 * AppCard — kartu app di Apps Marketplace grid.
 *
 * Hover/focus: subtle elevate + border-green. Klik whole card → buka detail
 * dialog (parent handler). Install button stop-propagation → trigger install
 * mutation tanpa membuka dialog.
 *
 * A11y:
 *   - Wrapper `<article>` dengan `aria-labelledby` ke nama app
 *   - Klik card adalah `<button type="button">` overlay (focus-visible)
 *   - Install button nested: pakai `onClick` dengan stopPropagation supaya
 *     parent button tidak juga fire. Untuk a11y nested-button rule, pakai
 *     div-as-card + 2 button siblings (card-open + install).
 */
import { Icon } from '@ghanem/ui';
import type { AppInstalled } from '../../api/apps';

const CATEGORY_LABEL: Record<AppInstalled['category'], string> = {
  visualization: 'Visualisasi',
  analysis: 'Analisis',
  integration: 'Integrasi',
  utility: 'Utilitas',
};

const CATEGORY_TONE: Record<AppInstalled['category'], string> = {
  visualization: 'bg-blue-50 text-blue-600',
  analysis: 'bg-purple-100 text-purple-500',
  integration: 'bg-amber-100 text-amber-700',
  utility: 'bg-green-50 text-green-700',
};

export interface AppCardProps {
  app: AppInstalled;
  onOpen: (app: AppInstalled) => void;
  onInstallToggle: (app: AppInstalled) => void;
  /** Loading install mutation untuk app ini. */
  installPending: boolean;
}

function fmtRating(r: number): string {
  return r.toFixed(1);
}

function fmtDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('id-ID');
}

export function AppCard({ app, onOpen, onInstallToggle, installPending }: AppCardProps): JSX.Element {
  const titleId = `app-card-${app.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={[
        'group relative flex flex-col gap-3 p-4',
        'bg-surface border border-line rounded-3',
        'hover:border-green-200 hover:shadow-1',
        'transition-all duration-hf',
        'focus-within:border-green-500 focus-within:shadow-focus',
      ].join(' ')}
    >
      {/* Card-wide click area sebagai overlay button — diset z-1 supaya install button (z-2) bisa tetap clickable. */}
      <button
        type="button"
        onClick={() => onOpen(app)}
        aria-label={`Buka detail ${app.name}`}
        className={[
          'absolute inset-0 z-[1] rounded-3',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
        ].join(' ')}
      />

      <div className="flex items-start justify-between gap-2 relative z-[2] pointer-events-none">
        <div
          aria-hidden="true"
          className="flex-none inline-flex items-center justify-center w-12 h-12 rounded-2 text-white shadow-1"
          style={{ background: `linear-gradient(135deg, ${app.gradient.from}, ${app.gradient.to})` }}
        >
          <Icon name={app.iconName} size={22} aria-hidden />
        </div>
        {app.installed ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-1 bg-green-50 text-green-700 text-[10.5px] font-semibold uppercase tracking-cap">
            <Icon name="check" size={9} aria-hidden /> Installed
          </span>
        ) : app.pricing === 'free' ? (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-amber-100 text-amber-700 text-[10.5px] font-semibold uppercase tracking-cap">
            Free
          </span>
        ) : (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10.5px] font-semibold uppercase tracking-cap">
            Paid
          </span>
        )}
      </div>

      <div className="relative z-[2] pointer-events-none">
        <h3 id={titleId} className="font-display font-semibold text-h3 text-ink m-0 truncate">
          {app.name}
        </h3>
        <p className="text-xs text-ink-4 mt-0.5 truncate">{app.vendor}</p>
      </div>

      <p className="text-sm text-ink-3 line-clamp-2 relative z-[2] pointer-events-none">
        {app.description}
      </p>

      <div className="flex items-center justify-between gap-2 mt-auto relative z-[2] pointer-events-none">
        <div className="flex items-center gap-2 text-[11px] text-ink-4 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Icon name="star" size={11} className="text-amber-700" aria-hidden />
            <span className="num font-semibold text-ink-2">{fmtRating(app.rating)}</span>
          </span>
          <span aria-hidden>·</span>
          <span className="num">{fmtDownloads(app.downloads)} install</span>
          <span
            className={[
              'inline-flex items-center px-1.5 py-0.5 rounded-1 text-[10px] font-semibold',
              CATEGORY_TONE[app.category],
            ].join(' ')}
          >
            {CATEGORY_LABEL[app.category]}
          </span>
        </div>
      </div>

      {/* Install button — z-2 supaya berada di atas card-overlay. pointer-events-auto karena parent stack pointer-events-none. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onInstallToggle(app);
        }}
        disabled={installPending}
        aria-busy={installPending || undefined}
        className={[
          'relative z-[2] inline-flex items-center justify-center gap-1.5 h-9 rounded-2',
          'text-sm font-semibold pointer-events-auto',
          'transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          app.installed
            ? 'bg-surface border border-line text-ink-2 hover:bg-surface-2'
            : 'bg-green-500 text-white border border-green-600 hover:bg-green-600',
        ].join(' ')}
      >
        {installPending ? (
          <span aria-hidden className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-pill animate-spin" />
        ) : (
          <Icon name={app.installed ? 'check' : 'download'} size={13} aria-hidden />
        )}
        {app.installed ? 'Uninstall' : 'Install'}
      </button>
    </article>
  );
}
