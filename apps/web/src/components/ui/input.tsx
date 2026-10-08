import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-heading">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              error
                ? 'border-danger focus-visible:ring-danger'
                : 'border-line focus-visible:ring-focus-ring',
              className,
            ),
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger-text font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-muted">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
