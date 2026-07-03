import { create } from 'zustand';
import {
  type Board,
  type Thread,
  type Post,
  fetchBoards,
  fetchBoard,
  fetchThreads,
  fetchThread,
  fetchPosts,
  createThread,
  createPost,
  patchThread,
  deleteThread,
  deletePost,
} from '@/lib/forumApi';

/**
 * ForumState contém todo o estado do fórum.
 * Segue o padrão do chatStore: loading/error são globais, ações setam silenciosamente em caso de erro.
 */
interface ForumState {
  boards: Board[];
  threads: Thread[];
  posts: Post[];
  currentBoard: Board | null;
  currentThread: Thread | null;
  loading: boolean;
  error: string | null;

  // Ações
  fetchBoards: () => Promise<void>;
  fetchThreads: (slug: string, limit?: number, offset?: number) => Promise<void>;
  fetchThread: (id: string) => Promise<void>;
  fetchPosts: (threadId: string) => Promise<void>;
  createThread: (slug: string, input: { title: string; content: string; tags: string[] }) => Promise<void>;
  createPost: (threadId: string, input: { content: string; reply_to?: string | null }) => Promise<void>;
  patchThread: (id: string, partial: Partial<Thread>) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useForumStore = create<ForumState>((set) => ({
  boards: [],
  threads: [],
  posts: [],
  currentBoard: null,
  currentThread: null,
  loading: false,
  error: null,

  /**
   * Busca todos os boards.
   */
  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchBoards();
      set({ boards: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar boards',
        loading: false,
      });
    }
  },

  /**
   * Busca threads de um board por slug.
   * Define currentBoard e threads.
   */
  fetchThreads: async (slug, limit, offset) => {
    set({ loading: true, error: null });
    try {
      const board = await fetchBoard(slug);
      const data = await fetchThreads(slug, limit, offset);
      set({
        currentBoard: board,
        threads: data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar threads',
        loading: false,
      });
    }
  },

  /**
   * Busca um thread específico pelo ID.
   * Define currentThread e currentBoard (se disponível via context).
   */
  fetchThread: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchThread(id);
      set({
        currentThread: data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar thread',
        loading: false,
      });
    }
  },

  /**
   * Busca posts de um thread.
   */
  fetchPosts: async (threadId) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPosts(threadId);
      set({ posts: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar posts',
        loading: false,
      });
    }
  },

  /**
   * Cria um novo thread em um board.
   * Atualiza threads e retorna a ação ao componente se precisar do novo thread.
   */
  createThread: async (slug, input) => {
    set({ loading: true, error: null });
    try {
      const newThread = await createThread(slug, input);
      set((state) => ({
        threads: [newThread, ...state.threads],
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao criar thread',
        loading: false,
      });
    }
  },

  /**
   * Cria um novo post em um thread.
   * Atualiza posts e incrementa post_count do thread atual.
   */
  createPost: async (threadId, input) => {
    set({ loading: true, error: null });
    try {
      const newPost = await createPost(threadId, input);
      set((state) => ({
        posts: [...state.posts, newPost],
        currentThread: state.currentThread
          ? { ...state.currentThread, post_count: state.currentThread.post_count + 1 }
          : null,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao criar post',
        loading: false,
      });
    }
  },

  /**
   * Atualiza um thread (pin/lock/etc).
   */
  patchThread: async (id, partial) => {
    set({ loading: true, error: null });
    try {
      const updated = await patchThread(id, partial);
      set((state) => ({
        currentThread: state.currentThread && state.currentThread.id === id ? updated : state.currentThread,
        threads: state.threads.map((t) => (t.id === id ? updated : t)),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao atualizar thread',
        loading: false,
      });
    }
  },

  /**
   * Deleta um thread (soft delete).
   */
  deleteThread: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteThread(id);
      set((state) => ({
        threads: state.threads.filter((t) => t.id !== id),
        currentThread: state.currentThread?.id === id ? null : state.currentThread,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao deletar thread',
        loading: false,
      });
    }
  },

  /**
   * Deleta um post (soft delete).
   */
  deletePost: async (id) => {
    set({ loading: true, error: null });
    try {
      await deletePost(id);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao deletar post',
        loading: false,
      });
    }
  },

  /**
   * Limpa o erro do estado.
   */
  clearError: () => set({ error: null }),
}));
