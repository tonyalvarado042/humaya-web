import { vi } from 'vitest';

interface Localized {
  es: string;
  en: string;
}

export interface StubMessage {
  id: string;
  stayId: string;
  guestName: string;
  from: 'guest' | 'concierge' | 'staff';
  text: string;
  translations?: Localized;
  escalated: boolean;
  readAt: string | null;
  at: string;
}

const KNOWN_STAYS: Record<string, string> = {
  's-mendez-rojas': 'Valeria',
  's-weber': 'Hannah',
};

/** Mismo criterio de palabra clave que la Edge Function real (ver src/mocks/concierge.ts). */
const KEYWORD_ANSWERS: { keywords: string[]; text: Localized }[] = [
  {
    keywords: [
      'aire',
      'acondicionado',
      'clima',
      'calor',
      'frio',
      'air',
      'conditioning',
      'temperature',
      'ac',
    ],
    text: {
      es: 'El control está en la pared, al lado de la cama. Para dormir te recomendamos 23 °C; el botón con la hoja activa el modo silencioso.',
      en: 'The control is on the wall beside the bed. We recommend 23 °C for sleeping; the leaf button turns on silent mode.',
    },
  },
  {
    keywords: [
      'agua caliente',
      'ducha',
      'calentador',
      'agua',
      'hot water',
      'shower',
      'heater',
      'water',
    ],
    text: {
      es: 'El calentador ya está encendido. En la ducha, girá la llave hacia la izquierda y esperá unos 30 segundos.',
      en: 'The water heater is already on. Turn the shower handle to the left and wait about 30 seconds.',
    },
  },
  {
    keywords: ['luz', 'luces', 'lampara', 'panel', 'light', 'lights', 'lamp'],
    text: {
      es: 'Tocá el panel junto a la puerta: Atardecer baja las luces a un tono cálido y Noche apaga todo menos la luz del baño.',
      en: 'Use the panel beside the door: Sunset dims the lights to a warm tone, and Night turns everything off except the bathroom light.',
    },
  },
  {
    keywords: [
      'desayuno',
      'comida',
      'comer',
      'cena',
      'almuerzo',
      'breakfast',
      'food',
      'eat',
      'dinner',
      'lunch',
    ],
    text: {
      es: 'El desayuno se sirve de 7:00 a 10:00 a.m. Contanos si tenés alguna restricción.',
      en: 'Breakfast is served from 7:00 to 10:00 a.m. Tell us about any dietary restrictions.',
    },
  },
  {
    keywords: [
      'termales',
      'aguas',
      'volcan',
      'paseo',
      'tour',
      'hot springs',
      'springs',
      'volcano',
      'outing',
    ],
    text: {
      es: 'Hay varias opciones cerca. Si querés, te reservo entrada y transporte para mañana en la tarde.',
      en: 'There are several options nearby. I can book admission and transport for tomorrow afternoon.',
    },
  },
];

const FALLBACK: Localized = {
  es: 'Con gusto. Ya se lo paso al equipo de Humaya y te confirmo por aquí en unos minutos.',
  en: "Of course. I'll pass this to the Humaya team and confirm here in a few minutes.",
};

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function replyTo(text: string): { translations: Localized; escalated: boolean } {
  const normalized = normalize(text);
  const match = KEYWORD_ANSWERS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(normalize(keyword))),
  );
  if (match) return { translations: match.text, escalated: false };
  return { translations: FALLBACK, escalated: true };
}

/**
 * Doble liviano de la Edge Function `humaya-concierge` (ver supabase en
 * metodo-humaya/docs/ESTADO.md), para probar /app/concierge y /staff/concierge
 * sin pegarle a la red. Reproduce el mismo criterio de palabra clave y el
 * mismo contrato de acciones ya verificado a mano contra la función real.
 */
export function stubConciergeApi(initial: StubMessage[] = []) {
  let messages = [...initial];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));

    if (!init?.method || init.method === 'GET') {
      if (url.searchParams.get('staff')) {
        const conversations = Object.entries(KNOWN_STAYS).map(([stayId, guestName]) => {
          const thread = messages.filter((message) => message.stayId === stayId);
          const lastGuestMessage =
            thread.filter((message) => message.from === 'guest').at(-1) ?? null;
          const unreadCount = thread.filter(
            (message) => message.from === 'guest' && !message.readAt,
          ).length;
          const escalated = thread.some(
            (message) => message.from === 'concierge' && message.escalated && !message.readAt,
          );
          return { stayId, guestName, lastGuestMessage, unreadCount, escalated };
        });
        return new Response(JSON.stringify({ conversations }), { status: 200 });
      }

      const stayId = url.searchParams.get('stay_id') ?? '';
      return new Response(
        JSON.stringify({ messages: messages.filter((message) => message.stayId === stayId) }),
        { status: 200 },
      );
    }

    const body = JSON.parse(String(init.body)) as Record<string, string>;
    const stayId = body.stay_id;

    if (body.action === 'read') {
      messages = messages.map((message) =>
        message.stayId === stayId && message.from === 'guest' && !message.readAt
          ? { ...message, readAt: new Date().toISOString() }
          : message,
      );
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (body.action === 'reply') {
      messages = [
        ...messages.map((message) =>
          message.stayId === stayId && !message.readAt
            ? { ...message, readAt: new Date().toISOString() }
            : message,
        ),
        {
          id: `m-${messages.length}-staff`,
          stayId,
          guestName: KNOWN_STAYS[stayId] ?? '',
          from: 'staff',
          text: body.text,
          escalated: false,
          readAt: null,
          at: new Date().toISOString(),
        },
      ];
      return new Response(
        JSON.stringify({ messages: messages.filter((message) => message.stayId === stayId) }),
        { status: 200 },
      );
    }

    if (body.action === 'send') {
      const { translations, escalated } = replyTo(body.text);
      const at = new Date().toISOString();
      messages = [
        ...messages,
        {
          id: `m-${messages.length}-guest`,
          stayId,
          guestName: body.guest_name,
          from: 'guest',
          text: body.text,
          escalated: false,
          readAt: null,
          at,
        },
        {
          id: `m-${messages.length + 1}-concierge`,
          stayId,
          guestName: body.guest_name,
          from: 'concierge',
          text: translations.es,
          translations,
          escalated,
          readAt: null,
          at,
        },
      ];
      return new Response(
        JSON.stringify({ messages: messages.filter((message) => message.stayId === stayId) }),
        { status: 200 },
      );
    }

    return new Response(JSON.stringify({ error: 'unhandled_in_test' }), { status: 400 });
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, getMessages: () => messages };
}
