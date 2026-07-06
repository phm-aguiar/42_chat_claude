import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { OnlineSidebar } from '@/components/chat/OnlineSidebar';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { parseEmoticons } from '@/lib/emoticons';
import { useWebSocket } from '@/hooks/useWebSocket';
import { GENERAL_CHAT_ID } from '@/lib/chatApi';

import ChatList from '@/pages/chat/ChatList';

interface OutletContextType {
  setPageTitle: (title: string) => void;
}

export function ChatPage() {
  const { setPageTitle } = useOutletContext<OutletContextType>();

  const {
    messages,
    status,
    fetchHistory,
    activeChat,
    fetchHistoryForChat,
    chats,
    markRead,
  } = useChatStore();
  const { sendTyping } = useWebSocket();
  const [loadedChats, setLoadedChats] = useState<Set<string>>(new Set([GENERAL_CHAT_ID]));

  // Feature 105: setar título da página baseado no chat ativo
  useEffect(() => {
    const activeChat_ = chats.find((c) => c.id === activeChat);
    if (activeChat_?.type === 'general') {
      setPageTitle('Chat');
    } else if (activeChat_?.type === 'oneOnOne') {
      setPageTitle(activeChat_?.topic || '💬 1:1');
    } else {
      setPageTitle(activeChat_?.topic || 'Chat');
    }
  }, [activeChat, chats, setPageTitle]);

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

  // Feature 105: marcar como lido ao abrir um chat (DT-08)
  useEffect(() => {
    markRead(activeChat);
  }, [activeChat, markRead]);

  function handleSend(content: string) {
    window.dispatchEvent(new CustomEvent('chat:send', { detail: { content } }));
  }

  function handleInputChange(value: string) {
    // Dispara sendTyping() com debounce 1s (via useWebSocket)
    if (value.length > 0) {
      sendTyping();
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-base">
      {/* Body: Sidebar (ChatList) + Main (Messages) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Chat List + Online Users */}
        <div className="flex flex-col w-60 border-r border-surface-raised overflow-hidden">
          {/* ChatList (Feature 103) */}
          <ChatList />
          {/* OnlineSidebar (Feature 100) */}
          <div className="flex-1 overflow-auto border-t border-surface-raised">
            <OnlineSidebar />
          </div>
        </div>

        {/* Main: Message List + Input */}
        <div className="flex flex-col flex-1 overflow-hidden">
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
