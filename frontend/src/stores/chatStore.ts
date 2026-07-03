import { create } from 'zustand';
import { getMessages } from '@/lib/api';
import { fetchUserStats, type UserStats } from '@/lib/statsApi';
import {
  GENERAL_CHAT_ID,
  type Chat,
  type Message,
  fetchChats as fetchChatsAPI,
  fetchMessages as fetchMessagesAPI,
  createChat as createChatAPI,
} from '@/lib/chatApi';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface TypingIndicator {
  login: string;
  expiresAt: number;
}

interface ChatState {
  // Feature 100 backward compat: messages array linked to activeChat
  messages: Message[];
  status: ConnectionStatus;
  error: string | null;
  statsCache: Record<number, UserStats>;

  // Feature 103: multi-chat support
  chats: Chat[];
  activeChat: string; // chat_id
  messagesByChat: Record<string, Message[]>;
  typingByChat: Record<string, TypingIndicator[]>;
  hasMoreByChat: Record<string, boolean>;
  nextBeforeByChat: Record<string, string | undefined>;

  // Actions: Feature 100
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  fetchHistory: (before?: string, limit?: number) => Promise<void>;
  fetchStats: (userID: number) => Promise<void>;
  invalidateStats: (userID: number) => void;

  // Actions: Feature 103
  fetchChats: () => Promise<void>;
  setActiveChat: (chatId: string) => void;
  fetchHistoryForChat: (chatId: string, before?: string, limit?: number) => Promise<void>;
  createChat: (input: { type: 'oneOnOne' | 'group'; topic?: string; members?: number[] }) => Promise<void>;
  setTyping: (chatId: string, login: string, expiresAt?: number) => void;
  clearTyping: (chatId: string, login: string) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Feature 100 state
  messages: [],
  status: 'idle',
  error: null,
  statsCache: {},

  // Feature 103 state
  chats: [],
  activeChat: GENERAL_CHAT_ID,
  messagesByChat: { [GENERAL_CHAT_ID]: [] },
  typingByChat: {},
  hasMoreByChat: {},
  nextBeforeByChat: {},

  // Feature 100 actions
  addMessage: (msg) =>
    set((state) => {
      const chatId = msg.chat_id || GENERAL_CHAT_ID;

      // Dedup: verificar se a mensagem já existe neste chat
      const chatMessages = state.messagesByChat[chatId] || [];
      const exists = chatMessages.some((m) => m.id === msg.id);
      if (exists) return state; // já existe, não adiciona

      const updated = {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...chatMessages, msg],
        },
      };

      // Backward compat: manter messages sincronizado com activeChat
      if (chatId === state.activeChat) {
        updated.messages = [...updated.messagesByChat[chatId]];
      }

      return updated;
    }),

  setMessages: (msgs) =>
    set((state) => {
      const newMessagesByChat = {
        ...state.messagesByChat,
        [state.activeChat]: msgs,
      };
      return {
        messages: msgs,
        messagesByChat: newMessagesByChat,
      };
    }),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  // Feature 100: busca histórico do "general" chat
  fetchHistory: async (before?: string, limit = 50) => {
    try {
      const legacyMsgs = await getMessages(before, limit);
      // Converter LegacyMessage para Message (adicionar chat_id)
      const msgs: Message[] = legacyMsgs.map((m) => ({
        ...m,
        chat_id: GENERAL_CHAT_ID,
      }));
      // Histórico chega DESC (mais recente primeiro), inverter para exibição cronológica
      set((state) => {
        const chatId = GENERAL_CHAT_ID;
        const chatMessages = state.messagesByChat[chatId] || [];

        // Dedup: remover mensagens que já existem antes de prepend
        const newMsgs = msgs.reverse().filter((m) => !chatMessages.some((x) => x.id === m.id));

        const updated = {
          ...state,
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: [...newMsgs, ...chatMessages],
          },
        };

        // Backward compat
        if (chatId === state.activeChat) {
          updated.messages = updated.messagesByChat[chatId];
        }

        return updated;
      });
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

  // Feature 103 actions
  fetchChats: async () => {
    set({ error: null });
    try {
      const data = await fetchChatsAPI();
      set({ chats: data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar chats' });
    }
  },

  setActiveChat: (chatId: string) => {
    set((state) => {
      const messages = state.messagesByChat[chatId] || [];
      return {
        activeChat: chatId,
        messages, // backward compat
      };
    });
  },

  fetchHistoryForChat: async (chatId: string, before?: string, limit = 50) => {
    set({ error: null });
    try {
      const response = await fetchMessagesAPI(chatId, before, limit);
      set((state) => {
        const chatMessages = state.messagesByChat[chatId] || [];

        // Dedup: remover mensagens que já existem
        const newMsgs = response.messages.filter((m) => !chatMessages.some((x) => x.id === m.id));

        const newMessagesByChat = {
          ...state.messagesByChat,
          [chatId]: [...newMsgs, ...chatMessages],
        };

        const updated: Partial<ChatState> = {
          messagesByChat: newMessagesByChat,
          hasMoreByChat: {
            ...state.hasMoreByChat,
            [chatId]: response.has_more,
          },
          nextBeforeByChat: {
            ...state.nextBeforeByChat,
            [chatId]: response.next_before,
          },
        };

        // Backward compat: se for o activeChat, atualizar messages
        if (chatId === state.activeChat) {
          updated.messages = newMessagesByChat[chatId];
        }

        return updated;
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar mensagens' });
    }
  },

  createChat: async (input) => {
    set({ error: null });
    try {
      const newChat = await createChatAPI(input);
      set((state) => ({
        chats: [...state.chats, newChat],
        activeChat: newChat.id,
        messages: [],
        messagesByChat: {
          ...state.messagesByChat,
          [newChat.id]: [],
        },
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao criar chat' });
    }
  },

  setTyping: (chatId: string, login: string, expiresAt?: number) => {
    set((state) => {
      const typing = state.typingByChat[chatId] || [];
      // Remover se já existe (para atualizar expiration time)
      const filtered = typing.filter((t) => t.login !== login);
      const expiry = expiresAt || Date.now() + 5000; // 5s padrão
      return {
        typingByChat: {
          ...state.typingByChat,
          [chatId]: [...filtered, { login, expiresAt: expiry }],
        },
      };
    });
  },

  clearTyping: (chatId: string, login: string) => {
    set((state) => {
      const typing = state.typingByChat[chatId] || [];
      return {
        typingByChat: {
          ...state.typingByChat,
          [chatId]: typing.filter((t) => t.login !== login),
        },
      };
    });
  },

  clearError: () => set({ error: null }),
}));
