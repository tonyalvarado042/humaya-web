import {
  BookOpen,
  CalendarCheck,
  ChartColumn,
  ConciergeBell,
  CreditCard,
  Gauge,
  Globe,
  KeyRound,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Smartphone,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react';

/**
 * El ícono de una ficha de la portada interna.
 *
 * ── POR QUÉ UN MAPA Y NO EL ÍCONO DIRECTO ───────────────────────────────
 * Porque la base guarda un NOMBRE, escrito por quien configuró el enlace, y
 * lucide trae más de mil íconos. Importarlos todos para que alguien use seis
 * engordaría el paquete que baja recepción; y leer el nombre con
 * `lucide[nombre]` impediría que el empaquetador sacara los que no se usan.
 *
 * ── POR QUÉ UN NOMBRE DESCONOCIDO NO ROMPE NADA ─────────────────────────
 * Porque lo que falla callado cuesta más que lo que falla, pero una ficha en
 * blanco no es «falla»: es un enlace que el equipo necesita y no puede usar.
 * Un nombre que no está en el mapa —de una fila vieja, de un dedo— se dibuja
 * como un enlace genérico, y la ficha sigue sirviendo.
 */
const MAPA = {
  'concierge-bell': ConciergeBell,
  smartphone: Smartphone,
  gauge: Gauge,
  'calendar-check': CalendarCheck,
  globe: Globe,
  'monitor-play': MonitorPlay,
  mail: Mail,
  'message-circle': MessageCircle,
  'credit-card': CreditCard,
  'chart-column': ChartColumn,
  'book-open': BookOpen,
  'key-round': KeyRound,
  wifi: Wifi,
  'map-pin': MapPin,
  users: Users,
  wrench: Wrench,
  link: LinkIcon,
} as const satisfies Record<string, typeof LinkIcon>;

interface Props {
  nombre: string | null;
  size?: number;
  className?: string;
}

export function IconoDeEnlace({ nombre, size = 26, className }: Props) {
  const Icono = (nombre && MAPA[nombre as keyof typeof MAPA]) || LinkIcon;
  return <Icono size={size} strokeWidth={1.5} className={className} aria-hidden="true" />;
}
