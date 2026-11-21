import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';
import { supabaseStub } from '@/test/supabaseStub';

/**
 * La fecha de la cabecera habla el idioma de la pantalla.
 *
 * ── EL FALLO QUE ESTO AGARRA, Y CÓMO SE ENCONTRÓ ────────────────────────
 * Abriendo `/staff/guests` como administrador el 21 de noviembre de 2026,
 * con recepción en inglés: el título decía «Guests», el cuerpo «Nobody is in
 * the house today»… y arriba, «SÁBADO 21 DE NOVIEMBRE, 2026».
 *
 * La pantalla llamaba `longDate(hoy)` sin pasarle el idioma, y `longDate`
 * tiene `locale = 'es-CR'` por omisión. Llegadas sí se lo pasaba; esta no.
 *
 * Ninguna prueba lo vio aunque TODAS corren en inglés: todas miraban el
 * contenido y ninguna la fecha. Una pantalla a medio traducir pasa el
 * conjunto entero en verde.
 */

beforeEach(() => {
  // `hoyEnCostaRica` consulta el desfase del reloj contra el servidor.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  supabaseStub.tablas.humaya_llegadas = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const MESES_EN =
  /(January|February|March|April|May|June|July|August|September|October|November|December)/;
const MESES_ES =
  /de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i;

describe('la cabecera de la lista de huéspedes', () => {
  it('pone la fecha en el idioma de recepción', async () => {
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findByText(MESES_EN)).toBeInTheDocument();
    expect(screen.queryByText(MESES_ES)).not.toBeInTheDocument();
  });
});
