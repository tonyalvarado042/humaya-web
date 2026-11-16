import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AJUSTES_POR_DEFECTO, getAjustes, setDemoVisible } from '@/services/ajustes';
import { queryKeys } from './queryKeys';

/** Los ajustes del hotel. Nunca quedan en `undefined`: traen el valor de siempre. */
export function useAjustes() {
  return useQuery({
    queryKey: queryKeys.ajustes(),
    queryFn: getAjustes,
    initialData: AJUSTES_POR_DEFECTO,
  });
}

/** El interruptor de los datos de ejemplo. Solo un administrador lo mueve. */
export function useCambiarDemo() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: setDemoVisible,
    onSuccess: () => cache.invalidateQueries({ queryKey: queryKeys.ajustes() }),
  });
}
