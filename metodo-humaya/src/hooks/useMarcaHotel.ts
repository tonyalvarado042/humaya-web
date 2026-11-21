import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aplicarTemaNuevo } from '@/marca';
import { getMarcaDelHotel, guardarMarcaDelHotel, type CambiosDeMarca } from '@/services/marcaHotel';
import { queryKeys } from './queryKeys';

/** La marca de este hotel, leida de la tabla y no de lo que se resolvio al arrancar. */
export function useMarcaDelHotel() {
  return useQuery({
    queryKey: queryKeys.marcaDelHotel(),
    queryFn: getMarcaDelHotel,
  });
}

/**
 * Guardar la marca.
 *
 * Al terminar aplica el tema en esta pantalla misma: cambiar un color y tener
 * que recargar para verlo convierte elegir una paleta en adivinar. Los nombres
 * SI necesitan recargar, porque `MARCA` se fija al arrancar; lo dice la
 * pantalla.
 */
export function useGuardarMarca() {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: (cambios: CambiosDeMarca) => guardarMarcaDelHotel(cambios),
    onSuccess: (_resultado, cambios) => {
      if (cambios.tema !== undefined) aplicarTemaNuevo(cambios.tema);
      void cache.invalidateQueries({ queryKey: queryKeys.marcaDelHotel() });
    },
  });
}
