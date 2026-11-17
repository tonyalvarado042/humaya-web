import { useQuery } from '@tanstack/react-query';
import { agendaPorServicio } from '@/services/agenda';
import { queryKeys } from './queryKeys';

/**
 * Recepción deja esta pantalla abierta y un huésped puede reservar desde su
 * teléfono en cualquier momento. Sin esto, la agenda es una foto de cuando
 * alguien entró a la página.
 */
const CADA_CUANTO_MS = 60_000;

export function useAgendaPorServicio(desde: string, hasta: string) {
  return useQuery({
    queryKey: queryKeys.agendaPorServicio(desde, hasta),
    queryFn: () => agendaPorServicio(desde, hasta),
    refetchInterval: CADA_CUANTO_MS,
    refetchOnWindowFocus: true,
  });
}
