import { PartyPopper, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export type TagTone = 'alert' | 'celebration' | 'info';

interface TagProps {
  tone?: TagTone;
  children: ReactNode;
}

const toneClasses: Record<TagTone, string> = {
  alert: 'bg-alert text-on-alert',
  celebration: 'bg-celebration text-on-celebration',
  info: 'bg-info text-on-info',
};

/**
 * Etiqueta de contexto del huésped. Las alergias (`alert`) y las celebraciones
 * llevan ícono además del color, porque el color solo no comunica el estado.
 */
export function Tag({ tone = 'info', children }: TagProps) {
  const Icon = tone === 'alert' ? TriangleAlert : tone === 'celebration' ? PartyPopper : null;

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-tag px-3 text-[13px] font-medium',
        toneClasses[tone],
      )}
    >
      {Icon ? <Icon size={14} strokeWidth={1.6} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
