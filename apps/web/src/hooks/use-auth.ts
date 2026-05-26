/**
 * useAuth — convenience hook membungkus auth-store untuk consumer pages/components.
 *
 * Returns objek dengan `user`, `isAuthenticated`, plus actions `login` / `logout`.
 * Memilih slice-by-slice untuk meminimalkan re-render (Zustand best practice).
 */
import { useAuthStore } from '../stores/auth-store';
import type { User } from '@ghanem/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { user, isAuthenticated, login, logout };
}
