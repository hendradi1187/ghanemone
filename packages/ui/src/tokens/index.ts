/**
 * Token re-exports — untuk dipakai di code yang **bukan** Tailwind utility class,
 * misalnya inline styles untuk SVG markers, Leaflet GeoJSON style props, atau
 * canvas/WebGL render code.
 *
 * **Bila bisa, prefer Tailwind classes** (`bg-green-500`, `text-ink-2`, dst.) —
 * pakai token JS ini hanya saat truly necessary (third-party API yang menerima
 * string color, atau dynamic palette di chart).
 *
 * Naming mirror Tailwind config (lihat packages/config/tailwind-base.ts).
 */

export const colorTokens = {
  green: {
    50: '#ecf6ef',
    100: '#d4ecdb',
    200: '#a8d6b6',
    400: '#4ea96c',
    500: '#1f8a4a',
    600: '#156b39',
    700: '#0d4f2a',
    900: '#062b16',
  },
  blue: {
    50: '#eef3fb',
    100: '#d9e4f5',
    300: '#7ea3df',
    500: '#2a5fb8',
    600: '#1f4a96',
    900: '#0a1a3a',
  },
  amber: {
    100: '#fdf1d0',
    500: '#c2840d',
    700: '#8b5e07',
  },
  red: {
    100: '#fde2dd',
    500: '#cf3a2a',
    700: '#9b2218',
  },
  purple: {
    100: '#ede6f6',
    500: '#7a5cb8',
  },
  ink: {
    DEFAULT: '#0e1726',
    2: '#1f2a3d',
    3: '#3a4459',
    4: '#5b667e',
    5: '#8590a8',
    6: '#c9d0de',
  },
  surface: {
    bg: '#f7f5f0',
    DEFAULT: '#ffffff',
    2: '#fafaf6',
    3: '#f1ede4',
  },
  line: {
    DEFAULT: '#e6e1d4',
    2: '#d7d1c1',
  },
  map: {
    water: '#e4ecf4',
    'water-2': '#cfddec',
    land: '#ebe5d3',
    'land-2': '#dcd4be',
    coast: '#9da899',
  },
} as const;

/** Spacing scale (4px base) — number values dalam pixel. */
export const spacingTokens = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Border-radius scale — number values dalam pixel. */
export const radiusTokens = {
  1: 4,
  2: 6,
  3: 8,
  4: 12,
  pill: 9999,
} as const;

/** Motion tokens. */
export const motionTokens = {
  duration: {
    fast: 120,
    hf: 160,
    slow: 240,
  },
  easing: {
    hf: 'cubic-bezier(.2,.7,.3,1)',
  },
} as const;

/** Font family stacks. */
export const fontFamilyTokens = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  display: "'Inter Tight', 'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
} as const;
