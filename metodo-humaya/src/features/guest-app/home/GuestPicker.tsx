import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_STAYS } from '@/services/session';
import { useCurrentStay } from '../layout/useCurrentStay';

/** Selector de huésped para recorrer las dos historias de la demo. */
export function GuestPicker() {
  const { stayId, setStayId } = useCurrentStay();
  const { t } = useTranslation();
  const id = useId();

  return (
    <div className="flex flex-col items-end gap-1">
      <label htmlFor={id} className="text-[11px] tracking-wide text-muted-soft">
        {t('home.guestPicker')}
      </label>
      <select
        id={id}
        value={stayId}
        onChange={(event) => setStayId(event.target.value)}
        className="h-11 w-[164px] rounded-pill border border-line-strong bg-surface px-3 text-[13px] font-medium text-text min-[390px]:w-auto"
      >
        {DEMO_STAYS.map((option) => (
          <option key={option.stayId} value={option.stayId}>
            {option.arrivalOffsetDays === 0
              ? t('home.demoArrivalToday', { name: option.guestName })
              : t('home.demoArrivalInDays', {
                  name: option.guestName,
                  count: option.arrivalOffsetDays,
                })}
          </option>
        ))}
      </select>
    </div>
  );
}
