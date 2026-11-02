import { useQuery } from '@tanstack/react-query';
import { getWeeklyProgram, getWorkoutSession } from '@/services/workout';
import { queryKeys } from './queryKeys';

export function useWeeklyProgram() {
  return useQuery({
    queryKey: queryKeys.weeklyProgram(),
    queryFn: () => getWeeklyProgram(),
  });
}

export function useWorkoutSession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.workoutSession(sessionId),
    queryFn: () => getWorkoutSession(sessionId),
    enabled: sessionId.length > 0,
  });
}
