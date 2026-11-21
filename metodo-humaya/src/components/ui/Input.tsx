import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from './cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Oculta el label visualmente, pero lo deja para lectores de pantalla. */
  hideLabel?: boolean;
  /**
   * Una linea que explica el campo. Va atada con `aria-describedby`, no solo
   * puesta debajo: un lector de pantalla tiene que leerla al llegar al campo,
   * no cuando pase por casualidad por el parrafo de abajo.
   */
  hint?: string;
  error?: string;
}

export function Input({ label, hideLabel, hint, error, className, ...props }: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

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
        aria-describedby={describedBy || undefined}
        className={cn(
          'h-12 rounded-pill border bg-surface px-4.5 text-[15px] text-text transition-colors',
          'placeholder:text-muted-soft disabled:cursor-not-allowed disabled:text-disabled',
          error ? 'border-on-alert' : 'border-line-strong focus:border-gold',
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="m-0 text-[13px] leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="m-0 text-[13px] text-on-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
