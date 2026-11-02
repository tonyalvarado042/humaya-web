import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from './cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Oculta el label visualmente, pero lo deja para lectores de pantalla. */
  hideLabel?: boolean;
  error?: string;
}

export function Input({ label, hideLabel, error, className, ...props }: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn('text-[13px] font-medium text-text', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-12 rounded-pill border bg-surface px-4.5 text-[15px] text-text transition-colors',
          'placeholder:text-muted-soft disabled:cursor-not-allowed disabled:text-disabled',
          error ? 'border-on-alert' : 'border-line-strong focus:border-gold',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="m-0 text-[13px] text-on-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
