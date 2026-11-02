import type { LocalizedText } from './common';

/** Un consejo del protocolo de 7 días previo a la llegada. */
export interface ProtocolTip {
  /** Día del protocolo, del 1 al 7. */
  day: number;
  /** Orden dentro del día. */
  order: number;
  title: LocalizedText;
  body: LocalizedText;
}
