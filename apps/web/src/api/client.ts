/**
 * HTTP client — typed fetch wrapper with JWT injection + 401 refresh logic.
 *
 * Design notes (security trade-off documented):
 *   - Tokens stored in localStorage (NOT httpOnly cookies) because this is a
 *     SPA with no BFF. This exposes tokens to XSS; mitigations are:
 *     (a) strict CSP headers at the CDN/nginx layer (infra concern),
 *     (b) short-lived access tokens (15min), refresh tokens rotated on use.
 *   - Token refresh is attempted once on 401. If refresh fails, store is
 *     cleared and user is redirected to /login.
 *
 * Token keys:
 *   ghanem.accessToken  — JWT access token
 *   ghanem.refreshToken — opaque refresh token
 *   ghanem.user         — serialised User object
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ghanem.accessToken',
  REFRESH_TOKEN: 'ghanem.refreshToken',
  USER: 'ghanem.user',
} as const;

/** Read token from localStorage — returns null if missing or window unavailable. */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

/** Clear all auth tokens from storage and dispatch a custom event so AuthStore can react. */
export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.USER);
    // Broadcast so AuthStore and any other listeners can clear in-memory state.
    window.dispatchEvent(new CustomEvent('ghanem:auth:cleared'));
  } catch {
    // reason: Safari Private Mode can throw on localStorage access — swallow.
  }
}

/** Persist access token to localStorage. */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch {
    // reason: quota exceeded — token stays in memory only for this session.
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as Record<string, unknown>).message === 'string'
        ? (body as Record<string, unknown>).message as string
        : `HTTP ${status}: ${statusText}`;
    super(message);
    this.name = 'ApiError';
  }
}

/** Flag to prevent concurrent refresh attempts. */
let isRefreshing = false;
/** Queue of resolvers waiting for the refreshed token. */
let refreshWaiters: Array<(token: string | null) => void> = [];

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!data.accessToken) return null;

  setAccessToken(data.accessToken);
  if (data.refreshToken) {
    window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  }

  return data.accessToken;
}

/**
 * Core fetch wrapper. All API calls go through here.
 *
 * Features:
 *   - Base URL prepended
 *   - Content-Type defaulted to application/json
 *   - Authorization header injected if token exists
 *   - 401 → single refresh attempt, then redirect to /login
 *   - Non-2xx responses → throw ApiError with parsed body
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | boolean | undefined | null> } = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${path}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const token = getAccessToken();
  const headers = new Headers(fetchOptions.headers ?? {});

  if (!headers.has('Content-Type') && fetchOptions.method !== 'GET' && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...fetchOptions, headers });

  if (response.status === 401) {
    // Try refresh once — serialise concurrent refresh attempts.
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await attemptTokenRefresh().catch(() => null);
      isRefreshing = false;

      // Wake all waiters.
      for (const resolve of refreshWaiters) resolve(newToken);
      refreshWaiters = [];

      if (newToken) {
        // Retry original request with new token.
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(url, { ...fetchOptions, headers: retryHeaders });
        if (!retryResponse.ok) {
          const errorBody: unknown = await retryResponse.json().catch(() => ({}));
          throw new ApiError(retryResponse.status, retryResponse.statusText, errorBody);
        }
        return (await retryResponse.json()) as T;
      } else {
        // Refresh failed — clear storage and redirect.
        clearAuthStorage();
        if (typeof window !== 'undefined') {
          const from = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(`/login?from=${from}`);
        }
        throw new ApiError(401, 'Unauthorized', { message: 'Session berakhir. Silakan login kembali.' });
      }
    } else {
      // Already refreshing — wait for the result.
      const newToken = await new Promise<string | null>((resolve) => {
        refreshWaiters.push(resolve);
      });

      if (newToken) {
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(url, { ...fetchOptions, headers: retryHeaders });
        if (!retryResponse.ok) {
          const errorBody: unknown = await retryResponse.json().catch(() => ({}));
          throw new ApiError(retryResponse.status, retryResponse.statusText, errorBody);
        }
        return (await retryResponse.json()) as T;
      }

      throw new ApiError(401, 'Unauthorized', { message: 'Session berakhir.' });
    }
  }

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorBody);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Convenience wrappers. */
export const apiClient = {
  get: <T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined | null>) =>
    apiFetch<T>(path, { method: 'GET', params }),

  post: <T = unknown>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
