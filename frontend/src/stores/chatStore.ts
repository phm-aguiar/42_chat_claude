import { create } from 'zustand';
import { getMessages, type Message } from '@/lib/api';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface ChatState {
  messages: Message[];
  status: ConnectionStatus;
  error: string | null;

  // Actions
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  fetchHistory: (before?: string, limit?: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  status: 'idle',
  error: null,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setMessages: (msgs) => set({ messages: msgs }),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  fetchHistory: async (before?: string, limit = 50) => {
    try {
      const msgs = await getMessages(before, limit);
      // Histórico chega DESC (mais recente primeiro), inverter para exibição cronológica
      set((state) => ({
        messages: [...msgs.reverse(), ...state.messages],
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar histórico' });
    }
  },
}));
