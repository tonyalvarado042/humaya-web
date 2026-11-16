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
import { AdminPage } from '@/features/staff/admin/AdminPage';
import { ArrivalsPage } from '@/features/staff/arrivals/ArrivalsPage';
import { ConciergeInboxPage } from '@/features/staff/concierge/ConciergeInboxPage';
import { ConciergeThreadPage } from '@/features/staff/concierge/ConciergeThreadPage';
import { GuestProfilePage } from '@/features/staff/guest-profile/GuestProfilePage';
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
          element: <Mudanza base={MARCA.dominioPersonal} aviso="Taking you to the front desk…" />,
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
            // Sin estadía en la URL, la pantalla muestra su estado "no encontrado"
            // con el camino de vuelta a Llegadas.
            { path: 'guests', element: <GuestProfilePage /> },
            { path: 'guests/:stayId', element: <GuestProfilePage /> },
            { path: 'spa', element: <SpaPage /> },
            { path: 'concierge', element: <ConciergeInboxPage /> },
            { path: 'concierge/:stayId', element: <ConciergeThreadPage /> },
            { path: 'admin', element: <AdminPage /> },
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
    {
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
    },
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

export const router = createBrowserRouter(routes);
