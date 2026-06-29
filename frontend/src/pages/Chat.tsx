import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { clearToken } from '@/lib/auth';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { OnlineSidebar } from '@/components/chat/OnlineSidebar';
import { useWebSocket } from '@/hooks/useWebSocket';

export function ChatPage() {
  const { messages, status, fetchHistory } = useChatStore();
  useWebSocket();

  useEffect(() => {
    fetchHistory(undefined, 50);
  }, [fetchHistory]);

  function handleSend(content: string) {
    window.dispatchEvent(new CustomEvent('chat:send', { detail: { content } }));
  }

  function handleLogout() {
    clearToken();
    window.location.replace('/');
  }

  const statusLabel =
    status === 'connected' ? '● online'
    : status === 'connecting' ? '○ conectando'
    : '○ offline';

  const statusColor =
    status === 'connected' ? '#2DD57A'
    : status === 'connecting' ? '#00BABC'
    : '#EC3391';

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1B1B1B',
        fontFamily: '"Futura PT", ui-sans-serif, system-ui',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          height: '48px',
          background: '#202026',
          borderBottom: '1px solid #29292E',
          flexShrink: 0,
          gap: '16px',
        }}
      >
        <span style={{ color: '#00BABC', fontWeight: 700, fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          42 Chat
        </span>
        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>
        <span style={{ color: '#29292E', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          #general
        </span>
        <span style={{ marginLeft: 'auto', color: statusColor, fontSize: '11px', letterSpacing: '0.08em' }}>
          {statusLabel}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid #29292E',
            color: '#29292E',
            fontSize: '10px',
            padding: '4px 10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#FFFFFF';
            (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#29292E';
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          Sair
        </button>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <OnlineSidebar />

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <MessageList messages={messages} />
          <MessageInput onSend={handleSend} disabled={status !== 'connected'} />
        </div>
      </div>
    </div>
  );
}
