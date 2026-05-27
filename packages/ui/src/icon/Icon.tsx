/**
 * Icon — thin wrapper di atas Lucide React icons.
 *
 * Mempertahankan API string-name (`name: IconName`) yang sudah dipakai di
 * seluruh codebase. Rendering di-delegate ke Lucide icon components yang
 * di-map via `icon-map.ts`.
 *
 * Keuntungan vs SVG path hardcoded (icon-paths.ts lama):
 *   - Path selalu benar (Lucide maintained)
 *   - Tree-shakeable — Vite/esbuild hanya bundle ikon yang dipakai
 *   - Konsisten dengan brand (Lucide 2px stroke round cap/join default)
 *
 * A11y (identik dengan implementasi lama):
 *   - **Decorative** (default): `aria-hidden="true"`, tidak diumumkan SR.
 *   - **Labeled**: set `title` → menjadi `role="img"` dengan `<title>`.
 *   - Untuk icon-only buttons, **wajib** wrap dengan `<button aria-label="…">`.
 */
import { forwardRef, type CSSProperties, type SVGProps } from 'react';
import { type LucideProps } from 'lucide-react';
import { iconMap, isIconName, type IconName } from './icon-map';

export type { IconName };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Nama icon — autocomplete dari union nama yang tersedia. */
  name: IconName;
  /** Lebar/tinggi dalam pixel (square). Default 16. */
  size?: number;
  /** Stroke color — default `currentColor` (inherit dari parent). */
  color?: string;
  /** Stroke width — default 1.7 (match hi-fi rendering). */
  strokeWidth?: number;
  /** Title untuk screen reader. Bila set, icon dianggap meaningful, bukan decorative. */
  title?: string;
  /** Style override — gunakan hanya bila Tailwind tidak cukup. */
  style?: CSSProperties;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 16, color = 'currentColor', strokeWidth = 1.7, title, style, className, ...rest },
  ref,
) {
  if (!isIconName(name)) {
    return (
      <span
        aria-hidden="true"
        style={{ display: 'inline-block', width: size, height: size, ...style }}
      />
    );
  }

  const LucideIcon = iconMap[name];
  const labeled = Boolean(title);

  // Lucide components accept LucideProps which overlap with SVGProps<SVGSVGElement>.
  // We pass through remaining rest props after extracting Icon-specific ones.
  const lucideProps: LucideProps & { title?: string } = {
    size,
    color,
    strokeWidth,
    'aria-hidden': labeled ? undefined : (true as unknown as undefined),
    role: labeled ? 'img' : undefined,
    focusable: 'false' as unknown as undefined,
    style: { flex: '0 0 auto', display: 'inline-block', ...style },
    className,
    // reason: SVGProps has string index signatures that overlap with LucideProps —
    // the spread is safe because we've already extracted all Icon-specific props above.
    ...(rest as Record<string, unknown>),
  };

  if (labeled) {
    return (
      <LucideIcon
        // reason: forwardRef on Lucide component expects SVGSVGElement ref
        ref={ref as React.Ref<SVGSVGElement>}
        {...lucideProps}
      >
        <title>{title}</title>
      </LucideIcon>
    );
  }

  return (
    <LucideIcon
      ref={ref as React.Ref<SVGSVGElement>}
      {...lucideProps}
    />
  );
});
