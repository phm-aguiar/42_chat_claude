import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
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
        <span
          style={{
            color: '#00BABC',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          42 Chat
        </span>
        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>
        <span
          style={{
            color: '#29292E',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Conversations
        </span>
      </header>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#EC3391',
              color: '#FFFFFF',
              padding: '12px 16px',
              marginBottom: '12px',
              fontSize: '12px',
              marginLeft: '16px',
              marginRight: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                marginLeft: '16px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Chats list */}
        {(
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* General chat — always at top */}
            {generalChat && (
              <ChatItem
                label="# general"
                isActive={activeChat === generalChat.id}
                onClick={() => setActiveChat(generalChat.id)}
              />
            )}

            {/* OneOnOne chats */}
            {oneOnOneChats.length > 0 && (
              <div style={{ paddingTop: '8px' }}>
                {oneOnOneChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    label={chat.topic || '💬 1:1'}
                    isActive={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                  />
                ))}
              </div>
            )}

            {/* Group chats */}
            {groupChats.length > 0 && (
              <div style={{ paddingTop: '8px' }}>
                {groupChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    label={`👥 ${chat.topic || 'Grupo'}`}
                    isActive={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {chats.length === 0 && (
              <div
                style={{
                  color: '#29292E',
                  fontSize: '13px',
                  textAlign: 'center',
                  padding: '24px 20px',
                }}
              >
                Nenhuma conversa disponível
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Chat Button + Form */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #29292E',
          flexShrink: 0,
        }}
      >
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              backgroundColor: '#00BABC',
              color: '#1B1B1B',
              border: 'none',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: '"Futura PT", ui-sans-serif, system-ui',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#04809F';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00BABC';
            }}
          >
            + Nova Conversa
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#202026',
              border: '1px solid #29292E',
            }}
          >
            {/* Type selector */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#E3E3E3',
                }}
              >
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
                  style={{ cursor: 'pointer' }}
                />
                1:1
              </label>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#E3E3E3',
                }}
              >
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
                  style={{ cursor: 'pointer' }}
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
              style={{
                padding: '8px 12px',
                backgroundColor: '#1B1B1B',
                border: '1px solid #29292E',
                color: '#E3E3E3',
                fontSize: '12px',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = '#00BABC';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = '#29292E';
              }}
            />

            {/* Topic input (only for groups) */}
            {form.type === 'group' && (
              <input
                type="text"
                placeholder="Tópico (opcional)"
                value={form.topic || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1B1B1B',
                  border: '1px solid #29292E',
                  color: '#E3E3E3',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = '#00BABC';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = '#29292E';
                }}
              />
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreateChat}
                disabled={creating}
                style={{
                  flex: 1,
                  backgroundColor: '#2DD57A',
                  color: '#1B1B1B',
                  border: 'none',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  opacity: creating ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!creating) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1fa050';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!creating) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2DD57A';
                  }
                }}
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({ type: 'oneOnOne' });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#29292E',
                  color: '#E3E3E3',
                  border: '1px solid #29292E',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#00BABC';
                  (e.currentTarget as HTMLButtonElement).style.color = '#00BABC';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#29292E';
                  (e.currentTarget as HTMLButtonElement).style.color = '#E3E3E3';
                }}
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
 * ChatItem — renderiza um item da lista de chats
 */
interface ChatItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ChatItem({ label, isActive, onClick }: ChatItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isActive ? '#00BABC' : 'transparent'}`,
        backgroundColor: isActive ? '#202026' : 'transparent',
        color: isActive ? '#00BABC' : '#E3E3E3',
        fontSize: '13px',
        fontWeight: isActive ? 700 : 400,
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        if (!isActive) {
          el.style.backgroundColor = '#202026';
          el.style.color = '#FFFFFF';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        if (!isActive) {
          el.style.backgroundColor = 'transparent';
          el.style.color = '#E3E3E3';
        }
      }}
    >
      {label}
    </div>
  );
}
