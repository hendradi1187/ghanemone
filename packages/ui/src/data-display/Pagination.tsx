/**
 * Pagination — standar paginate controls (prev / pages / next + total count).
 *
 * Compact mode untuk small footers (max 5 pages window + ellipsis).
 *
 * A11y:
 *   - Wrapping `<nav role="navigation" aria-label="Pagination">`
 *   - Setiap button: `aria-label="Page N"` atau "Previous"/"Next"
 *   - Current page: `aria-current="page"`
 *   - Disabled prev/next saat batas: `disabled` + `aria-disabled="true"`
 */
import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import { Icon } from '../icon';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-indexed). */
  page: number;
  /** Page size — jumlah item per page. */
  pageSize: number;
  /** Total items across all pages. */
  total: number;
  /** Handler saat page berubah. */
  onPageChange: (next: number) => void;
  /** Maximum sibling pages shown around current page. Default 1. */
  siblingCount?: number;
  /** Label "Showing X-Y of Z" — pakai locale id-ID. */
  showCount?: boolean;
}

/** Build page list with ellipsis like: [1, '…', 4, 5, 6, '…', 12]. */
function buildPageRange(current: number, totalPages: number, siblingCount: number): Array<number | 'gap'> {
  const totalNumbers = siblingCount * 2 + 5; // 1, prev gap, sib, current, sib, next gap, last
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);

  const showLeftGap = leftSibling > 2;
  const showRightGap = rightSibling < totalPages - 1;

  const items: Array<number | 'gap'> = [1];
  if (showLeftGap) {
    items.push('gap');
  } else {
    for (let i = 2; i < leftSibling; i += 1) {
      items.push(i);
    }
  }
  for (let i = leftSibling; i <= rightSibling; i += 1) {
    if (i !== 1 && i !== totalPages) {
      items.push(i);
    }
  }
  if (showRightGap) {
    items.push('gap');
  } else {
    for (let i = rightSibling + 1; i < totalPages; i += 1) {
      items.push(i);
    }
  }
  items.push(totalPages);
  return items;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    pageSize,
    total,
    onPageChange,
    siblingCount = 1,
    showCount = true,
    className = '',
    ...rest
  },
  ref,
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pages = useMemo(
    () => buildPageRange(safePage, totalPages, siblingCount),
    [safePage, totalPages, siblingCount],
  );

  const startItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, total);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const handle = (n: number): void => {
    if (n < 1 || n > totalPages || n === safePage) return;
    onPageChange(n);
  };

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Pagination"
      className={['flex items-center justify-between gap-3 flex-wrap', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {showCount ? (
        <span className="text-xs text-ink-4">
          Menampilkan{' '}
          <b className="num text-ink-2">
            {startItem.toLocaleString('id-ID')}–{endItem.toLocaleString('id-ID')}
          </b>{' '}
          dari <b className="num text-ink-2">{total.toLocaleString('id-ID')}</b>
        </span>
      ) : (
        <span />
      )}

      <ul className="flex items-center gap-1 list-none m-0 p-0">
        <li>
          <button
            type="button"
            onClick={() => handle(safePage - 1)}
            disabled={!canPrev}
            aria-disabled={!canPrev}
            aria-label="Halaman sebelumnya"
            className={[
              'inline-flex items-center justify-center',
              'w-7 h-7 rounded-2 border border-line',
              'bg-surface text-ink-3',
              'transition-colors duration-hf',
              'hover:bg-surface-2',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
          >
            <Icon name="chevL" size={12} aria-hidden />
          </button>
        </li>
        {pages.map((p, idx) => {
          if (p === 'gap') {
            return (
              <li key={`gap-${idx}`} aria-hidden="true" className="px-1 text-ink-5 text-xs">
                …
              </li>
            );
          }
          const isCurrent = p === safePage;
          return (
            <li key={p}>
              <button
                type="button"
                onClick={() => handle(p)}
                aria-label={`Halaman ${p}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={[
                  'inline-flex items-center justify-center',
                  'min-w-7 h-7 px-2 rounded-2 border',
                  'text-xs font-semibold num',
                  'transition-colors duration-hf',
                  isCurrent
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-line bg-surface text-ink-3 hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                {p}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => handle(safePage + 1)}
            disabled={!canNext}
            aria-disabled={!canNext}
            aria-label="Halaman berikutnya"
            className={[
              'inline-flex items-center justify-center',
              'w-7 h-7 rounded-2 border border-line',
              'bg-surface text-ink-3',
              'transition-colors duration-hf',
              'hover:bg-surface-2',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
            ].join(' ')}
          >
            <Icon name="chevR" size={12} aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );
});
