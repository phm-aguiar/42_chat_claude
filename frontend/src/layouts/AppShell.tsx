import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSavedUser } from '@/lib/auth';
import { useChatStore } from '@/stores/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface RailButtonProps {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}

function RailButton({ active, title, onClick, children, badge }: RailButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        title={title}
        className={`flex h-11 w-11 items-center justify-center font-mono font-bold text-xs transition-[border-radius] ${
          active
            ? 'rounded-[14px] bg-accent-primary text-content-onAccent'
            : 'rounded-full bg-surface-raised text-content-primary/70 hover:text-content-secondary'
        }`}
      >
        {children}
      </button>
      {badge !== undefined && badge > 0 && (
        <Badge
          variant="error"
          count={badge}
          className="absolute -right-1 -top-1"
        />
      )}
    </div>
  );
}

interface TrafficLightProps {
  color: string;
}

function TrafficLight({ color }: TrafficLightProps) {
  return (
    <div
      className="h-[11px] w-[11px] rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

/**
 * AppShell v2 — MSN/Discord reskin
 * Estrutura:
 * - Title bar 44px (traffic lights, logo, sessão)
 * - Rail 72px vertical (navegação Hub/Chat/Fórum, avatar embaixo)
 * - Header contextual + Outlet
 */
export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSavedUser();
  const chats = useChatStore((state) => state.chats);

  // Calcular total de não-lidas (soma defensiva)
  const totalUnread = chats.reduce((sum, chat) => {
    return sum + ((chat as any).unread_count ?? 0);
  }, 0);

  // Determinar qual seção está ativa baseado na URL
  const isHub = location.pathname === '/';
  const isChat = location.pathname.startsWith('/chat');
  const isForum = location.pathname.startsWith('/forum');

  const [pageTitle, setPageTitle] = useState('42 Chat');

  useEffect(() => {
    if (isHub) setPageTitle('Hub');
    else if (isChat) setPageTitle('Chat');
    else if (isForum) setPageTitle('Fórum');
  }, [location.pathname, isHub, isChat, isForum]);

  const host = user?.current_host || '42sp';

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Title Bar 44px */}
      <header className="h-11 shrink-0 flex items-center justify-between px-4 bg-gradient-to-b from-[#3a1f57] to-[#241335] border-b border-white/5">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <TrafficLight color="#ff5f57" />
          <TrafficLight color="#febc2e" />
          <TrafficLight color="#28c840" />
        </div>

        {/* Logo */}
        <div className="font-mono font-bold text-sm text-content-primary">
          &lt;42_chat/&gt;
        </div>

        {/* Sessão info */}
        <div className="font-mono text-[11px] text-content-primary/50">
          sessão :: {host} :: 42sp
        </div>
      </header>

      {/* Main content flex row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Rail 72px */}
        <aside className="w-20 shrink-0 flex flex-col items-center justify-between py-3 px-2 bg-surface-deep border-r border-white/5">
          {/* Top navigation */}
          <div className="flex flex-col gap-3 items-center">
            <RailButton
              active={isHub}
              title="Hub"
              onClick={() => navigate('/')}
            >
              42
            </RailButton>

            <RailButton
              active={isChat}
              title="Chat"
              onClick={() => navigate('/chat')}
              badge={totalUnread}
            >
              CH
            </RailButton>

            <RailButton
              active={isForum}
              title="Fórum"
              onClick={() => navigate('/forum')}
            >
              FR
            </RailButton>
          </div>

          {/* Divisória */}
          <div className="w-8 h-px bg-white/5" />

          {/* Plus button (desabilitado) */}
          <button
            disabled
            title="canais — em breve"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-content-primary/50 cursor-not-allowed"
          >
            +
          </button>

          {/* Avatar do usuário */}
          {user && (
            <Avatar login={user.login} imageUrl={user.image_url} size="sm" />
          )}
        </aside>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Contextual header */}
          <header className="h-12 shrink-0 flex items-center border-b border-white/5 bg-surface-chat px-5">
            <h1 className="m-0 text-xs font-mono uppercase tracking-wide text-content-secondary">
              {pageTitle}
            </h1>
          </header>

          {/* Content */}
          <div className="relative flex-1 overflow-hidden">
            <Outlet context={{ setPageTitle }} />
          </div>
        </div>
      </div>
    </div>
  );
}
