import { elNegocio } from './negocio';
import { cliente } from './sesion';

/**
 * Los ajustes del hotel. Clave/valor, en `humaya_ajustes`.
 *
 * ── EL PRIMERO: demo_visible ────────────────────────────────────────────
 * Tony, 15 de noviembre de 2026: «el demo debería quedar como opción temporal
 * hasta que yo lo publique o en settings lo quite».
 *
 * Por eso los datos de ejemplo no se borraron del código: se apagan desde
 * Admin. Mientras el interruptor esté encendido, recepción puede alternar
 * entre las reservas de verdad y las estadías de la demo; apagado, la demo
 * desaparece de la pantalla sin tocar una línea ni desplegar nada.
 *
 * ── EL DÍA QUE HUBO DOS HOTELES ─────────────────────────────────────────
 * Acá decía: «hoy `humaya_propiedades` tiene una sola propiedad, así que se
 * lee el ajuste sin preguntar de cuál hotel. Cuando entre Bike & Bed habrá
 * que elegir, y este es el archivo que cambia.»
 *
 * Ese día llegó, y el aviso se quedó corto: no era solo que se LEÍA sin
 * elegir. `setDemoVisible` leía TODAS las propiedades y escribía el ajuste
 * en TODOS los hoteles. Comprobado en vivo el 21 de noviembre de 2026 con el
 * gemelo de esto, el interruptor del bot: estando en la pantalla del hotel
 * demo, el clic le cambió el ajuste a HUMAYA.
 *
 * Ahora se lee y se escribe UN hotel: el de esta pantalla.
 */

export interface Ajustes {
  /** ¿Se ofrecen los datos de ejemplo en recepción? */
  demoVisible: boolean;
}

export const AJUSTES_POR_DEFECTO: Ajustes = { demoVisible: true };

interface FilaAjuste {
  negocio_id: string;
  clave: string;
  valor: unknown;
}

export async function getAjustes(): Promise<Ajustes> {
  const db = await cliente();
  const { data, error } = await db.from('humaya_ajustes').select('*').eq('negocio_id', elNegocio());

  // Un fallo acá no debe tumbar recepción: se sigue con lo de siempre y la
  // pantalla funciona. Lo que no puede pasar es quedarse en blanco por un
  // ajuste.
  if (error) return AJUSTES_POR_DEFECTO;

  const filas = (data ?? []) as FilaAjuste[];
  const demo = filas.find((fila) => fila.clave === 'demo_visible');

  return {
    demoVisible: demo ? demo.valor === true : AJUSTES_POR_DEFECTO.demoVisible,
  };
}

/** Solo un administrador puede: RLS rechaza al resto, y la pantalla lo dice. */
export async function setDemoVisible(visible: boolean): Promise<void> {
  const db = await cliente();

  // UN hotel: el de esta pantalla. Antes se escribía en todos los que
  // tuvieran una propiedad, así que apagar el demo desde un hotel se lo
  // apagaba a los demás.
  const { error } = await db.from('humaya_ajustes').upsert(
    {
      negocio_id: elNegocio(),
      clave: 'demo_visible',
      valor: visible,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'negocio_id,clave' },
  );

  if (error) throw new Error(`ajustes_${error.code ?? 'error'}`);
}
