import { cn } from './cn';

interface SkeletonProps {
  variant?: 'block' | 'line' | 'circle';
  className?: string;
}

/**
 * Placeholder de carga. Es decorativo: el aviso para lectores de pantalla lo
 * pone la pantalla con un aria-live que diga "Cargando…".
 */
export function Skeleton({ variant = 'block', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block animate-pulse bg-gold-track',
        variant === 'block' && 'h-24 rounded-card',
        variant === 'line' && 'h-4 rounded-sm',
        variant === 'circle' && 'size-12 rounded-pill',
        className,
      )}
    />
  );
}
