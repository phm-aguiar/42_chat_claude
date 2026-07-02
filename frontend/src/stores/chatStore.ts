import { create } from 'zustand';
import { getMessages, type Message } from '@/lib/api';
import { fetchUserStats, type UserStats } from '@/lib/statsApi';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface ChatState {
  messages: Message[];
  status: ConnectionStatus;
  error: string | null;
  statsCache: Record<number, UserStats>;

  // Actions
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  fetchHistory: (before?: string, limit?: number) => Promise<void>;
  fetchStats: (userID: number) => Promise<void>;
  invalidateStats: (userID: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  status: 'idle',
  error: null,
  statsCache: {},

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

  fetchStats: async (userID) => {
    try {
      const data = await fetchUserStats(userID);
      set((state) => ({
        statsCache: { ...state.statsCache, [userID]: data },
      }));
    } catch (e) {
      // silencioso: mantém último estado conhecido (resiliência WS)
    }
  },

  invalidateStats: (userID) => {
    set((state) => {
      const next = { ...state.statsCache };
      delete next[userID];
      return { statsCache: next };
    });
  },
}));
