import { Menu } from 'lucide-react';
import type { Idioma } from '@/hooks/useIdiomaElegido';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AvisoDeVersion } from '@/components/AvisoDeVersion';
import { LogoDelHotel } from '@/components/LogoDelHotel';
import { Drawer } from '@/components/ui';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { STAFF_NAV, staffCopy } from './nav';
import { StaffNav } from './StaffNav';

/**
 * El título que muestra la barra superior en los anchos angostos. Sale de la
 * misma lista que el menú, así no hay dos lugares donde traducir lo mismo.
 *
 * ── POR QUÉ EL RESPALDO ES `/staff` Y NO EL PRIMERO DE LA LISTA ───────
 * Porque `/staff` se saca del `find` a propósito —si no, calzaría con todo—,
 * así que es justamente el caso que cae al respaldo. Con `destinos[0]` el
 * respaldo era «Home», que es OTRA pantalla: en la de reservas, la barra del
 * teléfono decía «Home» mientras el título decía «Bookings». Comprobado
 * entrando, el 25 de noviembre de 2026.
 *
 * Una barra que dice dónde estoy y se equivoca es peor que una barra sin
 * texto: en el teléfono es lo único que lo dice, porque el menú está cerrado.
 */
function currentLabel(pathname: string, idioma: Idioma): string {
  const destinos = STAFF_NAV[idioma];
  const calza = destinos.find(
    (destino) => destino.to !== '/staff' && pathname.startsWith(destino.to),
  );
  const reservas = destinos.find((destino) => destino.to === '/staff');
  return calza?.label ?? reservas?.label ?? destinos[0].label;
}

/**
 * Marco del dashboard. Desde 1024 px el sidebar queda fijo, como el prototipo;
 * debajo se reemplaza por una barra superior con menú deslizable.
 */
export function StaffLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const [idioma] = useIdiomaRecepcion();
  const copy = staffCopy[idioma];

  return (
    <div data-theme="staff" className="min-h-dvh bg-bg text-text">
      {/* Acá y no en la raíz: una pantalla vieja en recepción hace daño, y
          estos textos todavía no existen en los cuatro idiomas del huésped. */}
      <AvisoDeVersion idioma={idioma} />
      <div className="flex min-h-dvh">
        {/* Sidebar: solo desde 1024 px */}
        <aside className="hidden w-62 shrink-0 flex-col gap-8 bg-nav px-4.5 py-7 text-on-ink lg:flex">
          <div className="flex flex-col gap-1 px-3">
            <LogoDelHotel className="w-30" />
            <span className="text-[13px] text-ink-muted">{copy.area}</span>
          </div>
          <StaffNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barra superior: solo debajo de 1024 px */}
          <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={copy.openMenu}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-strong text-text"
            >
              <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {/* La caja de 32 px la pone el envoltorio y no el logo, para que
                el monograma quede centrado sea una imagen o sea una letra.
                Con `h-8` en el logo, la letra se pintaba pegada arriba
                —`leading-none`— y le quedaba 8 px más alta que el título de al
                lado. Medido el 25 de noviembre de 2026. Se ve en los hoteles
                SIN logo propio, que son los dos que compraron la app. */}
            <span className="flex h-8 shrink-0 items-center">
              <LogoDelHotel variant="mark" className="max-h-8 w-auto" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] text-muted">
                {currentLabel(pathname, idioma)}
              </span>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={copy.menuTitle}
        tema="staff"
      >
        <StaffNav onNavigate={() => setMenuOpen(false)} />
      </Drawer>
    </div>
  );
}
