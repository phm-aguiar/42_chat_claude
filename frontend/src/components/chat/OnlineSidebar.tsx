import { useChatStore } from '@/stores/chatStore';

export function OnlineSidebar() {
  const status = useChatStore((s) => s.status);
  const messages = useChatStore((s) => s.messages);

  // Extrai logins únicos das mensagens como proxy de "quem falou recentemente"
  const recentLogins = Array.from(
    new Set(messages.slice(-50).map((m) => m.login).filter(Boolean))
  ).slice(0, 12);

  return (
    <aside className="w-48 shrink-0 bg-surface-panel border-r border-surface-raised flex flex-col overflow-hidden">
      <div className="px-3.5 py-3 border-b border-surface-raised">
        <span className="text-content-muted text-xs tracking-widest uppercase font-bold">
          Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {status === 'connected' && recentLogins.length > 0 ? (
          recentLogins.map((login) => (
            <div key={login} className="flex items-center gap-2 px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 bg-status-success shrink-0" />
              <span className="text-content-secondary text-xs tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">
                {login}
              </span>
            </div>
          ))
        ) : (
          <div className="px-3.5 py-2">
            <span className="text-content-muted text-xs">—</span>
          </div>
        )}
      </div>

      <div className="px-3.5 py-2.5 border-t border-surface-raised">
        <span className="text-content-muted text-xs tracking-wider">
          {status === 'connected' ? `${recentLogins.length} recentes` : 'desconectado'}
        </span>
      </div>
    </aside>
  );
}
