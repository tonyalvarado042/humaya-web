import { useQuery } from '@tanstack/react-query';
import { getToday } from '@/services/clock';
import { getReservas, type FiltroReservas } from '@/services/reservas';
import { queryKeys } from './queryKeys';

/** Las reservas de Cloudbeds. Datos reales, no los de ejemplo de la demo. */
export function useReservas(filtro: FiltroReservas, hoy: string = getToday()) {
  return useQuery({
    queryKey: queryKeys.reservas(filtro, hoy),
    queryFn: () => getReservas(filtro, hoy),
  });
}
