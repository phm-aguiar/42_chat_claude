import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { clearToken } from '@/lib/auth';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { OnlineSidebar } from '@/components/chat/OnlineSidebar';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { parseEmoticons } from '@/lib/emoticons';
import { useWebSocket } from '@/hooks/useWebSocket';
import { GENERAL_CHAT_ID } from '@/lib/chatApi';

import ChatList from '@/pages/chat/ChatList';

export function ChatPage() {
  const {
    messages,
    status,
    fetchHistory,
    activeChat,
    fetchHistoryForChat,
  } = useChatStore();
  const { sendTyping } = useWebSocket();
  const [loadedChats, setLoadedChats] = useState<Set<string>>(new Set([GENERAL_CHAT_ID]));

  // Feature 103: carregar histórico do chat ativo na primeira vez
  useEffect(() => {
    if (!loadedChats.has(activeChat)) {
      fetchHistoryForChat(activeChat, undefined, 50);
      setLoadedChats((prev) => new Set([...prev, activeChat]));
    }
  }, [activeChat, fetchHistoryForChat, loadedChats]);

  // Feature 100: histórico inicial do "general" chat
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

  function handleInputChange(value: string) {
    // Dispara sendTyping() com debounce 1s (via useWebSocket)
    if (value.length > 0) {
      sendTyping();
    }
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
        {/* Sidebar: Chat List + Online Users */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '240px', borderRight: '1px solid #29292E', overflow: 'hidden' }}>
          {/* ChatList (Feature 103) */}
          <ChatList />
          {/* OnlineSidebar (Feature 100) */}
          <div style={{ flex: 1, overflow: 'auto', borderTop: '1px solid #29292E' }}>
            <OnlineSidebar />
          </div>
        </div>

        {/* Main: Message List + Input */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <MessageList messages={messages} contentRenderer={parseEmoticons} />
          {/* Typing Indicator (Feature 103) */}
          <TypingIndicator chatId={activeChat} />
          {/* Input */}
          <MessageInput
            onSend={handleSend}
            disabled={status !== 'connected'}
            onInputChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}
