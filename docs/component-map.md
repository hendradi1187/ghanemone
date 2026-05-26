# Component Map — Ghanem.one

Inventaris komponen dari prototype + hi-fi, props yang dipakai, dan rekomendasi
struktur folder saat porting ke TypeScript. Setiap entri mencantumkan
`file:line` agar mudah cross-check.

> **Scope:** Hanya komponen yang **akan dipakai** di production. Hi-Fi-only
> design-canvas chrome (Browser Window, Tweaks Panel) dikecualikan — itu hanya
> untuk demo screenshot di HTML.

---

## 1. Folder structure rekomendasi (Phase 7)

```
apps/web/src/
├── components/                 Cross-feature UI (shared globally)
│   ├── nav/
│   │   ├── TopNav.tsx          ← prototype-app.jsx IxTopNav (interactive)
│   │   └── Sidebar.tsx         ← prototype-app.jsx IxSidebar
│   ├── icons/
│   │   ├── Icon.tsx            ← hifi-components.jsx Icon (24 lucide-style)
│   │   └── icon-paths.ts       ← __ICON_PATHS dict
│   ├── feedback/
│   │   ├── Toast.tsx           ← prototype-app.jsx ToastStack
│   │   ├── EmptyState.tsx      ← prototype-states.jsx EmptyState
│   │   ├── ErrorState.tsx      ← prototype-states.jsx ErrorState
│   │   ├── Skeleton.tsx        ← prototype-states.jsx Skeleton primitives
│   │   └── ErrorBoundary.tsx   ← NEW: missing in prototype, required for prod
│   └── layout/
│       ├── Page.tsx            ← hifi-components.jsx HfPage (.hf wrapper)
│       └── Breadcrumb.tsx      ← inline in prototype-app.jsx PageDetail
├── features/
│   ├── datasets/
│   │   ├── DatasetCard.tsx     ← prototype-app.jsx DsRowInteractive (interactive)
│   │   ├── DatasetCardStatic.tsx ← hifi-components.jsx HfDatasetCard (non-interactive)
│   │   ├── DatasetDetail.tsx   ← prototype-app.jsx PageDetail
│   │   ├── DetailTabs.tsx      ← prototype-app.jsx tabs (Overview/Attrs/Quality/Lineage/API)
│   │   ├── QualityBar.tsx      ← inline in PageDetail
│   │   ├── LineageStepper.tsx  ← inline in PageDetail
│   │   └── hooks.ts            ← useDatasets(), useDataset(id), useStarMutation()
│   ├── map/
│   │   ├── RealMap.tsx         ← prototype-realmap.jsx RealMap
│   │   ├── LayerToggle.tsx     ← hifi-pages-2.jsx LayerToggle
│   │   ├── LayerPanel.tsx      ← composed (Layers panel from PageMap)
│   │   ├── BlockInfoCard.tsx   ← hifi-pages-2.jsx BlockInfoCard
│   │   └── lib/
│   │       └── leaflet-helpers.ts
│   ├── seismic/
│   │   ├── SeismicCrossSection.tsx  ← hifi-pages-2.jsx SeismicCrossSection
│   │   └── WellDetailsPanel.tsx     ← hifi-pages-2.jsx WellDetailsPanel
│   ├── ai-chat/
│   │   └── AiAssistant.tsx     ← prototype-app.jsx AiAssistant (pill→open)
│   ├── search/
│   │   └── TopSearch.tsx       ← inline in IxTopNav (debounced + dropdown)
│   ├── monitoring/
│   │   ├── PipelineTable.tsx
│   │   └── AlertList.tsx
│   ├── workspace/
│   │   ├── ProjectList.tsx
│   │   ├── KanbanBoard.tsx
│   │   └── KanbanCard.tsx
│   ├── apps/
│   │   └── AppCard.tsx
│   ├── compliance/
│   │   ├── ApprovalQueue.tsx
│   │   ├── AuditTrail.tsx
│   │   └── ComplianceKpis.tsx
│   └── upload/
│       ├── UploadWizard.tsx
│       ├── DropZone.tsx
│       ├── FileList.tsx
│       └── Stepper.tsx
├── pages/                       Route-level pages
│   ├── ExplorePage.tsx          ← PageExplore
│   ├── DetailPage.tsx           ← PageDetail
│   ├── MapPage.tsx              ← PageMap
│   ├── DashboardPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── WorkspacePage.tsx
│   ├── AppsPage.tsx
│   ├── MonitoringPage.tsx
│   ├── UploadPage.tsx
│   ├── CompliancePage.tsx
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
└── primitives/                  Charts & micro-components
    ├── Sparkline.tsx            ← hifi-components.jsx HfSpark
    ├── BarChart.tsx             ← hifi-components.jsx HfBars
    ├── DonutChart.tsx           ← hifi-components.jsx HfDonut
    ├── Kpi.tsx                  ← hifi-components.jsx HfKpi
    ├── Pill.tsx                 ← (new) wrap .pill class variants
    └── Button.tsx               ← (new) wrap .btn class variants
```

---

## 2. Component inventory (alphabetized)

### `<AiAssistant>`

- **Source:** `prototype-app.jsx:1057-1200`
- **Purpose:** Floating AI chat — pill state collapses to small badge, open state shows full chat with suggestions, input, and Claude-backed answers.
- **Props:**
  | Name | Type | Default | Notes |
  |---|---|---|---|
  | `context` | `{ page: string; datasetId?: string } \| null` | `null` | Disuntik ke prompt; juga mengubah suggestions |
- **Internal state:** `state` (`'pill' \| 'open'`), `messages[]`, `input`, `busy`.
- **Dependencies:** `<Icon>`, `window.claude.complete` (replace with `POST /api/v1/ai/ask` in prod — lihat api-contract.md §9).
- **A11y:** Send button disabled saat `busy`; messages region scrollable; tidak ada `aria-live` di prototype — **tambahkan saat port**.

### `<AppRouter>`

- **Source:** `prototype-app.jsx:1228-1250`
- **Purpose:** Top-level router. Switch on `page.name` (string) — hand-rolled.
- **Port:** Replace dengan **TanStack Router** atau React Router v6. Mapping:
  | `page.name` | Route path |
  |---|---|
  | `explore` | `/` (default) atau `/explore` |
  | `detail` | `/datasets/:id` |
  | `map` | `/map` |
  | `dashboard` | `/dashboard` |
  | `analytics` | `/analytics` |
  | `workspace` | `/workspace` |
  | `apps` | `/apps` |
  | `monitoring` | `/monitoring` |

### `<BlockInfoCard>`

- **Source:** `hifi-pages-2.jsx:236-280`
- **Purpose:** Floating right-side card di Map view — shows currently-selected WK detail (title, provider, area, KPI tiles, action buttons).
- **Props:** None saat ini (data hardcoded). **Port:** prop `dataset: Dataset` + `onClose: () => void`.

### `<DatasetCardSkeleton>`

- **Source:** `prototype-states.jsx:15-40`
- **Purpose:** Loading placeholder matching `<DsRowInteractive>` shape. Used by Explore page list saat filtering.
- **Props:** none.
- **Used in:** `prototype-app.jsx:503` (`isLoading` branch).

### `<DsRowInteractive>` (interactive Dataset card)

- **Source:** `prototype-app.jsx:578-653`
- **Purpose:** List item di Explore. Click → select (preview panel), click "Open details" icon → navigate, click "Add" → addToMap. Toggle "On Map" state.
- **Props:**
  | Name | Type | Required | Notes |
  |---|---|---|---|
  | `d` | `Dataset` | yes | Full dataset shape from CATALOG |
  | `selected` | boolean | yes | Highlights card |
  | `onSelect` | `() => void` | yes | Set parent's selected id |
  | `onOpen` | `() => void` | yes | Navigate to detail |
  | `onAddToMap` | `() => void` | yes | Add to mapLayers |
- **Variant:** Static version exists at `hifi-components.jsx:495-531` (`HfDatasetCard`); keep both but unify props in port.

### `<EmptyState>`

- **Source:** `prototype-states.jsx:66-109`
- **Purpose:** Reusable empty/error/success UI dengan icon, title, description, optional CTA + secondary action.
- **Props:**
  | Name | Type | Default | Notes |
  |---|---|---|---|
  | `icon` | string (icon name) | `'search'` | Reference to Icon.tsx |
  | `title` | string | required | |
  | `description` | string \| ReactNode | optional | |
  | `action` | `{ label, icon?, onClick }` | optional | Primary CTA |
  | `secondaryAction` | `{ label, onClick }` | optional | |
  | `tone` | `'default' \| 'error' \| 'success'` | `'default'` | Controls colors |
- **A11y:** `role="status"` (default) or `role="alert"` (error).

### `<ErrorState>`

- **Source:** `prototype-states.jsx:112-119`
- **Purpose:** Specialized error EmptyState. Wraps `<EmptyState tone="error" icon="warn">` with retry button.
- **Props:** `message?: string`, `onRetry?: () => void`.

### `<HfDonut>` → `<DonutChart>`

- **Source:** `hifi-components.jsx:603-626`
- **Props:**
  | Name | Type | Default |
  |---|---|---|
  | `data` | `Array<[label: string, value: number, colorToken: string]>` | sample |
  | `size` | number | 120 |
  | `thickness` | number | 18 |
- **Used in:** Dashboard composition donut (`hifi-pages.jsx:91`), Design System showcase.

### `<HfBars>` → `<BarChart>`

- **Source:** `hifi-components.jsx:588-601`
- **Props:** `data: number[]`, `color: string`, `height: number`.
- **Used in:** Design System; ad-hoc analytics.

### `<HfKpi>` → `<Kpi>`

- **Source:** `hifi-components.jsx:536-563`
- **Props:**
  | Name | Type | Notes |
  |---|---|---|
  | `label` | string | "Total Datasets" |
  | `value` | string | "2,452" (formatted) |
  | `delta` | string | "+128", "+12.3%" |
  | `dir` | `'up' \| 'down'` | Arrow direction |
  | `sub` | string | "30d", "MoM", "SLA 99%" |
  | `icon` | string | Icon name |
  | `color` | string | Token, e.g. `'var(--hf-blue-500)'` |

### `<HfMap>`

- **Source:** `hifi-components.jsx:294-434`
- **Purpose:** Static Leaflet map yang me-render hardcoded `HF_MAP_LAYERS` collection. Tujuan: artboard hi-fi populated.
- **Props:** `withPins`, `withCoords`, `withLegend`, `showAllLayers`, `fitTo`, `children`.
- **Port note:** Untuk production, **merge** dengan `<RealMap>` (interactive). HfMap exists murni untuk static hi-fi rendering — discard di Phase 8.

### `<HfPage>` → `<Page>`

- **Source:** `hifi-components.jsx:66-72`
- **Purpose:** Page root yang apply `.hf` className (token scope).
- **Props:** `children`, `screenLabel` (data attribute, hi-fi only).

### `<HfSidebar>` (static) / `<IxSidebar>` (interactive)

- **Source:** `hifi-components.jsx:130-196` (static), `prototype-app.jsx:326-390` (interactive)
- **Purpose:** Left sidebar di Explore — Browse categories, Categories filter (multi-select), Data provider list.
- **Props (interactive):** reads `filters`, `setFilters` from `useApp()` context.
- **Port:** unify ke `<Sidebar>` dengan props:
  ```ts
  interface SidebarProps {
    browse: BrowseItem[];
    categories: Category[];
    providers: Provider[];
    selectedThemes: Set<string>;
    onToggleTheme: (id: string) => void;
  }
  ```

### `<HfSpark>` → `<Sparkline>`

- **Source:** `hifi-components.jsx:568-587`
- **Props:** `data: number[]`, `color: string`, `height: number`, `fill: boolean`.
- **Style:** SVG; last point gets circle marker.

### `<HfTopNav>` (static) / `<IxTopNav>` (interactive)

- **Source:** `hifi-components.jsx:77-125` (static), `prototype-app.jsx:225-321` (interactive)
- **Purpose:** Brand + search + 7 nav links + help/notifications + user avatar.
- **Props (interactive):** reads `page`, `navigate` from `useApp()`.
- **Port:**
  ```ts
  interface TopNavProps {
    activeRoute: string;
    onNavigate: (route: string) => void;
    user: { initials: string; org: string; role: string };
    notifications: { count: number };
  }
  ```
- **Nav links** (`prototype-app.jsx:230-238`):
  `EXPLORE DATA, MAP, DASHBOARD, ANALYTICS, WORKSPACE, APPS, MONITORING`

### `<Icon>`

- **Source:** `hifi-components.jsx:8-61`
- **Purpose:** Lucide-style stroked SVG icon. 24 icons defined as path strings in `__ICON_PATHS`.
- **Props:**
  | Name | Type | Default |
  |---|---|---|
  | `name` | string (one of 24) | required |
  | `size` | number | 16 |
  | `color` | string | `'currentColor'` |
  | `style` | CSSProperties | undefined |
  | `strokeWidth` | number | 1.7 |
- **Icon names available (41 total):** `search, bell, help, chevron, chevR, chevL, plus, download, upload, filter, layers, pin, database, map, chart, pieChart, activity, shield, bolt, globe, user, doc, grid, list, star, eye, check, warn, x, arrowUp, arrowDown, arrowR, spark, refresh, settings, more, sparkle, clock, share, comment, arrowUpRight`.
- **Port:** Move to `components/icons/`. Generate TS type `IconName = keyof typeof iconPaths` for autocomplete safety.

### `<LayerToggle>`

- **Source:** `hifi-pages-2.jsx:210-233`
- **Purpose:** Checkbox-like layer toggle row di Map layers panel. Shows color swatch, label, opacity bar, count.
- **Props:** `k`, `label`, `color`, `count`, `on`, `onToggle`.

### `<PageDetail>`

- **Source:** `prototype-app.jsx:658-854`
- **Purpose:** Dataset detail page — breadcrumb, map preview, info panel with 5 tabs.
- **Internal state:** `tab` (one of `'overview' \| 'attrs' \| 'quality' \| 'lineage' \| 'api'`).
- **Reads from context:** `page.params.id`, `addToMap`, `mapLayers`, `navigate`.

### `<PageExplore>`

- **Source:** `prototype-app.jsx:395-575`
- **Purpose:** Main Explore page — sidebar + list + map + preview panel.
- **Internal state:** `localQ` (search), `selectedId` (preview), `isLoading` (filter latency demo — remove or replace with React Query loading state).

### `<PageMap>`

- **Source:** `prototype-app.jsx:859-1052`
- **Purpose:** Full-bleed Leaflet map dengan layer panel, search, view toggle (2D/3D/Split), AI assistant.
- **Bug to fix:** `seismicOn`, `showHorizons`, `showFaults`, `setShowHorizons`, `setShowFaults` direference tapi tidak dideklarasi. Saat port, declare:
  ```tsx
  const [seismicOn, setSeismicOn] = useState(false);
  const [showHorizons, setShowHorizons] = useState(true);
  const [showFaults, setShowFaults] = useState(true);
  ```

### `<PageStub>`

- **Source:** `prototype-app.jsx:1205-1223`
- **Purpose:** Placeholder untuk pages yang belum di-prototype interaktif (dashboard, analytics, workspace, apps, monitoring). Discard saat port — pages dibuild proper di Phase 8.

### `<RealMap>`

- **Source:** `prototype-realmap.jsx:82-224`
- **Purpose:** Interactive Leaflet map. Mounts once, updates layers when `activeLayers` prop changes, fits to highlight.
- **Props:**
  | Name | Type | Default |
  |---|---|---|
  | `activeLayers` | `string[]` | required (dataset ids) |
  | `onSelect` | `(id: string) => void` | optional |
  | `highlightId` | string | undefined |
  | `fullscreen` | boolean | false |
  | `showCoords` | boolean | true |
- **Side effects:** Mounts Leaflet map instance, attaches `ResizeObserver` for invalidateSize on parent resize.

### `<SeismicCrossSection>`

- **Source:** `hifi-pages-2.jsx:399-585`
- **Purpose:** Bottom-drawer 3D seismic cross-section view (SVG-rendered procedural waves + horizons + faults + wells).
- **Props:** `showHorizons`, `showFaults`.
- **Port:** Replace SVG generator dengan canvas/WebGL render driven by `/seismic/:id/cross-section` data (lihat api-contract.md §10).

### `<Skeleton>`

- **Source:** `prototype-states.jsx:7-12`
- **Props:** `width`, `height`, `radius`, `style`. CSS class `.skeleton` provides shimmer animation.

### `<ToastStack>`

- **Source:** `prototype-app.jsx:200-220`
- **Purpose:** Bottom-center toast queue. Reads `toasts[]` from AppCtx; renders fade-in/out chips.
- **Port:** Replace dengan **Sonner** (lib) atau keep custom. If keep, add `role="status"` `aria-live="polite"`.

### `<WellDetailsPanel>`

- **Source:** `hifi-pages-2.jsx:283-394`
- **Purpose:** Right-docking panel saat seismic mode aktif — shows well attributes table, seismic info, amplitude legend, horizon depth table.
- **Props:** `onClose: () => void`. **Port:** Add `well: Well` prop instead of hardcoded data.

---

## 3. Page → Components dependency tree

```
ExplorePage (PageExplore)
├── IxTopNav
│   ├── Icon × N
│   └── (inline) TopSearch dropdown
├── IxSidebar
│   └── Icon × N
├── DatasetCard list
│   └── DsRowInteractive × N
│       ├── Icon × N
│       └── (state) On Map indicator
├── DatasetCardSkeleton × 3   (loading)
├── EmptyState                (no results)
├── RealMap
│   └── Leaflet (external)
├── AiAssistant
│   └── Icon × N
└── Preview pane (inline, no extracted component yet — recommend `<DatasetPreview>`)

DetailPage (PageDetail)
├── (inline Breadcrumb)
├── RealMap (with highlightId)
├── AiAssistant (with context)
└── Detail panel (inline)
    ├── Hero section
    ├── Tabs (5)
    │   ├── Overview: tags + QualityBar list
    │   ├── Attrs: full attributes table
    │   ├── Quality: progress bars
    │   ├── Lineage: 4-step horizontal flow
    │   └── API: REST snippet + copy button

MapPage (PageMap)
├── RealMap (fullscreen)
├── LayerPanel
│   └── LayerToggle × N
├── (top-center) View toggle 2D/3D/Split
├── (top-center search)
├── BlockInfoCard (when !seismicOn)
├── AiAssistant (when !seismicOn)
├── SeismicCrossSection (when seismicOn)
└── WellDetailsPanel (when seismicOn)

CompliancePage (HfCompliance)
├── HfTopNav (user role=Compliance Officer)
├── (header + period filters)
├── ComplianceKpis (5 HfKpi tiles)
├── ApprovalQueue
│   └── (table rows with approve/review/reject buttons)
├── ComplianceByKkks
└── AuditTrail

UploadPage (HfUpload)
├── HfTopNav (user role=Data Operator)
├── (breadcrumb)
├── Stepper (6 steps)
├── DropZone
├── FileList (upload progress per file)
└── Guidelines sidebar

WorkspacePage (HfWorkspace)
├── HfTopNav
├── ProjectsSidebar
└── KanbanBoard
    └── KanbanCard × N (per status column)

AppsPage (HfApps)
├── HfTopNav
├── (hero + filter chips)
├── FeaturedApps (1 hero card + 1 side card)
└── AppGrid
    └── AppCard × N

MonitoringPage (HfMonitoring)
├── HfTopNav
├── MonitoringKpis (5 HfKpi)
├── PipelineTable
└── AlertList

DashboardPage (HfDashboard)
├── HfTopNav
├── DashboardKpis (4 HfKpi)
├── DataActivityChart (HfSpark + legend)
├── DataCompositionDonut (HfDonut + legend)
├── TopProviders (bar chart list)
├── ActivityFeed
└── HealthOverview (system status list)
```

---

## 4. Props derived from data shapes (TypeScript)

```ts
// Should live in packages/types/src/index.ts

export type DatasetKind = 'LAYER' | 'VOLUME' | 'DOC';
export type DatasetTheme = 'admin' | 'well' | 'seismic' | 'pipe' | 'facility' | 'doc';
export type Sensitivity = 'public' | 'internal' | 'confidential';
export type UserRole = 'regulator' | 'compliance_officer' | 'kkks_operator' | 'public_analyst';

export interface Provider {
  id: string;
  name: string;
  initials: string;            // 2-3 char
  datasetCount: number;
  weight?: number;             // 0-100 for bar fill
  colorToken?: string;
}

export interface DatasetAttribute { key: string; value: string }
export interface QualityScore { label: string; score: number /* 0-100 */ }

export interface Dataset {
  id: string;
  title: string;
  kind: DatasetKind;
  type: string;                // free-text: 'Administrative', 'Seismic', ...
  format: string;              // 'Vector · SHP, GeoJSON'
  theme: DatasetTheme;
  description: string;
  provider: Provider;
  verified: boolean;
  stats: { downloads: number; views: number; stars: number };
  attributes: DatasetAttribute[];
  quality: QualityScore[];
  crs: string;                 // 'EPSG:4326'
  bbox?: [number, number, number, number];
  sensitivity: Sensitivity;
  license?: string;
  createdAt: string;
  updatedAt: string;
  lastValidatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  orgId: string;
  org: string;                 // display name
  role: UserRole;
}

export interface ToastMessage {
  id: string;
  msg: string;
  kind: 'ok' | 'warn' | 'err';
}

export interface AppContextValue {
  page: { name: string; params: Record<string, unknown> };
  navigate: (name: string, params?: Record<string, unknown>) => void;
  mapLayers: Set<string>;      // dataset ids currently on map
  addToMap: (id: string) => void;
  toggleLayer: (id: string) => void;
  toasts: ToastMessage[];
  filters: { themes: Set<string>; q: string };
  setFilters: (updater: (f: Filters) => Filters) => void;
  catalog: Dataset[];          // served by TanStack Query in prod
}
```

---

## 5. Component-level a11y checklist

Saat porting, **wajib** preserve atau improve:

| Component | A11y requirement | Source |
|---|---|---|
| `IxTopNav` nav links | `aria-current="page"` saat active; keyboard nav (Enter/Space) | `prototype-app.jsx:299-301` |
| `IxTopNav` icon buttons | `aria-label`, `title` | `prototype-app.jsx:306-309` |
| `IxTopNav` notification dot | wrap in `aria-hidden="true"` | `prototype-app.jsx:309` |
| Loading list | `aria-busy="true"` + `aria-live="polite"` | `prototype-app.jsx:502` |
| List of datasets | `role="list" aria-label` | `prototype-app.jsx:512` |
| EmptyState (error tone) | `role="alert"` | `prototype-states.jsx:74` |
| EmptyState (default/success) | `role="status"` | `prototype-states.jsx:74` |
| Skeleton | `aria-hidden="true"` | `prototype-states.jsx:9` |
| Modal/dialog (future) | focus trap, ESC closes, `role="dialog"` `aria-modal="true"` | (none in prototype) |
| Map layer toggle | use `<input type="checkbox">` or `role="checkbox"` + keyboard support | currently click-only |
| AI chat messages | `aria-live="polite"` on messages region | **NEW: missing** |
| Toast | `role="status"` `aria-live="polite"` | **NEW: missing** |

---

## 6. Component coverage matrix (UI page → required components)

| Page | Required components | Status di prototype |
|---|---|---|
| Explore | TopNav, Sidebar, DatasetCard, DatasetCardSkeleton, EmptyState, RealMap, AiAssistant, DatasetPreview | All present except DatasetPreview (inline) |
| Detail | TopNav, Breadcrumb, RealMap, AiAssistant, DetailTabs, QualityBar, LineageStepper, Pill | All present |
| Map | TopNav, RealMap, LayerPanel, LayerToggle, BlockInfoCard, ViewToggle, AiAssistant, SeismicCrossSection, WellDetailsPanel | Present (with bugs — lihat README §9) |
| Dashboard | TopNav, Kpi, Sparkline, DonutChart, ActivityFeed, HealthList | Static only (hifi-pages.jsx HfDashboard) |
| Analytics | TopNav, ChartCanvas, FieldList, BarChart, Sparkline | Static only |
| Workspace | TopNav, ProjectsSidebar, KanbanBoard, KanbanCard, AvatarStack | Static only |
| Apps | TopNav, AppCard, FeaturedAppHero, FilterChip | Static only |
| Monitoring | TopNav, Kpi, PipelineTable, AlertList, StatusPill | Static only |
| Upload | TopNav, Stepper, DropZone, FileList, GuidelinesAside | Static only |
| Compliance | TopNav, Kpi, ApprovalQueueTable, ComplianceByKkks, AuditTrail | Static only |
| Login | Logo, ButtonList, FormField, Checkbox, Button | Static only |
| 404 | Logo (no nav), Illustration, ButtonRow, RelatedDatasetCards | Static only |

**Implication:** Phase 8 frontend work is roughly **40% extracting existing components into proper TS modules** (Explore + Detail + Map sudah interaktif), and **60% net-new build** untuk pages yang baru ada hi-fi.
