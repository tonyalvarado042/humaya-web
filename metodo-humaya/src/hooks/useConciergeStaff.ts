import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asignar, borrarNota, crearNota, getAsignacion, getNotas } from '@/services/conciergeStaff';

const notasKey = (stayId: string) => ['concierge-notas', stayId];
const asignacionKey = (stayId: string) => ['concierge-asignacion', stayId];

export function useNotasInternas(stayId: string) {
  return useQuery({
    queryKey: notasKey(stayId),
    queryFn: () => getNotas(stayId),
    enabled: !!stayId,
  });
}

export function useCrearNota(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      texto,
      autor,
    }: {
      texto: string;
      autor: { id: string; nombre: string | null };
    }) => crearNota(stayId, texto, autor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notasKey(stayId) });
    },
  });
}

export function useBorrarNota(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => borrarNota(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notasKey(stayId) });
    },
  });
}

export function useAsignacion(stayId: string) {
  return useQuery({
    queryKey: asignacionKey(stayId),
    queryFn: () => getAsignacion(stayId),
    enabled: !!stayId,
  });
}

export function useAsignar(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quien: { id: string; nombre: string | null } | null) => asignar(stayId, quien),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: asignacionKey(stayId) });
    },
  });
}
