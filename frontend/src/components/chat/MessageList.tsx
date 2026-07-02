import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/api';
import { UserSignature } from './UserSignature';

interface MessageListProps {
  messages: Message[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#29292E',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Nenhuma mensagem ainda
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '4px 20px',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Avatar */}
          <img
            src={msg.image_url || '/assets/default-avatar.png'}
            alt={msg.login}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/default-avatar.png'; }}
            style={{
              width: '28px',
              height: '28px',
              flexShrink: 0,
              objectFit: 'cover',
              filter: 'grayscale(30%)',
              marginTop: '2px',
            }}
          />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
              <span
                style={{
                  color: '#00BABC',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {msg.login}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
                {formatTime(msg.created_at)}
              </span>
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '13px',
                lineHeight: '1.5',
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </p>
            <UserSignature userID={msg.user_id} />
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
