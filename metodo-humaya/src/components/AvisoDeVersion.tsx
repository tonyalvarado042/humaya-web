import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { hayVersionNueva, traerVersionNueva } from '@/services/version';

/** Cada cinco minutos alcanza: un despliegue no es algo que pase cada rato. */
const CADA_CUANTO_MS = 5 * 60_000;

/**
 * Recepción trabaja en español o en inglés, así que el aviso también.
 *
 * La app del huésped habla cuatro idiomas y todavía no tiene estos textos:
 * por eso el aviso vive por ahora solo en recepción, que además es donde
 * una pantalla vieja hace daño de verdad.
 */
const textos = {
  es: {
    titulo: 'Hay una versión más nueva de esta pantalla.',
    cuerpo: 'Lo que estás viendo puede estar desactualizado.',
    actualizar: 'Actualizar',
    actualizando: 'Trayéndola…',
  },
  en: {
    titulo: 'There is a newer version of this screen.',
    cuerpo: 'What you are looking at may be out of date.',
    actualizar: 'Update',
    actualizando: 'Fetching it…',
  },
} as const;

export type IdiomaDelAviso = keyof typeof textos;

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
export function AvisoDeVersion({ idioma = 'es' }: { idioma?: IdiomaDelAviso }) {
  const copy = textos[idioma];
  const [hay, setHay] = useState(false);
  const [trayendo, setTrayendo] = useState(false);
  const barra = useRef<HTMLDivElement>(null);

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

  /**
   * La barra va fija abajo, así que tapa lo último de la pantalla — y lo
   * último de una conversación es el botón de enviar. En vez de taparlo, le
   * deja ese espacio libre al final de la página. Se mide en vez de fijarse
   * a ojo porque en un teléfono el texto se parte en varias líneas.
   */
  useLayoutEffect(() => {
    if (!hay) return;

    const medir = () => {
      document.body.style.paddingBottom = `${barra.current?.offsetHeight ?? 0}px`;
    };

    medir();
    window.addEventListener('resize', medir);
    return () => {
      window.removeEventListener('resize', medir);
      document.body.style.paddingBottom = '';
    };
  }, [hay]);

  if (!hay) return null;

  return (
    <div
      ref={barra}
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-line-strong bg-surface px-4 py-3 shadow-lg"
    >
      <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-gold" />
      <span className="text-sm font-medium text-text">{copy.titulo}</span>
      <span className="text-[13px] text-muted">{copy.cuerpo}</span>
      {/* Traer la versión nueva puede tardar unos segundos: hay que esperar
          a que el service worker nuevo tome el mando. Sin este aviso, el
          botón parece no hacer nada y se toca otra vez. */}
      <Button
        variant="outline"
        disabled={trayendo}
        onClick={() => {
          setTrayendo(true);
          void traerVersionNueva();
        }}
      >
        {trayendo ? copy.actualizando : copy.actualizar}
      </Button>
    </div>
  );
}
