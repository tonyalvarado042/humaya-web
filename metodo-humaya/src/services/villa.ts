import { STAYS, villaInfo } from '@/mocks';
import type { VillaInfo } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

/**
 * Wi-Fi e instructivos de la villa de una estadía.
 * No estaba en la tabla de servicios de docs/PLAN.md; lo pide la pantalla Mi villa.
 */
export async function getVillaInfo(stayId: string): Promise<VillaInfo> {
  assertMocks('villa.getVillaInfo');
  await delay();

  const stay = STAYS.find((item) => item.id === stayId);
  if (!stay) {
    throw new Error(`No existe la estadía ${stayId}`);
  }
  return villaInfo(stay.villa);
}
