// Base URL de API relativa — proxy Vite redireciona para backend em dev
const BASE = '';

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

function authHeader(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMessages(before?: string, limit = 50): Promise<Message[]> {
  const params = new URLSearchParams();
  if (before) params.set('before', before);
  params.set('limit', String(limit));

  const res = await fetch(`${BASE}/api/messages?${params}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error(`getMessages: ${res.status}`);
  return res.json();
}

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${BASE}/api/users/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error(`getUser: ${res.status}`);
  return res.json();
}
