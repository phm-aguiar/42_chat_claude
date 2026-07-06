interface AvatarProps {
  login: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
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
  const colors = ['accent-teal', 'accent-navy', 'status-success', 'status-error'];
  const index = hashStringToIndex(login, colors.length);
  return colors[index];
}

function getColorClasses(bgColor: string): { bg: string; text: string } {
  switch (bgColor) {
    case 'accent-navy':
      return { bg: 'bg-accent-navy', text: 'text-42-white' };
    case 'status-success':
      return { bg: 'bg-status-success', text: 'text-42-black' };
    case 'status-error':
      return { bg: 'bg-status-error', text: 'text-42-white' };
    case 'accent-teal':
    default:
      return { bg: 'bg-accent-teal', text: 'text-42-black' };
  }
}

export function Avatar({ login, imageUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = login.substring(0, 2).toUpperCase();
  const bgColor = getAvatarBgColor(login);
  const { bg, text } = getColorClasses(bgColor);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={login}
        className={`${sizeClasses[size]} object-cover flex-shrink-0`}
        onError={(e) => {
          // On error, replace with fallback initials
          const img = e.currentTarget as HTMLImageElement;
          const parent = img.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = `${sizeClasses[size]} ${bg} ${text} flex items-center justify-center font-bold flex-shrink-0 inline-flex`;
            fallback.textContent = initials;
            parent.replaceChild(fallback, img);
          }
        }}
      />
    );
  }

  // Fallback: initials badge
  return (
    <div
      className={`${sizeClasses[size]} ${bg} ${text} flex items-center justify-center font-bold flex-shrink-0 inline-flex`}
      title={login}
    >
      {initials}
    </div>
  );
}
