const BASE = '';

export interface UserStats {
  user_id: number;
  login: string;
  image_url: string;
  total_messages: number;
  active_rooms: number;
  tier: number;
  tier_label: string;
  member_since: string;
}

function authHeader(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUserStats(userID: number): Promise<UserStats> {
  const res = await fetch(`${BASE}/api/users/${userID}/stats`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error(`fetchUserStats: ${res.status}`);
  return res.json();
}
