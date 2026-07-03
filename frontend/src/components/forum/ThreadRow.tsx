import type { Thread } from '@/lib/forumApi';

interface ThreadRowProps {
  thread: Thread;
  onClick: () => void;
}

/**
 * Calcula tempo relativo simples (ex: "2h atrás", "1d atrás")
 */
function getRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
}

export function ThreadRow({ thread, onClick }: ThreadRowProps) {
  const relativeTime = getRelativeTime(thread.last_post_at);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#202026',
        border: '1px solid #29292E',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '56px',
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
      {/* Pin / Lock indicators (left side) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        {thread.is_pinned && (
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#00BABC',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)',
            }}
            title="Pinned"
          />
        )}
        {thread.is_locked && (
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#EC3391',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)',
            }}
            title="Locked"
          />
        )}
      </div>

      {/* Title and tags (flex: 1, middle) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Title */}
        <h3
          style={{
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 400,
            margin: '0 0 6px 0',
            fontFamily: '"Futura PT", ui-sans-serif, system-ui',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {thread.title}
        </h3>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {thread.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#29292E',
                  color: '#00BABC',
                  fontSize: '10px',
                  fontWeight: 400,
                  padding: '2px 6px',
                  fontFamily: '"Courier New", monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            ))}
            {thread.tags.length > 3 && (
              <span
                style={{
                  color: '#29292E',
                  fontSize: '10px',
                  fontWeight: 400,
                  padding: '2px 6px',
                }}
              >
                +{thread.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: post_count + time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        <div
          style={{
            color: '#29292E',
            fontSize: '11px',
            fontWeight: 400,
            fontFamily: '"Courier New", monospace',
          }}
        >
          {thread.post_count} {thread.post_count === 1 ? 'post' : 'posts'}
        </div>
        <div
          style={{
            color: '#29292E',
            fontSize: '11px',
            fontWeight: 400,
            minWidth: '40px',
            fontFamily: '"Courier New", monospace',
          }}
        >
          {relativeTime}
        </div>
      </div>
    </div>
  );
}
