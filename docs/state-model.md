# State Model — Ghanem.one

Bagaimana state mengalir di prototype, mutation patterns, side effects, dan
strategi porting ke production stack (TanStack Query + Zustand).

Sumber tunggal: `prototype-app.jsx:152-220` (`AppCtx`, `AppProvider`, `useApp`,
`ToastStack`). Cross-page state lainnya **local** ke component (`React.useState`).

---

## 1. AppCtx shape (prototype)

Dari `prototype-app.jsx:158-197`:

```js
{
  // Router state
  page: { name: 'explore' | 'detail' | 'map' | 'dashboard' | 'analytics'
               | 'workspace' | 'apps' | 'monitoring', params: { id?: string } },
  navigate: (name, params = {}) => void,

  // Map layers — Set of dataset ids currently rendered on map
  mapLayers: Set<string>,           // default: new Set(['wk-onwj'])
  addToMap: (id: string) => void,   // also emits toast
  toggleLayer: (id: string) => void,

  // Toast queue
  toasts: Array<{ id, msg, kind }>, // auto-dismiss after 3.2s

  // Filters — themes Set + free-text query, shared between Sidebar & Explore
  filters: { themes: Set<string>, q: string },
  setFilters: (updater) => void,

  // Catalog — static array shared between Explore, Detail, Map
  catalog: Dataset[],               // hardcoded CATALOG; replace with server data
}
```

### State origins

```js
const [page, setPage]                   = useState({ name: 'explore', params: {} });
const [mapLayers, setMapLayers]         = useState(new Set(['wk-onwj']));
const [toasts, setToasts]               = useState([]);
const [savedFilters, setSavedFilters]   = useState({ themes: new Set(), q: '' });
```

`catalog` is the hoisted constant `CATALOG` (no state) — passed via context for
ease of access.

---

## 2. Mutation matrix

| Action | Trigger | Mutator | Side effects |
|---|---|---|---|
| Navigate to page | TopNav click / link / programmatic | `navigate(name, params)` (`prototype-app.jsx:164`) | None |
| Open dataset detail | Click "Open details" in DatasetCard / search result | `navigate('detail', { id })` | None |
| Toggle theme filter | Click in Sidebar | `setFilters(f => { … themes.toggle(k) })` (`prototype-app.jsx:357-361`) | Triggers re-filter; PageExplore re-runs `useEffect` and shows skeleton 350ms |
| Set search query | Type in Explore search field | `setLocalQ(value)` (local) → `useEffect` syncs to `filters.q` (`prototype-app.jsx:401`) | Triggers re-filter + skeleton 350ms |
| Add dataset to map | Click "+ Add" button | `addToMap(id)` (`prototype-app.jsx:174-178`) | 1. `setMapLayers(s.add(id))` 2. `toast('✓ "title" ditambahkan ke peta')` |
| Toggle layer on/off | Click checkbox in Map layer panel | `toggleLayer(id)` (`prototype-app.jsx:180-186`) | None (no toast) |
| Show toast | Any code | `toast(msg, kind)` (`prototype-app.jsx:168-172`) | 1. Push to array 2. Schedule removal after 3200 ms |
| Change tab in Detail | Click tab | `setTab(k)` (local in PageDetail) | None |
| Open/close AI panel | Click pill or X | `setState('open' \| 'pill')` (local) | None |
| Send AI message | Press Enter / click send | `ask(input)` (`prototype-app.jsx:1072-1090`) | 1. Push user msg 2. `setBusy(true)` 3. await `claude.complete` 4. Push reply 5. `setBusy(false)` |

---

## 3. Side-effect catalog (`React.useEffect`)

| Effect | Component | Triggers on | Purpose |
|---|---|---|---|
| Sync localQ → filters.q | `PageExplore` | `[localQ]` | Debounced parent-state propagation |
| Skeleton timer | `PageExplore` | `[filters.themes.size, localQ]` | Set `isLoading=true`, clear after 350ms — demo only |
| Auto-dismiss toast | `AppProvider.toast` callback | (setTimeout, not effect) | Remove toast after 3200ms |
| Scroll AI chat to bottom | `AiAssistant` | `[messages, busy]` | `scrollTop = scrollHeight` |
| Mount Leaflet map | `RealMap` | mount once | Create L.map instance, attach Carto tiles |
| Update Leaflet layers | `RealMap` | `[activeLayers.join('|'), highlightId, onSelect]` | clearLayers + re-add from REAL_LAYERS |
| ResizeObserver invalidateSize | `RealMap`, `HfMap` | mount | Refresh Leaflet sizing on container resize |

### Effect cleanup hygiene

- `PageExplore` skeleton timer cleans up via `clearTimeout`.
- `RealMap` cleans up via `map.remove()` on unmount.
- `RealMap` ResizeObserver cleans up via `ro.disconnect()`.
- `AppProvider.toast` setTimeout — **not cleaned up** on unmount; toasts on unmounted provider will fire `setToasts`. **Fix at port**: keep ref to timer ids, clear on unmount.

---

## 4. State sharing across pages (prototype → production)

The prototype's AppCtx is **all-in-one** — convenient for ~1k LOC, but in
production we split into 2 layers:

### Layer 1: Server state → TanStack Query

| Key | Query | Replaces in prototype |
|---|---|---|
| `['datasets', filters]` | `GET /datasets` | `CATALOG` filter logic (`prototype-app.jsx:411-415`) |
| `['datasets', id]` | `GET /datasets/:id` | `CATALOG.find(d => d.id === id)` (`prototype-app.jsx:660`) |
| `['providers']` | `GET /providers` | hardcoded sidebar list (`prototype-app.jsx:376-380`) |
| `['categories']` | `GET /categories` | hardcoded `THEMES` (`prototype-app.jsx:143-150`) |
| `['monitoring', 'pipelines']` | `GET /monitoring/pipelines` | hardcoded in hifi-pages.jsx |
| `['monitoring', 'alerts']` | `GET /monitoring/alerts` | hardcoded in hifi-pages.jsx |
| `['approvals', status]` | `GET /approvals?status=…` | hardcoded `queue` in hifi-auxiliary.jsx |
| `['workspace', 'projects']` | `GET /workspace/projects` | hardcoded in hifi-pages-2.jsx |

Mutation hooks:
- `useStarDataset()` → `POST /datasets/:id/star`
- `useDownloadDataset()` → `POST /datasets/:id/download`
- `useApproveSubmission()` → `POST /approvals/:id/approve`
- `useRejectSubmission()` → `POST /approvals/:id/reject`
- `useUploadDataset()` → multi-step (init → chunks → complete)

Cache invalidation: optimistic update for `star`/`addToMap`; full refetch for
approve/reject (refreshes queue + KPIs).

### Layer 2: Client state → Zustand

```ts
// apps/web/src/store/useAppStore.ts
interface AppStore {
  // Map layers (transient — survives nav but not page reload)
  mapLayers: Set<string>;
  addToMap: (id: string) => void;
  removeFromMap: (id: string) => void;
  toggleLayer: (id: string) => void;

  // Explore filters (persisted to URL searchParams via router sync)
  filters: { themes: Set<string>; q: string };
  setQuery: (q: string) => void;
  toggleTheme: (theme: string) => void;
  clearFilters: () => void;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (msg: string, kind?: ToastKind) => void;
  dismissToast: (id: string) => void;

  // Map view mode (Map page only — could move to URL state)
  mapView: '2d' | '3d' | 'split';
  setMapView: (v: '2d' | '3d' | 'split') => void;

  // Seismic sub-layer toggles
  showHorizons: boolean;
  showFaults: boolean;
  setShowHorizons: (b: boolean) => void;
  setShowFaults: (b: boolean) => void;
}
```

### Layer 3: Router state → TanStack Router / React Router

| Prototype | Production |
|---|---|
| `page: { name, params }` | URL path + searchParams |
| `navigate('detail', { id: 'x' })` | `router.navigate({ to: '/datasets/$id', params: { id: 'x' } })` |
| Sidebar filter state (themes) | Optionally synced to `?theme=…` searchParams |
| Search query `localQ` | `?q=…` searchParam |

URL state advantages:
- Shareable links ("kirim ke kolega").
- Browser back/forward works automatically.
- Page reload preserves filter state (currently lost in prototype).

---

## 5. Recommended store split rationale

Why **not** keep AppCtx as single store?

1. **Server data freshness**: TanStack Query auto-revalidates on tab focus, retries on network failure, dedupes concurrent requests. Doing this manually in AppCtx is error-prone.
2. **Pagination + caching**: TQ keeps multiple queries (`['datasets', filtersA]`, `['datasets', filtersB]`) in cache simultaneously — instant back/forward without refetch.
3. **Optimistic mutations**: TQ has first-class support; React Context requires you to roll your own.
4. **DevTools**: TQ Devtools + Zustand Devtools (Redux DevTools compat) make debugging server-vs-client state crystal clear.
5. **Bundle size**: Zustand 1.2 KB gz, TQ ~13 KB gz — cheaper than re-rendering entire context on every dataset mutation.

---

## 6. Toast lifecycle

```
toast(msg)
  ↓ id = randstr()
  ↓ setToasts(arr => [...arr, { id, msg, kind }])
  ↓ setTimeout(3200ms)
  ↓ setToasts(arr => arr.filter(t => t.id !== id))
```

**Issues at port time:**
- If toast is added when provider unmounts, the timer still fires `setState` on
  a dead component. Symptom: React warning. **Fix:** track timers in a ref or
  use `useEffect` for cleanup.
- No max queue size — spammy mutations could pile up. **Fix:** cap at 5, drop oldest.
- No `kind` color differentiation in current renderer — only `ok` toasts shown
  with dark background. **Fix:** add color variants for `warn`/`err`.

---

## 7. Race conditions to watch

| Scenario | Prototype behavior | Port behavior |
|---|---|---|
| Rapid filter changes | Skeleton timer races (each filter change triggers new setTimeout, old one not cancelled completely → flicker) | TQ key change auto-cancels stale fetches |
| AI chat: send while busy | `if (busy) return` guards (`prototype-app.jsx:1073`) | Same; use `disabled` on input + send button (already present at `:1189-1194`) |
| Add to map twice | Set dedupes; toast fires twice — confusing | Check `mapLayers.has(id)` before toast |
| Logout mid-query | N/A (no auth in prototype) | TQ should `invalidateQueries(['*'])` on logout |
| WS reconnect on Monitoring | N/A | Exponential backoff in `useMonitoringWs()` hook |

---

## 8. Persistence strategy (Phase 8)

| State slice | Persist? | Storage | Rationale |
|---|---|---|---|
| Map layers Set | sessionStorage | per-tab session | Survives nav within tab; cleared on close (avoids stale layer ids after data churn) |
| Filter themes + q | URL searchParams | URL | Shareable, history-friendly |
| Map view mode (2d/3d/split) | URL searchParams or sessionStorage | tab session | Per-session preference |
| Toast queue | (don't persist) | memory | Ephemeral by design |
| AI chat session | localStorage or backend | per-user, backend after Phase 9 | Long-running conversation context |
| AppCtx `page` | URL (router) | URL | Standard SPA behavior |
| Auth session (JWT cookie) | HttpOnly cookie | server-set | Lihat auth-flow.md |
| Recently viewed datasets | localStorage | per-user | "Continue browsing" hint at next visit |
| Saved filters/views | backend | DB (Phase 9 `user_saved_filters` table — not in prototype yet) | Per-user, cross-device |

---

## 9. Diagram — prototype data flow

```
                ┌─────────────────────────────────┐
                │   AppProvider (prototype-app)   │
                │  ┌──────────────────────────┐   │
                │  │  useState:               │   │
                │  │   page, mapLayers,       │   │
                │  │   toasts, savedFilters   │   │
                │  │  + memo'd actions:       │   │
                │  │   navigate, addToMap,    │   │
                │  │   toggleLayer, toast     │   │
                │  └─────────────┬────────────┘   │
                │                │                │
                │       AppCtx.Provider           │
                └─────────────────┼───────────────┘
                                  │
        ┌───────────────┬─────────┴────────┬──────────────┐
        │               │                  │              │
   IxTopNav         IxSidebar         AppRouter      ToastStack
   (page,navigate)  (filters,setF)    (page) ─┐
                                              │
                            ┌─────────────────┴───────────┐
                            │                             │
                       PageExplore                    PageDetail
                       (filters, addToMap,            (page.params.id,
                        catalog)                       addToMap, mapLayers)
                            │                             │
                        DsRowInteractive            (inline tabs)
                            │
                          RealMap (mapLayers)
                            │
                       AiAssistant (no AppCtx,
                                    local state only)
```

---

## 10. Migration plan (prototype → Zustand + TanStack Query)

```ts
// Step 1: Replace CATALOG with server-driven hook
const { data: catalog, isLoading } = useDatasets(filters);

// Step 2: Move client-only state to Zustand
const mapLayers = useAppStore(s => s.mapLayers);
const addToMap = useAppStore(s => s.addToMap);

// Step 3: Replace navigate() with router
const navigate = useNavigate();
navigate({ to: '/datasets/$id', params: { id } });

// Step 4: Filter state → URL searchParams
const [searchParams, setSearchParams] = useSearchParams();
const q = searchParams.get('q') ?? '';

// Step 5: Toast → Sonner library or keep custom (with cleanup fix)
toast.success(`"${title}" ditambahkan ke peta`);
```

Migration order rekomendasi:
1. **TopNav + routing** (least risky, no server dep)
2. **AppStore (Zustand)** for `mapLayers`, `toasts`
3. **TanStack Query for datasets** — biggest leverage, replace CATALOG
4. **URL state for filters** — last (UX polish)

---

## 11. Action contract (TypeScript)

Final shape for production stores (jadi backend tahu apa yang FE expect):

```ts
// useAppStore — client-only ephemeral state
interface AppStore {
  mapLayers: Set<string>;
  addToMap: (id: string) => void;       // also pushes toast (success)
  removeFromMap: (id: string) => void;  // also pushes toast (info)
  toggleLayer: (id: string) => void;    // silent
  clearMapLayers: () => void;

  toasts: ToastMessage[];
  pushToast: (msg: string, kind?: 'ok' | 'warn' | 'err') => string;
  dismissToast: (id: string) => void;
}

// TanStack Query hooks — server state
function useDatasets(filters: DatasetFilters): UseQueryResult<DatasetListResponse>;
function useDataset(id: string): UseQueryResult<Dataset>;
function useProviders(): UseQueryResult<Provider[]>;
function useCategories(): UseQueryResult<Category[]>;
function useMonitoringPipelines(): UseQueryResult<Pipeline[]>;
function useMonitoringStream(): { lastEvent: WsEvent | null };  // WebSocket hook

function useStarMutation(): UseMutationResult<void, Error, { datasetId: string }>;
function useApproveMutation(): UseMutationResult<ApprovalItem, Error, { id: string; note?: string }>;
```

Detail per endpoint di [api-contract.md](./api-contract.md).
