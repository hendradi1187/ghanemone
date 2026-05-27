/**
 * Ghanem.one — Tailwind base preset
 *
 * Source-of-truth design tokens diturunkan langsung dari `hifi-tokens.css`
 * (lihat /workspace/hifi-tokens.css). Semua warna, tipografi, spacing, radius,
 * shadow, dan motion direpresentasikan di sini sebagai single Tailwind preset
 * sehingga apps/web dan apps/admin bisa men-spread konfigurasi ini.
 *
 * Naming convention:
 *   - CSS var `--hf-green-500`   → `theme.colors.green.500` (di-namespace untuk hindari clash dgn default Tailwind palette? — TIDAK. Tailwind default colors di-disable di preset ini untuk paksa pemakaian token brand. Bila perlu Tailwind default, gunakan `extend` di consumer.)
 *   - CSS var `--hf-ink`         → `theme.colors.ink.DEFAULT`
 *   - CSS var `--hf-bg`          → `theme.colors.surface.bg`
 *   - CSS var `--hf-r-3`         → `theme.borderRadius.3` (numeric step)
 *   - CSS var `--hf-sh-2`        → `theme.boxShadow.2`
 *   - CSS var `--hf-1` (spacing) → `theme.spacing.1` (4px step)
 *
 * Strict TS: di-export sebagai `Config` partial preset.
 */
import type { Config } from 'tailwindcss';

/**
 * Brand palette — warm-tech feel, hijau hutan (institutional) + biru prussian
 * (data + map heritage). Lihat hifi-tokens.css §"Brand palette".
 */
const colors = {
  // Brand primary — deep forest green
  green: {
    50: '#ecf6ef',
    100: '#d4ecdb',
    200: '#a8d6b6',
    400: '#4ea96c',
    500: '#1f8a4a', // primary
    600: '#156b39',
    700: '#0d4f2a',
    900: '#062b16',
  },
  // Brand accent — prussian blue
  blue: {
    50: '#eef3fb',
    100: '#d9e4f5',
    300: '#7ea3df',
    500: '#2a5fb8', // accent
    600: '#1f4a96',
    900: '#0a1a3a', // navy band
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
  // Neutrals — slate ink yang sedikit cool di highlight, hangat di shadow
  ink: {
    DEFAULT: '#0e1726', // near-black, slight cool
    2: '#1f2a3d',
    3: '#3a4459', // AA contrast on warm bg
    4: '#5b667e',
    5: '#8590a8',
    6: '#c9d0de',
  },
  // Surface = warm parchment canvas
  surface: {
    bg: '#f7f5f0', // warm canvas
    DEFAULT: '#ffffff',
    2: '#fafaf6',
    3: '#f1ede4',
  },
  line: {
    DEFAULT: '#e6e1d4',
    2: '#d7d1c1',
  },
  // Map-specific tints
  map: {
    water: '#e4ecf4',
    'water-2': '#cfddec',
    land: '#ebe5d3',
    'land-2': '#dcd4be',
    coast: '#9da899',
  },
  // System utility (selalu tersedia)
  transparent: 'transparent',
  current: 'currentColor',
  white: '#ffffff',
  black: '#000000',
} as const;

/**
 * Spacing scale berdasarkan 4px base. Mirror persis CSS vars `--hf-1` … `--hf-16`.
 */
const spacing = {
  px: '1px',
  0: '0',
  1: '4px', // --hf-1
  2: '8px', // --hf-2
  3: '12px', // --hf-3
  4: '16px', // --hf-4
  5: '20px', // --hf-5
  6: '24px', // --hf-6
  8: '32px', // --hf-8
  10: '40px', // --hf-10
  12: '48px', // --hf-12
  16: '64px', // --hf-16
  // Extra langkah yang sering dipakai consumer (responsive density), turunan dari base 4px
  7: '28px',
  9: '36px',
  11: '44px',
  14: '56px',
  20: '80px',
  24: '96px',
  32: '128px',
  // Fractional steps — match Tailwind default behavior untuk class `py-1.5`, `gap-2.5`, dst
  // Dipakai existing components (TopNav, Sidebar, Button). Without these, classes silently no-op.
  '0.5': '2px',
  '1.5': '6px',
  '2.5': '10px',
  '3.5': '14px',
};

/**
 * Border radius — pakai numeric step yang match `--hf-r-1` … `--hf-r-4` + pill.
 */
const borderRadius = {
  none: '0',
  1: '4px', // --hf-r-1
  2: '6px', // --hf-r-2
  3: '8px', // --hf-r-3
  4: '12px', // --hf-r-4
  pill: '9999px', // --hf-r-pill
  full: '9999px',
};

/**
 * Box-shadow — layered tokens identik dengan `--hf-sh-1` … `--hf-sh-4` + focus ring.
 */
const boxShadow = {
  none: 'none',
  1: '0 1px 2px rgba(14,23,38,.06)',
  2: '0 1px 2px rgba(14,23,38,.06), 0 4px 14px rgba(14,23,38,.06)',
  3: '0 1px 2px rgba(14,23,38,.06), 0 8px 28px rgba(14,23,38,.10)',
  4: '0 6px 18px rgba(14,23,38,.10), 0 18px 48px rgba(14,23,38,.16)',
  focus: '0 0 0 3px rgba(31,138,74,.18)',
  'focus-strong': '0 0 0 4px rgba(31,138,74,.18)',
};

/**
 * Font families — fonts diserve oleh consumer via @font-face / Google Fonts link.
 */
const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  display: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
};

/**
 * Font-size tokens. Tuple kedua = lineHeight + letterSpacing/weight defaults
 * berdasarkan helper class di hifi-tokens.css (.display, .h1, .h2, .h3, .body, .sm, .xs, .cap).
 */
const fontSize = {
  // Hierarchy yang match helper di .hf
  display: [
    '38px',
    { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' },
  ],
  h1: ['26px', { lineHeight: '1.2', letterSpacing: '-0.018em', fontWeight: '700' }],
  h2: ['20px', { lineHeight: '1.25', letterSpacing: '-0.012em', fontWeight: '700' }],
  h3: ['16px', { lineHeight: '1.3', letterSpacing: '-0.006em', fontWeight: '600' }],
  body: ['13.5px', { lineHeight: '1.45', letterSpacing: '-0.005em' }],
  sm: ['12px', { lineHeight: '1.45' }],
  xs: ['11px', { lineHeight: '1.4' }],
  cap: ['10.5px', { lineHeight: '1.2', letterSpacing: '0.07em', fontWeight: '600' }],
  // Konsisten dgn Tailwind defaults untuk progressive enhancement
  'num-big': ['28px', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
};

/**
 * Transition durations + easing — terjemahan `--hf-dur` dan `--hf-ease`.
 */
const transitionDuration = {
  hf: '160ms', // --hf-dur (default)
  fast: '120ms',
  slow: '240ms',
};
const transitionTimingFunction = {
  hf: 'cubic-bezier(.2,.7,.3,1)', // --hf-ease (default)
};

/**
 * Z-index scale — tidak ada di hifi-tokens.css, tapi ditetapkan di sini untuk hindari magic numbers.
 * Skala konservatif: nav (40), floating panels (50–55), modals (60), toast (70), tooltip (80).
 *
 * Hierarki floating di MapPage:
 *   floating-base    (50) — status bar statis: legend, CRS indicator
 *   floating-panel   (51) — collapsible side panels: LayerPanel, DatasetSidebar
 *   floating-overlay (55) — selalu di atas panel: SearchBar, View Mode Toggle
 */
const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  nav: '40',
  floating: '50',
  'floating-base': '50',
  'floating-panel': '51',
  'floating-overlay': '55',
  modal: '60',
  toast: '70',
  tooltip: '80',
};

/**
 * Screens — mobile-first breakpoints. Design at 375px mobile, scale ke 1440+ desktop.
 */
const screens = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
};

/**
 * Keyframes + animations — port dari `@keyframes hfSkeletonShimmer` di hifi-tokens.css.
 */
const keyframes = {
  'skeleton-shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'fade-in': {
    '0%': { opacity: '0', transform: 'translateY(2px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'fade-out': {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  // Animasi untuk SlideOver — slide dari kanan
  'slide-in-right': {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  'slide-out-right': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(100%)' },
  },
};
const animation = {
  'skeleton-shimmer': 'skeleton-shimmer 1.4s ease-in-out infinite',
  'fade-in': 'fade-in 160ms cubic-bezier(.2,.7,.3,1)',
  'fade-out': 'fade-out 160ms cubic-bezier(.2,.7,.3,1)',
  // SlideOver animations
  'slide-in-right': 'slide-in-right 200ms ease-out',
  'slide-out-right': 'slide-out-right 200ms ease-in',
};

/**
 * Tailwind preset — di-export sebagai partial Config.
 *
 * Catatan: `content: []` sengaja kosong karena preset tidak tahu di mana
 * consumer akan punya source files. Consumer wajib men-define `content` sendiri.
 */
export const tailwindBase: Partial<Config> = {
  // reason: Tailwind preset typing menerima Partial<Config>; di-cast ke Partial<Config>
  // supaya consumer (apps/web, apps/admin) bisa pass via `presets: [tailwindBase]` tanpa friction.
  content: [],
  // Dark mode: future-proof; saat ini belum ada dark theme di hi-fi.
  darkMode: 'class',
  theme: {
    // Override Tailwind default palette agar developer dipaksa pakai brand tokens.
    colors,
    screens,
    spacing,
    borderRadius,
    boxShadow,
    fontFamily,
    fontSize,
    extend: {
      transitionDuration,
      transitionTimingFunction,
      zIndex,
      keyframes,
      animation,
      // Tabular nums helper (untuk KPI / metric tiles)
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
      // Backdrop blur untuk floating panels (.floater)
      backdropBlur: {
        floater: '8px',
      },
      // Letter-spacing token semantik (sekaligus alias di atas fontSize entries)
      letterSpacing: {
        display: '-0.025em',
        h1: '-0.018em',
        h2: '-0.012em',
        h3: '-0.006em',
        body: '-0.005em',
        cap: '0.07em',
        widest: '0.08em',
      },
      // Line-height tokens semantik
      lineHeight: {
        tight: '1.1',
        snug: '1.2',
        normal: '1.45',
      },
    },
  },
  plugins: [],
};

export default tailwindBase;
