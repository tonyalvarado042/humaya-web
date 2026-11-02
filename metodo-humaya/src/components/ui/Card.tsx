import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type CardVariant = 'default' | 'accent' | 'ink';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-line bg-surface text-text',
  accent: 'border border-gold-dim bg-surface-sunken text-text',
  ink: 'border border-ink bg-ink text-on-ink',
};

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-card p-5', variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
}
