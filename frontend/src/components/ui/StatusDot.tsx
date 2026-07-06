export type StatusDotStatus = 'online' | 'away' | 'busy' | 'invisible' | 'offline';

export const STATUS_LABELS: Record<StatusDotStatus, string> = {
  online: 'Online',
  away: 'Ausente',
  busy: 'Ocupado',
  invisible: 'Invisível',
  offline: 'Offline',
};

interface StatusDotProps {
  status: StatusDotStatus;
  size?: 'sm' | 'md';
}

export function StatusDot({ status, size = 'md' }: StatusDotProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  const statusColorClasses = {
    online: 'bg-status-online',
    away: 'bg-status-away',
    busy: 'bg-status-busy',
    invisible: 'bg-status-invisible',
    offline: 'bg-status-offline',
  };

  const isOnline = status === 'online';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-2 border-surface-panel ${statusColorClasses[status]} ${
        isOnline ? 'animate-pulse-dot' : ''
      }`}
      title={STATUS_LABELS[status]}
    />
  );
}
