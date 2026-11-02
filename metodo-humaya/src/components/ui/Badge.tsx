import type { ReactNode } from 'react';
import { cn } from './cn';

export type BadgeTone = 'success' | 'warning' | 'neutral';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success text-on-success',
  warning: 'bg-warning text-on-warning',
  neutral: 'bg-neutral text-on-neutral',
};

/** Estado en píldora. El estado siempre va escrito: el color solo acompaña. */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6.5 items-center rounded-pill px-2.5 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
