import type { Pillar } from './common';

export type WowStatus = 'suggested' | 'planned' | 'done';

export interface WowExperience {
  id: string;
  stayId: string;
  pillar: Pillar;
  title: string;
  /** El "por qué", basado en las respuestas de la entrevista. */
  reason: string;
  status: WowStatus;
  dueBy?: string;
}

/**
 * Una experiencia lista para mostrar en "Preparar hoy": ya trae la villa y el
 * huésped resueltos, para que la pantalla no tenga que ir a buscarlos.
 */
export interface WowTask extends WowExperience {
  villa: number;
  guestName: string;
}
