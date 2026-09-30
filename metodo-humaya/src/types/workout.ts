import type { LocalizedText } from './common';

/** Familia de movimiento, usada para el ícono/demo de cada ejercicio. */
export type MovementFamily = 'squat' | 'hinge' | 'push' | 'pull' | 'core' | 'cardio';

/** Un ejercicio dentro de un bloque de la sesión. */
export interface WorkoutExercise {
  id: string;
  name: LocalizedText;
  cue: LocalizedText;
  family: MovementFamily;
  sets: number;
  /** Repeticiones objetivo; algunos ejercicios se miden por tiempo (ej. "40 s"). */
  reps: number | LocalizedText;
  workSeconds: number;
  restSeconds: number;
  weightKg?: number;
  /** Esfuerzo relativo (1-100), solo para mostrarlo en el reproductor. */
  effort: number;
}

/** Un bloque de la sesión (ej. "Tren inferior"), con sus ejercicios en orden. */
export interface WorkoutSection {
  id: string;
  name: LocalizedText;
  cue: LocalizedText;
  exercises: WorkoutExercise[];
}

/** Una sesión completa del programa semanal (un día). */
export interface WorkoutSession {
  id: string;
  dayIndex: number;
  focus: LocalizedText;
  blurb: LocalizedText;
  sections: WorkoutSection[];
}

/** El programa que el coach publica cada semana. */
export interface WeeklyProgram {
  id: string;
  coachName: string;
  weekOf: string;
  sessions: WorkoutSession[];
}
