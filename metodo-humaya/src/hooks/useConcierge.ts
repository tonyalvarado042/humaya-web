import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getMessages,
  getSuggestions,
  markConversationRead,
  sendMessage,
  sendStaffReply,
} from '@/services/concierge';
import type { LocalizedText } from '@/types';
import { queryKeys } from './queryKeys';

export function useConciergeMessages(stayId: string) {
  return useQuery({
    queryKey: queryKeys.conciergeMessages(stayId),
    queryFn: () => getMessages(stayId),
    enabled: Boolean(stayId),
  });
}

export function useConciergeSuggestions(): LocalizedText[] {
  return getSuggestions();
}

export function useSendMessage(stayId: string, guestName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => sendMessage(stayId, guestName, text),
    onSuccess: (messages) => {
      queryClient.setQueryData(queryKeys.conciergeMessages(stayId), messages);
      void queryClient.invalidateQueries({ queryKey: queryKeys.conciergeConversations() });
    },
  });
}

/**
 * Bandeja de /staff/concierge. El refetch periódico es la "notificación": este
 * MVP no tiene backend push real, así que el badge de sin-leer se actualiza
 * solo cada 15 s en vez de avisar al instante.
 */
export function useConciergeConversations() {
  return useQuery({
    queryKey: queryKeys.conciergeConversations(),
    queryFn: getConversations,
    refetchInterval: 15_000,
  });
}

export function useSendStaffReply(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => sendStaffReply(stayId, text),
    onSuccess: (messages) => {
      queryClient.setQueryData(queryKeys.conciergeMessages(stayId), messages);
      void queryClient.invalidateQueries({ queryKey: queryKeys.conciergeConversations() });
    },
  });
}

export function useMarkConversationRead(stayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markConversationRead(stayId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conciergeConversations() });
    },
  });
}
