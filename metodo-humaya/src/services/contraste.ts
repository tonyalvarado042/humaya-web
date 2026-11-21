/**
 * Cuánto contrasta un color contra otro, con la fórmula de WCAG 2.
 *
 * ── PARA QUÉ ────────────────────────────────────────────────────────────
 * El formulario de marca deja elegir el color de acento del hotel. Un dorado
 * claro sobre blanco, o un azul oscuro sobre negro, se ve bien en el selector
 * de color y es ilegible en la pantalla. Eso no se descubre hasta que un
 * huésped no encuentra el botón.
 *
 * Regla de la casa: lo que se sabe de antemano que va a salir mal se dice
 * ANTES, no se deja fallar callado. Esto es lo que lo sabe de antemano.
 *
 * ── LOS NÚMEROS ─────────────────────────────────────────────────────────
 * WCAG 2.1 AA pide 4.5:1 para texto normal y 3:1 para texto grande y para
 * los bordes de un control. Un acento se usa para las dos cosas, así que el
 * formulario avisa debajo de 3 y recomienda desde 4.5.
 */

export const MINIMO_TEXTO = 4.5;
export const MINIMO_GRANDE = 3;

/** Los tres canales de un `#rrggbb`, de 0 a 1. Null si no es un color. */
function canales(hex: string): [number, number, number] | null {
  const limpio = hex.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(limpio)) return null;
  return [
    parseInt(limpio.slice(1, 3), 16) / 255,
    parseInt(limpio.slice(3, 5), 16) / 255,
    parseInt(limpio.slice(5, 7), 16) / 255,
  ];
}

/**
 * La luminancia relativa de WCAG.
 *
 * El `0.0404...` y los exponentes no son arbitrarios: deshacen la curva de
 * gamma de sRGB para que el número represente luz y no el valor del byte.
 */
export function luminancia(hex: string): number | null {
  const rgb = canales(hex);
  if (!rgb) return null;
  const lineal = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lineal[0] + 0.7152 * lineal[1] + 0.0722 * lineal[2];
}

/**
 * La razón de contraste entre dos colores, de 1 (iguales) a 21 (negro y
 * blanco). Null si alguno no es un color.
 *
 * El orden no importa: siempre se divide el más claro entre el más oscuro.
 */
export function contraste(uno: string, otro: string): number | null {
  const a = luminancia(uno);
  const b = luminancia(otro);
  if (a === null || b === null) return null;
  const claro = Math.max(a, b);
  const oscuro = Math.min(a, b);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * Qué color de texto se lee mejor encima de este: negro o blanco.
 *
 * Sirve para proponer `sobreAcento` solo, en vez de dejar que alguien elija
 * texto blanco sobre un amarillo.
 */
export function textoQueSeLee(fondo: string): '#ffffff' | '#000000' | null {
  const conBlanco = contraste(fondo, '#ffffff');
  const conNegro = contraste(fondo, '#000000');
  if (conBlanco === null || conNegro === null) return null;
  return conBlanco >= conNegro ? '#ffffff' : '#000000';
}

export type Veredicto = 'bien' | 'justo' | 'mal' | 'desconocido';

/**
 * El contraste traducido a algo que se pueda poner en pantalla.
 *
 * - `bien`: se lee como texto normal (4.5 o más).
 * - `justo`: se lee grande o como borde, pero no como texto chico (3 a 4.5).
 * - `mal`: no se lee (menos de 3).
 */
export function veredicto(razon: number | null): Veredicto {
  if (razon === null) return 'desconocido';
  if (razon >= MINIMO_TEXTO) return 'bien';
  if (razon >= MINIMO_GRANDE) return 'justo';
  return 'mal';
}
