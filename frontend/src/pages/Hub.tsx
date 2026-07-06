import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedUser } from '@/lib/auth';
import { useChatStore } from '@/stores/chatStore';
import { apiFetch } from '@/lib/http';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface RecentThread {
  id: string;
  title: string;
  board_slug: string;
  author_login: string;
  author_image_url?: string;
  last_post_at: string;
}

/**
 * Hub — página inicial autenticada
 * Exibe saudação, atalhos primários (Chat/Fórum), e pulso da comunidade
 */
export function Hub() {
  const navigate = useNavigate();
  const user = getSavedUser();
  const chats = useChatStore((state) => state.chats);

  const [threads, setThreads] = useState<RecentThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch últimas threads na montagem
  useEffect(() => {
    const fetchRecentThreads = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/api/forum/threads/recent?limit=10');
        if (!res.ok) throw new Error('Failed to fetch threads');
        const data = await res.json();
        setThreads(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar threads'
        );
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentThreads();
  }, []);

  // Formata timestamp relativo (ex: "há 2h")
  const formatTimeAgo = (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `há ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays}d`;
  };

  return (
    <div className="min-h-screen bg-surface-base p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Greeting */}
        {user && (
          <div className="flex items-center gap-4">
            <Avatar login={user.login} imageUrl={user.image_url} size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-content-primary">
                <span className="font-mono">~/</span> Olá, {user.login}
              </h1>
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer transition-colors hover:bg-surface-raised"
            onClick={() => navigate('/chat')}
          >
            <div className="text-5xl">💬</div>
            <h2 className="text-lg font-semibold text-content-primary">Chat</h2>
            <p className="text-sm text-content-secondary">Converse em tempo real</p>
          </Card>

          <Card
            className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer transition-colors hover:bg-surface-raised"
            onClick={() => navigate('/forum')}
          >
            <div className="text-5xl">📋</div>
            <h2 className="text-lg font-semibold text-content-primary">Fórum</h2>
            <p className="text-sm text-content-secondary">Discussões e projetos</p>
          </Card>
        </div>

        {/* Pulse of Community */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Threads */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-content-primary">
              Últimas Threads
            </h2>

            {error && (
              <EmptyState
                title="Erro ao carregar threads"
                description={error}
              />
            )}

            {loading && <EmptyState title="Carregando..." />}

            {!loading && !error && threads.length === 0 && (
              <EmptyState
                title="Nenhuma thread recente"
                description="Seja o primeiro a criar uma discussão!"
              />
            )}

            {!loading && !error && threads.length > 0 && (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="cursor-pointer transition-colors hover:bg-surface-raised"
                    onClick={() =>
                      navigate(
                        `/forum/${thread.board_slug}/thread/${thread.id}`
                      )
                    }
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        login={thread.author_login}
                        imageUrl={thread.author_image_url}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-content-primary truncate">
                          {thread.title}
                        </h3>
                        <p className="text-xs text-content-secondary">
                          {thread.author_login} em {thread.board_slug}
                        </p>
                        <p className="text-xs text-content-muted">
                          {formatTimeAgo(thread.last_post_at)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Online + Chats */}
          <div className="space-y-6">
            {/* Online Now */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-content-primary">
                Online Agora
              </h2>
              <EmptyState
                title="Entre no chat"
                description="Veja quem está online participando das conversas"
              />
            </section>

            {/* Recent Chats */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-content-primary">
                Chats Recentes
              </h2>

              {chats.length === 0 && (
                <EmptyState
                  title="Nenhum chat"
                  description="Crie ou junte-se a um chat para começar"
                />
              )}

              {chats.length > 0 && (
                <div className="space-y-2">
                  {chats.slice(0, 5).map((chat) => (
                    <Card
                      key={chat.id}
                      className="flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-raised p-3"
                      onClick={() => navigate('/chat')}
                    >
                      <div>
                        <p className="text-sm font-medium text-content-primary">
                          {chat.topic || 'Chat'}
                        </p>
                      </div>
                      {(chat as any).unread_count > 0 && (
                        <Badge
                          variant="error"
                          count={(chat as any).unread_count}
                        />
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
