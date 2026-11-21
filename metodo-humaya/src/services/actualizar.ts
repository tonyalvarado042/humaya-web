/**
 * Cuando la pantalla quedó más vieja que el servidor.
 *
 * ── EL FALLO QUE ESTO ATIENDE, Y CÓMO SE ENCONTRÓ ───────────────────────
 * Tony, 21 de noviembre de 2026, con una captura: `staff.stayhumaya.com/app`
 * mostrando «No pudimos cargar esta pantalla · Puede ser un problema de
 * conexión». No era la conexión. En el mismo momento, esa misma dirección
 * abría bien en otro navegador.
 *
 * Lo que pasaba: el 20 de noviembre las funciones empezaron a EXIGIR el
 * hotel en cada llamada, porque sin él devolvían los datos de los dos
 * hoteles mezclados. Una pestaña abierta desde antes sigue corriendo el
 * código viejo —el service worker lo mantiene vivo hasta que se recargue— y
 * ese código llama sin `hotel`. La función contesta 400 `falta_hotel`, que
 * es exactamente lo que tiene que hacer, y la app lo muestra como un
 * problema de conexión.
 *
 * Comprobado contra la función en vivo, desde el navegador, ese día:
 *   sin hotel  -> 400 {"error":"falta_hotel"}
 *   con hotel  -> 200
 *
 * ── POR QUÉ SE RECARGA SOLA Y POR QUÉ UNA SOLA VEZ ──────────────────────
 * Porque `falta_hotel` no puede venir de otra cosa: el código de hoy SIEMPRE
 * manda el hotel. Si llegó, este bundle es viejo, y no hay nada que el
 * huésped pueda hacer al respecto — decirle «probá de nuevo» es mandarlo a
 * mirar su wifi. Recargar es la única salida, así que la app la toma.
 *
 * Una sola vez por sesión, y con bandera: si después de recargar vuelve a
 * pasar, es otra cosa y tiene que verse el error de verdad, no un ciclo de
 * recargas. Sin `sessionStorage` no se recarga: no se puede garantizar «una
 * sola vez», y un ciclo es peor que un error.
 */

const LLAVE = 'humaya.app-actualizada';

/** Si esa respuesta significa «tu pantalla es más vieja que el servidor». */
export function esPantallaVieja(status: number, cuerpo: string): boolean {
  // Solo `falta_hotel`, no cualquier 400: los otros —un campo vacío, un id
  // que falta— vienen de lo que alguien está haciendo en la pantalla, y
  // recargarle el formulario encima le borraría lo que escribió.
  return status === 400 && cuerpo.includes('falta_hotel');
}

/**
 * Tira el service worker viejo y recarga. Devuelve si de verdad lo intentó,
 * para que quien llama sepa si ya lo hizo antes.
 */
export function actualizarLaApp(): boolean {
  try {
    if (sessionStorage.getItem(LLAVE)) return false;
    sessionStorage.setItem(LLAVE, '1');
  } catch {
    return false;
  }

  const sw = typeof navigator === 'undefined' ? undefined : navigator.serviceWorker;
  const listo = sw?.getRegistrations
    ? sw
        .getRegistrations()
        .then((registros) => Promise.all(registros.map((registro) => registro.unregister())))
        .catch(() => undefined)
    : Promise.resolve(undefined);

  void listo.then(() => window.location.reload());
  return true;
}
