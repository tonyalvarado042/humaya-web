import { describe, expect, it } from 'vitest';
import { diaDe, firmarLlave } from '../../../supabase/functions/humaya-tv/llave.ts';
import { abrirLlave } from '../../../supabase/functions/humaya-entrada/llave.ts';

/**
 * Lo que firma la pantalla tiene que abrirlo la puerta.
 *
 * ── POR QUÉ ESTA PRUEBA EXISTE ──────────────────────────────────────────
 * `llave.ts` está DOS veces, a propósito: una copia viaja con `humaya-tv`,
 * que firma, y otra con `humaya-entrada`, que abre. Son dos funciones
 * desplegables distintas y no hay forma de compartir un archivo entre ellas
 * sin cambiar cómo se publican.
 *
 * Si las dos copias se separan —alguien toca una y se olvida de la otra, o
 * se despliega una sola—, las llaves dejan de abrir y el huésped ve «ese
 * enlace ya no está abierto» sin que nada se vea roto. Eso es justo lo que
 * falla callado, que es lo que más caro sale.
 *
 * Se comparan FIRMANDO Y ABRIENDO de verdad, cruzadas, y no comparando el
 * texto de los dos archivos: lo que importa no es que sean iguales, es que
 * se entiendan.
 */

const SECRETO = 'una-llave-de-servicio-cualquiera';

describe('las dos copias de llave.ts', () => {
  it('se entienden: humaya-tv firma y humaya-entrada abre', async () => {
    const vence = diaDe('2026-12-21') + 1;

    const llave = await firmarLlave(SECRETO, 'v1-capi-capi', '6892JEMFAN', vence);

    expect(await abrirLlave(SECRETO, llave!, diaDe('2026-12-18'))).toEqual({
      villa: 'v1-capi-capi',
      reserva: '6892JEMFAN',
      vence,
    });
  });
});
