/**
 * Icon path dictionary — lucide-style stroked SVG paths.
 *
 * Diturunkan persis dari `hifi-components.jsx` `__ICON_PATHS` (workspace root)
 * dengan **strong typing**. Setiap entry: `name → d-attribute string`.
 *
 * Jika icon baru dibutuhkan, tambah di sini → otomatis tersedia di Icon name union.
 *
 * Rationale untuk mempertahankan inline paths (alih-alih full `lucide-react` import):
 *   1. Bundle size — hanya 24 ikon yg di-include, ~1.5 KB total.
 *   2. Konsistensi visual dengan prototype (stroke-width 1.7, square cap).
 *   3. Tidak ada dependency runtime baru — Icon adalah pure SVG.
 *
 * Bila ke depan butuh ikon di luar set ini, **prefer** add lucide-react sebagai
 * dependency + lazy-import — jangan tambah path manual yang berisiko drift.
 */

export const iconPaths = {
  search: 'M11 19a8 8 0 1 1 5.3-2L21 21M11 19a8 8 0 0 0 5.3-2',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0',
  help: 'M9 9a3 3 0 1 1 4.5 2.6c-.8.5-1.5 1-1.5 2.4M12 17h.01',
  chevron: 'M6 9l6 6 6-6',
  chevR: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-9 6 9 6',
  plus: 'M12 5v14M5 12h14',
  download: 'M12 4v12m0 0l-4-4m4 4l4-4M4 20h16',
  upload: 'M12 20V8m0 0l-4 4m4-4l4 4M4 4h16',
  filter: 'M3 5h18l-7 9v6l-4-2v-4z',
  layers:
    'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5',
  pin:
    'M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  database:
    'M4 6c0-1.5 3.6-3 8-3s8 1.5 8 3v12c0 1.5-3.6 3-8 3s-8-1.5-8-3V6zM4 12c0 1.5 3.6 3 8 3s8-1.5 8-3M4 6c0 1.5 3.6 3 8 3s8-1.5 8-3',
  map: 'M9 4l-6 3v13l6-3 6 3 6-3V4l-6 3-6-3zM9 4v13M15 7v13',
  chart: 'M3 21h18M5 21V10m4 11V6m4 15v-9m4 9V8',
  pieChart: 'M21 12a9 9 0 1 1-9-9v9h9z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  globe:
    'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18',
  user:
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  doc:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M9 14h6M9 18h4',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  star: 'M12 2l3.1 6.3 7 .9-5 4.9 1.2 6.9L12 17.8l-6.3 3.2L7 14.1 2 9.2l7-.9z',
  eye:
    'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  check: 'M5 12l4 4L19 6',
  warn: 'M12 9v4m0 4h.01M12 2L2 22h20L12 2z',
  x: 'M6 6l12 12M18 6L6 18',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M5 12l7 7 7-7',
  arrowR: 'M5 12h14M12 5l7 7-7 7',
  spark:
    'M5 3v3M19 18v3M5 21v-3M19 6V3M3 5h3M16 19h3M3 19h3M16 5h3M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L8 13l3.5-1.5z',
  refresh:
    'M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  sparkle:
    'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  clock: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v14',
  comment: 'M21 12a8 8 0 0 1-12 7L3 21l2-6a8 8 0 1 1 16-3z',
  arrowUpRight: 'M7 17L17 7M7 7h10v10',
} as const;

/** Union dari semua nama icon yang tersedia. */
export type IconName = keyof typeof iconPaths;

/** Type guard — runtime check apakah string adalah icon name yang valid. */
export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(iconPaths, name);
}
