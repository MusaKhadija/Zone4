import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--zone4-accent)] text-white hover:bg-[var(--zone4-accent)]/90 active:bg-[var(--zone4-accent)]/95 focus:ring-[var(--zone4-accent)]/30',
  secondary: 'bg-gray-100 text-[var(--zone4-text)] hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-300',
  outline: 'border-2 border-[var(--zone4-accent)] text-[var(--zone4-accent)] hover:bg-[var(--zone4-accent)]/5 active:bg-[var(--zone4-accent)]/10 focus:ring-[var(--zone4-accent)]/30',
  ghost: 'text-[var(--zone4-text)] hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-[var(--zone4-radius)] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target',
        // Variant styles
        variantStyles[variant],
        // Size styles
        sizeStyles[size],
        // Full width
        fullWidth && 'w-full',
        // Disabled styles
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={isDisabled}
      aria-label={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};