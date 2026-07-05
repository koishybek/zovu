import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { routes } from './routes';

/** Guard приватных зон: нет токена → на Welcome (S-01). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to={routes.welcome} replace />;
  return <>{children}</>;
}
