import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  description,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-heading"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      </div>

      {children}

      {description && !error && (
        <p className="text-[11px] text-muted">{description}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-danger-text animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
