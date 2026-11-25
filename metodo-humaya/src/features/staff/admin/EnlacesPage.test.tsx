import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, stubSesionAbierta, supabaseStub } from '@/test/supabaseStub';

/**
 * Los enlaces de la portada interna, configurados por hotel.
 *
 * Tony, 24 de noviembre de 2026: «debe ser para cada hotel que se cree
 * entonces desde admin de hotel exp se puede configurar».
 */

const ADMINISTRADOR = {
  id: 'u-admin',
  email: 'tony@stayhumaya.com',
  nombre: 'Tony',
  rol: 'administrador',
};

function sembrar() {
  supabaseStub.tablas.humaya_enlaces = [
    {
      id: 'e-recepcion',
      negocio_id: NEGOCIO_DE_PRUEBA,
      clave: 'recepcion',
      etiqueta: 'Panel de recepción',
      descripcion: 'Llegadas, huéspedes, agenda y Concierge.',
      url: 'https://staff.stayhumaya.com/staff',
      icono: 'concierge-bell',
      orden: 1,
      habilitado: true,
    },
  ];
}

beforeEach(() => {
  sembrar();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function abrir() {
  renderRoutes(routes, { route: '/staff/admin/enlaces' });
  return screen.findByRole('heading', { name: 'Links', level: 2 });
}

describe('la lista', () => {
  it('muestra el enlace con su dirección completa', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    expect(
      screen.getByRole('heading', { name: 'Panel de recepción', level: 3 }),
    ).toBeInTheDocument();
    // La dirección entera y no el dominio: es lo que hay que poder revisar
    // cuando un enlace no lleva a donde debía.
    expect(screen.getByText('https://staff.stayhumaya.com/staff')).toBeInTheDocument();
  });

  it('cuando no hay ninguno lo dice, en vez de salir en blanco', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    supabaseStub.tablas.humaya_enlaces = [];
    await abrir();

    expect(screen.getByText('No links yet')).toBeInTheDocument();
  });
});

/**
 * Regla de la casa: si se sabe de antemano que un botón va a rebotar, no se
 * ofrece el botón — se explica por qué no está. RLS deja LEER a todo
 * recepción y escribir solo al rol `administrador`.
 */
describe('quién puede cambiarlos', () => {
  it('a recepción le muestra la lista y le explica que no la puede cambiar', async () => {
    await abrir();

    expect(
      screen.getByRole('heading', { name: 'Panel de recepción', level: 3 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add link/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByText(/Only an administrator can add or change links/)).toBeInTheDocument();
  });

  it('al administrador le da los botones', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    expect(screen.getByRole('button', { name: /Add link/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});

describe('agregar un enlace', () => {
  it('guarda lo escrito y le pone el https:// que nadie escribe', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: /Add link/ }));
    await userEvent.type(screen.getByLabelText('Name'), 'Contabilidad');
    await userEvent.type(screen.getByLabelText('Address'), 'conta.example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const guardado = await vi.waitFor(() => {
      const fila = supabaseStub.tablas.humaya_enlaces.find(
        (candidato) => candidato.etiqueta === 'Contabilidad',
      );
      if (!fila) throw new Error('todavía no');
      return fila;
    });

    expect(guardado.url).toBe('https://conta.example.com/');
    expect(guardado.negocio_id).toBe(NEGOCIO_DE_PRUEBA);
    // Entra al final, detrás de recepción, que es el que se usa todos los días.
    expect(guardado.orden).toBe(2);
  });

  /**
   * ── POR QUÉ ESTA PRUEBA ─────────────────────────────────────────────
   * Porque esta dirección termina dentro de un `<a href>` que ve todo el
   * equipo del hotel. Un `javascript:…` guardado acá correría código en la
   * sesión de recepción de cualquiera que toque la ficha.
   */
  it('no deja guardar una dirección que no es web, y lo dice', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: /Add link/ }));
    await userEvent.type(screen.getByLabelText('Name'), 'Trampa');
    await userEvent.type(screen.getByLabelText('Address'), 'javascript:alert(1)');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText('That address does not look like a web address.'),
    ).toBeInTheDocument();
    expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(1);
  });

  it('pide nombre antes de guardar', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: /Add link/ }));
    await userEvent.type(screen.getByLabelText('Address'), 'conta.example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Give it a name.')).toBeInTheDocument();
    expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(1);
  });
});

describe('borrar', () => {
  it('pide confirmación antes, porque borrar no se deshace', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Delete for good' }));
    await vi.waitFor(() => expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(0));
  });
});

describe('apagar', () => {
  it('lo deja apagado sin borrarlo, para poder volver a encenderlo', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));

    await vi.waitFor(() => expect(supabaseStub.tablas.humaya_enlaces[0].habilitado).toBe(false));
    expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(1);
  });
});
