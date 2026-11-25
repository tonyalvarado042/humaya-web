import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, stubSesionAbierta, supabaseStub } from '@/test/supabaseStub';

/**
 * La portada interna del hotel.
 *
 * Tony, 24 de noviembre de 2026: «generé una landing configurable para cada
 * hotel desde admin con todos links… Visión x10, Panel guest, Panel
 * recepción, Cloud beds, Sitio web. Algo bonito y llamativo para uso
 * interno».
 */

const ADMINISTRADOR = {
  id: 'u-admin',
  email: 'tony@stayhumaya.com',
  nombre: 'Tony',
  rol: 'administrador',
};

function enlace(campos: Record<string, unknown>) {
  return {
    id: `e-${String(campos.etiqueta)}`,
    negocio_id: NEGOCIO_DE_PRUEBA,
    clave: null,
    descripcion: null,
    icono: 'link',
    orden: 1,
    habilitado: true,
    ...campos,
  };
}

beforeEach(() => {
  supabaseStub.tablas.humaya_enlaces = [
    enlace({
      etiqueta: 'Panel de recepción',
      url: `${window.location.origin}/staff`,
      icono: 'concierge-bell',
      orden: 1,
    }),
    enlace({
      etiqueta: 'X10 Vision',
      url: 'https://liderax10.com/',
      descripcion: 'Contactos, embudo y seguimientos.',
      icono: 'gauge',
      orden: 2,
    }),
    enlace({ etiqueta: 'Apagado por ahora', url: 'https://nada.test/', habilitado: false, orden: 3 }),
  ];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function abrir() {
  return renderRoutes(routes, { route: '/staff/inicio' });
}

describe('la portada interna', () => {
  it('muestra los enlaces encendidos del hotel, y no los apagados', async () => {
    abrir();

    expect(await screen.findByRole('link', { name: /Panel de recepción/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /X10 Vision/ })).toBeInTheDocument();
    // Apagado quiere decir apagado: el equipo no lo ve en la portada aunque
    // la fila siga en la base para poder volver a encenderla.
    expect(screen.queryByRole('link', { name: /Apagado por ahora/ })).not.toBeInTheDocument();
  });

  it('dice a dónde lleva cada ficha antes de tocarla', async () => {
    abrir();

    const vision = await screen.findByRole('link', { name: /X10 Vision/ });
    expect(vision).toHaveTextContent('liderax10.com');
    expect(vision).toHaveTextContent('Contactos, embudo y seguimientos.');
  });

  /**
   * Es un tablero del que se sale y al que se vuelve todo el día: lo de
   * afuera abre aparte para no perderlo. Lo de esta misma casa, no — abrir
   * una pestaña nueva para ir a tu propio panel es ruido.
   */
  it('lo de afuera abre en otra pestaña; lo de casa, acá mismo', async () => {
    abrir();

    const vision = await screen.findByRole('link', { name: /X10 Vision/ });
    expect(vision).toHaveAttribute('target', '_blank');
    expect(vision).toHaveAttribute('rel', expect.stringContaining('noopener'));

    const recepcion = screen.getByRole('link', { name: /Panel de recepción/ });
    expect(recepcion).not.toHaveAttribute('target');
  });

  /**
   * ── POR QUÉ ESTA PRUEBA ─────────────────────────────────────────────
   * Porque es una portada, no una sección más del panel: con la barra
   * lateral al lado se leería como «otra pantalla de recepción», y la mitad
   * de sus fichas llevan fuera de la app. El marco del panel bajó a ser una
   * ruta sin dirección propia justo para esto, y si alguien lo vuelve a
   * subir, esto se pone rojo.
   */
  it('no monta el marco del panel', async () => {
    // Primero el caso de control, para que la afirmación de abajo signifique
    // algo: una pantalla que SÍ va dentro del panel muestra el menú. Sin
    // esto, «no aparece Bookings» pasaría también si el menú no existiera en
    // ninguna parte.
    const panel = renderRoutes(routes, { route: '/staff/guests' });
    expect(await screen.findByRole('link', { name: 'Bookings' })).toBeInTheDocument();
    panel.unmount();

    abrir();
    await screen.findByRole('link', { name: /X10 Vision/ });
    expect(screen.queryByRole('link', { name: 'Bookings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('cuando el hotel no tiene ninguno, lo dice y explica dónde se agregan', async () => {
    supabaseStub.tablas.humaya_enlaces = [];
    abrir();

    expect(await screen.findByRole('heading', { name: 'No shortcuts yet' })).toBeInTheDocument();
    expect(screen.getByText(/Admin → Links/)).toBeInTheDocument();
  });

  /**
   * Regla de la casa: si se sabe de antemano que un botón va a rebotar, no se
   * ofrece el botón. RLS deja escribir estos enlaces solo al `administrador`.
   */
  it('el camino a configurarlos solo se le ofrece al administrador', async () => {
    abrir();
    await screen.findByRole('link', { name: /X10 Vision/ });
    expect(
      screen.queryByRole('link', { name: 'Set up these shortcuts' }),
    ).not.toBeInTheDocument();
  });

  it('y al administrador sí', async () => {
    stubSesionAbierta(ADMINISTRADOR);
    abrir();

    expect(
      await screen.findByRole('link', { name: 'Set up these shortcuts' }),
    ).toBeInTheDocument();
  });
});
