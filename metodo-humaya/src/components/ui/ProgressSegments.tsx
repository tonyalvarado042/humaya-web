import { cn } from './cn';

interface ProgressSegmentsProps {
  /** Cantidad total de pasos. */
  total: number;
  /** Pasos ya completados. El siguiente se marca como "en curso". */
  completed: number;
  label: string;
  valueText?: string;
}

/** Avance por pasos de la entrevista. El texto de apoyo lo pone la pantalla. */
export function ProgressSegments({ total, completed, label, valueText }: ProgressSegmentsProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      aria-valuetext={valueText ?? `${completed} de ${total}`}
      className="flex gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-[3px] flex-1 rounded-sm',
            index < completed ? 'bg-gold' : index === completed ? 'bg-gold-dim' : 'bg-gold-track',
          )}
        />
      ))}
    </div>
  );
}
