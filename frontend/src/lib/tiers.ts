export const TIER_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'novato',       color: '#29292E' }, // Dark Gray DS42
  1: { label: 'iniciante',    color: '#04809F' }, // CG Blue DS42
  2: { label: 'participante', color: '#00BABC' }, // Teal DS42
  3: { label: 'veterano',     color: '#2DD57A' }, // Green DS42
};

// getTier deriva o tier a partir do total de mensagens.
// 0 = novato, 1-50 = iniciante, 51-200 = participante, 201+ = veterano.
export function getTier(total: number): number {
  if (total === 0) return 0;
  if (total >= 1 && total <= 50) return 1;
  if (total >= 51 && total <= 200) return 2;
  return 3;
}
