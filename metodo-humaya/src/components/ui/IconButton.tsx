import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';
import type { ButtonVariant } from './buttonStyles';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatorio: el botón no tiene texto visible. */
  'aria-label': string;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-on-gold hover:bg-gold-bright',
  outline: 'border border-line-strong text-text hover:border-gold hover:text-gold-bright',
  ghost: 'border border-line-strong bg-surface text-text hover:border-gold',
  ink: 'bg-ink text-on-ink hover:bg-ink/90',
};

export function IconButton({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-pill transition-colors',
        'disabled:cursor-not-allowed disabled:bg-gold-track disabled:text-muted-soft',
        size === 'lg' ? 'size-12' : 'size-11',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
