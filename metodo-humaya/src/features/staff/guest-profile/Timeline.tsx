import { Card } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { TimelineEvent } from '@/types';
import type { ProfileTextos } from './copy';

/**
 * La línea de tiempo del HUMAYA Experience: antes, durante y después.
 *
 * ── POR QUÉ LA FRASE SE ARMA ACÁ Y NO EN EL SERVICIO ────────────────────
 * Porque la frase tiene idioma y el hecho no. `timelineFor()` devolvía
 * «Preparación pre-llegada» y «día 7 de 7» ya escritos, en español, y con
 * recepción en inglés la línea de tiempo quedaba en español en medio de una
 * pantalla traducida. Ahora el servicio manda cuántas respuestas hay y en
 * qué día de los siete va; el texto lo pone la pantalla.
 */
export function Timeline({ events, copy }: { events: TimelineEvent[]; copy: ProfileTextos }) {
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
            <span className="flex-1">{nombreDelHito(event, copy)}</span>
            <span className="text-muted">{cuandoFue(event, copy)}</span>
            <span className="sr-only">{event.done ? copy.hitoCumplido : copy.hitoPendiente}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function nombreDelHito(event: TimelineEvent, copy: ProfileTextos): string {
  switch (event.id) {
    case 'interview':
      return event.interview?.complete
        ? copy.hitoEntrevistaCompleta
        : copy.hitoEntrevistaParcial(event.interview?.answered ?? 0, event.interview?.total ?? 0);
    case 'prep':
      return copy.hitoPreparacion;
    case 'arrival':
      return copy.hitoLlegada;
    default:
      return copy.hitoSeguimiento;
  }
}

function cuandoFue(event: TimelineEvent, copy: ProfileTextos): string {
  if (event.id === 'prep') {
    return event.prepDay ? copy.cuandoDiaDeSiete(event.prepDay) : copy.cuandoNada;
  }
  if (event.date) return event.date;
  // La entrevista sin empezar no tiene fecha, y «—» no diría por qué.
  return event.id === 'interview' ? copy.cuandoSinEmpezar : copy.cuandoNada;
}
