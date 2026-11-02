import type { LocalizedText } from './common';

/** Un instructivo desplegable de la villa (aire, agua caliente, luces, cocina). */
export interface VillaGuide {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

/** Lo que muestra la pantalla Mi villa. */
export interface VillaInfo {
  villa: number;
  name: string;
  highlights: LocalizedText[];
  wifiNetwork: string;
  wifiPassword: string;
  guides: VillaGuide[];
}
