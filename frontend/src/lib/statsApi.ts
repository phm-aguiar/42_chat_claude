import { apiFetch } from './http';

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

export async function fetchUserStats(userID: number): Promise<UserStats> {
  const res = await apiFetch(`/api/users/${userID}/stats`);
  if (!res.ok) throw new Error(`fetchUserStats: ${res.status}`);
  return res.json();
}
