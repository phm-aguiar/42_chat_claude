import { StatusDot, type StatusDotStatus } from './StatusDot';

interface AvatarProps {
  login: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: StatusDotStatus;
}

function hashStringToIndex(str: string, arrayLength: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % arrayLength;
}

function getAvatarBgColor(login: string): string {
  const colors = ['accent-primary', 'accent-secondary', 'surface-hover'];
  const index = hashStringToIndex(login, colors.length);
  return colors[index];
}

function getColorClasses(bgColor: string): { bg: string; text: string } {
  switch (bgColor) {
    case 'accent-secondary':
      return { bg: 'bg-accent-secondary', text: 'text-content-onAccent' };
    case 'surface-hover':
      return { bg: 'bg-surface-hover', text: 'text-content-primary' };
    case 'accent-primary':
    default:
      return { bg: 'bg-accent-primary', text: 'text-content-onAccent' };
  }
}

export function Avatar({ login, imageUrl, size = 'md', status }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusDotSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'md' as const,
  };

  const initials = login.substring(0, 2).toUpperCase();
  const bgColor = getAvatarBgColor(login);
  const { bg, text } = getColorClasses(bgColor);

  const wrapperClass = status ? 'relative inline-flex' : 'inline-flex';

  if (imageUrl) {
    return (
      <div className={wrapperClass}>
        <img
          src={imageUrl}
          alt={login}
          className={`${sizeClasses[size]} object-cover flex-shrink-0 rounded-full`}
          onError={(e) => {
            // On error, replace with fallback initials
            const img = e.currentTarget as HTMLImageElement;
            const parent = img.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} ${bg} ${text} flex items-center justify-center font-bold flex-shrink-0 inline-flex rounded-full`;
              fallback.textContent = initials;
              parent.replaceChild(fallback, img);
            }
          }}
        />
        {status && (
          <div className="absolute bottom-0 right-0">
            <StatusDot status={status} size={statusDotSizeMap[size]} />
          </div>
        )}
      </div>
    );
  }

  // Fallback: initials badge
  return (
    <div className={wrapperClass}>
      <div
        className={`${sizeClasses[size]} ${bg} ${text} flex items-center justify-center font-bold flex-shrink-0 inline-flex rounded-full`}
        title={login}
      >
        {initials}
      </div>
      {status && (
        <div className="absolute bottom-0 right-0">
          <StatusDot status={status} size={statusDotSizeMap[size]} />
        </div>
      )}
    </div>
  );
}
