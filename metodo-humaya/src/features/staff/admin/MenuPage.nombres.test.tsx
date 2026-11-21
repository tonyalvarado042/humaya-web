import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubAdminApi, type StubOpcion } from '@/test/adminApiStub';
import { renderRoutes } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, stubSesionAbierta, supabaseStub } from '@/test/supabaseStub';

/**
 * Renombrar una opción del menú.
 *
 * Esto NO funcionaba hasta el 20 de noviembre de 2026: la columna `etiqueta`
 * se mostraba como editable, pero la app del huésped hace
 * `t('nav.' + clave, etiqueta)` y para las seis opciones sembradas ganaba
 * siempre la traducción del archivo. Cambiar el nombre no cambiaba nada.
 */

const RESERVAS: StubOpcion = {
  id: 'op-bookings',
  clave: 'bookings',
  etiqueta: 'Reservas',
  descripcion: 'Sauna, cold plunge y otras experiencias.',
  icono: 'calendar-days',
  habilitada: true,
  orden: 5,
};

/** La fila de la tabla, que es a donde escribe el formulario (vía RLS). */
function filaEnLaTabla(campos: Record<string, unknown> = {}) {
  return {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: RESERVAS.id,
    clave: RESERVAS.clave,
    etiqueta: RESERVAS.etiqueta,
    descripcion: RESERVAS.descripcion,
    etiquetas: {},
    descripciones: {},
    habilitada: true,
    orden: 5,
    ...campos,
  };
}

const ADMINISTRADOR = {
  id: 'u-admin',
  email: 'tony@stayhumaya.com',
  nombre: 'Tony',
  rol: 'administrador',
};

beforeEach(() => {
  resetMockState();
  stubSesionAbierta(ADMINISTRADOR);
  supabaseStub.tablas.humaya_admin_opciones = [filaEnLaTabla()];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function abrirElFormulario() {
  stubAdminApi({ opciones: [RESERVAS] });
  renderRoutes(routes, { route: '/staff/admin/menu' });

  const titulo = await screen.findByRole('heading', { name: 'Reservas' });
  const ficha = titulo.closest('li') as HTMLElement;
  await userEvent.click(within(ficha).getByRole('button', { name: 'Cambiar el nombre' }));
  return ficha;
}

describe('renombrar una opción del menú', () => {
  it('guarda el nombre en los dos idiomas', async () => {
    await abrirElFormulario();

    await userEvent.type(screen.getByLabelText('Nombre en español'), 'Rituales');
    await userEvent.type(screen.getByLabelText('Nombre en inglés'), 'Rituals');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await screen.findByRole('button', { name: 'Cambiar el nombre' });

    const fila = supabaseStub.tablas.humaya_admin_opciones[0];
    expect(fila.etiquetas).toEqual({ es: 'Rituales', en: 'Rituals' });
  });

  /**
   * El campo vacío NO significa «sin nombre»: significa «el que trae la app».
   * Si se guardara como cadena vacía, la fila quedaría con basura para
   * siempre y el placeholder diría una cosa y la base otra.
   */
  it('un idioma en blanco no se guarda como texto vacío', async () => {
    await abrirElFormulario();

    await userEvent.type(screen.getByLabelText('Nombre en español'), 'Rituales');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await screen.findByRole('button', { name: 'Cambiar el nombre' });

    const fila = supabaseStub.tablas.humaya_admin_opciones[0];
    expect(fila.etiquetas).toEqual({ es: 'Rituales' });
    expect(fila.etiquetas).not.toHaveProperty('en');
  });

  /** El formulario tiene que decir qué se vería si se deja en blanco. */
  it('muestra lo que ve el huésped si no se escribe nada', async () => {
    await abrirElFormulario();

    expect(screen.getByLabelText('Nombre en español')).toHaveAttribute(
      'placeholder',
      'Ahora dice: Reservas',
    );
    expect(screen.getByLabelText('Nombre en inglés')).toHaveAttribute(
      'placeholder',
      'Ahora dice: Bookings',
    );
  });

  it('cancelar no guarda nada', async () => {
    await abrirElFormulario();

    await userEvent.type(screen.getByLabelText('Nombre en español'), 'Rituales');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await screen.findByRole('button', { name: 'Cambiar el nombre' });
    expect(supabaseStub.tablas.humaya_admin_opciones[0].etiquetas).toEqual({});
  });

  /** La lista muestra los dos idiomas: es el único modo de ver que no se pisaron. */
  it('la lista muestra también cómo se llama en inglés', async () => {
    stubAdminApi({ opciones: [{ ...RESERVAS, etiquetas: { es: 'Rituales' } }] });
    renderRoutes(routes, { route: '/staff/admin/menu' });

    expect(await screen.findByRole('heading', { name: 'Rituales' })).toBeInTheDocument();
    expect(screen.getByText('Lo que ve en inglés: Bookings')).toBeInTheDocument();
  });
});

describe('quién puede cambiar el menú', () => {
  /**
   * Regla de la casa: si se sabe que un botón va a rebotar, no se ofrece.
   * Cambiar el nombre va directo a la tabla y RLS exige `administrador`.
   */
  it('sin rol de administrador no se ofrece cambiar el nombre', async () => {
    stubSesionAbierta({ ...ADMINISTRADOR, rol: 'operaciones' });
    stubAdminApi({ opciones: [RESERVAS] });
    renderRoutes(routes, { route: '/staff/admin/menu' });

    await screen.findByRole('heading', { name: 'Reservas' });
    expect(screen.queryByRole('button', { name: 'Cambiar el nombre' })).not.toBeInTheDocument();
    // Y lo explica, en vez de dejar un hueco sin motivo.
    expect(screen.getByRole('status')).toHaveTextContent(/lo hace un administrador/i);
  });

  /**
   * Encender y apagar NO va por la tabla: pasa por la función `humaya-admin`,
   * que acepta cualquier rol de recepción. Ese botón sí tiene que estar.
   */
  it('sin rol de administrador igual se puede encender y apagar', async () => {
    stubSesionAbierta({ ...ADMINISTRADOR, rol: 'operaciones' });
    stubAdminApi({ opciones: [RESERVAS] });
    renderRoutes(routes, { route: '/staff/admin/menu' });

    const titulo = await screen.findByRole('heading', { name: 'Reservas' });
    const ficha = titulo.closest('li') as HTMLElement;
    await userEvent.click(within(ficha).getByRole('button', { name: 'Deshabilitar' }));

    expect(await within(ficha).findByText('Deshabilitada')).toBeInTheDocument();
  });
});
