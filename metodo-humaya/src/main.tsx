import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { crearRouter } from '@/router';
import { aplicarHotel } from '@/marca';
import { resolverHotel } from '@/services/hotel';
import '@/i18n';
import '@/styles/tokens.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root en index.html');
}

/**
 * Primero se averigua de qué hotel es esta pantalla, y recién después se
 * pinta.
 *
 * ── POR QUÉ ANTES DE PINTAR Y NO DESPUÉS ────────────────────────────────
 * Porque el prefijo de las rutas depende del hotel: en
 * `guestexp.liderax10.com/humaya/app` el router tiene que nacer con
 * `basename: '/humaya'`. Resolverlo después obligaría a rearmar el router
 * con la app ya montada, y el huésped vería un parpadeo con la marca
 * equivocada — el nombre de OTRO hotel, por un instante, antes del suyo.
 *
 * Son dos consultas sin sesión contra la base. Si fallan, `resolverHotel`
 * devuelve lo que se pueda deducir del dominio y la app abre igual con la
 * marca por defecto: no abrir sería mucho peor.
 */
async function arrancar() {
  const donde = await resolverHotel(window.location.hostname, window.location.pathname);
  aplicarHotel(donde.hotel);

  const router = crearRouter({ lado: donde.lado, base: donde.base });

  createRoot(rootElement!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void arrancar();
