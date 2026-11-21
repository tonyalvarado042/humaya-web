import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';
import { supabaseStub } from '@/test/supabaseStub';

/**
 * Recepción entera habla los dos idiomas, no la mitad.
 *
 * ── EL FALLO QUE ESTO AGARRA, Y CÓMO SE ENCONTRÓ ────────────────────────
 * Abriendo todas las pantallas de recepción como administrador el 21 de
 * noviembre de 2026, con el menú en inglés: la puerta, Llegadas y Huéspedes
 * cumplían. Spa decía «Agenda de servicios», el Concierge «Esperando al
 * equipo», la ficha «Nunca olvidar» y las siete de Admin estaban enteras en
 * español — debajo de un menú que decía «Sign out».
 *
 * No era un error de código: era texto que no existía. 628 líneas en once
 * archivos `copy*.ts` escritas en un solo idioma. Tony, ese día: «aplica 1»,
 * que de las tres salidas era traducirlo todo.
 *
 * ── POR QUÉ ESTA PRUEBA MIRA EL IDIOMA Y NO EL CONTENIDO ────────────────
 * Porque 446 pruebas en verde no vieron nada: todas miraban qué decía la
 * pantalla, ninguna en qué idioma. Y porque todas corren en inglés —el valor
 * por omisión de recepción desde el 15 de noviembre—, así que una pantalla a
 * medio traducir las pasaba todas.
 *
 * Mira lo que ninguna otra mira: que el inglés esté, que el español NO esté,
 * y que el botón del menú cambie las dos cosas.
 */

beforeEach(() => {
  // `hoyEnCostaRica` consulta el desfase del reloj contra el servidor.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  supabaseStub.tablas.humaya_servicios = [];
  supabaseStub.tablas.humaya_servicio_reservas = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin en los dos idiomas', () => {
  it('arranca en inglés, incluido el menú de secciones', async () => {
    renderRoutes(routes, { route: '/staff/admin' });

    expect(await screen.findByRole('heading', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Brand' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Guest menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'TV screen' })).toBeInTheDocument();

    // Y lo que estaba en español no quedó a medias.
    expect(screen.queryByRole('link', { name: 'Marca' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pantalla del TV' })).not.toBeInTheDocument();
  });

  it('el botón del menú cambia también las secciones', async () => {
    renderRoutes(routes, { route: '/staff/admin' });
    await screen.findByRole('link', { name: 'Brand' });

    await userEvent.click(screen.getAllByRole('button', { name: 'Español' })[0]);

    expect(await screen.findByRole('link', { name: 'Marca' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pantalla del TV' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Brand' })).not.toBeInTheDocument();
  });
});

describe('la agenda de servicios en los dos idiomas', () => {
  it('arranca en inglés', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    expect(await screen.findByRole('heading', { name: 'Service schedule' })).toBeInTheDocument();
    expect(screen.queryByText('Agenda de servicios')).not.toBeInTheDocument();
    // El aviso del sauna es el texto más largo de la pantalla: si quedó en
    // español, quedó en español entero.
    expect(screen.getByText(/Sauna and cold plunge do not show up here/)).toBeInTheDocument();
  });

  it('cambia a español con el botón del menú', async () => {
    renderRoutes(routes, { route: '/staff/spa' });
    await screen.findByRole('heading', { name: 'Service schedule' });

    await userEvent.click(screen.getAllByRole('button', { name: 'Español' })[0]);

    expect(await screen.findByRole('heading', { name: 'Agenda de servicios' })).toBeInTheDocument();
    expect(screen.getByText(/Sauna y cold plunge no salen acá/)).toBeInTheDocument();
  });
});
