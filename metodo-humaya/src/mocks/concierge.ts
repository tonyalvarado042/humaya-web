import type { LocalizedText } from '@/types';

/** Respuestas bilingües del concierge mock; la API real reemplazará esta tabla. */
export interface ConciergeAnswer {
  label: LocalizedText;
  keywords: { es: string[]; en: string[] };
  text: LocalizedText;
}

export const CONCIERGE_ANSWERS: ConciergeAnswer[] = [
  {
    label: { es: 'Aire acondicionado', en: 'Air conditioning' },
    keywords: {
      es: ['aire', 'acondicionado', 'clima', 'calor', 'frío', 'frio'],
      en: ['air', 'conditioning', 'temperature', 'ac'],
    },
    text: {
      es: 'El control está en la pared, al lado de la cama. Para dormir te recomendamos 23 °C; el botón con la hoja activa el modo silencioso.',
      en: 'The control is on the wall beside the bed. We recommend 23 °C for sleeping; the leaf button turns on silent mode.',
    },
  },
  {
    label: { es: 'Agua caliente', en: 'Hot water' },
    keywords: {
      es: ['agua caliente', 'ducha', 'calentador', 'agua'],
      en: ['hot water', 'shower', 'heater', 'water'],
    },
    text: {
      es: 'El calentador ya está encendido. En la ducha, girá la llave hacia la izquierda y esperá unos 30 segundos. Si no sale caliente, avisame y alguien del equipo pasa por la villa.',
      en: 'The water heater is already on. Turn the shower handle to the left and wait about 30 seconds. If the water stays cold, let me know and someone from the team will come by.',
    },
  },
  {
    label: { es: 'Luces de la villa', en: 'Villa lights' },
    keywords: {
      es: ['luz', 'luces', 'lámpara', 'lampara', 'panel'],
      en: ['light', 'lights', 'lamp', 'panel'],
    },
    text: {
      es: 'Tocá el panel junto a la puerta: Atardecer baja las luces a un tono cálido y Noche apaga todo menos la luz del baño.',
      en: 'Use the panel beside the door: Sunset dims the lights to a warm tone, and Night turns everything off except the bathroom light.',
    },
  },
  {
    label: { es: 'Desayuno', en: 'Breakfast' },
    keywords: {
      es: ['desayuno', 'comida', 'comer', 'cena', 'almuerzo'],
      en: ['breakfast', 'food', 'eat', 'dinner', 'lunch'],
    },
    text: {
      es: 'El desayuno se sirve de 7:00 a 10:00 a.m. Contanos si tenés alguna restricción y lo preparamos aparte.',
      en: 'Breakfast is served from 7:00 to 10:00 a.m. Tell us about any dietary restrictions and we will prepare it separately.',
    },
  },
  {
    label: { es: 'Aguas termales', en: 'Hot springs' },
    keywords: {
      es: ['termales', 'aguas', 'volcán', 'volcan', 'paseo', 'tour'],
      en: ['hot springs', 'springs', 'volcano', 'outing', 'tour'],
    },
    text: {
      es: 'Hay varias opciones cerca. Si querés, te reservo entrada y transporte para mañana en la tarde. ¿Les sirve a las 3:00 p.m.?',
      en: 'There are several options nearby. I can book admission and transport for tomorrow afternoon. Would 3:00 p.m. work for you?',
    },
  },
];

export const FALLBACK_ANSWER: LocalizedText = {
  es: 'Con gusto. Ya se lo paso al equipo de Humaya y te confirmo por aquí en unos minutos.',
  en: "Of course. I'll pass this to the Humaya team and confirm here in a few minutes.",
};

export const GREETING: LocalizedText = {
  es: 'Hola, soy tu concierge de Humaya. Estoy acá las 24 horas para ayudarte con la villa, el lugar o lo que necesités.',
  en: "Hi, I'm your Humaya concierge. I'm here 24 hours a day to help with your villa, the property or anything else you need.",
};
