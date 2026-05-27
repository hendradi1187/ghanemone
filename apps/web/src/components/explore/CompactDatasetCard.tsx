/**
 * CompactDatasetCard — variant kartu dataset yang lebih kecil untuk split view.
 *
 * Dipakai saat map view aktif: dataset list menjadi kolom kiri yang lebih sempit,
 * card ini menampilkan info esensial dalam format horizontal compact.
 *
 * A11y:
 *   - role="article" + aria-label dengan nama dataset
 *   - Keyboard accessible via button wrapper
 *   - Focus ring brand green
 */
import type { DatasetRecord } from '../../mocks/datasets';
import { Icon } from '@ghanem/ui';

export interface CompactDatasetCardProps {
  dataset: DatasetRecord;
  selected?: boolean;
  highlighted?: boolean;
  onClick: (dataset: DatasetRecord) => void;
}

export function CompactDatasetCard({
  dataset,
  selected = false,
  highlighted = false,
  onClick,
}: CompactDatasetCardProps): JSX.Element {
  const kindColors: Record<string, string> = {
    LAYER: 'bg-green-500',
    VOLUME: 'bg-purple-500',
    DOC: 'bg-blue-500',
  };
  const kindColor = kindColors[dataset.kind] ?? 'bg-green-500';

  return (
    <article
      aria-label={dataset.title}
      className={[
        'group relative flex items-start gap-2.5 p-2.5 rounded-2 border',
        'transition-colors duration-hf cursor-pointer',
        'focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-1',
        selected || highlighted
          ? 'border-green-500 bg-green-50'
          : 'border-line bg-surface hover:bg-surface-2 hover:border-line-2',
      ].join(' ')}
    >
      {/* Thumbnail swatch — warna dari provider color */}
      <div
        aria-hidden="true"
        className="flex-none w-8 h-8 rounded-1 flex items-center justify-center text-white text-[9px] font-bold uppercase"
        style={{ background: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)' }}
      >
        {dataset.provider.initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5 flex-wrap">
          <span
            aria-hidden="true"
            className={[
              'inline-flex items-center px-1 py-px rounded-1',
              'text-[8.5px] font-bold uppercase tracking-widest leading-none text-white',
              kindColor,
            ].join(' ')}
          >
            {dataset.kind}
          </span>
          {dataset.verified ? (
            <Icon
              name="check"
              size={10}
              aria-label="Terverifikasi"
              className="text-green-600"
            />
          ) : null}
        </div>

        <p className="text-xs font-semibold text-ink leading-snug line-clamp-2 m-0">
          {dataset.title}
        </p>

        <div className="flex items-center gap-2 mt-1 text-[10.5px] text-ink-4">
          <span className="truncate">{dataset.provider.name}</span>
          {dataset.updatedLabel ? (
            <>
              <span aria-hidden>·</span>
              <span className="flex-none">{dataset.updatedLabel}</span>
            </>
          ) : null}
        </div>

        {/* Stats mini */}
        <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-5">
          {dataset.stats?.downloads !== undefined ? (
            <span className="inline-flex items-center gap-0.5">
              <Icon name="download" size={9} aria-hidden />
              <span className="num">{dataset.stats.downloads}</span>
            </span>
          ) : null}
          {dataset.stats?.views !== undefined ? (
            <span className="inline-flex items-center gap-0.5">
              <Icon name="eye" size={9} aria-hidden />
              <span className="num">{dataset.stats.views}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Invisible full-area click target */}
      <button
        type="button"
        className="absolute inset-0 rounded-2 focus:outline-none"
        aria-label={`Pilih dataset ${dataset.title}`}
        tabIndex={0}
        onClick={() => onClick(dataset)}
      />
    </article>
  );
}
