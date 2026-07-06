import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card({
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-xl bg-surface-panel border border-white/5 p-4';
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
