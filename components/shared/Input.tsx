import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--zone4-text)] mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--zone4-text-muted)]">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-[var(--zone4-radius)] border transition-all duration-200',
            'bg-white text-[var(--zone4-text)] placeholder-[var(--zone4-text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)]',
            error 
              ? 'border-[var(--zone4-error)] focus:ring-[var(--zone4-error)]/30 focus:border-[var(--zone4-error)]'
              : 'border-[var(--zone4-border)] hover:border-[var(--zone4-accent)]/50',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--zone4-text-muted)]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-[var(--zone4-error)]" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--zone4-text-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
};