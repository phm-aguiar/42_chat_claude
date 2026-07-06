import { apiFetch } from './http';

/**
 * ApiError é o formato padrão de erro retornado pela API do fórum.
 */
export interface ApiError {
  error: string;
  code: string;
}

/**
 * Board representa um fórum dentro do 42 Chat.
 * IDs: sempre string (UUID).
 */
export interface Board {
  id: string;
  slug: string;
  name: string;
  description: string;
  owner_id: number | null;
  sfw: boolean;
  theme: string;
  is_locked: boolean;
  created_at: string; // ISO 8601
}

/**
 * Thread representa um tópico dentro de um board.
 * IDs: sempre string (UUID).
 */
export interface Thread {
  id: string;
  board_id: string;
  author_id: number;
  author_login: string;
  author_image_url: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  post_count: number;
  last_post_at: string; // ISO 8601
  created_at: string; // ISO 8601
  deleted_at?: string | null; // ISO 8601 ou null
}

/**
 * Post representa uma resposta em um thread ou outra resposta (reply).
 * IDs: sempre string (UUID).
 */
export interface Post {
  id: string;
  thread_id: string;
  author_id: number;
  author_login: string;
  author_image_url: string;
  reply_to?: string | null; // UUID do post que este responde (nullable)
  content: string;
  created_at: string; // ISO 8601
  deleted_at?: string | null; // ISO 8601 ou null
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
 * Busca todos os boards.
 * GET /api/forum/boards
 */
export async function fetchBoards(): Promise<Board[]> {
  const res = await apiFetch('/api/forum/boards');
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Busca um board específico por slug.
 * GET /api/forum/boards/{slug}
 */
export async function fetchBoard(slug: string): Promise<Board> {
  const res = await apiFetch(`/api/forum/boards/${encodeURIComponent(slug)}`);
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Lista threads de um board com paginação.
 * GET /api/forum/boards/{slug}/threads?limit=&offset=
 */
export async function fetchThreads(
  slug: string,
  limit?: number,
  offset?: number
): Promise<Thread[]> {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('limit', String(limit));
  if (offset !== undefined) params.set('offset', String(offset));

  const path = `/api/forum/boards/${encodeURIComponent(slug)}/threads${
    params.toString() ? `?${params.toString()}` : ''
  }`;

  const res = await apiFetch(path);
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Busca um thread específico pelo ID.
 * GET /api/forum/threads/{id}
 */
export async function fetchThread(id: string): Promise<Thread> {
  const res = await apiFetch(`/api/forum/threads/${id}`);
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Cria um novo thread em um board.
 * POST /api/forum/boards/{slug}/threads
 * Body: {title, content, tags}
 */
export async function createThread(
  slug: string,
  input: { title: string; content: string; tags: string[] }
): Promise<Thread> {
  const res = await apiFetch(`/api/forum/boards/${encodeURIComponent(slug)}/threads`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Busca posts de um thread.
 * GET /api/forum/threads/{id}/posts
 */
export async function fetchPosts(threadId: string): Promise<Post[]> {
  const res = await apiFetch(`/api/forum/threads/${threadId}/posts`);
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Cria um novo post em um thread.
 * POST /api/forum/threads/{id}/posts
 * Body: {content, reply_to?}
 */
export async function createPost(
  threadId: string,
  input: { content: string; reply_to?: string | null }
): Promise<Post> {
  const res = await apiFetch(`/api/forum/threads/${threadId}/posts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Atualiza um thread (pin/lock/etc).
 * PATCH /api/forum/threads/{id}
 * Body: parcial (is_pinned, is_locked, etc)
 */
export async function patchThread(id: string, partial: Partial<Thread>): Promise<Thread> {
  const res = await apiFetch(`/api/forum/threads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(partial),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * Deleta um thread (soft delete).
 * DELETE /api/forum/threads/{id}
 */
export async function deleteThread(id: string): Promise<void> {
  const res = await apiFetch(`/api/forum/threads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) await handleError(res);
}

/**
 * Deleta um post (soft delete).
 * DELETE /api/forum/posts/{id}
 */
export async function deletePost(id: string): Promise<void> {
  const res = await apiFetch(`/api/forum/posts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) await handleError(res);
}
