import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForumStore } from '@/stores/forumStore';
import { ThreadRow } from '@/components/forum/ThreadRow';

interface BoardViewProps {
  slug: string;
}

export function BoardView({ slug }: BoardViewProps) {
  const navigate = useNavigate();
  const { currentBoard, threads, loading, error, fetchThreads, clearError } = useForumStore();

  // Fetch threads when slug changes
  useEffect(() => {
    fetchThreads(slug);
  }, [slug, fetchThreads]);

  function handleThreadClick(threadId: string) {
    navigate(`/forum/${slug}/thread/${threadId}`);
  }

  function handleNewThread() {
    navigate(`/forum/${slug}/new`);
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
        {/* Back button */}
        <button
          onClick={() => navigate('/forum')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#29292E',
            fontSize: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
            padding: '0',
            fontFamily: '"Futura PT", ui-sans-serif, system-ui',
            fontWeight: 400,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          ← Boards
        </button>

        <span style={{ color: '#29292E', fontSize: '11px' }}>—</span>

        {/* Board name */}
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 400,
            fontSize: '13px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {currentBoard?.name || 'Carregando...'}
        </span>

        {/* New Thread button */}
        <button
          onClick={handleNewThread}
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
            fontFamily: '"Futura PT", ui-sans-serif, system-ui',
            fontWeight: 400,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#00BABC';
            (e.currentTarget as HTMLButtonElement).style.color = '#00BABC';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#29292E';
            (e.currentTarget as HTMLButtonElement).style.color = '#29292E';
          }}
        >
          Nova Thread
        </button>
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
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
        {loading && !threads.length && (
          <div
            style={{
              color: '#29292E',
              fontSize: '14px',
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            Carregando threads...
          </div>
        )}

        {/* Threads List */}
        {!loading && threads.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
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
          <div
            style={{
              color: '#29292E',
              fontSize: '14px',
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            Nenhuma thread ainda — seja o primeiro a criar uma!
          </div>
        )}
      </div>
    </div>
  );
}
