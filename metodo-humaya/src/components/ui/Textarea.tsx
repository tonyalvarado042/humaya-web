import type { TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from './cn';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hideLabel?: boolean;
  error?: string;
}

export function Textarea({ label, hideLabel, error, className, ...props }: TextareaProps) {
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
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-21 resize-none rounded-xl border bg-surface px-3.5 py-3 text-sm text-text transition-colors',
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
