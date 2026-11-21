import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubAdminApi } from '@/test/adminApiStub';
import { renderRoutes } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, stubSesionAbierta, supabaseStub } from '@/test/supabaseStub';
import { SECCIONES_ADMIN } from './secciones';

/**
 * Admin dejó de ser una pantalla y pasó a ser seis.
 *
 * Tony, 20 de noviembre de 2026: «debes mejorar Admin y separar por función,
 * ejemplo: Admin - página TV, todo de TV». Antes era una sola columna con el
 * interruptor del demo, el menú del huésped, el bot del Concierge con su
 * llave de la API, el catálogo de servicios y las pantallas de los
 * televisores — y para cambiarle el precio a un servicio había que pasar de
 * largo por la llave.
 */

const ADMINISTRADOR = {
  id: 'u-admin',
  email: 'tony@stayhumaya.com',
  nombre: 'Tony',
  rol: 'administrador',
};

beforeEach(() => {
  resetMockState();
  stubAdminApi();
  stubSesionAbierta(ADMINISTRADOR);
  supabaseStub.tablas.humaya_hoteles = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      marca_experiencia: 'HUMAYA Experience',
      marca_hotel: 'HUMAYA',
      correo: 'reservations@stayhumaya.com',
      tema: {},
    },
  ];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('la portada de Admin', () => {
  it('muestra una ficha por sección, con su explicación', async () => {
    renderRoutes(routes, { route: '/staff/admin' });

    await screen.findByRole('heading', { name: 'Admin' });
    for (const seccion of SECCIONES_ADMIN) {
      const ficha = screen.getByRole('heading', { name: seccion.titulo, level: 2 });
      expect(ficha).toBeInTheDocument();
      expect(screen.getByText(seccion.cuerpo)).toBeInTheDocument();
    }
  });

  it('cada ficha lleva a su sección', async () => {
    renderRoutes(routes, { route: '/staff/admin' });

    // Acotado a la lista de fichas: el mismo nombre está además en el menú de
    // secciones de arriba, y sin acotar la búsqueda encuentra los dos.
    const fichas = within(await screen.findByRole('list', { name: 'Lo que se configura' }));
    for (const seccion of SECCIONES_ADMIN) {
      const enlace = fichas.getByRole('link', { name: new RegExp(seccion.titulo) });
      expect(enlace).toHaveAttribute('href', `/staff/admin/${seccion.ruta}`);
    }
  });
});

describe('el menú de secciones', () => {
  it('lleva de una sección a otra sin pasar por la portada', async () => {
    renderRoutes(routes, { route: '/staff/admin/servicios' });

    await screen.findByRole('heading', { name: 'Servicios de Reservas' });

    const menu = within(screen.getByRole('navigation', { name: 'Secciones de Admin' }));
    await userEvent.click(menu.getByRole('link', { name: 'Menú del huésped' }));

    expect(
      await screen.findByRole('heading', { name: 'Menú del huésped', level: 2 }),
    ).toBeInTheDocument();
  });

  it('está en todas las secciones', async () => {
    renderRoutes(routes, { route: '/staff/admin/marca' });

    expect(
      await screen.findByRole('navigation', { name: 'Secciones de Admin' }),
    ).toBeInTheDocument();
  });
});

describe('quién ve qué', () => {
  /**
   * Regla de la casa: lo que se sabe de antemano que va a rebotar no se
   * ofrece — se explica por qué no está. Pero el permiso NO es uno solo:
   * encender y apagar pasa por la función `humaya-admin`, que acepta
   * cualquier rol de recepción.
   */
  it('a quien no es administrador le explica qué no puede cambiar', async () => {
    stubSesionAbierta({ ...ADMINISTRADOR, rol: 'operaciones' });
    renderRoutes(routes, { route: '/staff/admin' });

    await screen.findByRole('heading', { name: 'Admin' });
    expect(screen.getByRole('status')).toHaveTextContent(/lo hace un administrador/i);
  });

  it('a un administrador no le avisa nada', async () => {
    renderRoutes(routes, { route: '/staff/admin' });

    await screen.findByRole('heading', { name: 'Admin' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
