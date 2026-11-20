/**
 * En qué momento de su estadía está el huésped.
 *
 * ── POR QUÉ ES LO PRIMERO QUE HAY QUE SABER ──────────────────────────────
 * La misma pregunta se contesta distinto según el día. «¿Dónde queda el
 * sauna?» el primer día es una bienvenida; la última mañana es una última
 * oportunidad, y la respuesta correcta incluye a qué hora cierra y que hoy
 * se va. Un recepcionista que no sabe en qué día va, contesta bien de
 * casualidad.
 *
 * Se calcula con fechas sin hora, en UTC, porque lo que importa es el día
 * del calendario: alguien que entra a las 11 p.m. ya está en su día 1.
 */

const soloDia = (iso: string) => iso.slice(0, 10);
const enMs = (dia: string) => Date.parse(`${dia}T00:00:00Z`);
const diasEntre = (desde: string, hasta: string) =>
  Math.round((enMs(hasta) - enMs(desde)) / 86_400_000);

export type ClaseDeMomento = 'por-llegar' | 'llega-hoy' | 'en-casa' | 'se-va-hoy' | 'se-fue';

export interface Momento {
  clase: ClaseDeMomento;
  /** Noche en la que va, empezando en 1. Cero si todavía no llegó. */
  dia: number;
  /** Noches totales de la estadía. */
  noches: number;
  /** Días que faltan para llegar, o que pasaron desde que se fue. */
  dias: number;
  /**
   * Si se va mañana. Se expone aparte porque cambia la respuesta a casi
   * todo: lo que se puede ofrecer, lo que ya no da tiempo, y lo que hay que
   * preguntar antes de que sea tarde.
   */
  seVaManana: boolean;
}

/**
 * Lo unico que hace falta saber de una estadia para ubicarla en el tiempo.
 *
 * No pide un `Stay` entero a proposito: asi la misma cuenta sirve para la
 * ficha de la demo y para una reserva real de Cloudbeds, que trae las dos
 * fechas y nada mas.
 */
export interface Fechas {
  checkIn: string;
  checkOut: string;
}

export function momentoDeLaEstadia(stay: Fechas, hoy: string): Momento {
  const entrada = soloDia(stay.checkIn);
  const salida = soloDia(stay.checkOut);
  const dia = soloDia(hoy);

  // Una estadía siempre vale al menos una noche, aunque las fechas vengan
  // iguales: un huésped que está en la villa no puede estar en «día 0».
  const noches = Math.max(1, diasEntre(entrada, salida));
  const paraEntrar = diasEntre(dia, entrada);
  const paraSalir = diasEntre(dia, salida);

  if (paraEntrar > 0) {
    return { clase: 'por-llegar', dia: 0, noches, dias: paraEntrar, seVaManana: false };
  }

  if (paraEntrar === 0) {
    return { clase: 'llega-hoy', dia: 1, noches, dias: 0, seVaManana: noches === 1 };
  }

  if (paraSalir < 0) {
    return { clase: 'se-fue', dia: noches, noches, dias: -paraSalir, seVaManana: false };
  }

  if (paraSalir === 0) {
    return { clase: 'se-va-hoy', dia: noches, noches, dias: 0, seVaManana: false };
  }

  return {
    clase: 'en-casa',
    dia: -paraEntrar + 1,
    noches,
    dias: paraSalir,
    seVaManana: paraSalir === 1,
  };
}
