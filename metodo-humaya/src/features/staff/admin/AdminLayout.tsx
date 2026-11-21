import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/components/ui/cn';
import { Screen, ScreenHeading } from '../layout/ScreenState';
import { useEsAdministrador, useIdiomaRecepcion } from '../puerta/contexto';
import { adminCopy } from './copy';
import { seccionesAdmin } from './secciones';

/**
 * El marco de Admin: el título, el menú de secciones, y abajo la sección.
 *
 * ── POR QUÉ UN MENÚ Y NO SOLO LAS FICHAS DE LA PORTADA ──────────────────
 * Porque configurar un hotel es ir y venir: se cambia un color, se mira el
 * menú del huésped, se vuelve al color. Con solo fichas, cada salto son dos
 * clics y pasar por la portada.
 *
 * ── POR QUÉ EL AVISO DE PERMISO VA ACÁ ──────────────────────────────────
 * Porque vale para las seis secciones, y porque el permiso no es uno solo:
 * encender y apagar pasa por la función `humaya-admin`, que acepta cualquier
 * rol de recepción, mientras que los nombres, la marca y los precios van
 * directo a la tabla y ahí RLS exige `administrador`. Decirlo una vez arriba
 * es más honesto que dejar que un formulario se llene entero para rebotar al
 * apretar Guardar.
 */
export function AdminLayout() {
  const esAdmin = useEsAdministrador();
  const [idioma] = useIdiomaRecepcion();
  const copy = adminCopy[idioma];

  return (
    <Screen>
      <ScreenHeading eyebrow={copy.area} title={copy.title} />

      <nav aria-label={copy.navLabel} className="-mx-1 overflow-x-auto">
        <ul className="m-0 flex list-none items-center gap-1 p-1">
          <li>
            <Enlace to="/staff/admin" end>
              {copy.todo}
            </Enlace>
          </li>
          {seccionesAdmin(idioma).map((seccion) => (
            <li key={seccion.ruta}>
              <Enlace to={`/staff/admin/${seccion.ruta}`}>{seccion.titulo}</Enlace>
            </li>
          ))}
        </ul>
      </nav>

      {esAdmin ? null : (
        <p
          role="status"
          className="m-0 rounded-card border border-line bg-surface-sunken px-4 py-3 text-sm leading-relaxed text-muted"
        >
          {copy.avisoSinPermiso}
        </p>
      )}

      <Outlet />
    </Screen>
  );
}

function Enlace({
  to,
  end = false,
  children,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex min-h-10 items-center rounded-pill border px-3.5 text-[13px] whitespace-nowrap no-underline transition-colors',
          isActive
            ? 'border-gold bg-gold text-on-gold'
            : 'border-line-strong text-muted hover:text-text',
        )
      }
    >
      {children}
    </NavLink>
  );
}
