import {
  CalendarDays,
  Dumbbell,
  MessageSquare,
  Sparkles,
  Tent,
  type LucideIcon,
} from 'lucide-react';

/** El ícono de cada opción es un texto en la base (humaya_admin_opciones.icono); acá se resuelve al componente. */
export const OPCION_ICONS: Record<string, LucideIcon> = {
  'message-square': MessageSquare,
  sparkles: Sparkles,
  tent: Tent,
  'calendar-days': CalendarDays,
  dumbbell: Dumbbell,
};
