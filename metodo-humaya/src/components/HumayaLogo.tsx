import { cn } from './ui/cn';

interface HumayaLogoProps {
  variant?: 'mark' | 'wordmark';
  className?: string;
  decorative?: boolean;
}

/** Activos oficiales de marca. El wordmark blanco se usa solo sobre fondos oscuros. */
export function HumayaLogo({
  variant = 'wordmark',
  className,
  decorative = false,
}: HumayaLogoProps) {
  return (
    <img
      src={variant === 'mark' ? '/mark-gold.png' : '/wordmark-white.png'}
      alt={decorative ? '' : 'Humaya'}
      width={variant === 'mark' ? 642 : 1500}
      height={variant === 'mark' ? 792 : 225}
      className={cn('block h-auto object-contain', className)}
    />
  );
}
