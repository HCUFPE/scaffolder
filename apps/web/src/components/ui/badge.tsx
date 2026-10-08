import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'outline' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-info-subtle text-info-text',
    secondary: 'bg-surface-strong text-body',
    success: 'bg-success-subtle text-success-text',
    destructive: 'bg-danger-subtle text-danger-text',
    warning: 'bg-warning-subtle text-warning-text',
    outline: 'border border-line-strong text-body',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors',
          variants[variant],
          className,
        ),
      )}
      {...props}
    />
  );
}
