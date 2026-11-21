import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAjustesTv,
  getAlrededor,
  guardarAlrededor,
  getVillasTv,
  guardarAjustesTv,
  guardarVillaTv,
  subirFotoDelHotel,
  subirFotoTv,
} from '@/services/tv';
import type { AjustesTv, CategoriaCerca } from '@/services/tv';
import type { CambiosVillaTv } from '@/types';
import { queryKeys } from './queryKeys';

/** El Wi-Fi y la foto, que son del hotel y no de cada villa. */
export function useAjustesTv() {
  return useQuery({
    queryKey: queryKeys.ajustesTv(),
    queryFn: getAjustesTv,
  });
}

export function useGuardarAjustesTv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cambios: Partial<AjustesTv>) => guardarAjustesTv(cambios),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ajustesTv() });
    },
  });
}

/** Subirla y dejarla puesta son una sola cosa para quien la sube. */
export function useSubirFotoDelHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (archivo: File) => {
      const nombre = await subirFotoDelHotel(archivo);
      await guardarAjustesTv({ foto: nombre });
      return nombre;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ajustesTv() });
    },
  });
}

/** Los lugares que el televisor recomienda. Una lista para todo el hotel. */
export function useAlrededor() {
  return useQuery({
    queryKey: queryKeys.alrededorTv(),
    queryFn: getAlrededor,
  });
}

export function useGuardarAlrededor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (local: CategoriaCerca[]) => guardarAlrededor(local),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alrededorTv() });
    },
  });
}

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
