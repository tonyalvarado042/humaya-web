import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, SegmentedControl, SlotGrid } from '@/components/ui';
import {
  useAdminServicios,
  useBookSlot,
  useGuestProfile,
  useReservarServicio,
  useServicioSlots,
  useSpaSlots,
} from '@/hooks';
import { getToday } from '@/services/clock';
import { intlLocale } from '@/i18n/localizedText';
import type { SpaFacility } from '@/types';
import { dayParts, timeLabel } from '../format';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { useCurrentStay } from '../layout/useCurrentStay';
import { DayPicker } from './DayPicker';

const SPA_VALUES = new Set(['sauna', 'cold_plunge']);

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

/** "HH:MM" de un servicio a una hora ISO completa, para reusar timeLabel(). */
function toIsoTime(day: string, hhmm: string): string {
  return `${day}T${hhmm}:00-06:00`;
}

function servicioPrice(precioUsd: number | null, unidad: string, proveedor: string | null): string {
  const price = precioUsd != null ? `$${precioUsd}/${unidad}` : '';
  const withProveedor = proveedor ? `Con ${proveedor}.` : '';
  return [withProveedor, price].filter(Boolean).join(' ');
}

export function BookingsPage() {
  const { stayId } = useCurrentStay();
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const profile = useGuestProfile(stayId);
  const servicios = useAdminServicios(true);

  const [value, setValue] = useState('sauna');
  const [day, setDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ label: string; time: string } | null>(null);

  const days = profile.data
    ? bookableDays(profile.data.stay.checkIn, profile.data.stay.checkOut)
    : [];
  const activeDay = day ?? days[0] ?? getToday();

  const isSpa = SPA_VALUES.has(value);
  const spaFacility: SpaFacility = value === 'cold_plunge' ? 'cold_plunge' : 'sauna';
  const activeServicio = (servicios.data ?? []).find((servicio) => servicio.id === value);

  const spaSlots = useSpaSlots(spaFacility, activeDay);
  const bookSpaSlot = useBookSlot(stayId);

  const servicioSlots = useServicioSlots(isSpa ? '' : value, activeDay);
  const reservarServicio = useReservarServicio(isSpa ? '' : value, activeDay);

  if (profile.isPending || servicios.isPending) {
    return <ScreenLoading label={t('bookings.loading')} />;
  }

  if (profile.isError || servicios.isError || !profile.data || !servicios.data) {
    return (
      <ScreenError
        onRetry={() => {
          void profile.refetch();
          void servicios.refetch();
        }}
      />
    );
  }

  const facilityOptions = [
    { value: 'sauna', label: t('bookings.sauna') },
    { value: 'cold_plunge', label: t('bookings.coldPlunge') },
    ...servicios.data.map((servicio) => ({ value: servicio.id, label: servicio.nombre })),
  ];

  function changeValue(next: string) {
    setValue(next);
    setSelected(null);
    setConfirmed(null);
  }

  function changeDay(next: string) {
    setDay(next);
    setSelected(null);
    setConfirmed(null);
  }

  const facilityName = value === 'cold_plunge' ? t('bookings.coldPlunge') : t('bookings.sauna');
  const locale = intlLocale(language);
  const guestName = profile.data.guest.fullName;

  function confirm() {
    if (!selected) return;
    if (isSpa) {
      bookSpaSlot.mutate(
        { facility: spaFacility, start: selected },
        {
          onSuccess: () => {
            setConfirmed({ label: facilityName, time: selected });
            setSelected(null);
          },
        },
      );
    } else if (activeServicio) {
      reservarServicio.mutate(
        { stayId, guestName, horaInicio: selected },
        {
          onSuccess: () => {
            setConfirmed({ label: activeServicio.nombre, time: toIsoTime(activeDay, selected) });
            setSelected(null);
          },
        },
      );
    }
  }

  const description = isSpa
    ? value === 'cold_plunge'
      ? t('bookings.coldPlungeInfo')
      : t('bookings.saunaInfo')
    : activeServicio
      ? [
          activeServicio.descripcion,
          servicioPrice(
            activeServicio.precioUsd,
            activeServicio.unidadPrecio,
            activeServicio.proveedor,
          ),
        ]
          .filter(Boolean)
          .join(' ')
      : '';

  const slotsQuery = isSpa ? spaSlots : servicioSlots;
  const slotItems = isSpa
    ? (spaSlots.data ?? []).map((slot) => ({
        id: slot.start,
        label: timeLabel(slot.start, locale),
        taken: Boolean(slot.stayId),
      }))
    : (servicioSlots.data ?? []).map((slot) => ({
        id: slot.start,
        label: timeLabel(toIsoTime(activeDay, slot.start), locale),
        taken: slot.taken,
      }));

  const selectedLabel = selected
    ? isSpa
      ? timeLabel(selected, locale)
      : timeLabel(toIsoTime(activeDay, selected), locale)
    : null;

  const confirmTargetName = isSpa ? facilityName : (activeServicio?.nombre ?? '');
  const mutationPending = isSpa ? bookSpaSlot.isPending : reservarServicio.isPending;
  const mutationError = isSpa ? bookSpaSlot.isError : reservarServicio.isError;

  return (
    <Screen>
      <ScreenHeading
        eyebrow={t('bookings.eyebrow')}
        title={t('bookings.title')}
        description={description}
      />

      <SegmentedControl
        label={t('bookings.facilityLabel')}
        options={facilityOptions}
        value={value}
        onChange={changeValue}
      />

      {days.length === 0 ? (
        <EmptyState title={t('bookings.noDaysTitle')} description={t('bookings.noDaysBody')} />
      ) : (
        <DayPicker days={days} value={activeDay} onChange={changeDay} />
      )}

      {slotsQuery.isPending ? <ScreenLoading label={t('bookings.loadingSlots')} lines={2} /> : null}

      {slotsQuery.isError ? <ScreenError onRetry={() => void slotsQuery.refetch()} /> : null}

      {slotsQuery.data ? (
        <SlotGrid
          label={t('bookings.slotsLabel', { facility: confirmTargetName.toLowerCase() })}
          slots={slotItems}
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

      {mutationError ? (
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
                facility: confirmed.label,
                weekday: dayParts(activeDay, locale).weekday,
                day: dayParts(activeDay, locale).day,
                time: timeLabel(confirmed.time, locale),
              })}
            </p>
          </div>
          <Button variant="outline" onClick={() => setConfirmed(null)}>
            {t('bookings.change')}
          </Button>
        </Card>
      ) : (
        <Button size="lg" disabled={!selected || mutationPending} onClick={confirm}>
          {selectedLabel
            ? t('bookings.confirm', { facility: confirmTargetName, time: selectedLabel })
            : t('bookings.pickSlot')}
        </Button>
      )}
    </Screen>
  );
}
