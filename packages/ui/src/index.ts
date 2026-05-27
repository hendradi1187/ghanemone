/**
 * @ghanem/ui — Shared component library untuk Ghanem.one.
 *
 * Public API barrel. Tambahkan komponen baru via re-export di sini (don't
 * import dari deep paths di consumer apps — keep boundary clean).
 *
 * Status (Phase 8.3):
 *   - DONE: Icon (+ 41 lucide-style paths), Page, Stack, Card, Container, Divider,
 *           TopNav, Sidebar, token re-exports.
 *   - DONE (this batch): Form (RHF + Zod), Overlay (Radix), Feedback (Sonner toast).
 *   - DEFERRED (Phase 8.4+): HfMap (Leaflet wrapper), DatePicker, FileUpload/DropZone,
 *           ComboBox/MultiSelect, Charts (Recharts: Sparkline/BarChart/DonutChart),
 *           Seismic 3D viewer (Three.js).
 *   - DEFERRED (Phase 8.5 / Task #16): Bug fixes pada PageMap, dst.
 */

// ── Primitives ────────────────────────────────────────────────────────
export {
  Stack,
  type StackProps,
  type StackGap,
  Card,
  type CardProps,
  Container,
  type ContainerProps,
  Page,
  type PageProps,
  Divider,
  type DividerProps,
} from './primitives';

// ── Icon ──────────────────────────────────────────────────────────────
export {
  Icon,
  type IconProps,
  iconMap,
  iconPaths,
  isIconName,
  type IconName,
} from './icon';

// ── Nav ───────────────────────────────────────────────────────────────
export {
  TopNav,
  type TopNavProps,
  type TopNavLink,
  type TopNavUser,
  type TopNavBrand,
  Sidebar,
  type SidebarProps,
  type SidebarSection,
  type SidebarBrowseItem,
  type SidebarCategoryItem,
  type SidebarProviderItem,
} from './nav';

// ── Form (RHF + Zod + Radix Checkbox/Radio/Select) ────────────────────
export * from './form';

// ── Overlay (Radix Dialog/Popover/DropdownMenu/Tooltip) ───────────────
export * from './overlay';

// ── Feedback (Sonner toasts) ──────────────────────────────────────────
export * from './feedback';

// ── Data-display (cards, chips, pagination, empty-state, schema table, code block, stat card) ─────────────
export * from './data-display';

// ── Navigation (Tabs) ────────────────────────────────────────────────
export * from './navigation';

// ── Charts (Recharts: Line/Bar/Pie/Donut) ─────────────────────────────
export * from './charts';

// ── Map (react-leaflet wrapper) ───────────────────────────────────────
export * from './map';

// ── Tokens (runtime JS access — prefer Tailwind classes when possible) ──
export {
  colorTokens,
  spacingTokens,
  radiusTokens,
  motionTokens,
  fontFamilyTokens,
} from './tokens';

// ── Shared types ──────────────────────────────────────────────────────
export type { Size, Variant, ToneColor, AsElement } from './types';
