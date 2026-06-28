import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';

export function ChatPage() {
  const { messages, status, fetchHistory } = useChatStore();

  useEffect(() => {
    // Carrega histórico inicial (antes do presente)
    fetchHistory(undefined, 50);
  }, [fetchHistory]);

  function handleSend(content: string) {
    // WebSocket send será conectado pelo hook useWebSocket em T014
    // Por ora, emite evento para ser capturado pelo hook
    window.dispatchEvent(new CustomEvent('chat:send', { detail: { content } }));
  }

  return (
    <div className="flex flex-col h-screen bg-[#1B1B1B]">
      {/* Header */}
      <div className="border-b border-[#29292E] px-6 py-3 flex items-center gap-3">
        <span className="text-[#00BABC] font-bold uppercase tracking-wider text-sm">
          42 Chat
        </span>
        <span className="text-[#29292E] text-xs">
          {status === 'connected' ? '● online' : status === 'connecting' ? '○ conectando...' : '○ offline'}
        </span>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={status !== 'connected'}
      />
    </div>
  );
}
