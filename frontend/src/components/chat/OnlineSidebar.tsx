import { useChatStore } from '@/stores/chatStore';

export function OnlineSidebar() {
  const status = useChatStore((s) => s.status);
  const messages = useChatStore((s) => s.messages);

  // Extrai logins únicos das mensagens como proxy de "quem falou recentemente"
  const recentLogins = Array.from(
    new Set(messages.slice(-50).map((m) => m.login).filter(Boolean))
  ).slice(0, 12);

  return (
    <aside
      style={{
        width: '164px',
        flexShrink: 0,
        background: '#202026',
        borderRight: '1px solid #29292E',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 14px 8px',
          borderBottom: '1px solid #29292E',
        }}
      >
        <span
          style={{
            color: '#29292E',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Online
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {status === 'connected' && recentLogins.length > 0 ? (
          recentLogins.map((login) => (
            <div
              key={login}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  background: '#2DD57A',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {login}
              </span>
            </div>
          ))
        ) : (
          <div style={{ padding: '8px 14px' }}>
            <span style={{ color: '#29292E', fontSize: '10px' }}>—</span>
          </div>
        )}
      </div>

      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #29292E',
        }}
      >
        <span style={{ color: '#29292E', fontSize: '9px', letterSpacing: '0.1em' }}>
          {status === 'connected' ? `${recentLogins.length} recentes` : 'desconectado'}
        </span>
      </div>
    </aside>
  );
}
