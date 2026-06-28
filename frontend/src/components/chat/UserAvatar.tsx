interface UserAvatarProps {
  login: string;
  imageUrl: string;
  size?: 'sm' | 'md';
}

export function UserAvatar({ login, imageUrl, size = 'md' }: UserAvatarProps) {
  const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';

  return (
    <img
      src={imageUrl || '/assets/default-avatar.png'}
      alt={login}
      className={`${sizeClass} object-cover flex-shrink-0`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/assets/default-avatar.png';
      }}
    />
  );
}
