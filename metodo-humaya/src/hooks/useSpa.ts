import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookSlot, getDaySchedule, getSlots, getStayBookings } from '@/services/spa';
import type { SpaFacility } from '@/types';
import { queryKeys, spaPrefixes } from './queryKeys';

export function useSpaSlots(facility: SpaFacility, date: string) {
  return useQuery({
    queryKey: queryKeys.spaSlots(facility, date),
    queryFn: () => getSlots(facility, date),
  });
}

export function useDaySchedule(date: string) {
  return useQuery({
    queryKey: queryKeys.spaSchedule(date),
    queryFn: () => getDaySchedule(date),
  });
}

export function useStayBookings(stayId: string) {
  return useQuery({
    queryKey: queryKeys.stayBookings(stayId),
    queryFn: () => getStayBookings(stayId),
  });
}

/**
 * Reservar invalida los horarios del huésped y la agenda de recepción: por eso
 * una reserva hecha en /app aparece en /staff sin que las pantallas se hablen.
 */
export function useBookSlot(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ facility, start }: { facility: SpaFacility; start: string }) =>
      bookSlot(facility, start, stayId),
    onSuccess: () => {
      for (const prefix of spaPrefixes) {
        void queryClient.invalidateQueries({ queryKey: prefix });
      }
    },
  });
}
