import type { VillaInfo } from '@/types';

const GUIDES = [
  {
    id: 'aire',
    title: { es: 'Aire acondicionado', en: 'Air conditioning' },
    body: {
      es: 'El control está en la pared, al lado de la cama. Encendelo con el botón central; para dormir recomendamos 23 °C y el modo silencioso (el botón con la hoja).',
      en: 'The control is on the wall beside the bed. Use the centre button to turn it on; for sleeping, we recommend 23 °C and silent mode (the leaf button).',
    },
  },
  {
    id: 'agua',
    title: { es: 'Agua caliente', en: 'Hot water' },
    body: {
      es: 'El calentador queda encendido siempre. Girá la llave de la ducha hacia la izquierda y esperá unos 30 segundos.',
      en: 'The water heater stays on. Turn the shower handle to the left and wait about 30 seconds.',
    },
  },
  {
    id: 'luces',
    title: { es: 'Luces inteligentes', en: 'Smart lights' },
    body: {
      es: 'Panel junto a la puerta: Día, Atardecer y Noche. También podés pedirle al concierge que las cambie por vos.',
      en: 'Use the panel beside the door: Day, Sunset and Night. You can also ask the concierge to adjust them for you.',
    },
  },
  {
    id: 'cocina',
    title: { es: 'Cocina', en: 'Kitchen' },
    body: {
      es: 'Cafetera de filtro, café de la zona y agua filtrada en la refri. Si necesitás algo más, escribinos.',
      en: 'There is a filter coffee maker, local coffee and filtered water in the fridge. Message us if you need anything else.',
    },
  },
];

/** Las 10 villas. Los instructivos son iguales; cambian el nombre y el wifi. */
const highlight = (es: string, en: string) => ({ es, en });

const HIGHLIGHTS = {
  1: [highlight('Vista al jardín', 'Garden view'), highlight('Terraza privada', 'Private terrace')],
  2: [
    highlight('Vista al volcán', 'Volcano view'),
    highlight('Escritorio con luz natural', 'Naturally lit desk'),
  ],
  3: [highlight('Vista al bosque', 'Forest view'), highlight('Terraza privada', 'Private terrace')],
  4: [
    highlight('Vista al volcán', 'Volcano view'),
    highlight('Terraza privada', 'Private terrace'),
    highlight('Doble altura', 'Double-height ceiling'),
  ],
  5: [
    highlight('Vista al jardín', 'Garden view'),
    highlight('Acceso directo al sendero', 'Direct trail access'),
  ],
  6: [highlight('Vista al volcán', 'Volcano view'), highlight('Tina exterior', 'Outdoor tub')],
  7: [
    highlight('Vista al jardín', 'Garden view'),
    highlight('Dos habitaciones', 'Two bedrooms'),
    highlight('Terraza amplia', 'Spacious terrace'),
  ],
  8: [highlight('Vista al bosque', 'Forest view'), highlight('Rincón de lectura', 'Reading nook')],
  9: [
    highlight('Vista al volcán', 'Volcano view'),
    highlight('Terraza privada', 'Private terrace'),
  ],
  10: [highlight('Vista al jardín', 'Garden view'), highlight('Dos habitaciones', 'Two bedrooms')],
};

export function villaInfo(villa: number): VillaInfo {
  const padded = String(villa).padStart(2, '0');
  return {
    villa,
    name: `Villa ${padded}`,
    highlights: HIGHLIGHTS[villa as keyof typeof HIGHLIGHTS] ?? [
      highlight('Vista al jardín', 'Garden view'),
    ],
    wifiNetwork: `Humaya-Villa${padded}`,
    // Dato de ejemplo: la clave real nunca va en el repositorio.
    wifiPassword: 'arenal2026',
    guides: GUIDES,
  };
}
