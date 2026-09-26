import { useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_STAY_ID } from '@/services/session';
import { StayContext } from './StayContext';

interface StayProviderProps {
  children: ReactNode;
  initialStayId?: string;
}

/**
 * Qué estadía está mirando la app del huésped. No hay login: esto es lo más
 * parecido a "quién inició sesión", que es el caso que ARCHITECTURE.md admite
 * para Context además de tema e idioma.
 */
export function StayProvider({ children, initialStayId }: StayProviderProps) {
  const [stayId, setStayId] = useState(initialStayId ?? DEFAULT_STAY_ID);
  const value = useMemo(() => ({ stayId, setStayId }), [stayId]);

  return <StayContext.Provider value={value}>{children}</StayContext.Provider>;
}
