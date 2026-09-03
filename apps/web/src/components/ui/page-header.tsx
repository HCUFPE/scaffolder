import type { ReactNode } from 'react';
import { Badge } from './badge';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  category,
  badgeText,
  badgeVariant = 'default',
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {category}
            </span>
          )}
          {badgeText && (
            <Badge variant={badgeVariant} className="text-[10px] py-0 px-2 font-bold">
              {badgeText}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
