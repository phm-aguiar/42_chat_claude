import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/api';
import { UserSignature } from './UserSignature';
import { parseEmoticons } from '@/lib/emoticons';

interface MessageListProps {
  messages: Message[];
  contentRenderer?: (content: string) => string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function MessageList({ messages, contentRenderer = parseEmoticons }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-0.5">
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-content-muted text-xs tracking-widest uppercase">
          Nenhuma mensagem ainda
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className="flex items-start gap-2.5 px-5 py-1 transition-colors hover:bg-surface-raised"
        >
          {/* Avatar */}
          <img
            src={msg.image_url || '/assets/default-avatar.png'}
            alt={msg.login}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/default-avatar.png'; }}
            className="w-7 h-7 shrink-0 object-cover grayscale-[30%] mt-0.5"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-accent-primary text-xs font-bold tracking-widest uppercase">
                {msg.login}
              </span>
              <span className="text-content-muted text-xs">
                {formatTime(msg.created_at)}
              </span>
            </div>
            <p className="text-content-primary text-sm leading-relaxed m-0 break-words">
              {contentRenderer(msg.content)}
            </p>
            <UserSignature userID={msg.user_id} />
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
