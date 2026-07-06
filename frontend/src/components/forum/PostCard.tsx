import { Avatar } from '@/components/ui/Avatar';
import { MDXRenderer } from './MDXRenderer';
import type { Post } from '@/lib/forumApi';

interface PostCardProps {
  post: Post;
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
  isOP = false,
  onReply,
  children,
}: PostCardProps) {
  // UUID curto (primeiros 8 chars) para exibição
  const shortReplyId = post.reply_to ? post.reply_to.substring(0, 8) : null;

  return (
    <div
      className={`
        flex flex-col gap-3 py-3 px-5 transition-colors
        ${isOP
          ? 'border-l-4 border-accent-primary bg-accent-primary/5 pl-4'
          : 'hover:bg-white/2'
        }
      `}
    >
      {/* Header: Avatar + Login + Timestamp */}
      <div className="flex items-center gap-3 mb-1">
        {/* Avatar */}
        <Avatar
          login={post.author_login}
          imageUrl={post.author_image_url}
          size="sm"
        />

        {/* Login + Timestamp */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-accent-primary text-xs font-bold uppercase tracking-widest flex-shrink-0">
            {post.author_login}
          </span>

          <span className="text-content-secondary text-xs flex-shrink-0 ml-auto">
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
      </div>

      {/* Reply-to indicator */}
      {shortReplyId && (
        <div className="text-xs text-content-secondary/60 italic pl-10">
          em resposta a {shortReplyId}
        </div>
      )}

      {/* Content (MDXRenderer) */}
      <div className="pl-10">
        <MDXRenderer content={post.content} />
      </div>

      {/* Reply Button */}
      {onReply && (
        <div className="pl-10 pt-2">
          <button
            onClick={() => onReply(post.id)}
            className="px-3 py-1.5 border border-accent-primary text-accent-primary text-xs font-bold uppercase tracking-wider transition-colors hover:bg-accent-primary hover:text-surface-base"
          >
            Responder
          </button>
        </div>
      )}

      {/* Children (nested replies tree view) */}
      {children && (
        <div className="pl-10 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
