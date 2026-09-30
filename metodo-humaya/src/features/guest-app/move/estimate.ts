import type { WorkoutSession } from '@/types';

/**
 * Minutos estimados de una sesión: suma el trabajo y el descanso de cada
 * serie de cada ejercicio y redondea a un múltiplo de 5, con un piso de 10.
 * Es una estimación para la tarjeta de la lista, no un cronómetro exacto.
 */
export function estimateSessionMinutes(session: WorkoutSession): number {
  const totalSeconds = session.sections.reduce((sectionSum, section) => {
    const sectionSeconds = section.exercises.reduce((exerciseSum, exercise) => {
      return exerciseSum + exercise.sets * (exercise.workSeconds + exercise.restSeconds);
    }, 0);
    return sectionSum + sectionSeconds;
  }, 0);

  const minutes = Math.round(totalSeconds / 60 / 5) * 5;
  return Math.max(minutes, 10);
}
