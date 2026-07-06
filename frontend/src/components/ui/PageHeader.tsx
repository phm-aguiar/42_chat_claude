interface PageHeaderProps {
  title: string;
  subtitle?: string;
  subtitleMono?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  subtitleMono = false,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 pb-6 border-b border-surface-raised">
      <div className="flex-1">
        <h1 className="text-content-primary text-2xl font-bold">
          {title}
        </h1>
        {subtitle && (
          <p className={`text-content-secondary text-sm mt-1 ${subtitleMono ? 'font-mono' : ''}`}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
