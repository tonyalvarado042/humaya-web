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
}

/**
 * Monta una pantalla suelta con lo que necesita: caché de consultas, un router
 * en memoria y la estadía en curso.
 */
export function renderWithProviders(ui: ReactElement, { route = '/', stayId }: Options = {}) {
  const queryClient = makeQueryClient();
  void i18n.changeLanguage('es');
  if (stayId) window.localStorage.setItem(`humaya.guest-language:${stayId}`, 'es');

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <StayProvider initialStayId={stayId}>
            <GuestLanguageProvider>{children}</GuestLanguageProvider>
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
