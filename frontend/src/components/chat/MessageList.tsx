import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/api';
import { UserAvatar } from './UserAvatar';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#29292E]">
        Nenhuma mensagem ainda
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-3 items-start">
          <UserAvatar login={msg.login} imageUrl={msg.image_url} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[#00BABC] text-sm font-bold uppercase">
                {msg.login}
              </span>
              <span className="text-[#29292E] text-xs">
                {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-[#FFFFFF] text-sm break-words">{msg.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
