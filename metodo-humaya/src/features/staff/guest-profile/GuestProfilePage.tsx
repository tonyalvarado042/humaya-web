import { Link, useParams } from 'react-router-dom';
import { Card, EmptyState, Tag, Textarea } from '@/components/ui';
import { localizedText } from '@/i18n/localizedText';
import { useGuestProfile, useSaveTeamNotes } from '@/hooks';
import { initials, villaName } from '../format';
import { Screen, ScreenLoading } from '../layout/ScreenState';
import { profileCopy as copy } from './copy';
import { Timeline } from './Timeline';
import { WowPanel } from './WowPanel';

/** Noches entre la entrada y la salida. */
function nightsBetween(checkIn: string, checkOut: string): number {
  const from = Date.parse(`${checkIn.slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${checkOut.slice(0, 10)}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

export function GuestProfilePage() {
  const { stayId } = useParams<{ stayId: string }>();
  const profile = useGuestProfile(stayId ?? '');
  const saveNotes = useSaveTeamNotes(stayId ?? '');

  if (!stayId) {
    return (
      <Screen>
        <NotFound />
      </Screen>
    );
  }

  if (profile.isPending) {
    return <ScreenLoading label={copy.loading} />;
  }

  // El servicio lanza "No existe la estadía" para un id inventado, así que un
  // error acá casi siempre es un enlace viejo, no una falla de red.
  if (profile.isError || !profile.data) {
    return (
      <Screen>
        <NotFound />
      </Screen>
    );
  }

  const { guest, stay, alerts, preferredCare, pillars, timeline, teamNotes } = profile.data;

  return (
    <Screen>
      <Link to="/staff" className="text-sm text-gold no-underline">
        {copy.back}
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <span
          aria-hidden="true"
          className="flex size-18 shrink-0 items-center justify-center rounded-pill bg-ink font-display text-[28px] text-gold-on-ink"
        >
          {initials(guest.fullName)}
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="m-0 font-display text-[28px] leading-tight font-medium lg:text-[40px]">
            {guest.fullName}
          </h1>
          <p className="m-0 text-[15px] text-muted">
            {copy.summary(
              villaName(stay.villa),
              nightsBetween(stay.checkIn, stay.checkOut),
              stay.partySize,
              copy.localeNames[guest.locale] ?? guest.locale,
            )}
          </p>
        </div>
      </header>

      {alerts.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {alerts.map((alert) => (
            <li key={alert.label.es}>
              <Tag
                tone={
                  alert.kind === 'allergy'
                    ? 'alert'
                    : alert.kind === 'celebration'
                      ? 'celebration'
                      : 'info'
                }
              >
                {localizedText(alert.label, 'es')}
              </Tag>
            </li>
          ))}
        </ul>
      ) : null}

      <Card variant="ink" className="flex flex-col gap-1.5">
        <span className="text-eyebrow text-ink-muted">{copy.careTitle}</span>
        <p className="m-0 font-display text-2xl leading-snug italic">{preferredCare}</p>
      </Card>

      {/*
        Debajo de 1024 px las experiencias WOW suben: es lo primero que el
        equipo revisa al recibir a alguien. Desde 1024 px van en su columna.
      */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-5 lg:order-1">
          {pillars.length > 0 ? (
            <ul className="m-0 grid list-none gap-3.5 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {pillars.map((pillar) => (
                <li key={pillar.pillar}>
                  <Card className="flex h-full flex-col gap-1.5">
                    <span className="text-eyebrow font-medium text-gold">
                      {copy.pillarNames[pillar.pillar]}
                    </span>
                    <p className="m-0 text-sm leading-relaxed">{pillar.text}</p>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-muted">{copy.noPillars}</p>
          )}

          <Timeline events={timeline} />

          <div className="flex flex-col gap-2">
            <Textarea
              label={copy.notesLabel}
              placeholder={copy.notesPlaceholder}
              defaultValue={teamNotes}
              onBlur={(event) => saveNotes.mutate(event.target.value)}
            />
            {saveNotes.isSuccess ? (
              <span aria-live="polite" className="text-[13px] text-on-success">
                {copy.notesSaved}
              </span>
            ) : null}
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:w-110 lg:shrink-0">
          <WowPanel stayId={stayId} />
        </div>
      </div>
    </Screen>
  );
}

function NotFound() {
  return (
    <EmptyState
      title={copy.notFoundTitle}
      description={copy.notFoundBody}
      action={
        <Link to="/staff" className="text-sm text-gold">
          {copy.back}
        </Link>
      }
    />
  );
}
