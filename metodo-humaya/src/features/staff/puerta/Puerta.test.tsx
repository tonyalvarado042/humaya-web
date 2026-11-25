import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { MARCA } from '@/marca';
import { createRoutes } from '@/router';
import { stubAdminApi } from '@/test/adminApiStub';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderRoutes } from '@/test/renderWithProviders';
import {
  resetSupabaseStub,
  stubSesionAbierta,
  supabaseStub,
  USUARIO_RECEPCION,
} from '@/test/supabaseStub';

/**
 * Lo que esta pantalla tiene que impedir, dicho con un número: hasta el 15 de
 * noviembre de 2026, experience.stayhumaya.com/staff respondía 200 a cualquiera
 * en internet, y la siguiente pantalla trae 48 reservas reales con nombre y
 * correo. Estos tests son los que no dejan que eso vuelva: si alguien saca la
 * puerta del router, fallan.
 *
 * `setup.ts` deja una sesión abierta por defecto. Acá se cierra a propósito.
 */
beforeEach(() => {
  resetMockState();
  stubConciergeApi();
  stubAdminApi();
  resetSupabaseStub();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** El árbol con los dos lados montados, como en local. */
const rutas = createRoutes({ includeDevUi: false, lado: 'ambos' });

/**
 * La marca de que alguien está ADENTRO.
 *
 * No sirve "Front desk": eso lo dice también el encabezado del formulario de
 * entrada, así que un test que lo buscara pasaría estando afuera. El enlace a
 * la app del huésped solo existe en el menú de recepción.
 */
const DENTRO = 'Open the guest app';

describe('sin sesión', () => {
  it('pide correo y clave en vez de mostrar recepción', async () => {
    renderRoutes(rutas, { route: '/staff' });

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
  });

  it('tampoco deja entrar por una pantalla de adentro', async () => {
    renderRoutes(rutas, { route: '/staff/concierge' });

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
  });

  it('abre en inglés y pasa a español de un toque', async () => {
    renderRoutes(rutas, { route: '/staff' });

    await userEvent.click(await screen.findByRole('button', { name: 'Español' }));

    expect(screen.getByRole('heading', { name: 'Entrá' })).toBeInTheDocument();
    // El botón ahora ofrece el camino de vuelta, no el idioma puesto.
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });
});

describe('al intentar entrar', () => {
  it('con un correo que no existe, lo dice y no abre', async () => {
    renderRoutes(rutas, { route: '/staff' });
    await screen.findByRole('heading', { name: 'Sign in' });

    await userEvent.type(screen.getByLabelText('Email'), 'cualquiera@ejemplo.com');
    await userEvent.type(screen.getByLabelText('Password'), 'lo-que-sea');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "That email and password don't match an account.",
    );
    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
  });

  it('explica el motivo cuando el servidor da uno distinto', async () => {
    supabaseStub.errorAlEntrar = 'Email not confirmed';
    renderRoutes(rutas, { route: '/staff' });
    await screen.findByRole('heading', { name: 'Sign in' });

    await userEvent.type(screen.getByLabelText('Email'), 'andres@stayhumaya.com');
    await userEvent.type(screen.getByLabelText('Password'), 'lo-que-sea');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This account still needs to confirm its email address.',
    );
  });

  it('con los campos vacíos no le pregunta nada a la base', async () => {
    renderRoutes(rutas, { route: '/staff' });
    await screen.findByRole('heading', { name: 'Sign in' });
    const antes = supabaseStub.consultas.length;

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter your email.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(supabaseStub.consultas.length).toBe(antes);
  });

  it('con las credenciales buenas entra a recepción', async () => {
    supabaseStub.tablas.cta_usuarios = [{ ...USUARIO_RECEPCION }];
    renderRoutes(rutas, { route: '/staff' });
    await screen.findByRole('heading', { name: 'Sign in' });

    await userEvent.type(screen.getByLabelText('Email'), USUARIO_RECEPCION.email);
    await userEvent.type(screen.getByLabelText('Password'), 'la-clave-de-andres');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('link', { name: DENTRO })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument();
  });
});

describe('con sesión pero sin permiso', () => {
  it('al rol externo le explica que no tiene acceso, con su correo', async () => {
    // `externo` es el rol del CRM para quien no debe ver clientes ajenos. Los
    // huéspedes del hotel son exactamente eso.
    const externo = { ...USUARIO_RECEPCION, rol: 'externo', email: 'quien@ejemplo.com' };
    supabaseStub.usuario = externo;
    supabaseStub.tablas.cta_usuarios = [externo];
    renderRoutes(rutas, { route: '/staff' });

    expect(
      await screen.findByRole('heading', { name: 'Your account has no access yet' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/quien@ejemplo\.com/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
  });

  it('a quien no tiene fila en el CRM también lo deja afuera', async () => {
    // Cuenta creada en Auth pero sin registro en cta_usuarios: se falla cerrado.
    supabaseStub.usuario = { ...USUARIO_RECEPCION, rol: null };
    supabaseStub.tablas.cta_usuarios = [];
    renderRoutes(rutas, { route: '/staff' });

    expect(
      await screen.findByRole('heading', { name: 'Your account has no access yet' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
  });

  it('el botón de salir cierra la sesión', async () => {
    const externo = { ...USUARIO_RECEPCION, rol: 'externo' };
    supabaseStub.usuario = externo;
    supabaseStub.tablas.cta_usuarios = [externo];
    renderRoutes(rutas, { route: '/staff' });

    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(supabaseStub.salidas).toBe(1);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});

describe('cada dominio sirve su lado', () => {
  it('en el dominio del huésped, /staff no sirve recepción', async () => {
    // La mudanza solo corre cuando el dominio del personal existe. Hoy la
    // bandera viene apagada —staff.stayhumaya.com no resuelve todavía—, así
    // que el test la enciende para probar el comportamiento que quedó listo.
    vi.spyOn(MARCA, 'dominiosSeparados', 'get').mockReturnValue(true);
    const reemplazar = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      pathname: '/staff/concierge',
      search: '',
      hash: '',
      replace: reemplazar,
    } as unknown as Location);

    renderRoutes(createRoutes({ includeDevUi: false, lado: 'huesped' }), {
      route: '/staff/concierge',
    });

    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(reemplazar).toHaveBeenCalledWith('https://staff.stayhumaya.com/staff/concierge');
  });

  /**
   * Desde el 24 de noviembre de 2026 la raíz del dominio de recepción abre la
   * LANDING del hotel, no el panel: `hotelexp.liderax10.com/bikeandbed` es la
   * dirección corta que se manda, y el panel —`/bikeandbed/staff`— es el que
   * recepción se guarda. Antes esto redirigía a `/staff`.
   */
  it('en el dominio del personal, la raíz es la landing del hotel', async () => {
    // Acá lo que se prueba es a dónde lleva la raíz, no la puerta: con sesión.
    stubSesionAbierta();
    const { router } = renderRoutes(createRoutes({ includeDevUi: false, lado: 'personal' }), {
      route: '/',
    });

    // La portada, detrás de la puerta, y sin salirse de la raíz.
    expect(await screen.findByRole('link', { name: 'Go to the front desk' })).toHaveAttribute(
      'href',
      '/staff',
    );
    expect(router.state.location.pathname).toBe('/');
    // Y no es el panel: el menú de recepción no está.
    expect(screen.queryByRole('link', { name: DENTRO })).not.toBeInTheDocument();
  });
});
