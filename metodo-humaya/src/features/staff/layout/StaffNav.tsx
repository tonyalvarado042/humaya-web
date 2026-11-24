import { House } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/components/ui/cn';
import { useConciergeConversations } from '@/hooks';
import { salir } from '@/services/sesion';
import { useCambiarHotel, useIdiomaRecepcion, useQuienEntro } from '../puerta/contexto';
import { STAFF_NAV, staffCopy } from './nav';

interface StaffNavProps {
  /** Se llama al elegir un destino, para cerrar el menú deslizable. */
  onNavigate?: () => void;
}

/**
 * Los enlaces del dashboard. Los comparten el sidebar y el menú deslizable.
 * El badge de Concierge es la "notificación" de este MVP: sin backend push
 * real, se actualiza solo con el refetch periódico de useConciergeConversations.
 *
 * Abajo va quién entró. Antes decía "Turno mañana · Recepción", que era un
 * dato de la demo: no había turnos ni había nadie. Ahora dice el nombre de la
 * persona que tiene la sesión abierta, que sí es verdad y además sirve para
 * notar de una ojeada si quedó la sesión de otra persona en la computadora.
 */
export function StaffNav({ onNavigate }: StaffNavProps) {
  const [idioma, cambiarIdioma] = useIdiomaRecepcion();
  const copy = staffCopy[idioma];
  const persona = useQuienEntro();
  const cambiarHotel = useCambiarHotel();

  const conversations = useConciergeConversations();
  const unreadTotal = (conversations.data ?? []).reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0,
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {STAFF_NAV[idioma].map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] no-underline transition-colors',
                  isActive ? 'bg-surface/10 text-gold' : 'text-ink-muted hover:text-on-ink',
                )
              }
            >
              <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
              <span>{label}</span>
              {to === '/staff/concierge' && unreadTotal > 0 ? (
                <span className="ml-auto flex h-5.5 min-w-5.5 items-center justify-center rounded-pill bg-warning px-1.5 text-xs font-medium text-on-warning">
                  {unreadTotal}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
        <li>
          <span
            aria-disabled="true"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-ink-muted/50"
          >
            <House size={20} strokeWidth={1.6} aria-hidden="true" />
            <span>{copy.soon}</span>
            <span className="text-xs">· {copy.soonHint}</span>
          </span>
        </li>
      </ul>

      <div className="mt-auto flex flex-col items-start gap-3.5 px-3">
        <Link to="/app" onClick={onNavigate} className="text-sm text-gold">
          {copy.guestApp}
        </Link>
        <span className="text-[13px] text-ink-muted">{persona.nombre ?? persona.correo}</span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={cambiarIdioma}
            className="rounded-pill border border-ink-muted/40 px-3 py-1 text-[13px] text-ink-muted transition-colors hover:text-on-ink"
          >
            {copy.cambiarIdioma}
          </button>
          {/* Solo si hay a dónde cambiar: un botón que no lleva a ninguna
              parte no se ofrece. */}
          {cambiarHotel ? (
            <button
              type="button"
              onClick={cambiarHotel}
              className="text-[13px] text-ink-muted underline-offset-4 transition-colors hover:text-on-ink hover:underline"
            >
              {copy.cambiarHotel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void salir()}
            className="text-[13px] text-ink-muted underline-offset-4 transition-colors hover:text-on-ink hover:underline"
          >
            {copy.salir}
          </button>
        </div>
      </div>
    </div>
  );
}
