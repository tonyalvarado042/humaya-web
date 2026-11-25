import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { crearRouter } from '@/router';
import { FaltaElHotel } from '@/components/FaltaElHotel';
import { aplicarDominios, aplicarHotel, aplicarMarcaDelHotel } from '@/marca';
import { codigoDeLaRuta, resolverHotel } from '@/services/hotel';
import { alDiaConElServidor } from '@/services/actualizar';
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

// Una pestaña abierta desde antes de publicar sigue con el código viejo: el
// service worker se lo guarda. Esto la recarga cuando entra la versión nueva.
alDiaConElServidor(typeof navigator === 'undefined' ? undefined : navigator.serviceWorker);

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
  // Los dominios primero y aparte: `aplicarHotel()` reconstruye la marca
  // desde los valores por defecto, que son los de HUMAYA.
  aplicarDominios(donde.dominios);
  // La marca sí, el hotel solo si la dirección lo decide.
  //
  // En `hotelexp.liderax10.com/bikeandbed` el código de la ruta alcanza para
  // poner la marca de Bike & Bed en la puerta —antes decía «Humaya», la de
  // otro hotel— pero NO para dar por resuelto el hotel: de ese lado quién
  // entra lo decide la cuenta, y la Puerta tiene que preguntárselo a la base.
  // Ver `hotelConfirmado` en services/hotel.ts.
  if (donde.hotel && !donde.hotelConfirmado) aplicarMarcaDelHotel(donde.hotel);
  else aplicarHotel(donde.hotel);

  const raiz = createRoot(rootElement!);

  // En el dominio compartido del huesped, sin hotel en la direccion no hay
  // nada que pintar: mostrar el Home de OTRO hotel seria ensenarle a alguien
  // la marca y los datos de un tercero. Y dejarlo en blanco es un callejon
  // sin salida, que no tira error pero deja a la persona parada.
  if (donde.compartido && donde.lado === 'huesped' && !donde.hotel) {
    raiz.render(
      <StrictMode>
        <FaltaElHotel codigo={codigoDeLaRuta(window.location.pathname)} />
      </StrictMode>,
    );
    return;
  }

  const router = crearRouter({
    lado: donde.lado,
    base: donde.base,
  });

  raiz.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void arrancar();
