import { apiFetch } from './http';

export interface Message {
  id: string;
  user_id: number;
  login: string;
  image_url: string;
  content: string;
  created_at: string;
}

export interface User {
  id: number;
  login: string;
  image_url: string;
  current_host: string;
  level: number;
}

export async function getMessages(before?: string, limit = 50): Promise<Message[]> {
  const params = new URLSearchParams();
  if (before) params.set('before', before);
  params.set('limit', String(limit));

  const res = await apiFetch(`/api/messages?${params}`);
  if (!res.ok) throw new Error(`getMessages: ${res.status}`);
  return res.json();
}

export async function getUserById(id: number): Promise<User> {
  const res = await apiFetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`getUser: ${res.status}`);
  return res.json();
}
