import type { GuestAlert, PillarSummary } from '@/types';

/**
 * Alertas del huésped. Salen de la entrevista y se muestran igual en Llegadas y
 * en el perfil: si acá cambia una alergia, cambia en las dos pantallas.
 */
export const ALERTS: Record<string, GuestAlert[]> = {
  's-mendez-rojas': [
    { kind: 'celebration', label: { es: 'Aniversario · 5 años', en: 'Anniversary · 5 years' } },
    {
      kind: 'allergy',
      label: { es: 'Andrés: alergia a frutos secos', en: 'Andrés: nut allergy' },
    },
    { kind: 'info', label: { es: 'Valeria no toma alcohol', en: 'Valeria does not drink' } },
    {
      kind: 'info',
      label: { es: 'Avisar antes de tocar la puerta', en: 'Message before coming to the door' },
    },
  ],
  's-keller': [
    { kind: 'info', label: { es: 'Niños de 6 y 9 años', en: 'Children aged 6 and 9' } },
    { kind: 'allergy', label: { es: 'Sin lácteos', en: 'Dairy free' } },
  ],
  's-durand': [
    { kind: 'info', label: { es: 'Viene a trabajar', en: 'Working during the stay' } },
    { kind: 'info', label: { es: 'Vegetariana', en: 'Vegetarian' } },
  ],
  's-whitfield': [{ kind: 'info', label: { es: 'Llegada tarde', en: 'Late arrival' } }],
  's-arias': [{ kind: 'celebration', label: { es: 'Cumpleaños', en: 'Birthday' } }],
  's-bianchi': [{ kind: 'info', label: { es: 'Trae su bici', en: 'Bringing a bike' } }],
  's-morales': [{ kind: 'allergy', label: { es: 'Sin gluten', en: 'Gluten free' } }],
  's-weber': [{ kind: 'info', label: { es: 'Yoga al amanecer', en: 'Sunrise yoga' } }],
  's-solis': [{ kind: 'celebration', label: { es: 'Luna de miel', en: 'Honeymoon' } }],
};

interface ProfileCopy {
  /** Cómo pidieron que los atendamos, en sus palabras. */
  preferredCare: string;
  pillars: PillarSummary[];
  teamNotes: string;
}

/** Lo que el equipo sabe de cada huésped, sintetizado a partir de la entrevista. */
export const PROFILES: Record<string, ProfileCopy> = {
  's-mendez-rojas': {
    preferredCare:
      'Con calma y espacio. Preferimos un mensaje antes de que alguien pase por la villa.',
    pillars: [
      {
        pillar: 'move',
        text: 'Nivel moderado. Quieren una caminata al amanecer y un día de bici.',
      },
      {
        pillar: 'nourish',
        text: 'Andrés: alergia a frutos secos. Valeria no toma alcohol. Prefieren comida local.',
      },
      { pillar: 'connect', text: 'Vienen en pareja a celebrar su aniversario.' },
      { pillar: 'create', text: 'Quieren desconectarse: nada de trabajo durante la estadía.' },
      { pillar: 'believe', text: 'Buscan tiempo en silencio; interés en meditación guiada.' },
    ],
    teamNotes: '',
  },
  's-keller': {
    preferredCare:
      'Cercanos y conversadores. Les gusta que el equipo salude a los niños por su nombre.',
    pillars: [
      { pillar: 'move', text: 'Nivel intenso. Quieren caminatas largas y piscina todos los días.' },
      {
        pillar: 'nourish',
        text: 'Sin lácteos en toda la familia. Desayuno temprano, antes de las 7.',
      },
      { pillar: 'connect', text: 'Vienen con Mia (9) y Finn (6). Buscan planes para los cuatro.' },
      { pillar: 'create', text: 'Les interesa un taller de cocina con los niños.' },
      { pillar: 'believe', text: 'Sin práctica de meditación; no insistir con ese tema.' },
    ],
    teamNotes: '',
  },
  's-durand': {
    preferredCare: 'Solo lo necesario. Trabaja de día y prefiere que no la interrumpan.',
    pillars: [
      { pillar: 'move', text: 'Nivel suave. Caminatas cortas al final del día.' },
      { pillar: 'nourish', text: 'Vegetariana. Prefiere cenar temprano y en la villa.' },
      { pillar: 'connect', text: 'Viaja sola. No quiere actividades con otros huéspedes.' },
      {
        pillar: 'create',
        text: 'Viene a trabajar: necesita escritorio, buena luz y wifi estable.',
      },
    ],
    teamNotes: 'Pidió café de filtro de la zona en la villa desde el primer día.',
  },
  's-whitfield': {
    preferredCare: 'Todavía no completaron la entrevista.',
    pillars: [],
    teamNotes: 'Llegada tarde: dejar cena fría lista y la villa con luz cálida.',
  },
  's-arias': {
    preferredCare: 'Cercanos y conversadores. Vienen con ganas de que las recomienden lugares.',
    pillars: [
      { pillar: 'move', text: 'Nivel moderado. Les interesa una clase de yoga.' },
      { pillar: 'nourish', text: 'Sin restricciones. Quieren probar cocina costarricense.' },
      { pillar: 'connect', text: 'Vienen dos hermanas a celebrar el cumpleaños de Sofía.' },
      { pillar: 'believe', text: 'Cumple 40: quieren que el día se sienta especial.' },
    ],
    teamNotes: '',
  },
  's-bianchi': {
    preferredCare: 'Solo lo necesario. Sale temprano y vuelve al atardecer.',
    pillars: [
      { pillar: 'move', text: 'Nivel intenso. Trae su bici y sale al amanecer.' },
      { pillar: 'nourish', text: 'Sin restricciones. Desayuno antes de las 7.' },
      { pillar: 'connect', text: 'Viaja solo. Prefiere sus tiempos.' },
    ],
    teamNotes: 'Guardar la bici bajo techo; preguntó por un lugar seguro.',
  },
  's-morales': {
    preferredCare: 'Todavía no completaron la entrevista.',
    pillars: [],
    teamNotes: 'Uno del grupo es celíaco: confirmar el menú antes de la llegada.',
  },
  's-weber': {
    preferredCare: 'Todavía está respondiendo la entrevista.',
    pillars: [
      { pillar: 'connect', text: 'Viaja sola. Va por la mitad de la entrevista.' },
      { pillar: 'nourish', text: 'Sin restricciones declaradas hasta ahora.' },
    ],
    teamNotes: 'Preguntó por yoga al amanecer antes de reservar.',
  },
  's-solis': {
    preferredCare: 'Todavía no completaron la entrevista.',
    pillars: [],
    teamNotes: 'Luna de miel: preparar la villa con flores y vista despejada al volcán.',
  },
};
