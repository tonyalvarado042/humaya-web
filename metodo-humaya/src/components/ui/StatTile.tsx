import { cn } from './cn';

interface StatTileProps {
  label: string;
  value: string;
  /** Texto menor al lado del número, p. ej. "de 10". */
  suffix?: string;
  variant?: 'default' | 'ink';
}

/** Indicador del dashboard: rótulo arriba y número grande en Cormorant. */
export function StatTile({ label, value, suffix, variant = 'default' }: StatTileProps) {
  const isInk = variant === 'ink';

  return (
    <div
      className={cn(
        'rounded-card px-5 py-4.5',
        isInk ? 'bg-ink text-on-ink' : 'border border-line bg-surface text-text',
      )}
    >
      <div className={cn('text-[13px]', isInk ? 'text-ink-muted' : 'text-muted')}>{label}</div>
      <div className={cn('font-display text-[40px] leading-[1.1]', isInk && 'text-gold-on-ink')}>
        {value}
        {suffix ? (
          <span className={cn('text-[22px]', isInk ? 'text-ink-muted' : 'text-muted')}>
            {' '}
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
