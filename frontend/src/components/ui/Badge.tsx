import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'error';
  count?: number;
  children?: React.ReactNode;
}

export function Badge({
  variant = 'default',
  count,
  className = '',
  children,
  ...props
}: BadgeProps) {
  // Variante styles
  let variantStyles = '';
  switch (variant) {
    case 'default':
      variantStyles = 'bg-surface-raised text-text-content-primary';
      break;
    case 'accent':
      variantStyles = 'bg-accent-teal text-42-black';
      break;
    case 'error':
      variantStyles = 'bg-status-error text-42-white';
      break;
  }

  const baseStyles = 'inline-flex items-center justify-center font-medium';

  // If count is provided, render as a compact badge (numeric)
  if (count !== undefined) {
    const displayCount = count > 99 ? '99+' : String(count);
    const countSizeStyles = 'h-5 w-5 text-xs';
    const finalClassName = `${baseStyles} ${countSizeStyles} ${variantStyles} ${className}`.trim();

    return (
      <span className={finalClassName} {...props}>
        {displayCount}
      </span>
    );
  }

  // Regular badge with children
  const regularSizeStyles = 'px-2 py-1 text-sm';
  const finalClassName = `${baseStyles} ${regularSizeStyles} ${variantStyles} ${className}`.trim();

  return (
    <span className={finalClassName} {...props}>
      {children}
    </span>
  );
}
