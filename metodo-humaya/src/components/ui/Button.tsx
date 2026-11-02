import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';
import { cn } from './cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        buttonClasses(variant, size),
        'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gold-track disabled:text-muted-soft disabled:hover:bg-gold-track',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
