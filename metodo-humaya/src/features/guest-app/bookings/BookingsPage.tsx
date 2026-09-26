import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, SegmentedControl, SlotGrid } from '@/components/ui';
import { useBookSlot, useGuestProfile, useSpaSlots } from '@/hooks';
import { getToday } from '@/services/clock';
import { intlLocale } from '@/i18n/localizedText';
import type { SpaFacility } from '@/types';
import { dayParts, timeLabel } from '../format';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { useCurrentStay } from '../layout/useCurrentStay';
import { DayPicker } from './DayPicker';

/** Los días de la estadía que todavía se pueden reservar, desde hoy. */
function bookableDays(checkIn: string, checkOut: string): string[] {
  const today = getToday();
  const start = checkIn.slice(0, 10) > today ? checkIn.slice(0, 10) : today;
  const end = checkOut.slice(0, 10);

  const days: string[] = [];
  for (let cursor = new Date(`${start}T00:00:00Z`); ; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const iso = cursor.toISOString().slice(0, 10);
    if (iso > end) break;
    days.push(iso);
  }
  return days;
}

export function BookingsPage() {
  const { stayId } = useCurrentStay();
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const profile = useGuestProfile(stayId);

  const [facility, setFacility] = useState<SpaFacility>('sauna');
  const [day, setDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const days = profile.data
    ? bookableDays(profile.data.stay.checkIn, profile.data.stay.checkOut)
    : [];
  const activeDay = day ?? days[0] ?? getToday();

  const slots = useSpaSlots(facility, activeDay);
  const bookSlot = useBookSlot(stayId);
  const facilityOptions = [
    { value: 'sauna' as const, label: t('bookings.sauna') },
    { value: 'cold_plunge' as const, label: t('bookings.coldPlunge') },
  ];

  if (profile.isPending) {
    return <ScreenLoading label={t('bookings.loading')} />;
  }

  if (profile.isError || !profile.data) {
    return <ScreenError onRetry={() => void profile.refetch()} />;
  }

  function changeFacility(next: SpaFacility) {
    setFacility(next);
    setSelected(null);
    setConfirmed(null);
  }

  function changeDay(next: string) {
    setDay(next);
    setSelected(null);
    setConfirmed(null);
  }

  function confirm() {
    if (!selected) return;
    bookSlot.mutate(
      { facility, start: selected },
      {
        onSuccess: () => {
          setConfirmed(selected);
          setSelected(null);
        },
      },
    );
  }

  const facilityName = facility === 'sauna' ? t('bookings.sauna') : t('bookings.coldPlunge');
  const locale = intlLocale(language);

  return (
    <Screen>
      <ScreenHeading
        eyebrow={t('bookings.eyebrow')}
        title={t('bookings.title')}
        description={facility === 'sauna' ? t('bookings.saunaInfo') : t('bookings.coldPlungeInfo')}
      />

      <SegmentedControl
        label={t('bookings.facilityLabel')}
        options={facilityOptions}
        value={facility}
        onChange={changeFacility}
      />

      {days.length === 0 ? (
        <EmptyState title={t('bookings.noDaysTitle')} description={t('bookings.noDaysBody')} />
      ) : (
        <DayPicker days={days} value={activeDay} onChange={changeDay} />
      )}

      {slots.isPending ? <ScreenLoading label={t('bookings.loadingSlots')} lines={2} /> : null}

      {slots.isError ? <ScreenError onRetry={() => void slots.refetch()} /> : null}

      {slots.data ? (
        <SlotGrid
          label={t('bookings.slotsLabel', { facility: facilityName.toLowerCase() })}
          slots={slots.data.map((slot) => ({
            id: slot.start,
            label: timeLabel(slot.start, locale),
            taken: Boolean(slot.stayId),
          }))}
          selectedId={selected}
          onSelect={setSelected}
          takenLabel={t('bookings.taken')}
        />
      ) : null}

      <Card variant="accent">
        <p className="m-0 text-sm leading-relaxed text-muted">
          <span className="font-medium text-gold-bright">{t('bookings.suggestionLead')}</span>{' '}
          {t('bookings.suggestionBody')}
        </p>
      </Card>

      {bookSlot.isError ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {t('bookings.bookingError')}
        </p>
      ) : null}

      {confirmed ? (
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs text-muted">{t('bookings.confirmedLabel')}</p>
            <p className="m-0 text-[15px] font-medium">
              {t('bookings.confirmedSummary', {
                facility: facilityName,
                weekday: dayParts(activeDay, locale).weekday,
                day: dayParts(activeDay, locale).day,
                time: timeLabel(confirmed, locale),
              })}
            </p>
          </div>
          <Button variant="outline" onClick={() => setConfirmed(null)}>
            {t('bookings.change')}
          </Button>
        </Card>
      ) : (
        <Button size="lg" disabled={!selected || bookSlot.isPending} onClick={confirm}>
          {selected
            ? t('bookings.confirm', { facility: facilityName, time: timeLabel(selected, locale) })
            : t('bookings.pickSlot')}
        </Button>
      )}
    </Screen>
  );
}
