import { getValidToken, clearToken } from './auth';

const BASE = '';

/**
 * apiFetch — centralized fetch wrapper com injeção de token e tratamento de 401.
 *
 * - Injeta Authorization: Bearer <token> se token existir
 * - Injeta Content-Type: application/json se houver body e caller não definiu
 * - Em 401: limpa token, redireciona para /login, E lança erro para caller tratar
 * - Retorna Response para o caller decidir se consome JSON ou não
 * - Propaga outros erros de rede (não engule)
 *
 * @param path Caminho relativo (ex: '/api/forum/boards')
 * @param init RequestInit opcional
 * @returns Response (caller responsável por .json(), .text(), etc)
 * @throws Error se 401 (após redirecionar), ou se res.ok === false
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getValidToken();

  // Prepara headers: injeta Authorization e Content-Type conforme necessário
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Injeta Content-Type apenas se houver body e caller não definiu
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });

  // 401 Unauthorized: limpa token, redireciona, E lança erro
  if (res.status === 401) {
    clearToken();
    window.location.replace('/login');
    throw new Error('Unauthorized - redirecting to login');
  }

  return res;
}
