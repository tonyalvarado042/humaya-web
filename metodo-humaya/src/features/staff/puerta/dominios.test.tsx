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
