import { CalendarDays, MessageCircle, Tent, Users } from 'lucide-react';

/** Los destinos del dashboard. "Villas" queda para después del MVP. */
export const STAFF_NAV = [
  { to: '/staff', label: 'Llegadas', Icon: CalendarDays, end: true },
  { to: '/staff/guests', label: 'Huéspedes', Icon: Users, end: false },
  { to: '/staff/spa', label: 'Spa y bienestar', Icon: Tent, end: false },
  { to: '/staff/concierge', label: 'Concierge', Icon: MessageCircle, end: false },
];

export const staffCopy = {
  area: 'Recepción',
  shift: 'Turno mañana · Recepción',
  guestApp: 'Ver app del huésped',
  openMenu: 'Abrir menú',
  menuTitle: 'Recepción',
  soon: 'Villas',
  soonHint: 'Próximamente',
};
