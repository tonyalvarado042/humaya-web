import type { LocalizedText, Pillar } from './common';

export type InterviewDepth = 'light' | 'deep';

export interface InterviewOption {
  id: string;
  label: LocalizedText;
}

export interface InterviewQuestion {
  id: string;
  pillar: Pillar;
  depth: InterviewDepth;
  prompt: LocalizedText;
  /** Sin opciones, la pregunta es de respuesta abierta. */
  options?: InterviewOption[];
  /** Alergias y salud: se muestran con aviso y se pueden saltar (Ley 8968). */
  sensitive?: boolean;
}

export interface InterviewAnswer {
  questionId: string;
  value: string;
  answeredAt: string;
}

/** Avance de la entrevista de una estadía. Lo usan Inicio y Llegadas. */
export interface InterviewProgress {
  depth: InterviewDepth;
  answered: number;
  total: number;
  complete: boolean;
}
