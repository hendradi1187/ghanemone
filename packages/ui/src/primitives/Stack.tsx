/**
 * Stack — flexible flex container untuk row/col layout.
 *
 * Menggantikan inline `display:flex; gap:…; flexDirection:…` yang berulang
 * di hifi-components.jsx (`row`, `col` classes). Tokens-only spacing (Tailwind
 * gap-X utilities), no hardcoded values.
 *
 * Examples:
 *   <Stack direction="row" gap="3" align="center">…</Stack>
 *   <Stack direction="col" gap="2">…</Stack>
 */
import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

/** Token-aligned gap scale (4px base). Match `spacing` di tailwind-base. */
export type StackGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Arah flex — `row` (horizontal) atau `col` (vertical). Default `row`. */
  direction?: 'row' | 'col';
  /** Gap antar children, dipetakan ke Tailwind `gap-{n}` (4px step). Default `3`. */
  gap?: StackGap;
  /** Vertical alignment items. Default `center` untuk row, `stretch` untuk col. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Horizontal alignment / distribution. Default `start`. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Flex-wrap enable. Default false. */
  wrap?: boolean;
  /** Render sebagai element tag berbeda (semantik). */
  as?: ElementType;
  /** Apakah Stack ini occupy full width. Default false. */
  grow?: boolean;
  children?: ReactNode;
}

const gapMap: Record<StackGap, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '5': 'gap-5',
  '6': 'gap-6',
  '8': 'gap-8',
  '10': 'gap-10',
  '12': 'gap-12',
  '16': 'gap-16',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    direction = 'row',
    gap = '3',
    align,
    justify = 'start',
    wrap = false,
    as: Tag = 'div',
    grow = false,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const dirClass = direction === 'col' ? 'flex-col' : 'flex-row';
  const alignClass = align
    ? alignMap[align]
    : direction === 'row'
      ? alignMap.center
      : alignMap.stretch;
  const classes = [
    'flex',
    dirClass,
    gapMap[gap],
    alignClass,
    justifyMap[justify],
    wrap ? 'flex-wrap' : '',
    grow ? 'flex-1 min-w-0' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // reason: forwardRef polymorphic-as patterns butuh sedikit cast karena ref tipenya
  // bergantung pada Tag yang dipilih caller. Cast minimal di sini supaya consumer
  // tetap dapat type checking penuh pada props lainnya.
  const Component = Tag as ElementType;
  return (
    <Component ref={ref} className={classes} {...rest}>
      {children}
    </Component>
  );
});
