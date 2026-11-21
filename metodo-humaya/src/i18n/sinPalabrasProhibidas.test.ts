import { describe, expect, it } from 'vitest';
import en from './en.json';
import es from './es.json';

/**
 * Las palabras que el hotel no dice.
 *
 * ── POR QUÉ EXISTE ESTA PRUEBA ──────────────────────────────────────────
 * Porque la regla estaba escrita en `marca.ts` y la app la rompía igual.
 * Abriendo la ficha del huésped el 21 de noviembre de 2026 apareció en
 * pantalla «Protocolo pre-llegada», y en el Home del huésped «Todavía no
 * arrancó tu protocolo». La decisión de Tony del 11 de noviembre dice lo
 * contrario, textual en `marca.ts`:
 *
 *   «⚠️ «Protocolo» queda PROHIBIDO por la misma razón — suena todavía más
 *    a hospital. Donde haga falta esa idea se escribe «el orden» o «la
 *    secuencia».»
 *
 * Peor: una prueba de la ficha del huésped AFIRMABA el texto prohibido, así
 * que el conjunto en verde estaba defendiendo el error.
 *
 * Una regla que solo vive en un comentario se rompe sola. Esta prueba la
 * sostiene.
 *
 * ── QUÉ MIRA Y QUÉ NO ───────────────────────────────────────────────────
 * Mira los VALORES de los archivos de traducción, que es lo que el huésped
 * lee. No mira las claves (`protocolTitle`) ni los nombres de archivos y
 * tipos: esos no se le muestran a nadie, y renombrarlos no cambia nada de
 * lo que el hotel dice. El texto de recepción que no está acá lo cuida la
 * prueba de su propia pantalla.
 */

/** Toda cadena del JSON, con su camino, para poder decir dónde está. */
function cadenas(valor: unknown, camino = ''): [string, string][] {
  if (typeof valor === 'string') return [[camino, valor]];
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([clave, dentro]) =>
      cadenas(dentro, camino ? `${camino}.${clave}` : clave),
    );
  }
  return [];
}

const PROHIBIDAS = [
  // Decisión de Tony del 11 de noviembre de 2026: suena a hospital.
  /protocolos?\b/i,
  // «Nunca yoga, en Humaya es pilates.»
  /\byoga\b/i,
];

describe('el vocabulario de la app', () => {
  for (const [nombre, archivo] of [
    ['es', es],
    ['en', en],
  ] as const) {
    it(`no usa palabras prohibidas en ${nombre}.json`, () => {
      const malas = cadenas(archivo).filter(([, texto]) =>
        PROHIBIDAS.some((prohibida) => prohibida.test(texto)),
      );

      expect(malas).toEqual([]);
    });
  }

  it('la prueba sirve: agarra una palabra prohibida si entra', () => {
    // Sin esto, un día alguien cambia las expresiones y la prueba queda en
    // verde sin mirar nada. Un verificador que nunca falló no verifica.
    const malas = cadenas({ home: { titulo: 'Tu protocolo de 7 días' } }).filter(([, texto]) =>
      PROHIBIDAS.some((prohibida) => prohibida.test(texto)),
    );

    expect(malas).toEqual([['home.titulo', 'Tu protocolo de 7 días']]);
  });
});
