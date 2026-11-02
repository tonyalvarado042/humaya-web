import { WEEKLY_PROGRAM } from '@/mocks';
import type { WeeklyProgram, WorkoutSession } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

/** El programa semanal activo (pilar Move). Un solo coach en esta primera fase. */
export async function getWeeklyProgram(): Promise<WeeklyProgram> {
  assertMocks('workout.getWeeklyProgram');
  await delay();
  return WEEKLY_PROGRAM;
}

/** Una sesión puntual del programa, para abrir el reproductor directo desde su id. */
export async function getWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  assertMocks('workout.getWorkoutSession');
  await delay();
  const found = WEEKLY_PROGRAM.sessions.find((item) => item.id === sessionId);
  if (!found) {
    throw new Error(`No existe la sesión ${sessionId}`);
  }
  return found;
}
