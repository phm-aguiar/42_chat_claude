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
      className="
        bg-surface-panel border border-surface-raised p-4 cursor-pointer
        transition-all hover:border-accent-primary hover:bg-surface-raised
        flex items-center gap-3 min-h-14
      "
    >
      {/* Pin / Lock indicators (left side) */}
      <div className="flex gap-1.5 flex-shrink-0">
        {thread.is_pinned && (
          <div
            className="w-3 h-3 bg-accent-primary flex-shrink-0"
            style={{
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)',
            }}
            title="Pinned"
          />
        )}
        {thread.is_locked && (
          <div
            className="w-3 h-3 bg-status-error flex-shrink-0"
            style={{
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)',
            }}
            title="Locked"
          />
        )}
      </div>

      {/* Title and tags (flex: 1, middle) */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-content-primary text-sm font-normal m-0 whitespace-nowrap overflow-hidden text-ellipsis mb-1.5">
          {thread.title}
        </h3>

        {/* Author + Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Author login */}
          {thread.author_login && (
            <span className="text-content-muted text-xs font-normal whitespace-nowrap">
              por {thread.author_login}
            </span>
          )}

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex gap-1.5">
              {thread.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-raised text-accent-primary text-xs font-normal px-1.5 py-0.5 font-mono whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
              {thread.tags.length > 3 && (
                <span className="text-content-muted text-xs font-normal px-1.5 py-0.5">
                  +{thread.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: post_count + time */}
      <div className="flex items-center gap-4 flex-shrink-0 text-right">
        <div className="text-content-muted text-xs font-normal font-mono whitespace-nowrap">
          {thread.post_count} {thread.post_count === 1 ? 'post' : 'posts'}
        </div>
        <div className="text-content-muted text-xs font-normal font-mono min-w-10">
          {relativeTime}
        </div>
      </div>
    </div>
  );
}
