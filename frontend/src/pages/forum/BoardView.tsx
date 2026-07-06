import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useForumStore } from '@/stores/forumStore';
import { ThreadRow } from '@/components/forum/ThreadRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface BoardViewProps {
  slug: string;
}

export function BoardView({ slug }: BoardViewProps) {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();
  const { currentBoard, threads, loading, error, fetchThreads, clearError } = useForumStore();

  // Fetch threads when slug changes
  useEffect(() => {
    fetchThreads(slug);
  }, [slug, fetchThreads]);

  // Update page title when board loads
  useEffect(() => {
    if (currentBoard) {
      setPageTitle(currentBoard.name);
    }
  }, [currentBoard, setPageTitle]);

  function handleThreadClick(threadId: string) {
    navigate(`/forum/${slug}/thread/${threadId}`);
  }

  function handleNewThread() {
    navigate(`/forum/${slug}/new`);
  }

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Error message */}
      {error && (
        <div className="bg-status-error text-content-primary px-5 py-3 text-xs flex items-center justify-between gap-4 flex-shrink-0">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="bg-transparent border-0 text-content-primary cursor-pointer text-sm p-0 ml-auto hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sticky toolbar */}
      <div className="bg-surface-panel border-b border-surface-raised px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/forum')}
            className="text-content-muted hover:text-content-primary"
          >
            ← Voltar
          </Button>
          <span className="text-content-muted text-xs">—</span>
          <span className="text-content-primary text-sm font-normal uppercase tracking-tight">
            {currentBoard?.name || 'Carregando...'}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNewThread}
        >
          Nova Thread
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-5">
        {/* Loading state */}
        {loading && !threads.length && (
          <EmptyState
            icon="⏳"
            title="Carregando threads..."
            description="Aguarde um momento"
          />
        )}

        {/* Threads List */}
        {!loading && threads.length > 0 && (
          <div className="flex flex-col gap-3 max-w-4xl">
            {threads.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                onClick={() => handleThreadClick(thread.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && threads.length === 0 && !error && (
          <EmptyState
            icon="💬"
            title="Nenhuma thread ainda"
            description="Seja o primeiro a criar uma thread neste board"
          />
        )}
      </div>
    </div>
  );
}
