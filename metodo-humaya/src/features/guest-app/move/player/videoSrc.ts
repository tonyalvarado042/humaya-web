import type { VideoRole } from './types';

/**
 * Clips cortos grabados para el prototipo de Ascenso (pilar Move), servidos
 * desde `public/videos/`. Mismos cinco roles que el prototipo en HTML:
 * intro de sesión, intro de sección, ejercicio, cierre de tanda y enfriamiento.
 */
export const VIDEO_SRC: Record<VideoRole, string> = {
  intro: '/videos/intro.mp4',
  section: '/videos/section.mp4',
  exercise: '/videos/exercise.mp4',
  closing: '/videos/closing.mp4',
  cooldown: '/videos/cooldown.mp4',
};
