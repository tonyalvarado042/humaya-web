import { MARCA, esHotelDeDemostracion } from '@/marca';

/**
 * La portada del dominio compartido.
 *
 * ── OJO: ESTA NO ES «LA PÁGINA DE LA DEMO» ──────────────────────────────
 * Se llama DemoHomePage por su origen, pero es la portada de CUALQUIER
 * hotel que viva en `guestexp.liderax10.com/<código>`. El hotel nuevo que se
 * cree mañana entra por acá.
 *
 * Por eso lo de «demo» dejó de estar escrito fijo. Hasta el 24 de noviembre
 * de 2026 decía siempre:
 *
 *   «Demo de {experiencia}»   → en el hotel demo salía, literal,
 *      «DEMO DE DEMO EXPERIENCE»; en un hotel real diría «Demo de Arenal
 *      Experience», que no es cierto.
 *   «Demo con datos ficticios. No contiene información de huéspedes reales.»
 *      → en un hotel real eso es falso, y lo lee el huésped.
 *
 * Ahora lo decide `es_demo`, una bandera del hotel en la base, y no una
 * comparación con el código 'demo' repartida por el código.
 */
export const demoHomeCopy = {
  get eyebrow() {
    return esHotelDeDemostracion() ? `Demo de ${MARCA.experiencia}` : MARCA.experiencia;
  },
  title: 'Become More Human',
  description:
    'Una experiencia conectada para acompañar al huésped y darle a recepción el contexto que necesita.',
  guestCta: 'App del huésped',
  staffCta: 'Recepción',
  /** Solo en la demo: en un hotel de verdad los datos son de verdad. */
  get disclaimer() {
    return esHotelDeDemostracion()
      ? 'Demo con datos ficticios. No contiene información de huéspedes reales.'
      : null;
  },
  entradaCta: '¿Ya reservaste? Buscá tu estadía',
};
