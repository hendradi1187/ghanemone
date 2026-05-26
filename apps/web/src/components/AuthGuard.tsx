/**
 * AuthGuard — wrap protected routes.
 *
 * Redirect ke `/login` saat user tidak ter-autentikasi, dengan `state.from`
 * berisi route asal. LoginPage memakai `state.from` untuk redirect-back
 * setelah login sukses.
 *
 * Pakai sebagai element wrapper di route definition (`router.tsx`) atau
 * di-compose secara manual di page-level (jarang dibutuhkan).
 */
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';

export interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    );
  }
  return <>{children}</>;
}
