import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { Placeholder } from '@/components/Placeholder';
import { UiKitPage } from '@/features/dev/UiKitPage';
import { BookingsPage } from '@/features/guest-app/bookings/BookingsPage';
import { ConciergePage } from '@/features/guest-app/concierge/ConciergePage';
import { HomePage } from '@/features/guest-app/home/HomePage';
import { InterviewPage } from '@/features/guest-app/interview/InterviewPage';
import { GuestLayout } from '@/features/guest-app/layout/GuestLayout';
import { VillaPage } from '@/features/guest-app/villa/VillaPage';
import { ArrivalsPage } from '@/features/staff/arrivals/ArrivalsPage';
import { GuestProfilePage } from '@/features/staff/guest-profile/GuestProfilePage';
import { StaffLayout } from '@/features/staff/layout/StaffLayout';
import { SpaPage } from '@/features/staff/spa/SpaPage';

/** Rutas de la app. Se exportan aparte para poder montarlas en memoria en los tests. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/app',
    element: <GuestLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'interview', element: <InterviewPage /> },
      { path: 'concierge', element: <ConciergePage /> },
      { path: 'villa', element: <VillaPage /> },
      { path: 'bookings', element: <BookingsPage /> },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      { index: true, element: <ArrivalsPage /> },
      // Sin estadía en la URL, la pantalla muestra su estado "no encontrado"
      // con el camino de vuelta a Llegadas.
      { path: 'guests', element: <GuestProfilePage /> },
      { path: 'guests/:stayId', element: <GuestProfilePage /> },
      { path: 'spa', element: <SpaPage /> },
    ],
  },
  {
    path: '/dev/ui',
    element: <UiKitPage />,
  },
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

export const router = createBrowserRouter(routes);
