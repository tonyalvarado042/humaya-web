import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptPrivacy,
  getAlerts,
  getGuestProfile,
  getPrivacyConsent,
  saveTeamNotes,
} from '@/services/guests';
import { queryKeys } from './queryKeys';

export function useGuestProfile(stayId: string) {
  return useQuery({
    queryKey: queryKeys.guestProfile(stayId),
    queryFn: () => getGuestProfile(stayId),
  });
}

export function useAlerts(stayId: string) {
  return useQuery({
    queryKey: queryKeys.alerts(stayId),
    queryFn: () => getAlerts(stayId),
  });
}

export function usePrivacyConsent(stayId: string) {
  return useQuery({
    queryKey: queryKeys.privacyConsent(stayId),
    queryFn: () => getPrivacyConsent(stayId),
  });
}

export function useAcceptPrivacy(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acceptPrivacy(stayId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.privacyConsent(stayId) });
    },
  });
}

export function useSaveTeamNotes(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notes: string) => saveTeamNotes(stayId, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestProfile(stayId) });
    },
  });
}
