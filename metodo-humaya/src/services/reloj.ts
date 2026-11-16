import { SUPABASE_URL } from './sesion';

/**
 * La hora, corregida contra el servidor.
 *
 * ── POR QUÉ NO ALCANZA CON `Date.now()` ─────────────────────────────────
 * Comprobado el 16 de noviembre de 2026 en la máquina de Tony: el reloj del
 * equipo iba **4 minutos adelantado** del servidor. Una nota recién escrita
 * aparecía como «hace 4 minutos», y el aviso de «esperando hace…» le habría
 * sumado esos 4 minutos a cada huésped. Un número que dice cuánto lleva
 * esperando alguien no puede depender de si la computadora tiene la hora bien.
 *
 * ── CÓMO SE MIDE ────────────────────────────────────────────────────────
 * Toda respuesta HTTP trae la cabecera `Date` con la hora del servidor. Una
 * sola petición alcanza para saber cuánto miente el reloj local, y de ahí en
 * adelante se le resta esa diferencia.
 *
 * Si la medición falla, se sigue con `Date.now()`: un reloj corrido es peor
 * que uno exacto, pero mucho mejor que una pantalla que no carga.
 */

let desfaseMs = 0;
let midiendo: Promise<void> | null = null;

async function medir(): Promise<void> {
  try {
    const antes = Date.now();
    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/`, { method: 'HEAD' });
    const despues = Date.now();

    const cabecera = respuesta.headers.get('date');
    if (!cabecera) return;

    const delServidor = new Date(cabecera).getTime();
    if (Number.isNaN(delServidor)) return;

    // El viaje de ida y vuelta se reparte: la cabecera se escribió más o
    // menos a la mitad. Sin esto, una red lenta se confundiría con un reloj
    // atrasado.
    const local = antes + (despues - antes) / 2;
    const diferencia = local - delServidor;

    // Menos de un segundo no vale la pena corregir, y la cabecera `Date`
    // viene redondeada al segundo: corregir ese ruido sería inventar precisión.
    desfaseMs = Math.abs(diferencia) >= 1000 ? diferencia : 0;
  } catch {
    // Sin red no hay corrección. Se sigue con el reloj local.
  }
}

/** Arranca la medición una sola vez. Se puede llamar sin esperar. */
export function sincronizarReloj(): void {
  midiendo ??= medir();
}

/** Ahora, en milisegundos, según el servidor. */
export function ahora(): number {
  sincronizarReloj();
  return Date.now() - desfaseMs;
}

/** Cuánto se está corrigiendo, en milisegundos. Para poder verlo en pantalla. */
export function desfaseDelReloj(): number {
  return desfaseMs;
}
