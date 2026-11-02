import {
  Card,
  EmptyState,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui';
import { useDaySchedule } from '@/hooks';
import type { SpaBooking, SpaScheduleRow } from '@/types';
import { longDate, villaName } from '../format';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { spaCopy as copy } from './copy';

/** La agenda del prototipo es la del 15 de noviembre. */
const SCHEDULE_DATE = '2026-11-15';

function Slot({ booking }: { booking: SpaBooking | null }) {
  if (!booking) {
    return (
      <span className="flex h-13 items-center rounded-xl border border-dashed border-line-strong px-3.5 text-sm text-muted">
        {copy.free}
      </span>
    );
  }

  return (
    <span className="flex h-13 items-center justify-between gap-3 rounded-xl bg-ink px-3.5 text-sm text-on-ink">
      <span className="truncate">{booking.guestName}</span>
      <span className="shrink-0 opacity-75">{villaName(booking.villa)}</span>
    </span>
  );
}

const isBooked = (row: SpaScheduleRow) => Boolean(row.sauna || row.coldPlunge);

export function SpaPage() {
  const schedule = useDaySchedule(SCHEDULE_DATE);

  if (schedule.isPending) {
    return <ScreenLoading label={copy.loading} />;
  }

  if (schedule.isError || !schedule.data) {
    return <ScreenError onRetry={() => void schedule.refetch()} />;
  }

  const rows = schedule.data.rows;
  const saunaCount = rows.filter((row) => row.sauna).length;
  const coldCount = rows.filter((row) => row.coldPlunge).length;
  const next = rows.find(isBooked);
  const nextBooking = next?.sauna ?? next?.coldPlunge ?? null;

  const booked = rows.filter(isBooked);
  const freeTimes = rows.filter((row) => !isBooked(row)).map((row) => row.time);

  return (
    <Screen>
      <ScreenHeading eyebrow={longDate(schedule.data.date)} title={copy.title} />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label={copy.statSauna} value={String(saunaCount)} />
        <StatTile label={copy.statCold} value={String(coldCount)} />
        <StatTile
          label={copy.statNext}
          value={next?.time ?? copy.noNext}
          suffix={nextBooking ? villaName(nextBooking.villa) : undefined}
        />
      </section>

      {booked.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyBody} />
      ) : (
        <>
          {/* Tabla completa: desde 1024 px */}
          <div className="hidden rounded-card border border-line bg-surface p-5 lg:block">
            <Table aria-label={copy.tableLabel}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-24">{copy.colTime}</TableHeaderCell>
                  <TableHeaderCell>{copy.colSauna}</TableHeaderCell>
                  <TableHeaderCell>{copy.colCold}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.time} className="border-b-0">
                    <TableCell className="text-[15px] font-medium">{row.time}</TableCell>
                    <TableCell>
                      <Slot booking={row.sauna} />
                    </TableCell>
                    <TableCell>
                      <Slot booking={row.coldPlunge} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/*
            Debajo de 1024 px solo los horarios con reserva llevan tarjeta; los
            libres se resumen en una línea, para no alargar la lista con diez
            tarjetas vacías.
          */}
          <div className="flex flex-col gap-3 lg:hidden">
            {booked.map((row) => (
              <Card key={row.time} className="flex flex-col gap-2.5">
                <span className="font-display text-xl">{row.time}</span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted">{copy.colSauna}</span>
                  <Slot booking={row.sauna} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted">{copy.colCold}</span>
                  <Slot booking={row.coldPlunge} />
                </div>
              </Card>
            ))}

            {freeTimes.length > 0 ? (
              <p className="m-0 text-sm text-muted">
                {copy.freeAt} {freeTimes.join(', ')}
              </p>
            ) : null}
          </div>
        </>
      )}
    </Screen>
  );
}
