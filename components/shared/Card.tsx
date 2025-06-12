import React from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'normal' | 'large';
type CardVariant = 'elevated' | 'flat' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  variant?: CardVariant;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  normal: 'p-4',
  large: 'p-6',
};

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-white zone4-shadow',
  flat: 'bg-white',
  outlined: 'bg-white border border-[var(--zone4-border)]',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'normal',
  variant = 'elevated',
  onClick,
  role,
  tabIndex,
}) => {
  const isInteractive = onClick !== undefined;

  return (
    <div
      className={cn(
        'rounded-[var(--zone4-radius)] transition-all duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        isInteractive && 'cursor-pointer hover:zone4-shadow-lg active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
};