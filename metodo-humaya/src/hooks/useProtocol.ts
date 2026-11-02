import { useQuery } from '@tanstack/react-query';
import { getProtocolTips } from '@/services/protocol';
import { queryKeys } from './queryKeys';

export function useProtocolTips(stayId: string) {
  return useQuery({
    queryKey: queryKeys.protocolTips(stayId),
    queryFn: () => getProtocolTips(stayId),
  });
}
