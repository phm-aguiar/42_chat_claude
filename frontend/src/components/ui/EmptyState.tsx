interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
      {icon && (
        <div className="text-4xl">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}
      <h3 className="text-text-content-primary text-lg font-medium">
        {title}
      </h3>
      {description && (
        <p className="text-text-content-secondary text-sm max-w-md text-center">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}
