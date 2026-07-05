import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { routes } from './routes';

/** Стартовый редирект по сессии (S-01 гость / рабочее пространство по роли). */
export function RootRedirect() {
  const { accessToken, user } = useAuthStore();
  if (!accessToken || !user) return <Navigate to={routes.welcome} replace />;
  if (user.active_role === 'specialist' && user.is_specialist) {
    return <Navigate to={routes.spOrders} replace />;
  }
  if (user.is_client) return <Navigate to={routes.clientOrders} replace />;
  // Есть токен, но роль ещё не выбрана (новый юзер прервал онбординг)
  return <Navigate to={routes.role} replace />;
}
