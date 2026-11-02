import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPendingWowCount,
  getWowSuggestions,
  getWowsDueBy,
  updateWowStatus,
} from '@/services/wow';
import { getToday } from '@/services/clock';
import type { WowStatus } from '@/types';
import { queryKeys } from './queryKeys';

export function useWowSuggestions(stayId: string) {
  return useQuery({
    queryKey: queryKeys.wows(stayId),
    queryFn: () => getWowSuggestions(stayId),
  });
}

export function useWowsDueBy(date: string = getToday()) {
  return useQuery({
    queryKey: queryKeys.wowsDueBy(date),
    queryFn: () => getWowsDueBy(date),
  });
}

export function usePendingWowCount(date: string = getToday()) {
  return useQuery({
    queryKey: queryKeys.pendingWowCount(date),
    queryFn: () => getPendingWowCount(date),
  });
}

/** Cambiar el estado de una experiencia mueve el contador y los pendientes del día. */
export function useUpdateWowStatus(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WowStatus }) => updateWowStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wows(stayId) });
      void queryClient.invalidateQueries({ queryKey: ['wows-due-by'] });
      void queryClient.invalidateQueries({ queryKey: ['wows-pending-count'] });
    },
  });
}
