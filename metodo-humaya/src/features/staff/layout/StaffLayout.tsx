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
 */
function currentLabel(pathname: string, idioma: Idioma): string {
  const destinos = STAFF_NAV[idioma];
  const calza = destinos.find(
    (destino) => destino.to !== '/staff' && pathname.startsWith(destino.to),
  );
  return calza?.label ?? destinos[0].label;
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
            <LogoDelHotel variant="mark" className="h-8 w-auto shrink-0" />
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

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={copy.menuTitle}>
        <StaffNav onNavigate={() => setMenuOpen(false)} />
      </Drawer>
    </div>
  );
}
