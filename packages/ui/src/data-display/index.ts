/**
 * Data-display module — komponen presentasi data list/tabel/grid.
 *
 * - DatasetCard: row/tile dataset
 * - FilterChip: pill filter aktif
 * - Pagination: page navigator
 * - EmptyState: placeholder no-data / no-results / error
 * - AttributeTable: schema/columns table (Phase 8.8)
 * - CodeBlock: code snippet dengan copy button (Phase 8.8)
 * - StatCard: metric tile compact (Phase 8.8)
 */
export {
  DatasetCard,
  type DatasetCardProps,
  type DatasetCardData,
  type DatasetCardVariant,
  type DatasetKind,
  type DatasetStatus,
} from './DatasetCard';

export {
  FilterChip,
  type FilterChipProps,
  type FilterChipTone,
} from './FilterChip';

export {
  Pagination,
  type PaginationProps,
} from './Pagination';

export {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
  type EmptyStateAction,
} from './EmptyState';

export {
  AttributeTable,
  type AttributeTableProps,
  type AttributeRow,
  type AttributeFieldType,
} from './AttributeTable';

export {
  CodeBlock,
  type CodeBlockProps,
  type CodeLanguage,
} from './CodeBlock';

export {
  StatCard,
  type StatCardProps,
  type StatCardTone,
  type StatCardSize,
} from './StatCard';
