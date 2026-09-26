import { cn } from '@/components/ui/cn';
import type { VillaStatus } from '@/types';
import { villaName } from '../format';
import { arrivalsCopy as copy } from './copy';

const stateClasses: Record<VillaStatus['state'], string> = {
  arriving: 'bg-gold-dim text-ink',
  occupied: 'bg-ink text-on-ink',
  departing: 'border border-dashed border-muted-soft bg-surface text-text',
  free: 'border border-line bg-surface text-muted',
};

/** El tablero de las 10 villas. Al costado en escritorio, debajo en angosto. */
export function VillaBoard({ villas }: { villas: VillaStatus[] }) {
  if (villas.length === 0) return null;

  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
      <h2 className="m-0 font-display text-2xl font-medium">{copy.villasTitle}</h2>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4 xl:grid-cols-2">
        {villas.map((villa) => (
          <li
            key={villa.villa}
            className={cn(
              'flex h-16 flex-col justify-center gap-0.5 rounded-xl px-3 text-xs',
              stateClasses[villa.state],
            )}
          >
            <span className="text-sm font-semibold">{villaName(villa.villa)}</span>
            <span>{villa.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
