import { Navigate } from 'react-router-dom';
import { esHotelDeDemostracion } from '@/marca';
import { GuestLayout } from './layout/GuestLayout';

/**
 * Qué abre el huésped, según el hotel sea real o la demo.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026, después de crear Bike & Bed desde el panel:
 *
 *   «Cuando entro al hotel me salen dos opciones, lo cual no debería ser
 *   así. Todas las aplicaciones deben ser igual: si entro a Hotel
 *   Experience es la parte de recepción, y si entro a Guest Experience es
 *   la parte de Guest. Y cuando le doy clic al link me devuelve a la página
 *   de Humaya, lo cual tampoco está correcto.»
 *
 * Tenía razón en las dos, y la segunda era peor de lo que se veía desde
 * afuera: `guestexp.liderax10.com/bikeandbed/app` no «devolvía a Humaya»,
 * mostraba **las estadías de ejemplo de Humaya dentro de Bike & Bed**:
 * «Hola, Valeria. Llegás hoy. Ya tenemos lista la Villa 04.» Valeria y
 * Hannah son personas inventadas de la demo.
 *
 * ── POR QUÉ ESTO ES UNA REGLA Y NO UN DETALLE ──────────────────────────
 * El manual del equipo lo prohíbe con todas las letras, en su lista de «lo
 * que nunca debemos hacer»: **«usar IA para simular empatía o inventar
 * datos del huésped»**. Saludar por el nombre de alguien que no existe, en
 * el hotel de otro, es exactamente eso.
 *
 * ── POR QUÉ A /entrada Y NO A LA APP ───────────────────────────────────
 * Porque la app del huésped todavía corre con datos de ejemplo: no lee la
 * reserva real. `EntradaPage` ya lo tenía escrito —«todavía no hay a dónde
 * mandarlo, /app es la demo»— y por eso no ofrece el botón de entrar. La
 * portada con dos botones contradecía esa decisión sin querer.
 *
 * Así que un hotel de verdad manda a buscar la estadía, que sí es real. La
 * demo sigue abriendo la app, que es para lo que existe.
 *
 * El día que la app lea la reserva real, esto se cae solo: pasa a abrir la
 * app en los dos casos.
 */
export function PuertaDelHuesped() {
  if (!esHotelDeDemostracion()) return <Navigate to="/entrada" replace />;
  return <GuestLayout />;
}
