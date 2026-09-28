import { PROTOCOL_TIPS, STAYS } from '@/mocks';
import type { ProtocolTip } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

/**
 * Los consejos del día del protocolo de 7 días en el que va la estadía.
 * No estaba en la tabla de servicios de docs/PLAN.md; lo pide la sección
 * "Preparate" de la pantalla Inicio.
 */
export async function getProtocolTips(stayId: string): Promise<ProtocolTip[]> {
  assertMocks('protocol.getProtocolTips');
  await delay();

  const stay = STAYS.find((item) => item.id === stayId);
  if (!stay) {
    throw new Error(`No existe la estadía ${stayId}`);
  }
  if (!stay.prepDay) {
    return [];
  }

  return PROTOCOL_TIPS.filter((tip) => tip.day === stay.prepDay).sort((a, b) => a.order - b.order);
}
