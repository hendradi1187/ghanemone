/**
 * Apps API — mock catalog + installed-state persistence.
 *
 * Phase 8.13. Consumer: `pages/AppsPage.tsx` + `AppDetailDialog`. Phase 9
 * ganti dengan `/v1/apps` (catalog) + `/v1/me/installed-apps` (state).
 *
 * localStorage:
 *   - Key `ghanem.apps.installed`: `string[]` (array of app ids yang ter-install).
 *   Built-in apps catalog tidak punya `installed` flag — flag dihitung dari
 *   localStorage set di query-time.
 */
import { APPS_CATALOG, type AppCategory, type AppRecord } from '../mocks/apps';

const STORAGE_KEY = 'ghanem.apps.installed';

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 150, max = 350): number {
  return min + Math.floor(Math.random() * (max - min));
}

/* ─── localStorage helpers ─────────────────────────────────────────────── */

function readInstalled(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.filter((s): s is string => typeof s === 'string'));
  } catch (err) {
    void err;
    return new Set<string>();
  }
}

function writeInstalled(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    void err;
  }
}

/* ─── Public types ─────────────────────────────────────────────────────── */

export interface AppInstalled extends AppRecord {
  installed: boolean;
}

export interface AppFilters {
  search?: string;
  category?: AppCategory | undefined;
  installedOnly?: boolean;
}

/* ─── Public API ───────────────────────────────────────────────────────── */

/** List apps dengan filter (search + category + installed). */
export async function getApps(filters: AppFilters = {}): Promise<AppInstalled[]> {
  await sleep(jitter());
  const installed = readInstalled();
  const search = (filters.search ?? '').toLowerCase().trim();
  let list: AppInstalled[] = APPS_CATALOG.map((a) => ({
    ...a,
    installed: installed.has(a.id),
  }));
  if (filters.category) {
    list = list.filter((a) => a.category === filters.category);
  }
  if (filters.installedOnly) {
    list = list.filter((a) => a.installed);
  }
  if (search) {
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.vendor.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search),
    );
  }
  return list;
}

export async function getAppById(id: string): Promise<AppInstalled | null> {
  await sleep(jitter(100, 200));
  const found = APPS_CATALOG.find((a) => a.id === id);
  if (!found) return null;
  const installed = readInstalled();
  return { ...found, installed: installed.has(id) };
}

export async function installApp(id: string): Promise<{ ok: true }> {
  await sleep(jitter(300, 700));
  const set = readInstalled();
  set.add(id);
  writeInstalled(set);
  return { ok: true };
}

export async function uninstallApp(id: string): Promise<{ ok: true }> {
  await sleep(jitter(200, 400));
  const set = readInstalled();
  set.delete(id);
  writeInstalled(set);
  return { ok: true };
}
