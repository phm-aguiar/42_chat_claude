import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import { BoardCard } from '@/components/forum/BoardCard';

export function ForumListPage() {
  const { boards, loading, error, fetchBoards, clearError } = useForumStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  function handleBoardClick(slug: string) {
    window.location.pathname = `/forum/${slug}`;
  }

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1B1B1B',
        fontFamily: '"Futura PT", ui-sans-serif, system-ui',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          height: '48px',
          background: '#202026',
          borderBottom: '1px solid #29292E',
          flexShrink: 0,
          gap: '16px',
        }}
      >
        <span
          style={{
            color: '#00BABC',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          42 Forum
        </span>
        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>
        <span
          style={{
            color: '#29292E',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Boards
        </span>
        <button
          onClick={() => window.location.replace('/')}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid #29292E',
            color: '#29292E',
            fontSize: '10px',
            padding: '4px 10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#FFFFFF';
            (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#29292E';
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          Voltar
        </button>
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 20px',
        }}
      >
        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#EC3391',
              color: '#FFFFFF',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                marginLeft: '16px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !boards.length && (
          <div
            style={{
              color: '#29292E',
              fontSize: '14px',
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            Carregando boards...
          </div>
        )}

        {/* Boards Grid */}
        {!loading && boards.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
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
          <div
            style={{
              color: '#29292E',
              fontSize: '14px',
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            Nenhum board disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
}
