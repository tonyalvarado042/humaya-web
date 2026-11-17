import { CalendarClock, CalendarDays, MessageCircle, Settings, Users } from 'lucide-react';
import type { Idioma } from '@/hooks/useIdiomaElegido';

export interface DestinoStaff {
  to: string;
  label: string;
  Icon: typeof CalendarDays;
  end: boolean;
}

/**
 * Los destinos del dashboard, en los dos idiomas.
 *
 * Tony, 15 de noviembre de 2026: recepción «todo en inglés en interno». El
 * botón a español vive en el menú y lo cambia todo de una vez, porque el
 * idioma se comparte desde la puerta.
 *
 * "Villas" queda para después del MVP.
 */
export const STAFF_NAV: Record<Idioma, DestinoStaff[]> = {
  en: [
    { to: '/staff', label: 'Bookings', Icon: CalendarDays, end: true },
    { to: '/staff/guests', label: 'Guests', Icon: Users, end: false },
    { to: '/staff/spa', label: 'Schedule', Icon: CalendarClock, end: false },
    { to: '/staff/concierge', label: 'Concierge', Icon: MessageCircle, end: false },
    { to: '/staff/admin', label: 'Admin', Icon: Settings, end: false },
  ],
  es: [
    { to: '/staff', label: 'Reservas', Icon: CalendarDays, end: true },
    { to: '/staff/guests', label: 'Huéspedes', Icon: Users, end: false },
    { to: '/staff/spa', label: 'Agenda', Icon: CalendarClock, end: false },
    { to: '/staff/concierge', label: 'Concierge', Icon: MessageCircle, end: false },
    { to: '/staff/admin', label: 'Admin', Icon: Settings, end: false },
  ],
};

export interface StaffMarcoTextos {
  area: string;
  guestApp: string;
  openMenu: string;
  menuTitle: string;
  soon: string;
  soonHint: string;
  cambiarIdioma: string;
  salir: string;
}

export const staffCopy: Record<Idioma, StaffMarcoTextos> = {
  en: {
    area: 'Front desk',
    guestApp: 'Open the guest app',
    openMenu: 'Open menu',
    menuTitle: 'Front desk',
    soon: 'Villas',
    soonHint: 'Coming soon',
    cambiarIdioma: 'Español',
    salir: 'Sign out',
  },
  es: {
    area: 'Recepción',
    guestApp: 'Ver app del huésped',
    openMenu: 'Abrir menú',
    menuTitle: 'Recepción',
    soon: 'Villas',
    soonHint: 'Próximamente',
    cambiarIdioma: 'English',
    salir: 'Salir',
  },
};
