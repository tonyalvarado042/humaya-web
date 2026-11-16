import { useMutation } from '@tanstack/react-query';
import { checkReservation, type EntradaBusqueda } from '@/services/entrada';

export function useCheckReservation() {
  return useMutation({
    mutationFn: (busqueda: EntradaBusqueda) => checkReservation(busqueda),
  });
}
