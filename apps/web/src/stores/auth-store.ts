/**
 * Auth store — Zustand slice untuk session client-side.
 *
 * Sprint 9.3: replaced mock login dengan real API call ke POST /api/v1/auth/login.
 *
 * Token persistence strategy (localStorage — SPA limitation, documented risk):
 *   - ghanem.accessToken  — short-lived JWT (15min from backend)
 *   - ghanem.refreshToken — rotated refresh token
 *   - ghanem.user         — serialised User for instant hydration
 *
 * Refresh flow delegated to api/client.ts interceptor (attemptTokenRefresh).
 * This store only handles login/logout/hydrate lifecycle.
 */
import { create } from 'zustand';
import type { User } from '@ghanem/types';
import { apiClient, clearAuthStorage, STORAGE_KEYS } from '../api/client';

/** Shape returned by POST /api/v1/auth/login and POST /api/v1/auth/refresh */
interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string | null;
    organization: string | null;
    provisioningStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

function persistTokens(accessToken: string, refreshToken: string, user: User): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {
    // reason: Safari Private Mode / quota exceeded — session lives in memory only.
  }
}

function readPersistedSession(): { accessToken: string; refreshToken: string; user: User } | null {
  if (typeof window === 'undefined') return null;
  try {
    const accessToken = window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userRaw = window.localStorage.getItem(STORAGE_KEYS.USER);
    if (!accessToken || !refreshToken || !userRaw) return null;
    const user = JSON.parse(userRaw) as User;
    if (!user || typeof user.email !== 'string') return null;
    return { accessToken, refreshToken, user };
  } catch {
    return null;
  }
}

/** Normalize backend role string (ADMIN, KKKS_OPERATOR, ...) → UserRole enum. */
function normalizeRole(role: string | null): User['role'] {
  if (!role) return null;
  const map: Record<string, User['role']> = {
    ADMIN: 'admin',
    REGULATOR: 'regulator',
    KKKS_OPERATOR: 'kkks_operator',
    ANALYST: 'analyst',
    // already-lowercase passthrough
    admin: 'admin',
    regulator: 'regulator',
    kkks_operator: 'kkks_operator',
    analyst: 'analyst',
  };
  return map[role] ?? 'analyst';
}

/** Map backend user shape → @ghanem/types User. */
function mapApiUser(apiUser: AuthLoginResponse['user']): User {
  return {
    id: apiUser.id,
    sub: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.fullName,
    organization: apiUser.organization,
    role: normalizeRole(apiUser.role),
    provisioningStatus: (apiUser.provisioningStatus as User['provisioningStatus']) ?? 'active',
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Restore session from localStorage on app mount. No network call. */
  hydrate: () => void;
  /** Called by client interceptor after successful token refresh. */
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthLoginResponse>('/auth/login', { email, password });
      const user = mapApiUser(response.user);
      persistTokens(response.accessToken, response.refreshToken, user);
      set({
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login gagal — periksa kredensial Anda';
      set({ isLoading: false, error: message, isAuthenticated: false });
      throw err;
    }
  },

  logout: async () => {
    // Attempt server-side logout (invalidate refresh token) — non-fatal if fails.
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // reason: logout endpoint failure is non-fatal — clear client state regardless.
    }
    clearAuthStorage();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  hydrate: () => {
    const session = readPersistedSession();
    if (session) {
      set({
        user: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        isAuthenticated: true,
      });
    }
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
    // Also store in the old single key for backward compat (client.ts reads directly)
    try {
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch {
      // reason: storage unavailable — token stays in memory.
    }
  },
}));

// Listen for the custom event emitted by clearAuthStorage() in the client interceptor.
// This ensures the store is cleared even when the 401 handling happens outside a React tree.
if (typeof window !== 'undefined') {
  window.addEventListener('ghanem:auth:cleared', () => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: 'Session berakhir. Silakan login kembali.',
      });
    }
  });
}
