import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card({
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'bg-surface-panel p-4';
  const finalClassName = `${baseStyles} ${className}`.trim();

  return (
    <div
      className={finalClassName}
      {...props}
    >
      {children}
    </div>
  );
}
