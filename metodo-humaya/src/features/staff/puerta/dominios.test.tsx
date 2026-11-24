import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';
import { stubAdminApi } from '@/test/adminApiStub';

/**
 * Cada dominio sirve lo suyo, en las DOS direcciones.
 *
 * ── EL FALLO QUE ESTO AGARRA, Y CÓMO SE ENCONTRÓ ────────────────────────
 * Estaba hecha una mitad: quien pedía `/staff` en el dominio del huésped
 * salía para recepción. La otra mitad no existía, y el 21 de noviembre de
 * 2026 Tony abrió `staff.stayhumaya.com/app`. La dirección respondía —el
 * mismo Worker sirve los dos dominios— y montaba la app del huésped, con su
 * selector de estadías de la demo, en la casa de recepción.
 *
 * ── POR QUÉ SE PRUEBAN LAS DOS JUNTAS ───────────────────────────────────
 * Porque son la misma regla. Separadas, una se arregla y la otra se olvida,
 * que es exactamente lo que pasó.
 */

const reemplazar = vi.fn();

beforeEach(() => {
  stubAdminApi();
  reemplazar.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function enLaDireccion(pathname: string) {
  vi.stubGlobal('location', {
    pathname,
    search: '',
    hash: '',
    replace: reemplazar,
  } as unknown as Location);
}

describe('cada dominio sirve lo suyo', () => {
  it('la app del huésped NO se sirve desde el dominio de recepción', async () => {
    enLaDireccion('/app');

    renderRoutes(createRoutes({ includeDevUi: false, lado: 'personal' }), { route: '/app' });

    expect(
      screen.queryByRole('navigation', { name: 'Navegación principal' }),
    ).not.toBeInTheDocument();
    expect(reemplazar).toHaveBeenCalledWith('https://experience.stayhumaya.com/app');
  });

  it('se lleva la ruta entera, no solo /app', async () => {
    enLaDireccion('/app/bookings');

    renderRoutes(createRoutes({ includeDevUi: false, lado: 'personal' }), {
      route: '/app/bookings',
    });

    expect(reemplazar).toHaveBeenCalledWith('https://experience.stayhumaya.com/app/bookings');
  });

  it('en un dominio que sirve los dos lados, /app se monta', async () => {
    // En local no hay dos dominios: `ambos` tiene que seguir abriendo la app.
    renderRoutes(createRoutes({ includeDevUi: false, lado: 'ambos' }), { route: '/app' });

    expect(
      await screen.findByRole('navigation', { name: 'Navegación principal' }),
    ).toBeInTheDocument();
    expect(reemplazar).not.toHaveBeenCalled();
  });
});

/**
 * El hotel que vive en el dominio compartido.
 *
 * ── EL FALLO QUE ESTO AGARRA ────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «acá el app de recepción tira a enlace
 * malo», sobre `guestexp.liderax10.com/demo`.
 *
 * El botón «Recepción» terminaba en `staff.stayhumaya.com/demo/staff`, y se
 * equivocaba en las dos mitades a la vez:
 *
 *  1. EL DOMINIO. `MARCA.dominioPersonal` salía de una variable de entorno
 *     fijada al compilar, que es la de HUMAYA. `aplicarHotel()` pisaba el
 *     nombre y el correo del hotel, pero no los dominios — el propio
 *     router.tsx lo tenía anotado como advertencia desde el 21 de noviembre.
 *  2. LA RUTA. El prefijo del hotel (`/demo`) solo existe del lado del
 *     huésped. Del lado de recepción el hotel lo dice la cuenta, y la
 *     dirección es `/staff` pelada.
 *
 * Verificado en vivo antes de arreglar: salía «Esta dirección no existe».
 */
describe('un hotel del dominio compartido', () => {
  it('manda recepción a SU dominio, no al de HUMAYA, y sin el prefijo', async () => {
    const { aplicarDominios } = await import('@/marca');
    aplicarDominios({ huesped: 'guestexp.liderax10.com', personal: 'hotelexp.liderax10.com' });
    enLaDireccion('/demo/staff');

    renderRoutes(createRoutes({ includeDevUi: false, lado: 'huesped', base: '/demo' }), {
      route: '/staff',
    });

    expect(reemplazar).toHaveBeenCalledWith('https://hotelexp.liderax10.com/staff');
    // Lo que pasaba antes, las dos mitades del error:
    expect(reemplazar).not.toHaveBeenCalledWith('https://staff.stayhumaya.com/demo/staff');
  });

  it('en el dominio propio de un hotel el prefijo no existe y nada cambia', async () => {
    const { aplicarDominios } = await import('@/marca');
    aplicarDominios({ huesped: 'experience.stayhumaya.com', personal: 'staff.stayhumaya.com' });
    enLaDireccion('/staff');

    renderRoutes(createRoutes({ includeDevUi: false, lado: 'huesped', base: '' }), {
      route: '/staff',
    });

    expect(reemplazar).toHaveBeenCalledWith('https://staff.stayhumaya.com/staff');
  });
});
