import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
  actionText?: string;
  actionHref?: string;
  actionColorClass?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBgClass = 'bg-brand-subtle',
  iconColorClass = 'text-brand-text',
  actionText,
  actionHref,
  actionColorClass = 'text-brand-text hover:text-brand-primary-hover',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-line-strong transition-colors ${className}`}
    >
      {/* Upper Layer: Metric & Icon */}
      <div className="p-5 flex items-center justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-heading tracking-tight">
            {value}
          </div>
          <div className="text-xs font-medium text-muted mt-0.5">
            {title}
          </div>
        </div>
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass} ${iconColorClass}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      {/* Lower Layer: Action Link Footer */}
      {actionText && actionHref && (
        <div className="bg-surface-muted border-t border-line px-5 py-2.5">
          <Link
            to={actionHref}
            className={`text-xs font-semibold flex items-center justify-between group ${actionColorClass}`}
          >
            <span>{actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
