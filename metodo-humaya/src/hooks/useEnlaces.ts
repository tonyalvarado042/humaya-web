import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  borrarEnlace,
  crearEnlace,
  editarEnlace,
  getEnlaces,
  moverEnlace,
  toggleEnlace,
  type CambiosEnlace,
  type Enlace,
  type NuevoEnlace,
} from '@/services/enlaces';
import { queryKeys } from './queryKeys';

/**
 * Los enlaces de la portada interna.
 *
 * La portada pide solo los encendidos; el panel de Admin los pide todos,
 * porque ahí hay que poder volver a encender uno apagado.
 */
export function useEnlaces(soloHabilitados = false) {
  return useQuery({
    queryKey: queryKeys.enlaces(soloHabilitados),
    queryFn: () => getEnlaces(soloHabilitados),
  });
}

/** Cualquier cambio invalida las dos listas: la del panel y la de la portada. */
function useInvalidar() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.enlaces(true) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.enlaces(false) });
  };
}

export function useCrearEnlace() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (nuevo: NuevoEnlace) => crearEnlace(nuevo),
    onSuccess: invalidar,
  });
}

export function useEditarEnlace() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: CambiosEnlace }) =>
      editarEnlace(id, cambios),
    onSuccess: invalidar,
  });
}

export function useToggleEnlace() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, habilitado }: { id: string; habilitado: boolean }) =>
      toggleEnlace(id, habilitado),
    onSuccess: invalidar,
  });
}

export function useMoverEnlace() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({
      lista,
      id,
      hacia,
    }: {
      lista: Enlace[];
      id: string;
      hacia: 'arriba' | 'abajo';
    }) => moverEnlace(lista, id, hacia),
    onSuccess: invalidar,
  });
}

export function useBorrarEnlace() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: string) => borrarEnlace(id),
    onSuccess: invalidar,
  });
}
