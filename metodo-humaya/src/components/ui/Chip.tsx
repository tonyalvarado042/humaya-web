import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Cuando se define, el chip actúa como interruptor y expone aria-pressed. */
  selected?: boolean;
  children: ReactNode;
}

export function Chip({ selected, type = 'button', className, children, ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-pill px-4 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:border-line-soft disabled:text-disabled',
        selected
          ? 'border border-gold bg-gold text-on-gold'
          : 'border border-line-strong bg-surface text-text hover:border-gold hover:text-gold-bright',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
