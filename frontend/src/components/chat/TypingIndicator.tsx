import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';

/**
 * TypingIndicator — Exibe indicadores de digitação em tempo real.
 *
 * Design (ADR-103.4):
 * - Cada indicador expires após 5s do último evento (expiresAt)
 * - Timer local limpa automaticamente via clearTyping
 * - Filtra usuário atual (ignore own typing)
 *
 * Props:
 * @param chatId - UUID do chat (string)
 *
 * Renderização:
 * - Se ninguém digitando: null
 * - 1 pessoa: "@login está digitando..."
 * - N pessoas: "@login1, @login2 estão digitando..."
 */
export function TypingIndicator({ chatId }: { chatId: string }) {
  const typingByChat = useChatStore((s) => s.typingByChat);
  const clearTyping = useChatStore((s) => s.clearTyping);
  const typing = typingByChat[chatId] || [];

  // Limpa automático por expiração
  useEffect(() => {
    const timers = typing
      .filter((t) => Date.now() < t.expiresAt)
      .map((t) => {
        const delay = Math.max(0, t.expiresAt - Date.now());
        return setTimeout(() => {
          clearTyping(chatId, t.login);
        }, delay);
      });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [typing, chatId, clearTyping]);

  // Filtra apenas indicadores ainda válidos
  const active = typing.filter((t) => Date.now() < t.expiresAt);

  if (active.length === 0) return null;

  const logins = active.map((t) => `@${t.login}`).join(', ');
  const text =
    active.length === 1
      ? `${logins} está digitando...`
      : `${logins} estão digitando...`;

  return (
    <div className="px-5 py-2 text-accent-primary text-sm italic min-h-5">
      {text}
    </div>
  );
}
