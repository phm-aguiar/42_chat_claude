// Decodifica o payload JWT sem verificar assinatura — apenas para checar exp local.
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Retorna o token do localStorage se existir e não estiver expirado.
// Remove e retorna null se expirado ou inválido.
export function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    localStorage.removeItem('token');
    return null;
  }
  if (payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('token');
    return null;
  }
  return token;
}

export interface AuthUser {
  id: number;
  login: string;
  image_url: string;
  current_host?: string;
}

// Salva token e dados do usuário no localStorage.
export function saveToken(token: string, user?: AuthUser): void {
  localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

// Remove token e dados do usuário do localStorage.
export function clearToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Retorna o usuário salvo no localStorage, ou null.
export function getSavedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Monta a URL de autorização OAuth2 da 42 Intra.
export function buildOAuthUrl(): string {
  const clientId = import.meta.env.VITE_42_CLIENT_ID ?? '';
  const redirectUri = import.meta.env.VITE_42_REDIRECT_URI ?? window.location.origin;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'public',
  });
  return `https://api.intra.42.fr/oauth/authorize?${params}`;
}
