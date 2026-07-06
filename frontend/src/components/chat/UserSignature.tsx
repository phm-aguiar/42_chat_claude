import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { TIER_MAP } from '@/lib/tiers';

interface UserSignatureProps {
  userID: number;
}

export function UserSignature({ userID }: UserSignatureProps) {
  const stats = useChatStore((s) => s.statsCache?.[userID]);
  const fetchStats = useChatStore((s) => s.fetchStats);

  useEffect(() => {
    if (!stats) {
      fetchStats(userID);
    }
  }, [userID, stats, fetchStats]);

  // Modo "novato" (sem stats ou 0 mensagens) degrada implicitamente:
  // tier 0 → badge "novato", "0 mensagens", login fallback.
  const tier = stats ? stats.tier : 0;
  const tierColor = TIER_MAP[tier].color;
  const tierLabel = TIER_MAP[tier].label;

  return (
    <div className="flex h-16 items-center gap-2 px-1 text-[11px] text-content-secondary">
      {/* Tier badge + message count (avatar + login removed to avoid duplication with MessageList header) */}
      <div className="flex items-center gap-1.5">
        {/* Cor do tier vem de TIER_MAP em runtime — única exceção permitida de estilo inline */}
        <span
          className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-surface-base"
          style={{ backgroundColor: tierColor }}
        >
          {tierLabel}
        </span>

        <span className="text-[9px] text-content-muted">
          {stats?.total_messages || 0} mensagens
        </span>
      </div>
    </div>
  );
}
