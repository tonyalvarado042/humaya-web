import { useMutation } from '@tanstack/react-query';
import { checkReservation } from '@/services/entrada';

export function useCheckReservation() {
  return useMutation({
    mutationFn: (email: string) => checkReservation(email),
  });
}
