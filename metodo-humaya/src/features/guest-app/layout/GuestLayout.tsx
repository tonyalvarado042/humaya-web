import { CalendarDays, Dumbbell, House, MessageSquare, Sparkles, Tent } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/components/ui/cn';
import { GuestLanguageProvider } from './GuestLanguageProvider';
import { StayProvider } from './StayProvider';

/** Marco de la app del huésped: tema oscuro, ancho de celular y barra inferior. */
export function GuestLayout() {
  return (
    <StayProvider>
      <GuestLanguageProvider>
        <GuestShell />
      </GuestLanguageProvider>
    </StayProvider>
  );
}

function GuestShell() {
  const { t } = useTranslation();
  const nav = [
    { to: '/app', label: t('nav.home'), Icon: House, end: true },
    { to: '/app/interview', label: t('nav.interview'), Icon: MessageSquare, end: false },
    { to: '/app/concierge', label: t('nav.concierge'), Icon: Sparkles, end: false },
    { to: '/app/villa', label: t('nav.villa'), Icon: Tent, end: false },
    { to: '/app/bookings', label: t('nav.bookings'), Icon: CalendarDays, end: false },
    { to: '/app/move', label: t('nav.move'), Icon: Dumbbell, end: false },
  ];

  return (
    <div data-theme="guest" className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
        <main className="flex-1 pb-24">
          <Outlet />
        </main>

        <nav
          aria-label={t('nav.label')}
          className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-nav pb-[env(safe-area-inset-bottom)]"
        >
          <ul className="m-0 flex list-none justify-around p-0">
            {nav.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[60px] min-w-16 flex-col items-center justify-center gap-1 px-1 text-[11px] tracking-wide no-underline transition-colors',
                      isActive ? 'text-gold' : 'text-muted-soft hover:text-text',
                    )
                  }
                >
                  <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
