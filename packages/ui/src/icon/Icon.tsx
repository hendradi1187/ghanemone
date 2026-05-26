/**
 * Icon — lucide-style stroked SVG icon.
 *
 * Port dari `hifi-components.jsx` (workspace root). Strong-typed `name` prop
 * yang autocomplete dari `IconName` union (lihat icon-paths.ts).
 *
 * A11y:
 *   - **Decorative** (default): `aria-hidden="true"`, tidak diumumkan SR.
 *   - **Labeled**: set `title` atau `aria-label` → menjadi `role="img"` dengan `<title>`.
 *
 * Untuk icon-only buttons, **wajib** wrap dengan `<button aria-label="…">`.
 * Icon-nya sendiri tetap decorative (aria-hidden), label di-handle button.
 */
import { forwardRef, type CSSProperties, type SVGProps } from 'react';
import { iconPaths, type IconName } from './icon-paths';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Nama icon — autocomplete dari union 41 ikon yang tersedia. */
  name: IconName;
  /** Lebar/tinggi dalam pixel (square). Default 16. */
  size?: number;
  /** Stroke color — default `currentColor` (inherit dari parent). */
  color?: string;
  /** Stroke width — default 1.7 (match hi-fi rendering). */
  strokeWidth?: number;
  /** Title untuk screen reader / tooltip. Bila set, icon dianggap meaningful, bukan decorative. */
  title?: string;
  /** Style override — gunakan hanya bila Tailwind tidak cukup. */
  style?: CSSProperties;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 16, color = 'currentColor', strokeWidth = 1.7, title, style, ...rest },
  ref,
) {
  const d = iconPaths[name];
  // reason: nama selalu terdefinisi karena di-validasi di compile-time via IconName union;
  // pengecekan runtime tetap dipertahankan sebagai defense-in-depth.
  if (!d) {
    return (
      <span
        aria-hidden="true"
        style={{ display: 'inline-block', width: size, height: size, ...style }}
      />
    );
  }

  const labeled = Boolean(title);
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labeled ? undefined : true}
      role={labeled ? 'img' : undefined}
      focusable="false"
      style={{ flex: '0 0 auto', display: 'inline-block', ...style }}
      {...rest}
    >
      {labeled ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
});
