import { House } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/components/ui/cn';
import { STAFF_NAV, staffCopy as copy } from './nav';

interface StaffNavProps {
  /** Se llama al elegir un destino, para cerrar el menú deslizable. */
  onNavigate?: () => void;
}

/** Los enlaces del dashboard. Los comparten el sidebar y el menú deslizable. */
export function StaffNav({ onNavigate }: StaffNavProps) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {STAFF_NAV.map(({ to, label, Icon, end }) => (
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

      <div className="mt-auto flex flex-col gap-3.5 px-3">
        <Link to="/app" onClick={onNavigate} className="text-sm text-gold">
          {copy.guestApp}
        </Link>
        <span className="text-[13px] text-ink-muted">{copy.shift}</span>
      </div>
    </div>
  );
}
