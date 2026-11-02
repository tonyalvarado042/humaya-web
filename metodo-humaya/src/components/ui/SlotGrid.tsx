import { cn } from './cn';

export interface Slot {
  /** Identificador estable del horario, p. ej. "2026-11-15T17:00". */
  id: string;
  /** Hora tal como se muestra, p. ej. "17:00". */
  label: string;
  taken?: boolean;
}

interface SlotGridProps {
  label: string;
  slots: Slot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  takenLabel?: string;
}

/**
 * Grilla de horarios de sauna y cold plunge. Un horario ocupado va deshabilitado
 * y lo dice en su nombre accesible: el tachado y el color no alcanzan.
 */
export function SlotGrid({
  label,
  slots,
  selectedId,
  onSelect,
  takenLabel = 'ocupado',
}: SlotGridProps) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedId;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={slot.taken}
            aria-pressed={slot.taken ? undefined : isSelected}
            aria-label={slot.taken ? `${slot.label}, ${takenLabel}` : slot.label}
            onClick={() => onSelect(slot.id)}
            className={cn(
              'h-11 rounded-xl border text-sm font-medium transition-colors',
              slot.taken
                ? 'cursor-not-allowed border-line-soft text-disabled line-through'
                : isSelected
                  ? 'border-gold bg-gold text-on-gold'
                  : 'border-line-strong bg-surface text-text hover:border-gold',
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
