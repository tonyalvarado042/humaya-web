import type { WowExperience } from '@/types';

/**
 * Experiencias WOW sugeridas a partir de la entrevista. El "por qué" repite el
 * dato que las originó, así el equipo entiende de dónde sale la sugerencia.
 *
 * Las tres con dueBy hoy son las tareas de "Preparar hoy" en Llegadas, y las
 * cinco que no están hechas son el indicador "Experiencias WOW por preparar".
 */
export const SEED_WOWS: WowExperience[] = [
  {
    id: 'w-mendez-connect',
    stayId: 's-mendez-rojas',
    pillar: 'connect',
    title: 'Flores de la zona y una nota escrita a mano por su aniversario',
    reason: 'Celebran 5 años juntos y lo mencionaron en la entrevista.',
    status: 'planned',
    dueBy: '2026-11-14T15:00:00-06:00',
  },
  {
    id: 'w-mendez-nourish',
    stayId: 's-mendez-rojas',
    pillar: 'nourish',
    title: 'Cóctel sin alcohol de maracuyá y jengibre de bienvenida',
    reason: 'Valeria no toma alcohol; evitar frutos secos por Andrés.',
    status: 'suggested',
  },
  {
    id: 'w-mendez-believe',
    stayId: 's-mendez-rojas',
    pillar: 'believe',
    title: 'Sauna privada al atardecer con vista al volcán',
    reason: 'Buscan calma y silencio; les interesa la meditación guiada.',
    status: 'suggested',
  },
  {
    id: 'w-keller-move',
    stayId: 's-keller',
    pillar: 'move',
    title: 'Kit de exploración para los niños',
    reason: 'Vienen con Mia y Finn, de 9 y 6 años, y quieren moverse al aire libre.',
    status: 'planned',
    dueBy: '2026-11-14T16:30:00-06:00',
  },
  {
    id: 'w-durand-create',
    stayId: 's-durand',
    pillar: 'create',
    title: 'Escritorio listo y café de filtro de la zona',
    reason: 'Viene a trabajar y pidió un espacio tranquilo con buena luz.',
    status: 'planned',
    dueBy: '2026-11-14T17:00:00-06:00',
  },
  {
    id: 'w-arias-believe',
    stayId: 's-arias',
    pillar: 'believe',
    title: 'Desayuno de cumpleaños en la terraza con vista al volcán',
    reason: 'Sofía cumple 40 durante la estadía y vienen a celebrarlo.',
    status: 'suggested',
  },
];
