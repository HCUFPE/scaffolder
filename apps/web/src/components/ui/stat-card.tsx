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
  iconBgClass = 'bg-blue-50 dark:bg-blue-950/60',
  iconColorClass = 'text-blue-600 dark:text-blue-400',
  actionText,
  actionHref,
  actionColorClass = 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors ${className}`}
    >
      {/* Upper Layer: Metric & Icon */}
      <div className="p-5 flex items-center justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {title}
          </div>
        </div>
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass} ${iconColorClass}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Lower Layer: Action Link Footer */}
      {actionText && actionHref && (
        <div className="bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 px-5 py-2.5">
          <Link
            to={actionHref}
            className={`text-xs font-semibold flex items-center justify-between group ${actionColorClass}`}
          >
            <span>{actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
