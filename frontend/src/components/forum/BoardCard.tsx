import type { Board } from '@/lib/forumApi';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        bg-surface-panel border border-surface-raised p-5 cursor-pointer
        transition-all hover:border-accent-primary hover:bg-surface-raised
        min-h-32 flex flex-col
      "
    >
      {/* Slug em monospace teal */}
      <div className="text-accent-primary font-mono text-xs font-normal tracking-widest mb-2 uppercase">
        /{board.slug}
      </div>

      {/* Name em Futura Heavy */}
      <h3 className="text-content-primary text-base font-bold m-0 mb-2 font-sans">
        {board.name}
      </h3>

      {/* Description */}
      <p className="text-content-secondary text-sm leading-relaxed m-0 flex-1 break-words font-normal">
        {board.description}
      </p>

      {/* Locked indicator */}
      {board.is_locked && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="bg-status-error text-content-primary text-xs font-bold px-2 py-0.5 uppercase tracking-wider">
            Locked
          </span>
        </div>
      )}
    </div>
  );
}
