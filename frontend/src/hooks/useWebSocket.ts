import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { GENERAL_CHAT_ID } from '@/lib/chatApi';
import { getValidToken, getSavedUser } from '@/lib/auth';

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000]; // ms, cap 16s
const TYPING_DEBOUNCE_MS = 1000; // 1s debounce (ADR-103.4)

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const lastTimestampRef = useRef<string | undefined>(undefined);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  const {
    addMessage,
    setStatus,
    setError,
    fetchHistory,
    activeChat,
    setTyping,
    bumpUnread,
  } = useChatStore();

  /**
   * sendTyping — Emite evento de digitação com debounce 1s (ADR-103.4).
   * Não emitir mais de 1x/s mesmo se usuário continua digitando.
   */
  const sendTyping = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTyping = now - lastTypingSentRef.current;

    // Se menos de 1s, agendar envio no futuro
    if (timeSinceLastTyping < TYPING_DEBOUNCE_MS) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'typing', chat_id: activeChat }));
          lastTypingSentRef.current = Date.now();
        }
      }, TYPING_DEBOUNCE_MS - timeSinceLastTyping);
      return;
    }

    // Pode enviar agora
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', chat_id: activeChat }));
      lastTypingSentRef.current = now;
    }
  }, [activeChat]);

  const connect = useCallback(() => {
    const token = getValidToken();
    if (!token) {
      setStatus('error');
      setError('Token de autenticação não encontrado');
      return;
    }

    setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // ADR-103.5: incluir chat_id se não for GENERAL (backward compat)
    const chatParam =
      activeChat !== GENERAL_CHAT_ID ? `&chat_id=${encodeURIComponent(activeChat)}` : '';
    const url = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}${chatParam}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // Socket antigo (troca de chat durante o handshake) — descarta
      if (wsRef.current !== ws) {
        ws.close();
        return;
      }
      attemptRef.current = 0;
      setStatus('connected');
      setError(null);
      // Carrega histórico desde a última mensagem recebida
      fetchHistory(lastTimestampRef.current, 50);
      // Re-fetch user stats after reconnection
      const store = useChatStore.getState();
      Object.keys(store.statsCache).forEach((uid) => {
        store.fetchStats(Number(uid));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Handle user_stats_changed event
        if (msg.type === 'user_stats_changed') {
          const store = useChatStore.getState();
          store.invalidateStats(msg.user_id);
          store.fetchStats(msg.user_id);
          return;
        }

        // Handle chat_activity event (Feature 105: mark unread if not viewing this chat)
        if (msg.type === 'chat_activity') {
          if (msg.chat_id && msg.chat_id !== activeChat) {
            bumpUnread(msg.chat_id);
          }
          return;
        }

        // Handle typing indicator (ADR-103.4)
        if (msg.type === 'typing') {
          // Ignore próprio usuário digitando (opcional, mas recomendado)
          const currentUser = getSavedUser();
          if (msg.login && msg.login !== currentUser?.login) {
            setTyping(msg.chat_id, msg.login);
          }
          return;
        }

        // Mensagens de chat têm 'id' — eventos de sistema (join/leave) não
        if (msg.id) {
          addMessage(msg);
          lastTimestampRef.current = msg.created_at;
        }
      } catch {
        // mensagem malformada — ignorar
      }
    };

    ws.onerror = () => {
      if (wsRef.current === ws) setStatus('error');
    };

    ws.onclose = () => {
      // DT-01: só reconecta se ESTE socket ainda é o ativo. Fechamento
      // intencional (troca de chat/unmount) zera wsRef antes do close —
      // sem este guard, o timer de backoff reabria a conexão com o
      // activeChat antigo (stale closure) e sobrescrevia wsRef, mandando
      // as mensagens para a room errada (general).
      if (wsRef.current !== ws) return;
      wsRef.current = null;
      setStatus('idle');

      // Backoff exponencial: [1000, 2000, 4000, 8000, 16000] ms
      const delay = BACKOFF_DELAYS[Math.min(attemptRef.current, BACKOFF_DELAYS.length - 1)];
      attemptRef.current += 1;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [activeChat, addMessage, setStatus, setError, fetchHistory, setTyping, bumpUnread]);

  useEffect(() => {
    connect();

    // Listener para envio de mensagens via CustomEvent (de Chat.tsx)
    function handleSend(e: Event) {
      const { content } = (e as CustomEvent<{ content: string }>).detail;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'message', content, chat_id: activeChat }));
      }
    }

    window.addEventListener('chat:send', handleSend);

    return () => {
      window.removeEventListener('chat:send', handleSend);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      // Fechamento intencional: zera wsRef ANTES do close para o guard
      // do onclose não agendar reconexão com closure antiga (DT-01)
      const ws = wsRef.current;
      wsRef.current = null;
      ws?.close();
    };
  }, [connect, activeChat]);

  return {
    status: useChatStore((s) => s.status),
    sendTyping,
  };
}
