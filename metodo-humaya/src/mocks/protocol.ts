import type { ProtocolTip } from '@/types';

/**
 * Protocolo de 7 días previo a la llegada, uno de los tres momentos del Método
 * Humaya. Dos tips por día, en voseo y breves, como la landing.
 *
 * PROVISIONAL: el contenido real lo tiene que pasar Anthony.
 */
export const PROTOCOL_TIPS: ProtocolTip[] = [
  {
    day: 1,
    order: 1,
    title: { es: 'Empezá a soltar', en: 'Start letting go' },
    body: {
      es: 'Anotá las tres cosas que querés dejar atrás durante estos días.',
      en: 'Write down three things you want to leave behind during these days.',
    },
  },
  {
    day: 1,
    order: 2,
    title: { es: 'Movimiento suave', en: 'Gentle movement' },
    body: {
      es: 'Caminá 20 minutos, sin auriculares y sin apuro.',
      en: 'Walk for 20 minutes, without headphones and without rushing.',
    },
  },
  {
    day: 2,
    order: 1,
    title: { es: 'Hidratación', en: 'Hydration' },
    body: {
      es: 'Sumá dos vasos de agua a tu día desde hoy.',
      en: 'Add two glasses of water to your day.',
    },
  },
  {
    day: 2,
    order: 2,
    title: { es: 'Comida real', en: 'Real food' },
    body: {
      es: 'Elegí una comida del día sin nada procesado.',
      en: 'Choose one meal today without anything processed.',
    },
  },
  {
    day: 3,
    order: 1,
    title: { es: 'Descanso', en: 'Rest' },
    body: {
      es: 'Dejá el celular una hora antes de dormir.',
      en: 'Put your phone away one hour before bed.',
    },
  },
  {
    day: 3,
    order: 2,
    title: { es: 'Respiración', en: 'Breathing' },
    body: {
      es: 'Cinco minutos de respiración lenta al despertar.',
      en: 'Take five minutes for slow breathing when you wake up.',
    },
  },
  {
    day: 4,
    order: 1,
    title: { es: 'Silencio', en: 'Silence' },
    body: {
      es: 'Buscá quince minutos de silencio, sin pantallas ni música.',
      en: 'Find fifteen minutes of silence, without screens or music.',
    },
  },
  {
    day: 4,
    order: 2,
    title: { es: 'Sol de la mañana', en: 'Morning sunlight' },
    body: {
      es: 'Salí a que te dé el sol apenas te levantés.',
      en: 'Step outside into the sunlight as soon as you get up.',
    },
  },
  {
    day: 5,
    order: 1,
    title: { es: 'Hidratación', en: 'Hydration' },
    body: {
      es: 'Sumá dos vasos de agua a tu día desde hoy.',
      en: 'Add two glasses of water to your day.',
    },
  },
  {
    day: 5,
    order: 2,
    title: { es: 'Descanso', en: 'Rest' },
    body: {
      es: 'Dejá el celular una hora antes de dormir.',
      en: 'Put your phone away one hour before bed.',
    },
  },
  {
    day: 6,
    order: 1,
    title: { es: 'Liviano', en: 'Keep it light' },
    body: {
      es: 'Cená temprano y liviano: tu cuerpo va a agradecerlo en el viaje.',
      en: 'Have an early, light dinner. Your body will thank you on the journey.',
    },
  },
  {
    day: 6,
    order: 2,
    title: { es: 'Empacá con calma', en: 'Pack with ease' },
    body: {
      es: 'Ropa cómoda, calzado para caminar y algo abrigado para la noche.',
      en: 'Pack comfortable clothes, walking shoes and something warm for the evening.',
    },
  },
  {
    day: 7,
    order: 1,
    title: { es: 'Llegá sin prisa', en: 'Arrive without rushing' },
    body: {
      es: 'El check-in es desde las 3:00 p.m. No hace falta correr.',
      en: 'Check-in starts at 3:00 p.m. There is no need to rush.',
    },
  },
  {
    day: 7,
    order: 2,
    title: { es: 'Dejá espacio', en: 'Leave some space' },
    body: {
      es: 'No planifiques nada para tu primera tarde en Humaya.',
      en: 'Leave your first afternoon at Humaya open.',
    },
  },
];
