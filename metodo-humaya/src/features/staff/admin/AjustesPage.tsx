import { Badge, Button, Card } from '@/components/ui';
import { useAjustes, useCambiarDemo } from '@/hooks';
import { useEsAdministrador } from '../puerta/contexto';
import { adminCopy as copy } from './copy';

/**
 * Lo que no es de ninguna de las otras secciones. Hoy: los datos de ejemplo.
 *
 * Tony, 15 de noviembre de 2026: «el demo debería quedar como opción temporal
 * hasta que yo lo publique o en settings lo quite». Esta es esa parte de
 * settings.
 */
export function AjustesPage() {
  const ajustes = useAjustes();
  const cambiarDemo = useCambiarDemo();
  const esAdmin = useEsAdministrador();

  const demoVisible = ajustes.data?.demoVisible ?? false;

  return (
    <section className="flex flex-col gap-3">
      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="m-0 font-display text-xl text-text">{copy.demoTitulo}</h2>
            <Badge tone={demoVisible ? 'success' : 'neutral'}>
              {demoVisible ? copy.demoEncendido : copy.demoApagado}
            </Badge>
          </div>
          <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">{copy.demoCuerpo}</p>
          {esAdmin ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                disabled={cambiarDemo.isPending}
                onClick={() => cambiarDemo.mutate(!demoVisible)}
              >
                {demoVisible ? copy.demoApagar : copy.demoEncender}
              </Button>
              {cambiarDemo.isError ? (
                <span role="alert" className="text-[13px] text-on-alert">
                  {copy.demoSoloAdmin}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
