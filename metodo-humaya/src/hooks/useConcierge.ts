import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, getSuggestions, sendMessage } from '@/services/concierge';
import type { LocalizedText } from '@/types';
import { queryKeys } from './queryKeys';

export function useConciergeMessages() {
  return useQuery({
    queryKey: queryKeys.conciergeMessages(),
    queryFn: getMessages,
  });
}

export function useConciergeSuggestions(): LocalizedText[] {
  return getSuggestions();
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => sendMessage(text),
    onSuccess: (messages) => {
      queryClient.setQueryData(queryKeys.conciergeMessages(), messages);
    },
  });
}
