import type { MovementFamily, WeeklyProgram, WorkoutExercise } from '@/types';
import { daysFromToday } from './today';

let exerciseSeq = 0;
let sectionSeq = 0;
let sessionSeq = 0;

function exercise(
  name: { es: string; en: string },
  cue: { es: string; en: string },
  family: MovementFamily,
  sets: number,
  reps: number | { es: string; en: string },
  effort: number,
  options: { restSeconds?: number; weightKg?: number } = {},
): WorkoutExercise {
  exerciseSeq += 1;
  const isTimed = typeof reps !== 'number';
  const workSeconds = isTimed
    ? Number(reps.es.replace(/\D/g, '')) || 40
    : effort >= 70
      ? 40
      : effort >= 60
        ? 35
        : 30;
  return {
    id: `move-ex-${exerciseSeq}`,
    name,
    cue,
    family,
    sets,
    reps,
    workSeconds,
    restSeconds: options.restSeconds ?? (effort >= 65 ? 30 : 15),
    weightKg: options.weightKg,
    effort,
  };
}

function section(
  name: { es: string; en: string },
  cue: { es: string; en: string },
  exercises: WorkoutExercise[],
) {
  sectionSeq += 1;
  return { id: `move-sec-${sectionSeq}`, name, cue, exercises };
}

function session(
  dayIndex: number,
  focus: { es: string; en: string },
  blurb: { es: string; en: string },
  sections: ReturnType<typeof section>[],
) {
  sessionSeq += 1;
  return { id: `move-session-${sessionSeq}`, dayIndex, focus, blurb, sections };
}

const fullBody = session(
  0,
  { es: 'Full body', en: 'Full body' },
  {
    es: 'Hoy vamos con fuerza total, sin prisa. Calentá bien y respetá la técnica antes que el peso.',
    en: 'Today we go full strength, no rush. Warm up well and respect technique over weight.',
  },
  [
    section(
      { es: 'Tren inferior', en: 'Lower body' },
      {
        es: 'Vamos alternando cada ejercicio del bloque, prestá atención a la postura.',
        en: 'We alternate each exercise in the block — watch your posture.',
      },
      [
        exercise(
          { es: 'Sentadilla goblet', en: 'Goblet squat' },
          {
            es: 'Bajá controlado, empujá el piso, pecho arriba.',
            en: 'Lower with control, push through the floor, chest up.',
          },
          'squat',
          3,
          12,
          65,
          { weightKg: 16 },
        ),
        exercise(
          { es: 'Peso muerto rumano', en: 'Romanian deadlift' },
          {
            es: 'Cadera atrás, espalda recta, sentí el isquiotibial.',
            en: 'Hips back, straight back, feel the hamstring.',
          },
          'hinge',
          3,
          10,
          70,
          { weightKg: 20 },
        ),
      ],
    ),
    section(
      { es: 'Tren superior', en: 'Upper body' },
      {
        es: 'Empuje y jalón alternado — cuidá el codo en cada repetición.',
        en: 'Alternating push and pull — watch your elbow on every rep.',
      },
      [
        exercise(
          { es: 'Press militar', en: 'Overhead press' },
          {
            es: 'Core apretado, subí recto sin arquear la espalda.',
            en: 'Brace your core, press straight up without arching.',
          },
          'push',
          3,
          10,
          60,
          { weightKg: 10 },
        ),
        exercise(
          { es: 'Remo con mancuerna', en: 'Dumbbell row' },
          {
            es: 'Codo pegado al cuerpo, apretá la espalda arriba.',
            en: 'Elbow close to your body, squeeze your back at the top.',
          },
          'pull',
          3,
          12,
          60,
          { weightKg: 14 },
        ),
      ],
    ),
  ],
);

const upperStrength = session(
  1,
  { es: 'Upper strength', en: 'Upper strength' },
  {
    es: 'Fuerza de tren superior. Pocas repeticiones, buena forma, descansos completos.',
    en: 'Upper body strength. Fewer reps, good form, full rests.',
  },
  [
    section(
      { es: 'Empuje', en: 'Push' },
      {
        es: 'Controlá la bajada en cada repetición.',
        en: 'Control the lowering phase on every rep.',
      },
      [
        exercise(
          { es: 'Press banca con mancuernas', en: 'Dumbbell bench press' },
          {
            es: 'Omóplatos atrás, bajá hasta el pecho sin rebotar.',
            en: 'Shoulder blades back, lower to your chest without bouncing.',
          },
          'push',
          4,
          8,
          75,
          { weightKg: 18 },
        ),
        exercise(
          { es: 'Flexiones', en: 'Push-ups' },
          {
            es: 'Cuerpo en línea recta, codos a 45 grados.',
            en: 'Keep a straight line, elbows at 45 degrees.',
          },
          'push',
          3,
          12,
          55,
        ),
      ],
    ),
    section(
      { es: 'Jalón', en: 'Pull' },
      {
        es: 'Sentí el trabajo en la espalda, no en el brazo.',
        en: 'Feel it in your back, not your arm.',
      },
      [
        exercise(
          { es: 'Jalón al pecho con banda', en: 'Band lat pulldown' },
          { es: 'Tirá con los codos, pecho arriba.', en: 'Pull with your elbows, chest up.' },
          'pull',
          4,
          10,
          60,
        ),
        exercise(
          { es: 'Plancha', en: 'Plank' },
          { es: 'Cadera neutra, no la dejés caer.', en: 'Neutral hips, don’t let them sag.' },
          'core',
          3,
          { es: '40 s', en: '40 s' },
          55,
        ),
      ],
    ),
  ],
);

const lowerStrength = session(
  2,
  { es: 'Lower strength', en: 'Lower strength' },
  {
    es: 'Piernas y cadera. El calentamiento de hoy vale oro — no lo saltés.',
    en: 'Legs and hips. Today’s warm-up is gold — don’t skip it.',
  },
  [
    section(
      { es: 'Cuádriceps y glúteo', en: 'Quads and glutes' },
      {
        es: 'Series pesadas, descanso completo entre cada una.',
        en: 'Heavy sets, full rest between each one.',
      },
      [
        exercise(
          { es: 'Sentadilla búlgara', en: 'Bulgarian split squat' },
          {
            es: 'Rodilla apuntando al mismo lado del pie.',
            en: 'Knee tracking over the same-side foot.',
          },
          'squat',
          3,
          10,
          75,
          { weightKg: 12 },
        ),
        exercise(
          { es: 'Zancada caminando', en: 'Walking lunge' },
          {
            es: 'Paso largo, bajá recto sin inclinarte.',
            en: 'Long step, drop straight down without leaning.',
          },
          'squat',
          3,
          12,
          65,
        ),
      ],
    ),
    section(
      { es: 'Core', en: 'Core' },
      {
        es: 'Cerramos con el core, va a arder al final.',
        en: 'We close with core work — it’ll burn.',
      },
      [
        exercise(
          { es: 'Bird-dog con mancuerna', en: 'Dumbbell bird-dog row' },
          {
            es: 'Cadera fija, sacá el brazo y la pierna contraria.',
            en: 'Keep hips still, extend opposite arm and leg.',
          },
          'core',
          3,
          { es: '30 s', en: '30 s' },
          50,
          { weightKg: 6 },
        ),
        exercise(
          { es: 'Puente de glúteo', en: 'Glute bridge' },
          {
            es: 'Apretá glúteo arriba, no arquees la lumbar.',
            en: 'Squeeze at the top, don’t arch your lower back.',
          },
          'hinge',
          3,
          { es: '30 s', en: '30 s' },
          45,
        ),
      ],
    ),
  ],
);

/** El programa activo de la semana. Un solo coach en esta primera fase. */
export const WEEKLY_PROGRAM: WeeklyProgram = {
  id: 'move-program-current',
  coachName: 'Coach Tony Alvarado',
  weekOf: daysFromToday(0),
  sessions: [fullBody, upperStrength, lowerStrength],
};
