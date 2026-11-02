import { useQuery } from '@tanstack/react-query';
import { getArrivals, getStay, getVillaStatus } from '@/services/stays';
import { getToday } from '@/services/clock';
import type { ArrivalRange } from '@/types';
import { queryKeys } from './queryKeys';

export function useArrivals(range: ArrivalRange) {
  return useQuery({
    queryKey: queryKeys.arrivals(range),
    queryFn: () => getArrivals(range),
  });
}

export function useStay(stayId: string) {
  return useQuery({
    queryKey: queryKeys.stay(stayId),
    queryFn: () => getStay(stayId),
  });
}

export function useVillaStatus(date: string = getToday()) {
  return useQuery({
    queryKey: queryKeys.villaStatus(date),
    queryFn: () => getVillaStatus(date),
  });
}
