import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom';
import { ladoDe, MARCA, type Lado } from '@/marca';
import { Mudanza, MudanzaAlHuesped } from '@/components/Mudanza';
import { Placeholder } from '@/components/Placeholder';
import { DemoHomePage } from '@/features/demo-home/DemoHomePage';
import { PuertaDelHuesped } from '@/features/guest-app/PuertaDelHuesped';
import { UiKitPage } from '@/features/dev/UiKitPage';
import { EntradaPage } from '@/features/entrada/EntradaPage';
import { BookingsPage } from '@/features/guest-app/bookings/BookingsPage';
import { ConciergePage } from '@/features/guest-app/concierge/ConciergePage';
import { HomePage } from '@/features/guest-app/home/HomePage';
import { InterviewPage } from '@/features/guest-app/interview/InterviewPage';
import { MovePage } from '@/features/guest-app/move/MovePage';
import { SessionPlayerPage } from '@/features/guest-app/move/SessionPlayerPage';
import { MyDataPage } from '@/features/guest-app/resumen/MyDataPage';
import { VillaPage } from '@/features/guest-app/villa/VillaPage';
import { AdminIndexPage } from '@/features/staff/admin/AdminIndexPage';
import { AdminLayout } from '@/features/staff/admin/AdminLayout';
import { AjustesPage } from '@/features/staff/admin/AjustesPage';
import { CloudbedsPage } from '@/features/staff/admin/CloudbedsPage';
import { EnlacesPage } from '@/features/staff/admin/EnlacesPage';
import { HotelesPage } from '@/features/staff/admin/HotelesPage';
import { BotPage } from '@/features/staff/admin/BotPage';
import { MarcaPage } from '@/features/staff/admin/MarcaPage';
import { MenuPage } from '@/features/staff/admin/MenuPage';
import { ServiciosPage } from '@/features/staff/admin/ServiciosPage';
import { TvPage } from '@/features/staff/admin/TvPage';
import { ArrivalsPage } from '@/features/staff/arrivals/ArrivalsPage';
import { ConciergeInboxPage } from '@/features/staff/concierge/ConciergeInboxPage';
import { ConciergeThreadPage } from '@/features/staff/concierge/ConciergeThreadPage';
import { GuestProfilePage } from '@/features/staff/guest-profile/GuestProfilePage';
import { GuestsListPage } from '@/features/staff/guests/GuestsListPage';
import { StaffLayout } from '@/features/staff/layout/StaffLayout';
import { PortadaPage } from '@/features/staff/portada/PortadaPage';
import { Puerta } from '@/features/staff/puerta/Puerta';
import { SpaPage } from '@/features/staff/spa/SpaPage';

interface CreateRoutesOptions {
  includeDevUi?: boolean;
  /**
   * Qué lado sirve este dominio. Por defecto sale del hostname: en
   * experience.* el huésped, en staff.* el personal, y en local los dos.
   */
  lado?: Lado;
}

/** Construye las rutas y permite verificar por separado el árbol de producción. */
export function createRoutes({
  includeDevUi = import.meta.env.DEV,
  lado = ladoDe(window.location.hostname),
}: CreateRoutesOptions = {}): RouteObject[] {
  /**
   * Recepción no se sirve desde el dominio del huésped. Hasta hoy sí:
   * experience.stayhumaya.com/staff respondía 200 a cualquiera en internet.
   * Ahora sale para staff.stayhumaya.com, que es donde hay puerta.
   */
  const staff: RouteObject =
    lado === 'huesped' && MARCA.dominiosSeparados
      ? {
          path: '/staff/*',
          /**
           * El prefijo del hotel VIAJA al otro lado.
           *
           * Antes se quitaba, porque del lado de recepción el hotel no iba en
           * la ruta. Desde el 24 de noviembre de 2026 sí va, de los dos
           * lados: `guestexp.liderax10.com/bikeandbed/staff` termina en
           * `hotelexp.liderax10.com/bikeandbed/staff`, y no en la recepción
           * «de nadie».
           *
           * En el dominio propio de un hotel no hay prefijo que llevar:
           * `base` es vacío porque la dirección no tiene código.
           */
          element: <Mudanza base={MARCA.dominioPersonal} aviso="Taking you to the front desk…" />,
        }
      : {
          path: '/staff',
          /**
           * La puerta envuelve TODO lo de recepción; el marco del panel, solo
           * lo que va adentro del panel.
           *
           * Antes la puerta montaba `StaffLayout` directo, así que cualquier
           * pantalla nueva de recepción nacía con barra lateral. La portada
           * interna (`/staff/inicio`) no la quiere: es una portada, y la
           * mitad de sus fichas llevan fuera del panel. Por eso el marco
           * baja a ser una ruta sin dirección propia, que es como React
           * Router dice «estas comparten marco y aquella no».
           */
          element: (
            <Puerta>
              <Outlet />
            </Puerta>
          ),
          children: [
            { path: 'inicio', element: <PortadaPage /> },
            {
              element: <StaffLayout />,
              children: [
                { index: true, element: <ArrivalsPage /> },
                // Antes acá vivía la ficha SIN estadía, así que el menú siempre
                // decía «No encontramos a ese huésped»: un destino que no llevaba
                // a ninguna parte. Ahora es la lista de quién está en la casa.
                { path: 'guests', element: <GuestsListPage /> },
                { path: 'guests/:stayId', element: <GuestProfilePage /> },
                { path: 'spa', element: <SpaPage /> },
                { path: 'concierge', element: <ConciergeInboxPage /> },
                { path: 'concierge/:stayId', element: <ConciergeThreadPage /> },
                // Admin dejo de ser una pantalla y paso a ser seis, cada una con
                // su direccion. Tony, 20 de noviembre de 2026: «debes mejorar
                // Admin y separar por funcion, ejemplo: Admin - pagina TV, todo
                // de TV». Ver features/staff/admin/secciones.ts.
                {
                  path: 'admin',
                  element: <AdminLayout />,
                  children: [
                    { index: true, element: <AdminIndexPage /> },
                    { path: 'marca', element: <MarcaPage /> },
                    { path: 'menu', element: <MenuPage /> },
                    { path: 'servicios', element: <ServiciosPage /> },
                    { path: 'concierge', element: <BotPage /> },
                    { path: 'tv', element: <TvPage /> },
                    { path: 'enlaces', element: <EnlacesPage /> },
                    { path: 'ajustes', element: <AjustesPage /> },
                    // Crear hoteles. Solo la ve el super admin, y la base lo
                    // exige: cada funcion pregunta si quien llama es de
                    // plataforma antes de hacer nada.
                    { path: 'hoteles', element: <HotelesPage /> },
                    // La llave de Cloudbeds de cada hotel. Tambien de
                    // plataforma: la base pide `humaya_soy_plataforma()`
                    // antes de conectar nada o de tocar la boveda.
                    { path: 'cloudbeds', element: <CloudbedsPage /> },
                  ],
                },
              ],
            },
          ],
        };

  /**
   * Y al revés: la app del huésped no se sirve desde el dominio de recepción.
   *
   * Faltaba esta mitad. El 21 de noviembre de 2026 Tony abrió
   * `staff.stayhumaya.com/app` y le salió «No pudimos cargar esta pantalla».
   * La dirección existía —el mismo Worker sirve los dos dominios— y montaba
   * la app del huésped, con su selector de estadías de la demo, en la casa de
   * recepción. Ahora sale para el dominio del huésped, igual que `/staff`
   * sale para el del personal.
   *
   * ⚠️ LAS DOS MUDANZAS SABEN DE UN SOLO HOTEL. `MARCA.dominioHuesped` y
   * `dominioPersonal` salen de variables de entorno: `aplicarHotel()` pisa el
   * nombre y el correo con los del hotel resuelto, pero NO los dominios. Con
   * un segundo hotel con dominio propio, estas dos lo mandarían al dominio de
   * HUMAYA — peor que no mudarlo. Antes de darle dominio propio a otro hotel,
   * los dominios tienen que salir de su fila, no del entorno.
   */
  const app: RouteObject =
    lado === 'personal' && MARCA.dominiosSeparados
      ? {
          path: '/app/*',
          element: <MudanzaAlHuesped />,
        }
      : {
          path: '/app',
          // Un hotel de verdad no abre la app: todavia corre con estadias
          // de ejemplo. Ver PuertaDelHuesped.
          element: <PuertaDelHuesped />,
          children: [
            { index: true, element: <HomePage /> },
            { path: 'resumen', element: <MyDataPage /> },
            { path: 'interview', element: <InterviewPage /> },
            { path: 'concierge', element: <ConciergePage /> },
            { path: 'villa', element: <VillaPage /> },
            { path: 'bookings', element: <BookingsPage /> },
            { path: 'move', element: <MovePage /> },
            { path: 'move/:sessionId', element: <SessionPlayerPage /> },
          ],
        };

  return [
    {
      path: '/',
      /**
       * Cada dominio abre lo suyo, sin preguntar.
       *
       * Tony, 24 de noviembre de 2026: «si entro a Hotel Experience es la
       * parte de recepción, y si entro a Guest Experience es la parte de
       * Guest». Hasta hoy la raíz del dominio del HUÉSPED mostraba una
       * portada con dos botones —«App del huésped» y «Recepción»—, así que
       * el huésped de un hotel veía un enlace a la recepción de ese hotel.
       *
       * En `ambos` (local y los previews, donde no hay dos dominios) la
       * portada sigue: ahí sirve de índice para trabajar.
       */
      element:
        lado === 'personal' ? (
          /**
           * La dirección pelada del hotel abre su LANDING, no el panel.
           *
           * Tony lo eligió así el 24 de noviembre de 2026: la dirección más
           * corta es la que se manda —«entrá acá y de ahí sale todo»—, y el
           * panel lo guarda recepción, que lo usa todo el día. Con el código
           * en la ruta eso da `hotelexp.liderax10.com/bikeandbed` para la
           * landing y `/bikeandbed/staff` para el panel; en el dominio propio
           * de un hotel, `staff.stayhumaya.com` y `staff.stayhumaya.com/staff`.
           *
           * Antes esto redirigía a `/staff`. Se cambió, no se agregó: dos
           * direcciones para la misma pantalla es lo que hay que evitar. La
           * portada sigue además en `/staff/inicio`, que es donde vive dentro
           * del árbol de recepción y lo que usan los enlaces de adentro.
           */
          <Puerta>
            <PortadaPage />
          </Puerta>
        ) : lado === 'huesped' ? (
          <Navigate to="/app" replace />
        ) : (
          <DemoHomePage />
        ),
    },
    {
      path: '/entrada',
      element: <EntradaPage />,
    },
    app,
    staff,
    ...(includeDevUi
      ? [
          {
            path: '/dev/ui',
            element: <UiKitPage />,
          },
        ]
      : []),
    {
      path: '*',
      element: (
        <Placeholder
          area="Página no encontrada"
          title="Esta dirección no existe"
          description="Revisá el enlace o volvé a /app para la app del huésped, o a /staff para recepción."
        />
      ),
    },
  ];
}

/** Rutas de la app. Se exportan aparte para poder montarlas en memoria en los tests. */
export const routes = createRoutes();

/**
 * El router de verdad, armado despues de saber que hotel es.
 *
 * `basename` es lo que hace que un solo despliegue sirva a varios hoteles sin
 * tocar una sola ruta: en guestexp.liderax10.com vale `/humaya` y React
 * Router le pone ese prefijo a cada enlace solo. En el dominio propio de un
 * hotel vale vacio y todo queda exactamente como estaba.
 *
 * Desde el 24 de noviembre de 2026 tambien vale en el dominio compartido de
 * recepcion: `hotelexp.liderax10.com/bikeandbed/staff`. Por eso `base` vive
 * en esta firma y NO en `CreateRoutesOptions` — las rutas no lo usan, lo usa
 * el router. Mientras estuvo en las dos, la mudanza lo manoseaba.
 */
interface CrearRouterOptions extends CreateRoutesOptions {
  /** El prefijo del hotel en el dominio compartido (`/bikeandbed`). */
  base?: string;
}

export function crearRouter(opciones: CrearRouterOptions = {}) {
  const { base = '', ...resto } = opciones;
  // `base` es SOLO el basename: desde el 24 de noviembre de 2026 las rutas no
  // lo necesitan. React Router le pone el prefijo a cada enlace solo, de los
  // dos lados — antes la mudanza a recepción tenía que quitarlo, porque de
  // ese lado el hotel no iba en la ruta. Ahora va.
  return createBrowserRouter(createRoutes(resto), base ? { basename: base } : undefined);
}
