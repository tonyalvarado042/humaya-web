import { useContext } from 'react';
import { StayContext } from './StayContext';

/** La estadía que está mirando la app del huésped. */
export function useCurrentStay() {
  const context = useContext(StayContext);
  if (!context) {
    throw new Error('useCurrentStay necesita estar dentro de un StayProvider');
  }
  return context;
}
