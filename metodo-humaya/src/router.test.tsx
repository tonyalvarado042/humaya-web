import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutes, routes } from '@/router';
import { stubAdminApi } from '@/test/adminApiStub';

function renderAt(path: string, routeSet: RouteObject[] = routes) {
  const router = createMemoryRouter(routeSet, { initialEntries: [path] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  stubAdminApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('rutas base', () => {
  it('monta la app del huésped en /app', async () => {
    renderAt('/app');
    expect(await screen.findByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  });

  it('monta el resumen "Mis datos" en /app/resumen', async () => {
    renderAt('/app/resumen');
    expect(await screen.findByRole('heading', { name: 'Mis datos' })).toBeVisible();
  });

  it('muestra la portada con accesos a huésped y recepción', async () => {
    document.documentElement.lang = 'en';
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Become More Human' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'App del huésped' })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: 'Recepción' })).toHaveAttribute('href', '/staff');
    await waitFor(() => expect(document.documentElement.lang).toBe('es'));
  });

  /**
   * La portada del dominio compartido es la de CUALQUIER hotel que viva ahí,
   * no «la página de la demo». Hasta el 24 de noviembre de 2026 decía siempre
   * «Demo de {experiencia}» y «Demo con datos ficticios»: en el hotel demo
   * salía «Demo de Demo Experience», y en un hotel real habría dicho que los
   * datos de sus huéspedes son inventados.
   *
   * Este test iba al revés: exigía el aviso montando la portada con HUMAYA,
   * que no es una demo. Defendía el error.
   */
  describe('la portada y el aviso de datos ficticios', () => {
    it('en un hotel de verdad no dice «demo» en ninguna parte', async () => {
      const { aplicarHotel } = await import('@/marca');
      aplicarHotel({
        negocioId: 'n-1',
        codigo: 'arenal',
        marcaExperiencia: 'Arenal Experience',
        marcaHotel: 'ARENAL',
        correo: 'hola@arenal.com',
        esDemo: false,
        portadaTitulo: null,
        portadaBajada: null,
        tema: null,
      });

      renderAt('/');

      expect(screen.queryByText(/Demo con datos ficticios/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Demo de/)).not.toBeInTheDocument();
      expect(screen.getByText('Arenal Experience')).toBeVisible();
    });

    it('el hotel pone su propio titular, no el de HUMAYA', async () => {
      // Tony, 24 de noviembre de 2026: «todos textos de home etc deben ser
      // configurables, veo que dice Become More Human pero el hotel dueño
      // puede poner ahí otra cosa». Esa frase es de HUMAYA.
      const { aplicarHotel } = await import('@/marca');
      aplicarHotel({
        negocioId: 'n-3',
        codigo: 'arenal',
        marcaExperiencia: 'Arenal Experience',
        marcaHotel: 'ARENAL',
        correo: 'hola@arenal.com',
        esDemo: false,
        portadaTitulo: 'Donde el volcán te despierta',
        portadaBajada: 'Tu estadía, en la palma de la mano.',
        tema: null,
      });

      renderAt('/');

      expect(
        screen.getByRole('heading', { name: 'Donde el volcán te despierta' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Tu estadía, en la palma de la mano.')).toBeInTheDocument();
      // EL PUNTO: la frase de HUMAYA no aparece en el hotel de otro.
      expect(screen.queryByText('Become More Human')).not.toBeInTheDocument();
    });

    it('sin nada escrito, se usa la de siempre', async () => {
      const { aplicarHotel } = await import('@/marca');
      aplicarHotel({
        negocioId: 'n-4',
        codigo: 'otro',
        marcaExperiencia: 'Otro Experience',
        marcaHotel: 'OTRO',
        correo: 'hola@otro.com',
        esDemo: false,
        portadaTitulo: null,
        portadaBajada: null,
        tema: null,
      });

      renderAt('/');

      expect(screen.getByRole('heading', { name: 'Become More Human' })).toBeInTheDocument();
    });

    it('en la demo sí lo avisa, y no repite el nombre', async () => {
      const { aplicarHotel } = await import('@/marca');
      aplicarHotel({
        negocioId: 'n-2',
        codigo: 'demo',
        marcaExperiencia: 'Demo Experience',
        marcaHotel: 'HOTEL DEMO',
        correo: 'demo@liderax10.com',
        esDemo: true,
        portadaTitulo: null,
        portadaBajada: null,
        tema: null,
      });

      renderAt('/');

      expect(screen.getByText(/Demo con datos ficticios/)).toBeVisible();
      // «DEMO DE DEMO EXPERIENCE» era lo que se veía en vivo. Sigue siendo
      // feo, pero es la marca que eligió el hotel: lo que no puede pasar es
      // que esta línea aparezca en un hotel real.
      expect(screen.getByText('Demo de Demo Experience')).toBeVisible();
    });
  });

  it('monta /entrada', () => {
    renderAt('/entrada');
    // Abre en inglés desde el 15 de noviembre: 53 de las 62 reservas reales
    // entran por Airbnb, Expedia y Booking, casi todas de afuera. El español
    // está a un toque, y eso se prueba en EntradaPage.test.tsx.
    expect(screen.getByRole('heading', { name: 'Find your stay' })).toBeInTheDocument();
  });

  it('la portada enlaza a /entrada', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /Buscá tu estadía/ })).toHaveAttribute(
      'href',
      '/entrada',
    );
  });

  it('muestra recepción en /staff', async () => {
    renderAt('/staff');
    // Ahora hay puerta: primero revisa la sesión y después monta la pantalla.
    // La sesión abierta la pone setup.ts; quién entra y quién no se prueba en
    // Puerta.test.tsx.
    expect(await screen.findByText('Front desk')).toBeInTheDocument();
  });

  it('monta el catálogo del sistema visual en desarrollo', () => {
    renderAt('/dev/ui');
    expect(screen.getByRole('heading', { name: 'Sistema visual' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Tema' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SlotGrid' })).toBeInTheDocument();
  });

  it('excluye el catálogo del árbol de producción', () => {
    renderAt('/dev/ui', createRoutes({ includeDevUi: false }));
    expect(screen.getByRole('heading', { name: 'Esta dirección no existe' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sistema visual' })).not.toBeInTheDocument();
  });

  it('muestra el 404 en una ruta que no existe', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { name: 'Esta dirección no existe' })).toBeInTheDocument();
  });
});
