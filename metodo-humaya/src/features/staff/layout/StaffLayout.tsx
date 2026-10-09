import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HumayaLogo } from '@/components/HumayaLogo';
import { Drawer } from '@/components/ui';
import { STAFF_NAV, staffCopy as copy } from './nav';
import { StaffNav } from './StaffNav';

/** El título que muestra la barra superior en los anchos angostos. */
function currentLabel(pathname: string): string {
  if (pathname.startsWith('/staff/guests')) return 'Huéspedes';
  if (pathname.startsWith('/staff/spa')) return 'Spa y bienestar';
  if (pathname.startsWith('/staff/concierge')) return 'Concierge';
  return STAFF_NAV[0].label;
}

/**
 * Marco del dashboard. Desde 1024 px el sidebar queda fijo, como el prototipo;
 * debajo se reemplaza por una barra superior con menú deslizable.
 */
export function StaffLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.lang = 'es';
  }, []);

  return (
    <div data-theme="staff" className="min-h-dvh bg-bg text-text">
      <div className="flex min-h-dvh">
        {/* Sidebar: solo desde 1024 px */}
        <aside className="hidden w-62 shrink-0 flex-col gap-8 bg-nav px-4.5 py-7 text-on-ink lg:flex">
          <div className="flex flex-col gap-1 px-3">
            <HumayaLogo className="w-30" />
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
            <HumayaLogo variant="mark" className="h-8 w-auto shrink-0" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] text-muted">{currentLabel(pathname)}</span>
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
