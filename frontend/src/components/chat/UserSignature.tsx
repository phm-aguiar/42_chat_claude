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
    <div
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 4px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
      }}
    >
      {/* Tier badge + message count (avatar + login removed to avoid duplication with MessageList header) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Tier badge */}
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 0,
            backgroundColor: tierColor,
            color: '#1B1B1B',
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {tierLabel}
        </span>

        {/* Message count */}
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>
          {stats?.total_messages || 0} mensagens
        </span>
      </div>
    </div>
  );
}
