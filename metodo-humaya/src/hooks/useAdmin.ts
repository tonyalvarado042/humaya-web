import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  crearServicio,
  getOpciones,
  getServicios,
  getServicioSlots,
  reservarServicio,
  toggleOpcion,
  toggleServicio,
  type NuevoServicio,
} from '@/services/admin';
import { queryKeys } from './queryKeys';

export function useAdminOpciones(onlyEnabled = false) {
  return useQuery({
    queryKey: queryKeys.adminOpciones(onlyEnabled),
    queryFn: () => getOpciones(onlyEnabled),
  });
}

export function useToggleOpcion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, habilitada }: { id: string; habilitada: boolean }) =>
      toggleOpcion(id, habilitada),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-opciones'] });
    },
  });
}

export function useAdminServicios(onlyEnabled = false) {
  return useQuery({
    queryKey: queryKeys.adminServicios(onlyEnabled),
    queryFn: () => getServicios(onlyEnabled),
  });
}

export function useToggleServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, habilitado }: { id: string; habilitado: boolean }) =>
      toggleServicio(id, habilitado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-servicios'] });
    },
  });
}

export function useCrearServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (servicio: NuevoServicio) => crearServicio(servicio),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-servicios'] });
    },
  });
}

export function useServicioSlots(servicioId: string, fecha: string) {
  return useQuery({
    queryKey: queryKeys.servicioSlots(servicioId, fecha),
    queryFn: () => getServicioSlots(servicioId, fecha),
    enabled: Boolean(servicioId && fecha),
  });
}

export function useReservarServicio(servicioId: string, fecha: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { stayId: string; guestName: string; horaInicio: string }) =>
      reservarServicio({ servicioId, fecha, ...params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.servicioSlots(servicioId, fecha) });
    },
  });
}
