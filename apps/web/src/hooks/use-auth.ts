/**
 * useAuth — convenience hook wrapping auth-store for page/component consumers.
 *
 * Selects slice-by-slice to minimise re-renders (Zustand best practice).
 * Sprint 9.3: logout is now async (calls POST /auth/logout before clearing).
 */
import { useAuthStore } from '../stores/auth-store';
import type { User } from '@ghanem/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { user, isAuthenticated, isLoading, error, login, logout };
}
