import React from 'react';
import { cn } from '@/lib/utils';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'subtitle';

interface TypographyProps {
  variant: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-3xl md:text-4xl font-semibold leading-tight text-[var(--zone4-text)]',
  h2: 'text-2xl md:text-3xl font-semibold leading-tight text-[var(--zone4-text)]',
  h3: 'text-xl md:text-2xl font-semibold leading-snug text-[var(--zone4-text)]',
  body: 'text-base leading-relaxed text-[var(--zone4-text)]',
  subtitle: 'text-lg leading-relaxed text-[var(--zone4-text-muted)]',
  caption: 'text-sm leading-normal text-[var(--zone4-text-muted)]',
};

const defaultElements: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  subtitle: 'p',
  caption: 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className,
  as,
}) => {
  const Component = as || defaultElements[variant];
  
  return (
    <Component 
      className={cn(variantStyles[variant], className)}
    >
      {children}
    </Component>
  );
};