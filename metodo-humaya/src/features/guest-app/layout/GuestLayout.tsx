import { House } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/components/ui/cn';
import { useAdminOpciones } from '@/hooks';
import { etiquetaDeOpcion } from '@/i18n/opciones';
import { supportedGuestLanguage } from '@/i18n/localizedText';
import { OPCION_ICONS } from '../icons';
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
  const { t, i18n } = useTranslation();
  const idioma = supportedGuestLanguage(
    i18n.language as Parameters<typeof supportedGuestLanguage>[0],
  );
  // Inicio no se puede deshabilitar: las demás opciones salen de
  // humaya_admin_opciones, la misma fuente que leen las fichas del Home.
  const opciones = useAdminOpciones(true);

  const nav = [
    { to: '/app', label: t('nav.home'), Icon: House, end: true },
    ...(opciones.data ?? []).map((opcion) => ({
      to: `/app/${opcion.clave}`,
      // Lo que el hotel escribió en el idioma de esta persona le gana a la
      // traducción de la app; donde no escribió nada, sigue valiendo la
      // traducción. Ver src/i18n/opciones.ts: hasta el 20 de noviembre de
      // 2026 renombrar una opción en admin no cambiaba NADA acá.
      label: etiquetaDeOpcion(opcion, idioma),
      Icon: (opcion.icono && OPCION_ICONS[opcion.icono]) || House,
      end: false,
    })),
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
