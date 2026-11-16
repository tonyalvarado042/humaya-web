import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '@/types';
import { esperaDesde } from './espera';

function mensaje(
  from: ChatMessage['from'],
  at: string,
  extra: Partial<ChatMessage> = {},
): ChatMessage {
  return {
    id: `${from}-${at}`,
    stayId: 's-weber',
    guestName: 'Hannah',
    from,
    text: 'hola',
    escalated: false,
    readAt: null,
    at,
    ...extra,
  };
}

describe('desde cuándo espera el huésped', () => {
  it('no espera nada si nunca escribió', () => {
    expect(esperaDesde([])).toBeNull();
  });

  it('espera desde su mensaje si nadie contestó', () => {
    const mensajes = [mensaje('guest', '2026-11-16T10:00:00Z')];
    expect(esperaDesde(mensajes)).toBe('2026-11-16T10:00:00Z');
  });

  it('deja de esperar cuando contesta el staff', () => {
    const mensajes = [
      mensaje('guest', '2026-11-16T10:00:00Z'),
      mensaje('staff', '2026-11-16T10:05:00Z'),
    ];
    expect(esperaDesde(mensajes)).toBeNull();
  });

  it('vuelve a esperar si escribió después de que le contestaron', () => {
    const mensajes = [
      mensaje('guest', '2026-11-16T10:00:00Z'),
      mensaje('staff', '2026-11-16T10:05:00Z'),
      mensaje('guest', '2026-11-16T11:00:00Z'),
    ];
    expect(esperaDesde(mensajes)).toBe('2026-11-16T11:00:00Z');
  });

  it('una respuesta del bot que SÍ supo cuenta como contestada', () => {
    const mensajes = [
      mensaje('guest', '2026-11-16T10:00:00Z'),
      mensaje('concierge', '2026-11-16T10:00:30Z', { escalated: false }),
    ];
    expect(esperaDesde(mensajes)).toBeNull();
  });

  it('un «ya se lo paso al equipo» NO cuenta como contestada', () => {
    // Es la trampa de toda esta cuenta: el hilo tiene una respuesta debajo
    // del mensaje del huésped, así que «hay respuesta» daría falso. Pero esa
    // respuesta dice justamente que todavía no le contestaron.
    const mensajes = [
      mensaje('guest', '2026-11-16T10:00:00Z'),
      mensaje('concierge', '2026-11-16T10:00:30Z', { escalated: true }),
    ];
    expect(esperaDesde(mensajes)).toBe('2026-11-16T10:00:00Z');
  });

  it('no se mide por «sin leer»: abrir el hilo marca leído y seguiría esperando', () => {
    const mensajes = [mensaje('guest', '2026-11-16T10:00:00Z', { readAt: '2026-11-16T10:01:00Z' })];
    expect(esperaDesde(mensajes)).toBe('2026-11-16T10:00:00Z');
  });
});
