import { Card } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { TimelineEvent } from '@/types';
import { profileCopy as copy } from './copy';

/** La línea de tiempo del Método Humaya: antes, durante y después. */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Card className="flex flex-col gap-2.5">
      <span className="text-eyebrow font-medium text-gold">{copy.methodTitle}</span>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-2.5 text-[13px]">
            <span
              aria-hidden="true"
              className={cn(
                'size-2.5 shrink-0 rounded-pill',
                event.done ? 'bg-gold' : 'border-1.5 border-line-strong',
              )}
            />
            <span className="flex-1">{event.label}</span>
            <span className="text-muted">{event.when}</span>
            <span className="sr-only">{event.done ? '· cumplido' : '· pendiente'}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
