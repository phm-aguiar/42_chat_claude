import type { Board } from '@/lib/forumApi';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#202026',
        border: '1px solid #29292E',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#00BABC';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#29292E';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#29292E';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#202026';
      }}
    >
      {/* Slug em monospace teal */}
      <div
        style={{
          color: '#00BABC',
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '0.05em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        /{board.slug}
      </div>

      {/* Name em Futura Heavy */}
      <h3
        style={{
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 700,
          margin: '0 0 8px 0',
          fontFamily: '"Futura PT", ui-sans-serif, system-ui',
        }}
      >
        {board.name}
      </h3>

      {/* Description */}
      <p
        style={{
          color: '#E3E3E3',
          fontSize: '13px',
          lineHeight: '1.5',
          margin: '0',
          flex: 1,
          wordBreak: 'break-word',
        }}
      >
        {board.description}
      </p>

      {/* Locked indicator */}
      {board.is_locked && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              backgroundColor: '#EC3391',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Locked
          </span>
        </div>
      )}
    </div>
  );
}
