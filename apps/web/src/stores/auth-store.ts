/**
 * Auth store — Zustand slice untuk session client-side.
 *
 * Phase 8: implementasi mock (tidak ada call ke backend OIDC nyata).
 * Phase 9: replace `login()` dengan call ke `POST /v1/auth/oidc/callback` +
 * konversi HttpOnly cookie ke in-memory accessor (lihat docs/auth-flow.md §3).
 *
 * Persistence: token + user di-mirror ke `localStorage` (key `ghanem.session`).
 * `hydrate()` di-call sekali pada App boot untuk merestore session sebelum
 * AuthGuard berjalan (lihat App.tsx).
 *
 * Lihat docs/state-model.md §2 untuk rasionale split client vs server state.
 */
import { create } from 'zustand';
import type { User, UserRole } from '@ghanem/types';

/** Storage key untuk session blob (`{ token, user }`). */
const STORAGE_KEY = 'ghanem.session';

/** Shape session yang dipersist. */
interface PersistedSession {
  token: string;
  user: User;
}

export interface AuthState {
  /** Current user — `null` kalau belum login atau session expired. */
  user: User | null;
  /** Access token (mock JWT di Phase 8). Phase 9: HttpOnly cookie, tidak diekspos. */
  token: string | null;
  /** Computed: `user !== null`. Convenience getter untuk consumer. */
  isAuthenticated: boolean;
  /** Mock-login: email + password ≥ 8 char → success. */
  login: (email: string, password: string) => Promise<void>;
  /** Hapus session + localStorage. */
  logout: () => void;
  /** Restore session dari localStorage on App mount. */
  hydrate: () => void;
}

/* ─── Mock helpers (Phase 8 only) ────────────────────────────────────── */

/** Derive role dari domain email — mimic JIT provisioning (auth-flow.md §9). */
function inferRoleFromEmail(email: string): UserRole {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (domain.includes('skkmigas') || domain.includes('skk-migas')) return 'regulator';
  if (
    domain.includes('phe') ||
    domain.includes('pertamina') ||
    domain.includes('medco') ||
    domain.includes('chevron') ||
    domain.includes('inpex')
  ) {
    return 'kkks_operator';
  }
  return 'analyst';
}

/** Derive organization display name dari email domain. */
function inferOrgFromEmail(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (domain.includes('skkmigas')) return 'SKK Migas';
  if (domain.includes('phe')) return 'PHE ONWJ';
  if (domain.includes('pertamina')) return 'Pertamina Hulu';
  if (domain.includes('medco')) return 'Medco E&P';
  if (domain.includes('chevron')) return 'Chevron Indonesia';
  return 'Public Analyst';
}

/** Generate 2-char initials dari email local part. */
function deriveInitials(email: string): string {
  const local = email.split('@')[0] ?? 'user';
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

/** Mock JWT — base64-encoded header.payload (no signature). NEVER use in prod. */
function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.sub,
      email: user.email,
      role: user.role,
      organization: user.organization,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  return `${header}.${payload}.mock`;
}

function buildMockUser(email: string): User {
  const role = inferRoleFromEmail(email);
  const organization = inferOrgFromEmail(email);
  const now = new Date().toISOString();
  return {
    id: `user_${Math.random().toString(36).slice(2, 10)}`,
    sub: `mock|${email}`,
    email,
    fullName: deriveInitials(email),
    organization,
    role,
    provisioningStatus: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

function persistSession(session: PersistedSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  } catch (err) {
    // reason: localStorage bisa throw di Safari Private Mode / quota exceeded.
    // Swallow — session tetap valid di memory; user perlu re-login next visit.
    void err;
  }
}

function readSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedSession>;
    if (
      typeof parsed.token === 'string' &&
      parsed.user &&
      typeof parsed.user === 'object' &&
      typeof (parsed.user as User).email === 'string'
    ) {
      return parsed as PersistedSession;
    }
    return null;
  } catch (err) {
    void err;
    return null;
  }
}

/* ─── Store ──────────────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    // Mock validation — Phase 8 only.
    if (!email.includes('@')) {
      throw new Error('Format email tidak valid');
    }
    if (password.length < 8) {
      throw new Error('Password minimal 8 karakter');
    }
    // Simulate network latency 400-700ms.
    const delayMs = 400 + Math.floor(Math.random() * 300);
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

    const user = buildMockUser(email);
    const token = generateMockToken(user);
    persistSession({ token, user });
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    persistSession(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const session = readSession();
    if (session) {
      set({ user: session.user, token: session.token, isAuthenticated: true });
    }
  },
}));
