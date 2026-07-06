import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Badge } from '@/components/ui/Badge';
import { GENERAL_CHAT_ID } from '@/lib/chatApi';

interface NewChatForm {
  type: 'oneOnOne' | 'group';
  topic?: string;
  members?: string;
}

export default function ChatList() {
  const { chats, activeChat, error, fetchChats, setActiveChat, createChat, clearError } =
    useChatStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewChatForm>({
    type: 'oneOnOne',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  async function handleCreateChat() {
    if (!form.type) return;

    setCreating(true);
    try {
      const input = {
        type: form.type,
        ...(form.topic && { topic: form.topic }),
        ...(form.members &&
          form.members.trim() && {
            members: form.members
              .split(',')
              .map((m) => parseInt(m.trim(), 10))
              .filter((m) => !isNaN(m)),
          }),
      };

      await createChat(input as any);
      setShowForm(false);
      setForm({ type: 'oneOnOne' });
    } finally {
      setCreating(false);
    }
  }

  // Separar chats por tipo
  const generalChat = chats.find((c) => c.type === 'general' || c.id === GENERAL_CHAT_ID);
  const oneOnOneChats = chats.filter((c) => c.type === 'oneOnOne');
  const groupChats = chats.filter((c) => c.type === 'group');

  return (
    <div className="flex flex-col h-full bg-surface-base">
      {/* Main content */}
      <div className="flex-1 overflow-auto py-4 flex flex-col">
        {/* Error message */}
        {error && (
          <div className="bg-status-error text-white px-4 py-3 mb-3 text-xs flex justify-between items-center mx-4">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="bg-transparent border-none text-white cursor-pointer text-base p-0 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chats list */}
        <div className="flex-1 overflow-auto">
          {/* General chat — always at top */}
          {generalChat && (
            <ChatItem
              label="# general"
              isActive={activeChat === generalChat.id}
              unreadCount={(generalChat as any).unread_count ?? 0}
              onClick={() => setActiveChat(generalChat.id)}
            />
          )}

          {/* OneOnOne chats */}
          {oneOnOneChats.length > 0 && (
            <div className="pt-2">
              {oneOnOneChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  label={chat.topic || '💬 1:1'}
                  isActive={activeChat === chat.id}
                  unreadCount={(chat as any).unread_count ?? 0}
                  onClick={() => setActiveChat(chat.id)}
                />
              ))}
            </div>
          )}

          {/* Group chats */}
          {groupChats.length > 0 && (
            <div className="pt-2">
              {groupChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  label={`👥 ${chat.topic || 'Grupo'}`}
                  isActive={activeChat === chat.id}
                  unreadCount={(chat as any).unread_count ?? 0}
                  onClick={() => setActiveChat(chat.id)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {chats.length === 0 && (
            <div className="text-content-muted text-sm text-center py-6 px-5">
              Nenhuma conversa disponível
            </div>
          )}
        </div>
      </div>

      {/* New Chat Button + Form */}
      <div className="px-4 py-4 border-t border-surface-raised shrink-0">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-accent-primary text-surface-base border-none py-2.5 px-4 text-xs font-bold tracking-widest uppercase cursor-pointer transition-colors hover:bg-accent-secondary"
          >
            + Nova Conversa
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-3 bg-surface-panel border border-surface-raised">
            {/* Type selector */}
            <div className="flex gap-2">
              <label className="flex-1 flex items-center gap-1.5 cursor-pointer text-xs text-content-primary">
                <input
                  type="radio"
                  value="oneOnOne"
                  checked={form.type === 'oneOnOne'}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as 'oneOnOne' | 'group',
                    }))
                  }
                  className="cursor-pointer"
                />
                1:1
              </label>
              <label className="flex-1 flex items-center gap-1.5 cursor-pointer text-xs text-content-primary">
                <input
                  type="radio"
                  value="group"
                  checked={form.type === 'group'}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as 'oneOnOne' | 'group',
                    }))
                  }
                  className="cursor-pointer"
                />
                Grupo
              </label>
            </div>

            {/* Members input (for both types) */}
            <input
              type="text"
              placeholder="IDs de usuários (separados por vírgula)"
              value={form.members || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, members: e.target.value }))}
              className="px-3 py-2 bg-surface-base border border-surface-raised text-content-primary text-xs focus:border-accent-primary focus:outline-none transition-colors"
            />

            {/* Topic input (only for groups) */}
            {form.type === 'group' && (
              <input
                type="text"
                placeholder="Tópico (opcional)"
                value={form.topic || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                className="px-3 py-2 bg-surface-base border border-surface-raised text-content-primary text-xs focus:border-accent-primary focus:outline-none transition-colors"
              />
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCreateChat}
                disabled={creating}
                className="flex-1 bg-status-success text-surface-base border-none py-2 text-xs font-bold uppercase cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-accent-secondary"
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({ type: 'oneOnOne' });
                }}
                className="flex-1 bg-surface-raised text-content-primary border border-surface-raised py-2 text-xs font-bold uppercase cursor-pointer transition-colors hover:border-accent-primary hover:text-accent-primary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ChatItem — renderiza um item da lista de chats com badge de não lidas
 */
interface ChatItemProps {
  label: string;
  isActive: boolean;
  unreadCount: number;
  onClick: () => void;
}

function ChatItem({ label, isActive, unreadCount, onClick }: ChatItemProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-between px-4 py-3 cursor-pointer border-l-[3px] transition-all select-none ${
        isActive
          ? 'border-l-accent-primary bg-surface-panel text-accent-primary font-bold'
          : 'border-l-transparent bg-transparent text-content-primary font-normal hover:bg-surface-panel hover:text-content-secondary'
      }`}
    >
      <span className="text-sm truncate">{label}</span>
      {unreadCount > 0 && (
        <Badge variant="error" count={unreadCount} className="ml-2 shrink-0" />
      )}
    </div>
  );
}
