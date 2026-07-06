import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSavedUser } from '@/lib/auth';
import { useChatStore } from '@/stores/chatStore';

/**
 * AppShell é o layout autenticado com sidebar + header + conteúdo.
 * - Sidebar fixa à esquerda: links (Hub, Chat, Fórum) + avatar do usuário
 * - Badge com unread count no ícone Chat
 * - Header contextual no topo
 * - Outlet para o conteúdo
 */
export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSavedUser();
  const chats = useChatStore((state) => state.chats);

  // Calcular total de não-lidas (soma defensiva: unread_count ?? 0)
  const totalUnread = chats.reduce((sum, chat) => {
    return sum + ((chat as any).unread_count ?? 0);
  }, 0);

  // Determinar qual seção está ativa baseado na URL
  const isHub = location.pathname === '/';
  const isChat = location.pathname.startsWith('/chat');
  const isForum = location.pathname.startsWith('/forum');

  const [pageTitle, setPageTitle] = useState('42 Chat');

  // Permitir que páginas filhas atualizem o título via context ou localStorage
  // (implementação simples: páginas podem usar um state global ou context)
  useEffect(() => {
    // Padrão: detectar pela URL
    if (isHub) setPageTitle('Hub');
    else if (isChat) setPageTitle('Chat');
    else if (isForum) setPageTitle('Fórum');
  }, [location.pathname, isHub, isChat, isForum]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-black)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '64px',
          background: 'var(--color-near-black)',
          borderRight: '1px solid var(--color-dark-gray)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: '16px',
          flexShrink: 0,
        }}
      >
        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Hub */}
          <button
            onClick={() => navigate('/')}
            style={{
              width: '48px',
              height: '48px',
              border: 'none',
              background: isHub ? 'var(--color-teal)' : 'transparent',
              color: isHub ? 'var(--color-black)' : 'var(--color-dark-gray)',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: 'bold',
            }}
            title="Hub"
          >
            ⌂
          </button>

          {/* Chat with Badge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => navigate('/chat')}
              style={{
                width: '48px',
                height: '48px',
                border: 'none',
                background: isChat ? 'var(--color-teal)' : 'transparent',
                color: isChat ? 'var(--color-black)' : 'var(--color-dark-gray)',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                fontWeight: 'bold',
              }}
              title="Chat"
            >
              💬
            </button>
            {totalUnread > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--color-pink)',
                  color: 'var(--color-white)',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  minWidth: '20px',
                }}
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </div>
            )}
          </div>

          {/* Forum */}
          <button
            onClick={() => navigate('/forum')}
            style={{
              width: '48px',
              height: '48px',
              border: 'none',
              background: isForum ? 'var(--color-teal)' : 'transparent',
              color: isForum ? 'var(--color-black)' : 'var(--color-dark-gray)',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: 'bold',
            }}
            title="Fórum"
          >
            📋
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Avatar */}
        {user && (
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--color-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--color-teal)',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '4px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                'var(--color-teal)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                'var(--color-navy)')
            }
            title={user.login}
          >
            {user.login.substring(0, 2).toUpperCase()}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header
          style={{
            background: 'var(--color-near-black)',
            borderBottom: '1px solid var(--color-dark-gray)',
            padding: '0 20px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '400',
              color: 'var(--color-dark-gray)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {pageTitle}
          </h1>
        </header>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            background: 'var(--color-black)',
            position: 'relative',
          }}
        >
          <Outlet context={{ setPageTitle }} />
        </div>
      </div>
    </div>
  );
}
