/**
 * Container — centered max-width wrapper untuk page-level content.
 *
 * Pakai untuk page bodies yang butuh constrained width di layar lebar.
 * Mobile-first: full-width di sm-, lalu max-width naik di breakpoint.
 *
 * Examples:
 *   <Container>…</Container>             // default md (768px) max
 *   <Container size="xl">…</Container>   // 1280px max
 */
import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Max width preset. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Horizontal padding (mobile baseline). Default `4` (16px). */
  paddingX?: '0' | '2' | '3' | '4' | '5' | '6';
  /** Render sebagai element tag berbeda — semantic landmarks (main, section). */
  as?: ElementType;
  children?: ReactNode;
}

const sizeMap = {
  sm: 'max-w-screen-sm', // 640px
  md: 'max-w-screen-md', // 768px
  lg: 'max-w-screen-lg', // 1024px
  xl: 'max-w-screen-xl', // 1280px
  '2xl': 'max-w-screen-2xl', // 1440px
  full: 'max-w-full',
} as const;

const paddingXMap = {
  '0': 'px-0',
  '2': 'px-2',
  '3': 'px-3',
  '4': 'px-4',
  '5': 'px-5',
  '6': 'px-6',
} as const;

export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { size = 'lg', paddingX = '4', as: Tag = 'div', className = '', children, ...rest },
  ref,
) {
  const classes = ['w-full mx-auto', sizeMap[size], paddingXMap[paddingX], className]
    .filter(Boolean)
    .join(' ');

  const Component = Tag as ElementType;
  return (
    <Component ref={ref} className={classes} {...rest}>
      {children}
    </Component>
  );
});
