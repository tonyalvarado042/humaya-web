import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getVillasTv, guardarVillaTv, subirFotoTv } from '@/services/tv';
import type { CambiosVillaTv } from '@/types';
import { queryKeys } from './queryKeys';

export function useVillasTv() {
  return useQuery({
    queryKey: queryKeys.villasTv(),
    queryFn: getVillasTv,
  });
}

export function useGuardarVillaTv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: CambiosVillaTv }) =>
      guardarVillaTv(id, cambios),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.villasTv() });
    },
  });
}

/**
 * Subir la foto y dejarla puesta son una sola cosa para quien la sube.
 * Separarlas dejaria fotos huerfanas en el bucket cada vez que alguien
 * cierre la pantalla entre un paso y el otro.
 */
export function useSubirFotoTv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archivo }: { id: string; archivo: File }) => {
      const nombre = await subirFotoTv(id, archivo);
      await guardarVillaTv(id, { foto: nombre });
      return nombre;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.villasTv() });
    },
  });
}
