import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseInputStyles = 'w-full bg-surface-base text-text-content-primary border border-surface-raised px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-0 focus-visible:border-accent-teal disabled:opacity-50 disabled:cursor-not-allowed';

  const errorInputStyles = error ? 'border-status-error' : '';

  const inputClassName = `${baseInputStyles} ${errorInputStyles} ${className}`.trim();

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-text-content-primary text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClassName}
        {...props}
      />
      {error && (
        <p className="text-status-error text-sm">{error}</p>
      )}
    </div>
  );
}
