/**
 * icon-map.ts — mapping nama icon lama (IconName) ke komponen Lucide React.
 *
 * Pendekatan: pertahankan API string-name yang sudah dipakai di seluruh codebase
 * (nama lama tetap valid), tapi rendering sekarang via Lucide React components
 * sehingga path-nya benar dan maintainability meningkat.
 *
 * Lucide icons dipilih berdasarkan visual equivalence dengan path SVG lama
 * dan konteks geospatial / migas platform.
 *
 * Sumber: https://lucide.dev/icons/
 */
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  Bolt,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Globe2,
  Grid2x2,
  HelpCircle,
  Layers,
  List,
  Map,
  MessageCircle,
  MoreHorizontal,
  PieChart,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
  Upload,
  UserCircle2,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Tipe generik untuk komponen Lucide.
 * Setiap value di iconMap adalah LucideIcon component class.
 */
export const iconMap = {
  // Aksi umum
  search: Search,
  bell: Bell,
  help: HelpCircle,
  plus: Plus,
  download: Download,
  upload: Upload,
  filter: Filter,
  refresh: RefreshCw,
  settings: Settings,
  share: Share2,
  x: X,
  check: Check,
  eye: Eye,
  star: Star,
  comment: MessageCircle,
  more: MoreHorizontal,

  // Navigation / chevron
  chevron: ChevronDown,
  chevR: ChevronRight,
  chevL: ChevronLeft,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowR: ArrowRight,
  arrowUpRight: ArrowUpRight,

  // Domain / geospatial
  layers: Layers,
  pin: Pin,
  database: Database,
  map: Map,
  globe: Globe2,

  // Data viz
  chart: Activity,
  pieChart: PieChart,
  activity: Activity,
  grid: Grid2x2,
  list: List,

  // Document
  doc: FileText,

  // Status / system
  shield: ShieldCheck,
  bolt: Bolt,
  warn: TriangleAlert,
  clock: Clock,

  // User
  user: UserCircle2,

  // AI / Sparkle
  spark: Sparkles,
  sparkle: Sparkles,

  // Misc
  zap: Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

/** Type guard — runtime check apakah string adalah icon name yang valid. */
export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(iconMap, name);
}
