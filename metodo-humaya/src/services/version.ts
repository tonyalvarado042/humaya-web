/**
 * Si el servidor ya tiene una versión más nueva que la que está en pantalla.
 *
 * ── POR QUÉ EXISTE ESTE ARCHIVO ─────────────────────────────────────────
 * Comprobado el 16 de noviembre de 2026: la pestaña de Tony estaba corriendo
 * `index-BjLNlYcC.js` mientras el servidor servía `index-B5bwCd58.js`. La
 * ficha del huésped ya estaba publicada y en su pantalla no aparecía.
 *
 * La culpa es del service worker, y es por diseño: guarda la aplicación
 * entera para que abra sin red, y solo busca una versión nueva cuando la
 * página se carga de verdad. Una pantalla de recepción que queda abierta
 * todo el día nunca se carga de verdad, así que puede quedarse días atrás
 * sin que nadie lo note.
 *
 * Eso en una recepción es grave: alguien atiende con la pantalla de ayer y
 * jura que está viendo lo de hoy. Lo que falla callado cuesta más que lo que
 * falla.
 *
 * ── CÓMO SE DETECTA ─────────────────────────────────────────────────────
 * El `index.html` que se publica apunta a un bundle con hash en el nombre.
 * Si el hash que pide el servidor no es el que tiene cargado esta pestaña,
 * hay versión nueva. No hace falta preguntarle nada al service worker.
 *
 * ── Y POR QUÉ NO RECARGA SOLA ───────────────────────────────────────────
 * Porque una recarga automática se lleva por delante la respuesta a medio
 * escribir. Avisa, y decide la persona.
 */

const BUNDLE = /\/assets\/index-[A-Za-z0-9_-]+\.js/;

/** El bundle que tiene cargado esta pestaña. */
export function bundleDelDocumento(doc: Document): string | null {
  const script = doc.querySelector<HTMLScriptElement>('script[src*="/assets/index-"]');
  const src = script?.getAttribute('src') ?? '';
  return src.match(BUNDLE)?.[0] ?? null;
}

/** El bundle al que apunta un `index.html`. */
export function bundleDelHtml(html: string): string | null {
  return html.match(BUNDLE)?.[0] ?? null;
}

export async function hayVersionNueva(): Promise<boolean> {
  // En desarrollo no hay bundle con hash: Vite sirve los módulos sueltos.
  const mio = bundleDelDocumento(document);
  if (!mio) return false;

  try {
    // El parámetro no es decorativo: sin él, el service worker contesta con
    // el `index.html` que tiene guardado y la comparación siempre da igual.
    const respuesta = await fetch(`/index.html?v=${Date.now()}`, { cache: 'no-store' });
    if (!respuesta.ok) return false;

    const delServidor = bundleDelHtml(await respuesta.text());
    return delServidor !== null && delServidor !== mio;
  } catch {
    // Sin red no se sabe, y no saber no es motivo para molestar a nadie.
    return false;
  }
}

/** Trae la versión nueva. Recarga aunque el service worker no coopere. */
export async function traerVersionNueva(): Promise<void> {
  try {
    const registros = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registros.map((registro) => registro.update()));
    for (const registro of registros) {
      registro.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch {
    // Si no hay service worker, la recarga sola alcanza.
  }
  window.location.reload();
}
