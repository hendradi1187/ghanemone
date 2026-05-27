/**
 * AuthGuard — wrap protected routes.
 *
 * Sprint 9.3 update:
 *   - On first render: check /auth/me to validate stored token.
 *     If 401 → attempt refresh (handled by api/client.ts interceptor).
 *     If refresh also fails → client.ts redirects to /login automatically.
 *   - Shows loading spinner while validating to avoid flash of unauthenticated.
 *
 * Redirect ke `/login` saat user tidak ter-autentikasi, dengan `state.from`
 * berisi route asal. LoginPage memakai `state.from` untuk redirect-back
 * setelah login sukses.
 */
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useAuthStore } from '../stores/auth-store';
import { apiClient } from '../api/client';
import type { User } from '@ghanem/types';

/** Backend shape for GET /auth/me */
interface MeResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  organization: string | null;
  provisioningStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [validating, setValidating] = useState(false);
  const validatedRef = useRef(false);

  useEffect(() => {
    // Only validate once per mount and only if we think we're authenticated.
    if (validatedRef.current || !isAuthenticated || !user) return;
    validatedRef.current = true;

    setValidating(true);
    apiClient
      .get<MeResponse>('/auth/me')
      .then((me) => {
        // Normalize role (backend sends ADMIN, frontend expects admin).
        const roleMap: Record<string, User['role']> = {
          ADMIN: 'admin', REGULATOR: 'regulator',
          KKKS_OPERATOR: 'kkks_operator', ANALYST: 'analyst',
        };
        const refreshedUser: User = {
          id: me.id,
          sub: me.id,
          email: me.email,
          fullName: me.fullName,
          organization: me.organization,
          role: me.role ? (roleMap[me.role] ?? (me.role as User['role'])) : null,
          provisioningStatus: (me.provisioningStatus as User['provisioningStatus']) ?? 'active',
          createdAt: me.createdAt,
          updatedAt: me.updatedAt,
        };
        useAuthStore.setState({ user: refreshedUser });
      })
      .catch(() => {
        // Token invalid and refresh failed — client.ts already redirected to /login.
        // Clear store for consistency.
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      })
      .finally(() => {
        setValidating(false);
      });
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    );
  }

  if (validating) {
    return (
      <div
        role="status"
        aria-label="Memverifikasi sesi..."
        className="flex items-center justify-center h-full min-h-screen"
      >
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"
        />
        <span className="sr-only">Memverifikasi sesi...</span>
      </div>
    );
  }

  return <>{children}</>;
}
