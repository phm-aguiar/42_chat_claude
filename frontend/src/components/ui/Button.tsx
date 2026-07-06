import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles = 'font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';

  // Size styles
  const sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base';

  // Variant styles
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-accent-teal text-42-black hover:bg-opacity-90 active:bg-opacity-80';
      break;
    case 'secondary':
      variantStyles = 'bg-surface-panel border border-accent-teal text-text-content-primary hover:bg-surface-raised active:bg-surface-hover';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-text-content-primary hover:bg-surface-panel active:bg-surface-raised';
      break;
    case 'danger':
      variantStyles = 'bg-status-error text-42-white hover:bg-opacity-90 active:bg-opacity-80';
      break;
  }

  const finalClassName = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim();

  return (
    <button
      className={finalClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
