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
 */

const LLAVE = 'humaya.mi-estadia';
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
  try {
    localStorage.setItem(LLAVE, JSON.stringify(estadia));
  } catch {
    // Sin almacenamiento la pantalla sirve igual; solo no recuerda.
  }
}

export function olvidarEstadia(): void {
  try {
    localStorage.removeItem(LLAVE);
  } catch {
    // Nada que hacer: si no se puede escribir, tampoco se pudo guardar.
  }
}
