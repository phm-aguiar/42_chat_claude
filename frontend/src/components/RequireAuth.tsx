import { Navigate, Outlet } from 'react-router-dom';
import { getValidToken } from '@/lib/auth';

/**
 * RequireAuth é um componente de guarda que verifica se o usuário está autenticado.
 * Se não há token válido, redireciona para `/login`.
 * Se há token, renderiza as rotas filhas via `<Outlet />`.
 */
export function RequireAuth() {
  const token = getValidToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
