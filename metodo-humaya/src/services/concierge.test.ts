import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getConversations,
  getMessages,
  getSuggestions,
  markConversationRead,
  sendMessage,
  sendStaffReply,
} from './concierge';

const FN_URL = 'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1/humaya-concierge';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getMessages', () => {
  it('pide el hilo de la estadía correcta', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse({ messages: [{ id: 'm-1', from: 'concierge' }] }));

    const messages = await getMessages('s-mendez-rojas');

    expect(fetchMock).toHaveBeenCalledWith(
      `${FN_URL}?stay_id=s-mendez-rojas`,
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
    expect(messages).toHaveLength(1);
  });
});

describe('sendMessage', () => {
  it('manda la acción send con la estadía, el nombre y el texto', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse({ messages: [] }));

    await sendMessage('s-mendez-rojas', 'Valeria', '¿Cómo pongo el agua caliente?');

    expect(fetchMock).toHaveBeenCalledWith(
      FN_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          action: 'send',
          stay_id: 's-mendez-rojas',
          guest_name: 'Valeria',
          text: '¿Cómo pongo el agua caliente?',
        }),
      }),
    );
  });

  it('lanza un error si la respuesta no es ok', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));

    await expect(sendMessage('s-mendez-rojas', 'Valeria', 'hola')).rejects.toThrow(
      'concierge_http_500',
    );
  });
});

describe('getConversations', () => {
  it('pide el resumen para el staff', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse({ conversations: [] }));

    await getConversations();

    expect(fetchMock).toHaveBeenCalledWith(`${FN_URL}?staff=1`, expect.anything());
  });
});

describe('sendStaffReply', () => {
  it('manda la acción reply', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse({ messages: [] }));

    await sendStaffReply('s-weber', 'Ya te confirmamos el horario.');

    expect(fetchMock).toHaveBeenCalledWith(
      FN_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          action: 'reply',
          stay_id: 's-weber',
          text: 'Ya te confirmamos el horario.',
        }),
      }),
    );
  });
});

describe('markConversationRead', () => {
  it('manda la acción read', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await markConversationRead('s-weber');

    expect(fetchMock).toHaveBeenCalledWith(
      FN_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'read', stay_id: 's-weber' }),
      }),
    );
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
