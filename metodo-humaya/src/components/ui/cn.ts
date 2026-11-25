/**
 * Une clases de Tailwind descartando las vacías, `false` y `undefined`.
 *
 * ── LO QUE ESTO NO HACE, Y HAY QUE TENERLO PRESENTE ─────────────────────
 * **No resuelve conflictos.** No es `tailwind-merge`: pega las clases una
 * detrás de otra. Si un componente trae `h-auto` de base y quien lo usa pide
 * `h-8`, el elemento sale con las dos, y cuál gana la decide el orden de la
 * hoja de estilos compilada — no el orden en el que se escribieron acá.
 *
 * Eso no es teórico: el 25 de noviembre de 2026 el monograma de HUMAYA salió
 * a 642×792 en un teléfono porque el `h-auto` del logo le ganaba al `h-8` de
 * la barra de recepción. Ver `LogoDelHotel.tsx`.
 *
 * La regla, mientras `cn` sea esto: **un componente no pone de base una
 * propiedad que quien lo usa va a querer cambiar.** Las bases son lo
 * estructural (`block`, `object-contain`); las medidas las pide la pantalla.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
