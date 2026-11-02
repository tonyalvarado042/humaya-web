import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAnswers, getProgress, getQuestions, saveAnswer } from '@/services/interview';
import type { InterviewAnswer, InterviewDepth } from '@/types';
import { queryKeys } from './queryKeys';

export function useInterviewQuestions(depth: InterviewDepth) {
  return useQuery({
    queryKey: queryKeys.interviewQuestions(depth),
    queryFn: () => getQuestions(depth),
    // Las preguntas no cambian durante la sesión.
    staleTime: Infinity,
  });
}

export function useInterviewAnswers(stayId: string) {
  return useQuery({
    queryKey: queryKeys.interviewAnswers(stayId),
    queryFn: () => getAnswers(stayId),
  });
}

export function useInterviewProgress(stayId: string, depth: InterviewDepth = 'light') {
  return useQuery({
    queryKey: queryKeys.interviewProgress(stayId, depth),
    queryFn: () => getProgress(stayId, depth),
  });
}

/** Al guardar una respuesta cambian el avance, las respuestas y el perfil. */
export function useSaveAnswer(stayId: string, depth: InterviewDepth = 'light') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answer: InterviewAnswer) => saveAnswer(stayId, answer, depth),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['interview-progress', stayId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.interviewAnswers(stayId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestProfile(stayId) });
      void queryClient.invalidateQueries({ queryKey: ['arrivals'] });
    },
  });
}
