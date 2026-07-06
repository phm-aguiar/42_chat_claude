import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForumStore } from '@/stores/forumStore';
import { BoardCard } from '@/components/forum/BoardCard';
import { EmptyState } from '@/components/ui/EmptyState';

export function ForumListPage() {
  const { boards, loading, error, fetchBoards, clearError } = useForumStore();
  const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();

  useEffect(() => {
    fetchBoards();
    setPageTitle('Fórum');
  }, [fetchBoards, setPageTitle]);

  function handleBoardClick(slug: string) {
    window.location.pathname = `/forum/${slug}`;
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Loading state */}
        {loading && !boards.length && (
          <EmptyState
            icon="⏳"
            title="Carregando boards..."
            description="Aguarde um momento"
          />
        )}

        {/* Boards Grid */}
        {!loading && boards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => handleBoardClick(board.slug)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && boards.length === 0 && !error && (
          <EmptyState
            icon="📋"
            title="Nenhum board disponível"
            description="Não há boards no momento. Tente voltar mais tarde."
          />
        )}
      </div>
    </div>
  );
}
