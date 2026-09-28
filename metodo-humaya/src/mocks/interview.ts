import type { InterviewAnswer, InterviewDepth, InterviewQuestion } from '@/types';

/**
 * Preguntas de la entrevista.
 *
 * PROVISIONAL: las 5 light salen del prototipo; las 18 profundas están escritas
 * acá como marcador de posición hasta que Anthony pase las reales (es uno de los
 * pendientes de docs/PLAN.md). El tono sigue el de la landing: voseo, cálido y
 * breve.
 */
export const QUESTIONS: InterviewQuestion[] = [
  // ── Light: las 5 del prototipo ──────────────────────────────────────────
  {
    id: 'q-light-connect',
    pillar: 'connect',
    depth: 'light',
    prompt: { es: 'Para empezar, ¿con quién venís a Humaya?', en: 'Who are you coming with?' },
    options: [
      { id: 'pareja', label: { es: 'En pareja', en: 'As a couple' } },
      { id: 'familia', label: { es: 'En familia', en: 'With family' } },
      { id: 'amigos', label: { es: 'Con amigos', en: 'With friends' } },
      { id: 'solo', label: { es: 'Solo o sola', en: 'On my own' } },
    ],
  },
  {
    id: 'q-light-nourish',
    pillar: 'nourish',
    depth: 'light',
    prompt: {
      es: '¿Alguien tiene alergias o alguna restricción con la comida?',
      en: 'Does anyone have allergies or dietary restrictions?',
    },
    sensitive: true,
    options: [
      { id: 'ninguna', label: { es: 'Ninguna', en: 'None' } },
      { id: 'frutos-secos', label: { es: 'Frutos secos', en: 'Nuts' } },
      { id: 'gluten', label: { es: 'Gluten', en: 'Gluten' } },
      { id: 'lacteos', label: { es: 'Lácteos', en: 'Dairy' } },
      { id: 'otra', label: { es: 'Otra', en: 'Other' } },
    ],
  },
  {
    id: 'q-light-move',
    pillar: 'move',
    depth: 'light',
    prompt: {
      es: '¿Cuánto se quieren mover durante la estadía?',
      en: 'How active do you want to be during your stay?',
    },
    options: [
      { id: 'suave', label: { es: 'Suave', en: 'Gentle' } },
      { id: 'moderado', label: { es: 'Moderado', en: 'Moderate' } },
      { id: 'intenso', label: { es: 'Intenso', en: 'Intense' } },
    ],
  },
  {
    id: 'q-light-believe',
    pillar: 'believe',
    depth: 'light',
    prompt: {
      es: '¿Celebran algo especial en este viaje?',
      en: 'Are you celebrating something on this trip?',
    },
    options: [
      { id: 'aniversario', label: { es: 'Aniversario', en: 'Anniversary' } },
      { id: 'cumpleanos', label: { es: 'Cumpleaños', en: 'Birthday' } },
      { id: 'luna-de-miel', label: { es: 'Luna de miel', en: 'Honeymoon' } },
      { id: 'nada', label: { es: 'Nada en particular', en: 'Nothing in particular' } },
    ],
  },
  {
    id: 'q-light-create',
    pillar: 'create',
    depth: 'light',
    prompt: {
      es: '¿Cómo preferís que te atendamos?',
      en: 'How would you like us to look after you?',
    },
    options: [
      { id: 'calma', label: { es: 'Con calma y espacio', en: 'Calmly, with space' } },
      { id: 'cercanos', label: { es: 'Cercanos y conversadores', en: 'Warm and chatty' } },
      { id: 'necesario', label: { es: 'Solo lo necesario', en: 'Only what I need' } },
    ],
  },

  // ── Profunda: 18 preguntas, 3 o 4 por pilar ─────────────────────────────
  {
    id: 'q-deep-move-1',
    pillar: 'move',
    depth: 'deep',
    prompt: {
      es: '¿A qué hora del día te sentís con más energía?',
      en: 'What time of day do you have the most energy?',
    },
    options: [
      { id: 'amanecer', label: { es: 'Temprano en la mañana', en: 'Early morning' } },
      { id: 'media-manana', label: { es: 'A media mañana', en: 'Mid-morning' } },
      { id: 'tarde', label: { es: 'En la tarde', en: 'Afternoon' } },
      { id: 'noche', label: { es: 'De noche', en: 'Evening' } },
    ],
  },
  {
    id: 'q-deep-move-2',
    pillar: 'move',
    depth: 'deep',
    prompt: { es: '¿Qué te gusta hacer para moverte?', en: 'How do you like to move?' },
    options: [
      { id: 'caminar', label: { es: 'Caminar', en: 'Walking' } },
      { id: 'nadar', label: { es: 'Nadar', en: 'Swimming' } },
      { id: 'bici', label: { es: 'Andar en bici', en: 'Cycling' } },
      { id: 'yoga', label: { es: 'Yoga', en: 'Yoga' } },
      { id: 'nada', label: { es: 'Nada en particular', en: 'Nothing in particular' } },
    ],
  },
  {
    id: 'q-deep-move-3',
    pillar: 'move',
    depth: 'deep',
    prompt: {
      es: '¿Hay alguna lesión o molestia que debamos tener en cuenta?',
      en: 'Any injury or discomfort we should know about?',
    },
    sensitive: true,
    options: [
      { id: 'no', label: { es: 'No, ninguna', en: 'None' } },
      { id: 'espalda', label: { es: 'En la espalda', en: 'Back' } },
      { id: 'rodillas', label: { es: 'En las rodillas', en: 'Knees' } },
      { id: 'otra', label: { es: 'Otra', en: 'Other' } },
    ],
  },
  {
    id: 'q-deep-move-4',
    pillar: 'move',
    depth: 'deep',
    prompt: {
      es: '¿Te interesa una caminata guiada al volcán?',
      en: 'Would you like a guided hike to the volcano?',
    },
    options: [
      { id: 'amanecer', label: { es: 'Sí, al amanecer', en: 'Yes, at sunrise' } },
      { id: 'tarde', label: { es: 'Sí, en la tarde', en: 'Yes, in the afternoon' } },
      {
        id: 'por-mi-cuenta',
        label: { es: 'Prefiero ir por mi cuenta', en: 'I prefer to go alone' },
      },
      { id: 'no', label: { es: 'No, gracias', en: 'No, thanks' } },
    ],
  },
  {
    id: 'q-deep-nourish-1',
    pillar: 'nourish',
    depth: 'deep',
    prompt: {
      es: '¿Cómo describirías tu forma de comer?',
      en: 'How would you describe the way you eat?',
    },
    options: [
      { id: 'de-todo', label: { es: 'Como de todo', en: 'A bit of everything' } },
      { id: 'vegetariana', label: { es: 'Vegetariana', en: 'Vegetarian' } },
      { id: 'vegana', label: { es: 'Vegana', en: 'Vegan' } },
      { id: 'sin-gluten', label: { es: 'Sin gluten', en: 'Gluten free' } },
      { id: 'otra', label: { es: 'Otra', en: 'Other' } },
    ],
  },
  {
    id: 'q-deep-nourish-2',
    pillar: 'nourish',
    depth: 'deep',
    prompt: { es: '¿Tomás alcohol?', en: 'Do you drink alcohol?' },
    sensitive: true,
    options: [
      { id: 'si', label: { es: 'Sí', en: 'Yes' } },
      { id: 'moderacion', label: { es: 'Con moderación', en: 'In moderation' } },
      { id: 'no', label: { es: 'No', en: 'No' } },
    ],
  },
  {
    id: 'q-deep-nourish-3',
    pillar: 'nourish',
    depth: 'deep',
    prompt: {
      es: '¿Hay algún ingrediente que preferís evitar?',
      en: 'Any ingredient you would rather avoid?',
    },
    sensitive: true,
  },
  {
    id: 'q-deep-nourish-4',
    pillar: 'nourish',
    depth: 'deep',
    prompt: { es: '¿A qué hora te gusta desayunar?', en: 'When do you like to have breakfast?' },
    options: [
      { id: 'temprano', label: { es: 'Antes de las 7', en: 'Before 7' } },
      { id: 'medio', label: { es: 'Entre 7 y 9', en: 'Between 7 and 9' } },
      { id: 'tarde', label: { es: 'Después de las 9', en: 'After 9' } },
    ],
  },
  {
    id: 'q-deep-connect-1',
    pillar: 'connect',
    depth: 'deep',
    prompt: {
      es: '¿Con cuánta gente del equipo querés cruzarte durante el día?',
      en: 'How much contact with our team would you like?',
    },
    options: [
      { id: 'minimo', label: { es: 'Lo mínimo', en: 'As little as possible' } },
      { id: 'normal', label: { es: 'Lo normal', en: 'The usual' } },
      { id: 'conversar', label: { es: 'Me gusta conversar', en: 'I enjoy chatting' } },
    ],
  },
  {
    id: 'q-deep-connect-2',
    pillar: 'connect',
    depth: 'deep',
    prompt: { es: '¿Vienen con niños?', en: 'Are you travelling with children?' },
    options: [
      { id: 'no', label: { es: 'No', en: 'No' } },
      { id: 'menores-6', label: { es: 'Sí, menores de 6', en: 'Yes, under 6' } },
      { id: '6-12', label: { es: 'Sí, entre 6 y 12', en: 'Yes, between 6 and 12' } },
      { id: 'adolescentes', label: { es: 'Sí, adolescentes', en: 'Yes, teenagers' } },
    ],
  },
  {
    id: 'q-deep-connect-3',
    pillar: 'connect',
    depth: 'deep',
    prompt: {
      es: '¿Querés que organicemos algo con otros huéspedes?',
      en: 'Would you like us to arrange something with other guests?',
    },
    options: [
      { id: 'si', label: { es: 'Sí, me encantaría', en: 'Yes, I would love that' } },
      { id: 'tal-vez', label: { es: 'Tal vez', en: 'Maybe' } },
      { id: 'no', label: { es: 'No, gracias', en: 'No, thanks' } },
    ],
  },
  {
    id: 'q-deep-create-1',
    pillar: 'create',
    depth: 'deep',
    prompt: {
      es: '¿Vas a trabajar durante la estadía?',
      en: 'Will you be working during your stay?',
    },
    options: [
      { id: 'no', label: { es: 'No, vengo a desconectarme', en: 'No, I am here to disconnect' } },
      { id: 'poco', label: { es: 'Un poco', en: 'A little' } },
      { id: 'si', label: { es: 'Sí, todos los días', en: 'Yes, every day' } },
    ],
  },
  {
    id: 'q-deep-create-2',
    pillar: 'create',
    depth: 'deep',
    prompt: {
      es: '¿Te interesa algún taller con artesanos de la zona?',
      en: 'Any interest in a workshop with local artisans?',
    },
    options: [
      { id: 'ceramica', label: { es: 'Cerámica', en: 'Pottery' } },
      { id: 'cocina', label: { es: 'Cocina', en: 'Cooking' } },
      { id: 'cafe', label: { es: 'Café', en: 'Coffee' } },
      { id: 'ninguno', label: { es: 'Ninguno', en: 'None' } },
    ],
  },
  {
    id: 'q-deep-create-3',
    pillar: 'create',
    depth: 'deep',
    prompt: { es: '¿Qué querés llevarte de este viaje?', en: 'What do you want to take home?' },
    options: [
      { id: 'descanso', label: { es: 'Descanso', en: 'Rest' } },
      { id: 'ideas', label: { es: 'Ideas nuevas', en: 'New ideas' } },
      { id: 'pareja', label: { es: 'Tiempo en pareja', en: 'Time together' } },
      { id: 'aventura', label: { es: 'Aventura', en: 'Adventure' } },
    ],
  },
  {
    id: 'q-deep-believe-1',
    pillar: 'believe',
    depth: 'deep',
    prompt: { es: '¿Practicás algún tipo de meditación?', en: 'Do you practise any meditation?' },
    options: [
      { id: 'diario', label: { es: 'Sí, todos los días', en: 'Yes, daily' } },
      { id: 'a-veces', label: { es: 'A veces', en: 'Sometimes' } },
      {
        id: 'me-interesa',
        label: { es: 'Nunca, pero me interesa', en: 'Never, but I am curious' },
      },
      { id: 'no', label: { es: 'No', en: 'No' } },
    ],
  },
  {
    id: 'q-deep-believe-2',
    pillar: 'believe',
    depth: 'deep',
    prompt: {
      es: '¿Te gustaría una sesión de respiración al amanecer?',
      en: 'Would you like a sunrise breathing session?',
    },
    options: [
      { id: 'si', label: { es: 'Sí', en: 'Yes' } },
      { id: 'tal-vez', label: { es: 'Tal vez', en: 'Maybe' } },
      { id: 'no', label: { es: 'No', en: 'No' } },
    ],
  },
  {
    id: 'q-deep-believe-3',
    pillar: 'believe',
    depth: 'deep',
    prompt: {
      es: '¿Hay algo que estés cerrando o empezando en tu vida?',
      en: 'Is there something you are closing or starting in your life?',
    },
    sensitive: true,
  },
  {
    id: 'q-deep-believe-4',
    pillar: 'believe',
    depth: 'deep',
    prompt: {
      es: '¿Qué significa para vos volverte más humano?',
      en: 'What does becoming more human mean to you?',
    },
  },
];

/** Qué entrevista eligió cada estadía. Sin entrada, se asume la light. */
export const STAY_DEPTH: Record<string, InterviewDepth> = {};

export function depthFor(stayId: string): InterviewDepth {
  return STAY_DEPTH[stayId] ?? 'light';
}

const answer = (questionId: string, value: string, answeredAt: string): InterviewAnswer => ({
  questionId,
  value,
  answeredAt,
});

/**
 * Respuestas ya guardadas. Valeria y la Familia Keller la tienen completa;
 * Camille va por 3 de 5 y Hannah por 2, como muestra el dashboard.
 */
export const SEED_ANSWERS: Record<string, InterviewAnswer[]> = {
  's-mendez-rojas': [
    answer('q-light-connect', 'pareja', '2026-11-09T14:14:00-06:00'),
    answer('q-light-nourish', 'frutos-secos', '2026-11-09T14:15:00-06:00'),
    answer('q-light-move', 'moderado', '2026-11-09T14:16:00-06:00'),
    answer('q-light-believe', 'aniversario', '2026-11-09T14:17:00-06:00'),
    answer('q-light-create', 'calma', '2026-11-09T14:18:00-06:00'),
  ],
  's-keller': [
    answer('q-light-connect', 'familia', '2026-11-02T09:41:00-06:00'),
    answer('q-light-nourish', 'lacteos', '2026-11-02T09:42:00-06:00'),
    answer('q-light-move', 'intenso', '2026-11-02T09:43:00-06:00'),
    answer('q-light-believe', 'nada', '2026-11-02T09:44:00-06:00'),
    answer('q-light-create', 'cercanos', '2026-11-02T09:45:00-06:00'),
  ],
  's-durand': [
    answer('q-light-connect', 'solo', '2026-11-11T18:06:00-06:00'),
    answer('q-light-nourish', 'otra', '2026-11-11T18:07:00-06:00'),
    answer('q-light-move', 'suave', '2026-11-11T18:08:00-06:00'),
  ],
  's-arias': [
    answer('q-light-connect', 'amigos', '2026-10-28T11:21:00-06:00'),
    answer('q-light-nourish', 'ninguna', '2026-10-28T11:22:00-06:00'),
    answer('q-light-move', 'moderado', '2026-10-28T11:23:00-06:00'),
    answer('q-light-believe', 'cumpleanos', '2026-10-28T11:24:00-06:00'),
    answer('q-light-create', 'cercanos', '2026-10-28T11:25:00-06:00'),
  ],
  's-bianchi': [
    answer('q-light-connect', 'solo', '2026-11-01T16:01:00-06:00'),
    answer('q-light-nourish', 'ninguna', '2026-11-01T16:02:00-06:00'),
    answer('q-light-move', 'intenso', '2026-11-01T16:03:00-06:00'),
    answer('q-light-believe', 'nada', '2026-11-01T16:04:00-06:00'),
    answer('q-light-create', 'necesario', '2026-11-01T16:05:00-06:00'),
  ],
  // Hannah se frenó justo en la pregunta de alergias: por eso todavía no
  // aceptó la política de privacidad.
  's-weber': [
    answer('q-light-connect', 'solo', '2026-11-12T08:31:00-06:00'),
    answer('q-light-move', 'suave', '2026-11-12T08:32:00-06:00'),
  ],
};
