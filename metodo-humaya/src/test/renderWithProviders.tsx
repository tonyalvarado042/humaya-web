import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { StayProvider } from '@/features/guest-app/layout/StayProvider';
import { GuestLanguageProvider } from '@/features/guest-app/layout/GuestLanguageProvider';
import { PuertaContexto } from '@/features/staff/puerta/contexto';
import type { Idioma } from '@/hooks/useIdiomaElegido';
import i18n from '@/i18n';

/** Sin reintentos: un error tiene que fallar rápido, no colgar el test. */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface Options {
  /** Ruta inicial del router en memoria. */
  route?: string;
  /** Estadía que mira la app del huésped. */
  stayId?: string;
  /**
   * Monta la pantalla DENTRO de la puerta de recepción, en ese idioma.
   *
   * Hace falta para los componentes de recepción que se prueban sueltos: leen
   * su idioma del contexto de la puerta y sin ella `useIdiomaRecepcion()`
   * falla a propósito. Y de paso la prueba dice en qué idioma mira, en vez de
   * depender del valor por omisión.
   */
  recepcion?: Idioma;
}

/** Quien «entró» cuando una prueba monta una pantalla de recepción suelta. */
const QUIEN_ENTRO = {
  id: 'u-recepcion',
  correo: 'andres@stayhumaya.com',
  nombre: 'Andrés',
  rol: 'administrador',
  entra: true,
};

/**
 * Monta una pantalla suelta con lo que necesita: caché de consultas, un router
 * en memoria y la estadía en curso.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', stayId, recepcion }: Options = {},
) {
  const queryClient = makeQueryClient();
  void i18n.changeLanguage('es');
  if (stayId) window.localStorage.setItem(`humaya.guest-language:${stayId}`, 'es');

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <StayProvider initialStayId={stayId}>
            <GuestLanguageProvider>
              {recepcion ? (
                <PuertaContexto.Provider
                  value={{
                    persona: QUIEN_ENTRO,
                    idioma: recepcion,
                    cambiarIdioma: () => {},
                    cambiarHotel: null,
                  }}
                >
                  {children}
                </PuertaContexto.Provider>
              ) : (
                children
              )}
            </GuestLanguageProvider>
          </StayProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper }) };
}

/**
 * Monta el árbol de rutas real. Devuelve el router para poder comprobar la URL
 * después de navegar. La estadía la provee el layout de /app, como en la app.
 * Sirve igual para /staff, que no tiene "huésped actual".
 */
export function renderRoutes(routes: RouteObject[], { route = '/' }: Options = {}) {
  const queryClient = makeQueryClient();
  void i18n.changeLanguage('es');
  const router = createMemoryRouter(routes, { initialEntries: [route] });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router, queryClient, ...result };
}
