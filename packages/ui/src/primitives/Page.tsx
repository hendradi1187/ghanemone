/**
 * Page — top-level page wrapper. Sets full-height flex column dan applies
 * dasar token bg/text supaya child components dapat mengandalkan inheritance.
 *
 * Port dari `HfPage` di `hifi-components.jsx` (yang mengaplikasikan className `.hf`).
 * Karena tokens sekarang langsung di-apply via Tailwind base (lihat
 * `apps/web/src/index.css`), wrapper ini lebih ringan: hanya layout structure.
 *
 * Examples:
 *   <Page>                              // full-height flex column
 *     <TopNav />
 *     <main>…</main>
 *   </Page>
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Label untuk artboard/hi-fi screenshots. Hanya muncul sebagai `data-screen-label`
   * — tidak rendered visible. Berguna saat capturing storybook snapshots.
   */
  screenLabel?: string;
  /** Apakah page boleh overflow vertically. Default false (lock viewport-height app shell). */
  scroll?: boolean;
  children?: ReactNode;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
  { screenLabel, scroll = false, className = '', children, ...rest },
  ref,
) {
  const classes = [
    'flex flex-col w-full h-full',
    'bg-surface-bg text-ink',
    'font-sans text-body',
    scroll ? 'overflow-auto' : 'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      data-screen-label={screenLabel}
      className={classes}
      {...rest}
    >
      {children}
    </div>
  );
});
