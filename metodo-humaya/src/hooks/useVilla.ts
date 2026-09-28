import { useQuery } from '@tanstack/react-query';
import { getVillaInfo } from '@/services/villa';
import { queryKeys } from './queryKeys';

export function useVillaInfo(stayId: string) {
  return useQuery({
    queryKey: queryKeys.villaInfo(stayId),
    queryFn: () => getVillaInfo(stayId),
  });
}
