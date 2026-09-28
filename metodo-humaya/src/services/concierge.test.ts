import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { getMessages, getSuggestions, replyTo, sendMessage } from './concierge';

beforeEach(() => {
  resetMockState();
});

describe('replyTo', () => {
  it('responde por palabra clave', () => {
    expect(replyTo('¿Cómo pongo el agua caliente?').es).toContain('calentador');
    expect(replyTo('no encuentro el aire acondicionado').es).toContain('23 °C');
  });

  it('no depende de tildes ni de mayúsculas', () => {
    expect(replyTo('AGUAS TERMALES')).toBe(replyTo('aguas termales'));
    expect(replyTo('volcan')).toBe(replyTo('volcán'));
  });

  it('cae en la respuesta genérica cuando no entiende', () => {
    expect(replyTo('¿tienen helicóptero?').es).toContain('se lo paso al equipo');
  });
});

describe('sendMessage', () => {
  it('arranca con el saludo del concierge', async () => {
    const messages = await getMessages();

    expect(messages).toHaveLength(1);
    expect(messages[0].from).toBe('concierge');
  });

  it('agrega el mensaje del huésped y la respuesta, en ese orden', async () => {
    const messages = await sendMessage('¿Cómo pongo el agua caliente?');

    expect(messages).toHaveLength(3);
    expect(messages[1].from).toBe('guest');
    expect(messages[2].from).toBe('concierge');
    expect(messages[2].text).toContain('calentador');
  });

  it('los identificadores no se repiten', async () => {
    await sendMessage('luces');
    await sendMessage('desayuno');

    const messages = await getMessages();
    const ids = new Set(messages.map((message) => message.id));

    expect(ids.size).toBe(messages.length);
  });
});

describe('getSuggestions', () => {
  it('ofrece las sugerencias rápidas del prototipo', () => {
    expect(getSuggestions().map((suggestion) => suggestion.es)).toEqual([
      'Aire acondicionado',
      'Agua caliente',
      'Luces de la villa',
      'Desayuno',
      'Aguas termales',
    ]);
  });
});
