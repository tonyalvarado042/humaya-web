import { useState } from 'react';
import {
  Card,
  EmptyState,
  SegmentedControl,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui';
import { useArrivals, usePendingWowCount, useVillaStatus } from '@/hooks';
import { getToday } from '@/services/clock';
import type { ArrivalRange } from '@/types';
import { localeDe, longDate, timeLabel, villaName } from '../format';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { AlertTags, ConciergeIndicator, InterviewBadge, ProfileLink } from './ArrivalRow';
import { demoCopy, type DemoTextos } from './copyDemo';
import { PrepareToday } from './PrepareToday';
import { VillaBoard } from './VillaBoard';

/**
 * Los tres periodos. Era una constante de modulo que leia `copy` al importar
 * el archivo: con dos idiomas se quedaba en el del primer render y el boton
 * de idioma no la cambiaba nunca.
 */
function periodos(copy: DemoTextos) {
  return [
    { value: 'today' as const, label: copy.today },
    { value: 'tomorrow' as const, label: copy.tomorrow },
    { value: 'week' as const, label: copy.week },
  ];
}

/**
 * La vista DEMO de Llegadas: las dos estadías de ejemplo con su entrevista,
 * sus alertas y el tablero de las diez villas.
 *
 * Tony, 15 de noviembre de 2026: «el demo debería quedar como opción temporal
 * hasta que yo lo publique o en settings lo quite». Por eso esta pantalla
 * sigue completa y entera: no se borró nada. Se llega a ella desde el filtro
 * de Llegadas, que solo ofrece la opción mientras `demo_visible` esté
 * encendido en Admin.
 */
export function LlegadasDemo() {
  const [idioma] = useIdiomaRecepcion();
  const copy = demoCopy[idioma];
  const locale = localeDe(idioma);
  const [range, setRange] = useState<ArrivalRange>('today');

  const arrivals = useArrivals(range);
  const today = useArrivals('today');
  const villas = useVillaStatus();
  const pendingWows = usePendingWowCount();

  if (arrivals.isPending) {
    return <ScreenLoading label={copy.loading} />;
  }

  if (arrivals.isError || !arrivals.data) {
    return <ScreenError onRetry={() => void arrivals.refetch()} />;
  }

  const rows = arrivals.data;
  const todayRows = today.data ?? [];
  const occupied = (villas.data ?? []).filter(
    (villa) => villa.state === 'arriving' || villa.state === 'occupied',
  ).length;
  const complete = todayRows.filter((arrival) => arrival.interview.complete).length;

  return (
    <Screen>
      <ScreenHeading
        eyebrow={longDate(getToday(), locale)}
        title={copy.title}
        action={
          <SegmentedControl
            label={copy.rangeLabel}
            options={periodos(copy)}
            value={range}
            onChange={setRange}
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label={copy.statArrivals} value={String(todayRows.length)} />
        <StatTile label={copy.statOccupancy} value={String(occupied)} suffix={copy.ofTen} />
        <StatTile
          label={copy.statInterviews}
          value={String(complete)}
          suffix={copy.ofArrivals(todayRows.length)}
        />
        <StatTile label={copy.statWows} value={String(pendingWows.data ?? 0)} variant="ink" />
      </section>

      {rows.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyBody} />
      ) : (
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            {/* Tabla: desde 1024 px */}
            <div className="hidden rounded-card border border-line bg-surface lg:block">
              <Table aria-label={copy.tableLabel}>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>{copy.colGuest}</TableHeaderCell>
                    <TableHeaderCell>{copy.colVilla}</TableHeaderCell>
                    <TableHeaderCell>{copy.colArrival}</TableHeaderCell>
                    <TableHeaderCell>{copy.colPeople}</TableHeaderCell>
                    <TableHeaderCell>{copy.colInterview}</TableHeaderCell>
                    <TableHeaderCell>{copy.colAlerts}</TableHeaderCell>
                    <TableHeaderCell>
                      <span className="sr-only">{copy.seeProfile}</span>
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((arrival) => (
                    <TableRow key={arrival.stayId}>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <span className="font-medium">{arrival.guestName}</span>
                          <ConciergeIndicator stayId={arrival.stayId} />
                        </span>
                      </TableCell>
                      <TableCell>{villaName(arrival.villa)}</TableCell>
                      <TableCell>{timeLabel(arrival.checkIn, locale)}</TableCell>
                      <TableCell>{arrival.partySize}</TableCell>
                      <TableCell>
                        <InterviewBadge interview={arrival.interview} />
                      </TableCell>
                      <TableCell>
                        <AlertTags alerts={arrival.alerts} />
                      </TableCell>
                      <TableCell className="text-right">
                        <ProfileLink stayId={arrival.stayId} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Tarjetas: debajo de 1024 px */}
            <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden">
              {rows.map((arrival) => (
                <li key={arrival.stayId}>
                  <Card className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-medium">{arrival.guestName}</span>
                          <ConciergeIndicator stayId={arrival.stayId} />
                        </span>
                        <span className="text-[13px] text-muted">
                          {villaName(arrival.villa)} · {timeLabel(arrival.checkIn, locale)} ·{' '}
                          {copy.people(arrival.partySize)}
                        </span>
                      </div>
                      <InterviewBadge interview={arrival.interview} />
                    </div>
                    <AlertTags alerts={arrival.alerts} />
                    <ProfileLink stayId={arrival.stayId} />
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5 xl:w-85 xl:shrink-0">
            <VillaBoard villas={villas.data ?? []} />
            <PrepareToday />
          </div>
        </div>
      )}
    </Screen>
  );
}
