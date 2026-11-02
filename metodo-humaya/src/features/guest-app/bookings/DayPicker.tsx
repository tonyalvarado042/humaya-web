import { cn } from '@/components/ui/cn';
import { dayParts } from '../format';
import { useTranslation } from 'react-i18next';
import { intlLocale } from '@/i18n/localizedText';
import { useGuestLanguage } from '../layout/useGuestLanguage';

interface DayPickerProps {
  /** Fechas ISO, solo el día. */
  days: string[];
  value: string;
  onChange: (day: string) => void;
}

/**
 * Los días de la estadía. Vive en la pantalla y no en el kit: la Fase 1 lo dejó
 * fuera a propósito porque solo lo usa Reservas.
 */
export function DayPicker({ days, value, onChange }: DayPickerProps) {
  const { t } = useTranslation();
  const { language } = useGuestLanguage();
  return (
    <div role="radiogroup" aria-label={t('bookings.dayLabel')} className="flex gap-2">
      {days.map((day) => {
        const { weekday, day: label } = dayParts(day, intlLocale(language));
        const isSelected = day === value;

        return (
          <button
            key={day}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(day)}
            className={cn(
              'flex h-15 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm font-medium transition-colors',
              isSelected
                ? 'border-gold bg-surface text-gold-bright'
                : 'border-line bg-surface-sunken text-text hover:border-gold',
            )}
          >
            <span className="text-xs text-muted">{weekday}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
