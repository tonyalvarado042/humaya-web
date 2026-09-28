import { cn } from './cn';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'ink';
export type ButtonSize = 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-on-gold hover:bg-gold-bright',
  outline: 'border border-line-strong text-text hover:border-gold hover:text-gold-bright',
  ghost: 'border border-line-strong bg-surface text-text hover:border-gold',
  ink: 'bg-ink text-on-ink hover:bg-ink/90',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-6 text-[15px]',
};

/** Las clases de un botón. Las comparten Button y ButtonLink. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-pill font-medium no-underline transition-colors',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export { variantClasses as buttonVariantClasses };
