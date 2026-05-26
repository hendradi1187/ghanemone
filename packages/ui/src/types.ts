/**
 * Shared UI types — re-used across primitives, nav, icon, dst.
 * Tetap minimal: domain-specific types tinggal di @ghanem/types.
 */

/** Standard size scale untuk komponen yang menerima sizing variant. */
export type Size = 'sm' | 'md' | 'lg';

/** Visual emphasis variant — selaras dengan token Pill/Button di hifi-tokens.css. */
export type Variant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'ghost'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/** Subset color tokens yang relevan untuk swatch / status / accent. */
export type ToneColor =
  | 'green'
  | 'blue'
  | 'amber'
  | 'red'
  | 'purple'
  | 'ink';

/** Polymorphic element type helper — pakai untuk komponen yang bisa render sebagai elemen berbeda. */
export type AsElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav';
