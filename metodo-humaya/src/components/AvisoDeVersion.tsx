import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { hayVersionNueva, traerVersionNueva } from '@/services/version';

/** Cada cinco minutos alcanza: un despliegue no es algo que pase cada rato. */
const CADA_CUANTO_MS = 5 * 60_000;

const copy = {
  titulo: 'Hay una versión más nueva de esta pantalla.',
  cuerpo: 'Lo que estás viendo puede estar desactualizado.',
  actualizar: 'Actualizar',
};

/**
 * Avisa cuando el servidor ya publicó algo más nuevo que lo que esta pestaña
 * tiene cargado.
 *
 * ── POR QUÉ NO RECARGA SOLA ─────────────────────────────────────────────
 * Porque se llevaría por delante la respuesta a medio escribir. Avisa, y
 * decide quien está atendiendo.
 *
 * ── POR QUÉ NO SE PUEDE CERRAR ──────────────────────────────────────────
 * Porque el aviso no es una sugerencia: mientras esté, la pantalla está
 * mintiendo. Ocupa una línea abajo y se va sola al actualizar.
 */
export function AvisoDeVersion() {
  const [hay, setHay] = useState(false);

  useEffect(() => {
    let vivo = true;

    function mirar() {
      void hayVersionNueva().then((nueva) => {
        // Una vez que hay versión nueva, no deja de haberla. No se apaga
        // sola para que no parpadee si una consulta falla.
        if (vivo && nueva) setHay(true);
      });
    }

    mirar();
    const reloj = window.setInterval(mirar, CADA_CUANTO_MS);
    // Volver a la pestaña es el momento exacto en que alguien va a confiar
    // en lo que ve.
    window.addEventListener('focus', mirar);

    return () => {
      vivo = false;
      window.clearInterval(reloj);
      window.removeEventListener('focus', mirar);
    };
  }, []);

  if (!hay) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-line-strong bg-surface px-4 py-3 shadow-lg"
    >
      <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-gold" />
      <span className="text-sm font-medium text-text">{copy.titulo}</span>
      <span className="text-[13px] text-muted">{copy.cuerpo}</span>
      <Button variant="outline" onClick={() => void traerVersionNueva()}>
        {copy.actualizar}
      </Button>
    </div>
  );
}
