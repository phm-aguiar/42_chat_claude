// Base URL de API relativa — proxy Vite redireciona para backend em dev
const BASE = '';

/**
 * GENERAL_CHAT_ID — UUID fixo do chat "general" (Feature 100 backward compat).
 * Definido na migration 003 como constante documentada.
 */
export const GENERAL_CHAT_ID = '00000000-0000-7000-8000-000000000001';

/**
 * ApiError é o formato padrão de erro retornado pela API.
 */
export interface ApiError {
  error: string;
  code: string;
}

/**
 * Chat representa uma conversa (1x1 ou grupo).
 * IDs: sempre string (UUID).
 */
export interface Chat {
  id: string;
  type: 'oneOnOne' | 'group' | 'general'; // general é internal, mapeado de type='general'
  topic?: string;
  created_by: number;
  created_at: string; // ISO 8601
  members?: ChatMember[];
}

/**
 * ChatMember representa um membro e seu role em um chat.
 */
export interface ChatMember {
  user_id: number;
  role: 'owner' | 'member' | 'mod';
}

/**
 * Message representa uma mensagem (Feature 100 + Feature 103).
 * Chat_id é adicionado na Feature 103; sem chat_id assume GENERAL_CHAT_ID.
 */
export interface Message {
  id: string;
  chat_id?: string; // adicionado na Feature 103
  user_id: number;
  login: string;
  image_url: string;
  content: string;
  created_at: string; // ISO 8601
  deleted_at?: string | null; // soft delete
}

/**
 * MessagesResponse é o formato de resposta de GET /api/chats/{id}/messages.
 */
export interface MessagesResponse {
  messages: Message[];
  has_more: boolean;
  next_before?: string; // RFC3339, usado no próximo fetch se has_more
}

/**
 * Obtém o token JWT do localStorage para autenticação.
 * Header: Authorization: Bearer <token>
 */
function authHeader(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Trata erro HTTP: parse JSON ou lança message genérico.
 */
async function handleError(res: Response): Promise<never> {
  try {
    const err = (await res.json()) as ApiError;
    throw new Error(`${err.error} (${err.code})`);
  } catch {
    throw new Error(`HTTP ${res.status}`);
  }
}

/**
 * Busca todos os chats do usuário.
 * GET /api/chats
 */
export async function fetchChats(): Promise<Chat[]> {
  const res = await fetch(`${BASE}/api/chats`, {
    headers: authHeader(),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Busca um chat específico pelo ID.
 * GET /api/chats/{id}
 */
export async function fetchChat(id: string): Promise<Chat> {
  const res = await fetch(`${BASE}/api/chats/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Cria um novo chat.
 * POST /api/chats
 * Body: {type: 'oneOnOne'|'group', topic?: string, members?: number[]}
 */
export async function createChat(input: {
  type: 'oneOnOne' | 'group';
  topic?: string;
  members?: number[];
}): Promise<Chat> {
  const res = await fetch(`${BASE}/api/chats`, {
    method: 'POST',
    headers: {
      ...authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Lista mensagens de um chat com cursor pagination.
 * GET /api/chats/{id}/messages?before=<RFC3339>&limit=50
 *
 * @param chatId — UUID do chat
 * @param before — RFC3339 timestamp; retorna mensagens anteriores a este
 * @param limit — máximo de mensagens (padrão 50, máximo 100)
 */
export async function fetchMessages(
  chatId: string,
  before?: string,
  limit = 50
): Promise<MessagesResponse> {
  const params = new URLSearchParams();
  if (before) params.set('before', before);
  params.set('limit', String(Math.min(limit, 100)));

  const url = `${BASE}/api/chats/${chatId}/messages${
    params.toString() ? `?${params.toString()}` : ''
  }`;

  const res = await fetch(url, {
    headers: authHeader(),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Envia uma mensagem para um chat via REST (fallback se WS cair).
 * POST /api/chats/{id}/messages
 * Body: {content, chat_id}
 */
export async function sendMessage(
  chatId: string,
  content: string
): Promise<Message> {
  const res = await fetch(`${BASE}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      ...authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, chat_id: chatId }),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Deleta uma mensagem (soft delete).
 * DELETE /api/messages/{id}
 */
export async function deleteMessage(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/messages/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) await handleError(res);
}

/**
 * Adiciona um membro a um chat.
 * POST /api/chats/{id}/members
 * Body: {user_id}
 */
export async function addMember(chatId: string, userId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/chats/${chatId}/members`, {
    method: 'POST',
    headers: {
      ...authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) await handleError(res);
}

/**
 * Remove um membro de um chat.
 * DELETE /api/chats/{id}/members/{user_id}
 */
export async function removeMember(
  chatId: string,
  userId: number
): Promise<void> {
  const res = await fetch(
    `${BASE}/api/chats/${chatId}/members/${userId}`,
    {
      method: 'DELETE',
      headers: authHeader(),
    }
  );
  if (!res.ok) await handleError(res);
}
