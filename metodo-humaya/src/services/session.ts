import {
  DEFAULT_STAY_ID as MOCK_DEFAULT,
  DEMO_STAYS as MOCK_DEMO_STAYS,
  GUESTS as MOCK_GUESTS,
  STAYS as MOCK_STAYS,
} from '@/mocks';

/**
 * Quién es el huésped que mira la app. Hoy sale de los datos de ejemplo; cuando
 * haya login de verdad, sale de la sesión. Las pantallas lo piden por acá para
 * no tocar mocks/ directamente.
 */
export const DEFAULT_STAY_ID = MOCK_DEFAULT;

/** Las estadías de demo, con el idioma derivado del perfil real del huésped. */
export const DEMO_STAYS = MOCK_DEMO_STAYS.map((option) => {
  const stay = MOCK_STAYS.find((item) => item.id === option.stayId);
  const guest = MOCK_GUESTS.find((item) => item.id === stay?.guestId);
  return { ...option, locale: guest?.locale ?? ('es' as const) };
});
