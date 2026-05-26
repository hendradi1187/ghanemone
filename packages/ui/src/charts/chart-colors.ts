/**
 * Chart color palette — token-driven, dipakai oleh LineChart/BarChart/PieChart/DonutChart.
 *
 * Diambil langsung dari brand palette di `tokens/index.ts` supaya konsisten dengan
 * Tailwind classes di komponen lain. Hindari hex baru — kalau perlu warna lain,
 * tambahkan dulu di tokens.
 */
import { colorTokens } from '../tokens';

/** Primary line/bar color — brand green. */
export const CHART_PRIMARY = colorTokens.green[500];

/** Sekunder — blue prussian. */
export const CHART_SECONDARY = colorTokens.blue[500];

/**
 * 6-warna palette untuk slice pie/donut (deterministic order).
 * Disusun supaya kontras baik di canvas warm-parchment.
 */
export const CHART_PALETTE: readonly string[] = [
  colorTokens.green[500],
  colorTokens.blue[500],
  colorTokens.amber[500],
  colorTokens.red[500],
  colorTokens.purple[500],
  colorTokens.green[400],
  colorTokens.blue[300],
  colorTokens.amber[700],
];

/** Warna grid + axis text — netral, low-emphasis. */
export const CHART_GRID = colorTokens.line.DEFAULT;
export const CHART_AXIS = colorTokens.ink[4];
export const CHART_INK = colorTokens.ink.DEFAULT;
export const CHART_SURFACE = colorTokens.surface.DEFAULT;

/** Style umum untuk tooltip Recharts (brand-konsisten). */
export const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: colorTokens.surface.DEFAULT,
  border: `1px solid ${colorTokens.line.DEFAULT}`,
  borderRadius: 8,
  fontSize: 12,
  padding: '8px 10px',
  boxShadow: '0 4px 14px rgba(14,23,38,.08)',
  color: colorTokens.ink.DEFAULT,
} as const;

export const TOOLTIP_LABEL_STYLE = {
  color: colorTokens.ink[3],
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 4,
} as const;

export const TOOLTIP_ITEM_STYLE = {
  color: colorTokens.ink.DEFAULT,
  fontSize: 12,
  padding: '1px 0',
} as const;
