import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000]; // ms, cap 16s

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const lastTimestampRef = useRef<string | undefined>(undefined);
  const { addMessage, setStatus, setError, fetchHistory } = useChatStore();

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setError('Token de autenticação não encontrado');
      return;
    }

    setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
      setStatus('connected');
      setError(null);
      // Carrega histórico desde a última mensagem recebida
      fetchHistory(lastTimestampRef.current, 50);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
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
      setStatus('error');
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus('idle');

      // Backoff exponencial: [1000, 2000, 4000, 8000, 16000] ms
      const delay = BACKOFF_DELAYS[Math.min(attemptRef.current, BACKOFF_DELAYS.length - 1)];
      attemptRef.current += 1;

      setTimeout(() => {
        connect();
      }, delay);
    };
  }, [addMessage, setStatus, setError, fetchHistory]);

  useEffect(() => {
    connect();

    // Listener para envio de mensagens via CustomEvent (de Chat.tsx)
    function handleSend(e: Event) {
      const { content } = (e as CustomEvent<{ content: string }>).detail;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'message', content }));
      }
    }

    window.addEventListener('chat:send', handleSend);

    return () => {
      window.removeEventListener('chat:send', handleSend);
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    status: useChatStore((s) => s.status),
  };
}
