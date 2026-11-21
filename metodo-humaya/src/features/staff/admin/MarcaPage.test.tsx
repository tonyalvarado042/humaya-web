import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, stubSesionAbierta, supabaseStub } from '@/test/supabaseStub';

/**
 * La marca del hotel: nombres, colores y letras, configurables.
 *
 * Tony, 20 de noviembre de 2026: «todos debe ser configurables colores font y
 * etiquetas en admin». Hasta ese día la marca eran variables de entorno
 * fijadas al compilar y una paleta escrita en `tokens.css`: un hotel nuevo
 * salía dorado, y cambiar un color era un despliegue.
 */

const ADMINISTRADOR = {
  id: 'u-admin',
  email: 'tony@stayhumaya.com',
  nombre: 'Tony',
  rol: 'administrador',
};

function hotel(campos: Record<string, unknown> = {}) {
  return {
    negocio_id: NEGOCIO_DE_PRUEBA,
    marca_experiencia: 'HUMAYA Experience',
    marca_hotel: 'HUMAYA',
    correo: 'reservations@stayhumaya.com',
    tema: {},
    ...campos,
  };
}

/** La fila como la deja el update del formulario. */
function guardado() {
  return supabaseStub.tablas.humaya_hoteles[0];
}

beforeEach(() => {
  resetMockState();
  stubSesionAbierta(ADMINISTRADOR);
  supabaseStub.tablas.humaya_hoteles = [hotel()];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function abrir() {
  renderRoutes(routes, { route: '/staff/admin/marca' });
  return screen.findByRole('heading', { name: 'Brand', level: 2 });
}

describe('los nombres', () => {
  it('nace con lo que está guardado y no vacía', async () => {
    await abrir();

    expect(screen.getByLabelText('Name of the experience')).toHaveValue('HUMAYA Experience');
    expect(screen.getByLabelText('Name of the hotel')).toHaveValue('HUMAYA');
    expect(screen.getByLabelText('Bookings email')).toHaveValue('reservations@stayhumaya.com');
  });

  it('guarda el nombre nuevo', async () => {
    await abrir();

    const campo = screen.getByLabelText('Name of the hotel');
    await userEvent.clear(campo);
    await userEvent.type(campo, 'BIKE & BED');
    await userEvent.click(screen.getByRole('button', { name: 'Save the brand' }));

    await screen.findByText('Saved. The guest is already seeing it.');
    expect(guardado().marca_hotel).toBe('BIKE & BED');
  });
});

describe('los colores', () => {
  it('nace con los que están guardados', async () => {
    supabaseStub.tablas.humaya_hoteles = [
      hotel({ tema: { acento: '#4a9d7f', acentoStaff: '#2f6b56' } }),
    ];
    await abrir();

    expect(screen.getByLabelText('Accent, on a dark background')).toHaveValue('#4a9d7f');
    expect(screen.getByLabelText('Accent, on a light background')).toHaveValue('#2f6b56');
  });

  it('guarda el acento', async () => {
    await abrir();

    await userEvent.type(screen.getByLabelText('Accent, on a dark background'), '#4a9d7f');
    await userEvent.click(screen.getByRole('button', { name: 'Save the brand' }));

    await screen.findByText('Saved. The guest is already seeing it.');
    expect(guardado().tema).toEqual({ acento: '#4a9d7f' });
  });

  /**
   * El tema es UNA columna jsonb: si el formulario mandara solo el campo que
   * se tocó, guardar el acento borraría la fuente.
   */
  it('al guardar un campo no borra los demás', async () => {
    supabaseStub.tablas.humaya_hoteles = [
      hotel({ tema: { fuenteTitulos: 'Playfair Display', fuenteGoogle: true } }),
    ];
    await abrir();

    await userEvent.type(screen.getByLabelText('Accent, on a dark background'), '#4a9d7f');
    await userEvent.click(screen.getByRole('button', { name: 'Save the brand' }));

    await screen.findByText('Saved. The guest is already seeing it.');
    expect(guardado().tema).toEqual({
      fuenteTitulos: 'Playfair Display',
      fuenteGoogle: true,
      acento: '#4a9d7f',
    });
  });

  /** Un campo vaciado tiene que irse de la fila, no quedar como `''`. */
  it('vaciar un color lo saca de lo guardado', async () => {
    supabaseStub.tablas.humaya_hoteles = [hotel({ tema: { acento: '#4a9d7f' } })];
    await abrir();

    await userEvent.click(screen.getAllByRole('button', { name: 'Clear' })[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Save the brand' }));

    await screen.findByText('Saved. The guest is already seeing it.');
    expect(guardado().tema).toEqual({});
  });

  /**
   * Lo que falla callado cuesta más: un color mal escrito se descarta al
   * pintar, así que hay que decirlo ANTES de guardar y no dejar que alguien
   * crea que puso un color.
   */
  it('avisa cuando lo escrito no es un color', async () => {
    await abrir();

    await userEvent.type(screen.getByLabelText('Accent, on a dark background'), 'verde');

    expect(await screen.findByText(/Write it as #rrggbb/)).toBeInTheDocument();
  });

  it('propone el texto que se lee encima del acento', async () => {
    await abrir();

    // Un verde oscuro: encima se lee blanco.
    await userEvent.type(screen.getByLabelText('Accent, on a dark background'), '#2f6b56');
    await userEvent.click(screen.getByRole('button', { name: 'Use the one that reads' }));

    expect(screen.getByLabelText('Text on top of the accent')).toHaveValue('#ffffff');
  });
});

describe('las letras', () => {
  it('guarda la fuente y si hay que bajarla de Google', async () => {
    await abrir();

    await userEvent.type(screen.getByLabelText('Headings'), 'Playfair Display');
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Download these fonts from Google Fonts/ }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save the brand' }));

    await screen.findByText('Saved. The guest is already seeing it.');
    expect(guardado().tema).toEqual({ fuenteTitulos: 'Playfair Display', fuenteGoogle: true });
  });
});

describe('quién puede cambiar la marca', () => {
  /** RLS exige `administrador`: ofrecer Guardar a quien no lo es es mentirle. */
  it('sin rol de administrador no se ofrece guardar', async () => {
    stubSesionAbierta({ ...ADMINISTRADOR, rol: 'operaciones' });
    await abrir();

    expect(screen.queryByRole('button', { name: 'Save the brand' })).not.toBeInTheDocument();
  });

  /** Pero mirar cómo queda no toca la base: eso lo puede hacer cualquiera. */
  it('sin rol de administrador igual se puede ver cómo queda', async () => {
    stubSesionAbierta({ ...ADMINISTRADOR, rol: 'operaciones' });
    await abrir();

    expect(screen.getByRole('button', { name: 'See how it looks' })).toBeInTheDocument();
  });
});
