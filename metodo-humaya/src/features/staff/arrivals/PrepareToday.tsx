import { Skeleton } from '@/components/ui';
import { useWowsDueBy } from '@/hooks';
import { timeLabel, villaName } from '../format';
import { arrivalsCopy as copy } from './copy';

/** Las experiencias WOW con hora límite hoy, ordenadas por cuándo vencen. */
export function PrepareToday() {
  const wows = useWowsDueBy();

  return (
    <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="m-0 font-display text-2xl font-medium">{copy.prepareTitle}</h2>

      {wows.isPending ? (
        <>
          <span aria-live="polite" className="sr-only">
            Cargando los pendientes del día…
          </span>
          <Skeleton variant="line" />
          <Skeleton variant="line" className="w-2/3" />
        </>
      ) : null}

      {wows.data?.length === 0 ? (
        <p className="m-0 text-sm text-muted">{copy.prepareEmpty}</p>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {wows.data?.map((wow) => (
          <li key={wow.id} className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium">{wow.title}</span>
            <span className="text-muted">
              {villaName(wow.villa)} · antes de las {timeLabel(wow.dueBy ?? '')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
