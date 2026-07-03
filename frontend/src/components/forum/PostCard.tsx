import { MDXRenderer } from './MDXRenderer';
import type { Post } from '@/lib/forumApi';

interface PostCardProps {
  post: Post;
  author?: { login: string; image_url?: string; title?: string };
  isOP?: boolean;
  onReply?: (postId: string) => void;
  children?: React.ReactNode;
}

/**
 * Formata timestamp relativo: "há 2h", "há 30 min", etc.
 */
function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function PostCard({
  post,
  author,
  isOP = false,
  onReply,
  children,
}: PostCardProps) {
  // UUID curto (primeiros 8 chars) para exibição
  const shortReplyId = post.reply_to ? post.reply_to.substring(0, 8) : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderLeft: isOP ? '4px solid #00BABC' : 'none',
        paddingLeft: isOP ? '16px' : '20px',
        paddingRight: '20px',
        paddingTop: '12px',
        paddingBottom: '12px',
        background: isOP ? 'rgba(0, 186, 188, 0.02)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isOP) {
          (e.currentTarget as HTMLDivElement).style.background =
            'rgba(255,255,255,0.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isOP) {
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }
      }}
    >
      {/* Header: Avatar + Login + Title Badge + Timestamp */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px',
        }}
      >
        {/* Avatar */}
        {author && (
          <img
            src={author.image_url || '/assets/default-avatar.png'}
            alt={author.login}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                '/assets/default-avatar.png';
            }}
            style={{
              width: '32px',
              height: '32px',
              flexShrink: 0,
              objectFit: 'cover',
              filter: 'grayscale(30%)',
            }}
          />
        )}

        {/* Login + Badge + Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Login */}
          <span
            style={{
              color: '#00BABC',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {author?.login || 'unknown'}
          </span>

          {/* Title Badge */}
          {author?.title && (
            <span
              style={{
                padding: '2px 6px',
                backgroundColor: '#00BABC',
                color: '#1B1B1B',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {author.title}
            </span>
          )}

          {/* Timestamp */}
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              marginLeft: 'auto',
            }}
          >
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
      </div>

      {/* Reply-to indicator */}
      {shortReplyId && (
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '6px',
            paddingLeft: '42px',
            fontStyle: 'italic',
          }}
        >
          em resposta a {shortReplyId}
        </div>
      )}

      {/* Content (MDXRenderer) */}
      <div
        style={{
          paddingLeft: author ? '42px' : '0px',
          marginBottom: children || onReply ? '10px' : '0px',
        }}
      >
        <MDXRenderer content={post.content} />
      </div>

      {/* Reply Button */}
      {onReply && (
        <div
          style={{
            paddingLeft: author ? '42px' : '0px',
            marginBottom: children ? '8px' : '0px',
          }}
        >
          <button
            onClick={() => onReply(post.id)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #00BABC',
              color: '#00BABC',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                '#00BABC';
              (e.currentTarget as HTMLButtonElement).style.color = '#1B1B1B';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#00BABC';
            }}
          >
            Responder
          </button>
        </div>
      )}

      {/* Children (nested replies tree view) */}
      {children && (
        <div
          style={{
            paddingLeft: author ? '42px' : '0px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
