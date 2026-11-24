import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { ladoDe, MARCA, type Lado } from '@/marca';
import { Mudanza } from '@/components/Mudanza';
import { Placeholder } from '@/components/Placeholder';
import { DemoHomePage } from '@/features/demo-home/DemoHomePage';
import { UiKitPage } from '@/features/dev/UiKitPage';
import { EntradaPage } from '@/features/entrada/EntradaPage';
import { BookingsPage } from '@/features/guest-app/bookings/BookingsPage';
import { ConciergePage } from '@/features/guest-app/concierge/ConciergePage';
import { HomePage } from '@/features/guest-app/home/HomePage';
import { InterviewPage } from '@/features/guest-app/interview/InterviewPage';
import { GuestLayout } from '@/features/guest-app/layout/GuestLayout';
import { MovePage } from '@/features/guest-app/move/MovePage';
import { SessionPlayerPage } from '@/features/guest-app/move/SessionPlayerPage';
import { MyDataPage } from '@/features/guest-app/resumen/MyDataPage';
import { VillaPage } from '@/features/guest-app/villa/VillaPage';
import { AdminIndexPage } from '@/features/staff/admin/AdminIndexPage';
import { AdminLayout } from '@/features/staff/admin/AdminLayout';
import { AjustesPage } from '@/features/staff/admin/AjustesPage';
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
import { Puerta } from '@/features/staff/puerta/Puerta';
import { SpaPage } from '@/features/staff/spa/SpaPage';

interface CreateRoutesOptions {
  includeDevUi?: boolean;
  /**
   * Qué lado sirve este dominio. Por defecto sale del hostname: en
   * experience.* el huésped, en staff.* el personal, y en local los dos.
   */
  lado?: Lado;
  /**
   * El prefijo del hotel en el dominio compartido (`/demo`), para que la
   * mudanza a recepción no se lo lleve puesto: del lado del personal el
   * hotel lo dice la cuenta, y `/demo/staff` ahí no existe.
   */
  base?: string;
}

/** Construye las rutas y permite verificar por separado el árbol de producción. */
export function createRoutes({
  includeDevUi = import.meta.env.DEV,
  lado = ladoDe(window.location.hostname),
  base = '',
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
          element: (
            <Mudanza
              base={MARCA.dominioPersonal}
              quitar={base}
              aviso="Taking you to the front desk…"
            />
          ),
        }
      : {
          path: '/staff',
          element: (
            <Puerta>
              <StaffLayout />
            </Puerta>
          ),
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
                { path: 'ajustes', element: <AjustesPage /> },
                // Crear hoteles. Solo la ve el super admin, y la base lo
                // exige: cada funcion pregunta si quien llama es de
                // plataforma antes de hacer nada.
                { path: 'hoteles', element: <HotelesPage /> },
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
          element: <Mudanza base={MARCA.dominioHuesped} aviso="Taking you to the guest app…" />,
        }
      : {
          path: '/app',
          element: <GuestLayout />,
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
      // En el dominio del personal la raíz es recepción: nadie que entre a
      // staff.stayhumaya.com está buscando la demo.
      element: lado === 'personal' ? <Navigate to="/staff" replace /> : <DemoHomePage />,
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
 */
export function crearRouter(opciones: CreateRoutesOptions = {}) {
  const { base = '', ...resto } = opciones;
  return createBrowserRouter(
    createRoutes({ ...resto, base }),
    base ? { basename: base } : undefined,
  );
}
