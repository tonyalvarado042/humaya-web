import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  borrarRespuesta,
  borrarTema,
  crearRespuesta,
  crearTema,
  editarRespuesta,
  editarTema,
  getEstadoBot,
  getEstadoLlave,
  getRespuestas,
  getTemas,
  guardarLlave,
  guardarAjustesBot,
  type AjustesBot,
  type CambiosRespuesta,
  type CambiosTema,
} from '@/services/conciergeBase';

const TEMAS = ['concierge-base'];
const ESTADO = ['concierge-bot'];

export function useTemasBase() {
  return useQuery({ queryKey: TEMAS, queryFn: getTemas });
}

/**
 * El estado del bot. No se reintenta ni se refresca solo: cada consulta con
 * `probar` cuesta tokens de verdad, y un diagnóstico que se cobra cada vez que
 * mirás la pantalla no es un diagnóstico.
 */
export function useEstadoBot() {
  return useQuery({
    queryKey: ESTADO,
    queryFn: () => getEstadoBot(false),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

const LLAVE = ['concierge-llave'];

export function useEstadoLlave() {
  return useQuery({ queryKey: LLAVE, queryFn: getEstadoLlave, retry: false });
}

export function useGuardarLlave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valor: string) => guardarLlave(valor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LLAVE });
      // El estado del bot cambia con la llave: si no se refresca, la pantalla
      // seguiria diciendo «sin llave» con la llave ya puesta.
      void queryClient.invalidateQueries({ queryKey: ESTADO });
    },
  });
}

export function useProbarBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getEstadoBot(true),
    onSuccess: (estado) => {
      queryClient.setQueryData(ESTADO, estado);
    },
  });
}

export function useEditarTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: CambiosTema }) => editarTema(id, cambios),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEMAS });
      void queryClient.invalidateQueries({ queryKey: ESTADO });
    },
  });
}

export function useCrearTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tema, contenido }: { tema: string; contenido: string }) =>
      crearTema(tema, contenido),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEMAS });
    },
  });
}

export function useBorrarTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => borrarTema(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEMAS });
      void queryClient.invalidateQueries({ queryKey: ESTADO });
    },
  });
}

export function useGuardarAjustesBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ajustes: AjustesBot) => guardarAjustesBot(ajustes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ESTADO });
    },
  });
}

const RESPUESTAS = ['concierge-respuestas'];

export function useRespuestasGuardadas(soloActivas = false) {
  return useQuery({
    queryKey: [...RESPUESTAS, soloActivas],
    queryFn: () => getRespuestas(soloActivas),
  });
}

export function useEditarRespuesta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: CambiosRespuesta }) =>
      editarRespuesta(id, cambios),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS });
    },
  });
}

export function useCrearRespuesta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ titulo, texto }: { titulo: string; texto: string }) =>
      crearRespuesta(titulo, texto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS });
    },
  });
}

export function useBorrarRespuesta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => borrarRespuesta(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS });
    },
  });
}
