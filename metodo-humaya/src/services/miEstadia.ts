/**
 * La estadía que este teléfono ya encontró, para no volver a preguntarla.
 *
 * ── POR QUÉ EXISTE ──────────────────────────────────────────────────────
 * Tony, 21 de noviembre de 2026, sobre el QR del televisor: «debería tener
 * botón de entrar en la app, desde ahí la cual debe ingresar apellido y
 * código de reserva claro, pero guarda sesión para que cada vez no se lo
 * tenga que pedir».
 *
 * Tenía razón: `/entrada` encontraba la reserva y no se acordaba de nada. El
 * huésped que volvía a abrir el enlace —y lo abre, porque el QR está pegado
 * en la pantalla de su villa— tenía que buscar otra vez su código de Airbnb.
 * Eso es fricción, que es justo lo que el Servicio 3.0 del manual dice que
 * hay que quitar: «anticipar y conectar: usar información autorizada para
 * reducir fricciones».
 *
 * ── QUÉ SE GUARDA Y QUÉ NO ──────────────────────────────────────────────
 * Lo que el huésped ya vio en su pantalla: su nombre, sus fechas y el número
 * de reserva. Nada que él no haya visto ya, y nada de otra persona.
 *
 * NO es una sesión con permisos: no abre ninguna puerta ni autoriza nada. Es
 * una comodidad, y por eso vive en el teléfono y no en el servidor. Quien
 * tenga ese teléfono ya tenía el código.
 *
 * ── POR QUÉ CADUCA ──────────────────────────────────────────────────────
 * Porque una reserva vieja no es la estadía de nadie. Dos días después de la
 * salida se olvida sola: si el huésped vuelve, vuelve con otra reserva.
 *
 * ── POR QUÉ LA LLAVE LLEVA EL HOTEL ─────────────────────────────────────
 * Porque todos los hoteles comparten el dominio `guestexp.liderax10.com`, y
 * `localStorage` es del DOMINIO, no de la ruta. Con una sola llave, lo que
 * un teléfono buscó en un hotel salía saludado en el otro.
 *
 * Comprobado en vivo el 24 de noviembre de 2026: se buscó una reserva de
 * prueba en el hotel demo y, al abrir `/bikeandbed/entrada` en el mismo
 * teléfono, Bike & Bed decía **«Welcome back, Prueba Borrar»** — el nombre
 * de un huésped de otro hotel, en la pantalla de un hotel que nunca lo tuvo.
 *
 * No lo arregla RLS: esto pasa entero dentro del navegador.
 */

import { codigoActual } from '@/marca';

const RAIZ = 'humaya.mi-estadia';

/** La llave de ESTE hotel. Sin hotel resuelto no se recuerda nada. */
function llaveDelHotel(): string | null {
  const codigo = codigoActual();
  return codigo ? `${RAIZ}.${codigo}` : null;
}

/**
 * La llave vieja, sin hotel, que servía a todos a la vez. Se borra apenas se
 * la ve: mientras exista, sigue siendo el nombre de alguien a la vista de
 * cualquier otro hotel del mismo dominio.
 */
function borrarLaVieja(): void {
  try {
    localStorage.removeItem(RAIZ);
  } catch {
    // Sin almacenamiento no hay nada vieja que borrar.
  }
}
const DIAS_DESPUES = 2;

export interface MiEstadia {
  /** El número de reserva de Cloudbeds. */
  reserva: string;
  guestName: string | null;
  checkin: string | null;
  checkout: string | null;
}

function vigente(estadia: MiEstadia, hoy: string): boolean {
  if (!estadia.checkout) return true;
  const limite = new Date(`${estadia.checkout}T00:00:00Z`);
  limite.setUTCDate(limite.getUTCDate() + DIAS_DESPUES);
  return hoy <= limite.toISOString().slice(0, 10);
}

/** La estadía guardada, si hay una y todavía tiene sentido. */
export function miEstadia(hoy: string = new Date().toISOString().slice(0, 10)): MiEstadia | null {
  borrarLaVieja();
  const LLAVE = llaveDelHotel();
  if (!LLAVE) return null;

  let crudo: string | null;
  try {
    crudo = localStorage.getItem(LLAVE);
  } catch {
    // Ventana privada o almacenamiento bloqueado: no se recuerda nada y la
    // pantalla pide el código, como antes.
    return null;
  }
  if (!crudo) return null;

  try {
    const leido = JSON.parse(crudo) as Partial<MiEstadia>;
    if (!leido || typeof leido.reserva !== 'string' || !leido.reserva) return null;
    const estadia: MiEstadia = {
      reserva: leido.reserva,
      guestName: typeof leido.guestName === 'string' ? leido.guestName : null,
      checkin: typeof leido.checkin === 'string' ? leido.checkin : null,
      checkout: typeof leido.checkout === 'string' ? leido.checkout : null,
    };
    if (!vigente(estadia, hoy)) {
      olvidarEstadia();
      return null;
    }
    return estadia;
  } catch {
    // Un `localStorage` con basura adentro no puede dejar la pantalla rota.
    olvidarEstadia();
    return null;
  }
}

export function recordarEstadia(estadia: MiEstadia): void {
  const LLAVE = llaveDelHotel();
  if (!LLAVE) return;
  try {
    localStorage.setItem(LLAVE, JSON.stringify(estadia));
  } catch {
    // Sin almacenamiento la pantalla sirve igual; solo no recuerda.
  }
}

export function olvidarEstadia(): void {
  borrarLaVieja();
  const LLAVE = llaveDelHotel();
  if (!LLAVE) return;
  try {
    localStorage.removeItem(LLAVE);
  } catch {
    // Nada que hacer: si no se puede escribir, tampoco se pudo guardar.
  }
}
