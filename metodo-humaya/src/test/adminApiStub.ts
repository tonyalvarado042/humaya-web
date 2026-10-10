import { vi } from 'vitest';

export interface StubOpcion {
  id: string;
  clave: string;
  etiqueta: string;
  descripcion: string | null;
  icono: string | null;
  habilitada: boolean;
  orden: number;
}

export interface StubServicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  proveedor: string | null;
  precio_usd: number | null;
  unidad_precio: string;
  duracion_min: number;
  hora_inicio: string;
  hora_fin: string;
  habilitado: boolean;
  orden: number;
}

/** Las mismas 5 opciones sembradas en Supabase (ver docs/ESTADO.md). */
export const DEFAULT_OPCIONES: StubOpcion[] = [
  {
    id: 'op-interview',
    clave: 'interview',
    etiqueta: 'Entrevista',
    descripcion: 'Contanos como te gusta que te atiendan.',
    icono: 'message-square',
    habilitada: true,
    orden: 1,
  },
  {
    id: 'op-concierge',
    clave: 'concierge',
    etiqueta: 'Concierge',
    descripcion: 'Preguntale lo que necesites a cualquier hora.',
    icono: 'sparkles',
    habilitada: true,
    orden: 2,
  },
  {
    id: 'op-villa',
    clave: 'villa',
    etiqueta: 'Mi villa',
    descripcion: 'Wi-Fi, instructivos y todo sobre tu villa.',
    icono: 'tent',
    habilitada: true,
    orden: 3,
  },
  {
    id: 'op-bookings',
    clave: 'bookings',
    etiqueta: 'Reservas',
    descripcion: 'Sauna, cold plunge y otras experiencias.',
    icono: 'calendar-days',
    habilitada: true,
    orden: 4,
  },
  {
    id: 'op-move',
    clave: 'move',
    etiqueta: 'Move',
    descripcion: 'Tu entrenamiento guiado de la semana.',
    icono: 'dumbbell',
    habilitada: true,
    orden: 5,
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

/**
 * Doble liviano de la Edge Function `humaya-admin`, para probar GuestLayout,
 * HomePage, BookingsPage y /staff/admin sin pegarle a la red.
 */
export function stubAdminApi(
  initial: { opciones?: StubOpcion[]; servicios?: StubServicio[] } = {},
) {
  let opciones = (initial.opciones ?? DEFAULT_OPCIONES).map((item) => ({ ...item }));
  let servicios = (initial.servicios ?? []).map((item) => ({ ...item }));
  const reservas = new Map<string, Set<string>>();

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));

    if (!init?.method || init.method === 'GET') {
      const que = url.searchParams.get('que');

      if (que === 'opciones') {
        const onlyEnabled = url.searchParams.get('habilitadas');
        const list = onlyEnabled ? opciones.filter((o) => o.habilitada) : opciones;
        return jsonResponse({ opciones: list });
      }

      if (que === 'servicios') {
        const onlyEnabled = url.searchParams.get('habilitados');
        const list = onlyEnabled ? servicios.filter((s) => s.habilitado) : servicios;
        return jsonResponse({ servicios: list });
      }

      if (que === 'servicio-slots') {
        const servicioId = url.searchParams.get('servicio_id') ?? '';
        const fecha = url.searchParams.get('fecha') ?? '';
        const servicio = servicios.find((s) => s.id === servicioId);
        if (!servicio) return jsonResponse({ error: 'not_found' }, 404);

        const taken = reservas.get(`${servicioId}:${fecha}`) ?? new Set<string>();
        const [startH, startM] = servicio.hora_inicio.split(':').map(Number);
        const [endH, endM] = servicio.hora_fin.split(':').map(Number);
        const start = startH * 60 + startM;
        const end = endH * 60 + endM;
        const slots: { start: string; taken: boolean }[] = [];
        for (
          let cursor = start;
          cursor + servicio.duracion_min <= end;
          cursor += servicio.duracion_min
        ) {
          const hh = Math.floor(cursor / 60)
            .toString()
            .padStart(2, '0');
          const mm = (cursor % 60).toString().padStart(2, '0');
          const hhmm = `${hh}:${mm}`;
          slots.push({ start: hhmm, taken: taken.has(hhmm) });
        }
        return jsonResponse({ servicio, slots });
      }

      return jsonResponse({ error: 'unknown_query' }, 400);
    }

    const body = JSON.parse(String(init.body)) as Record<string, string>;

    if (body.action === 'toggle_opcion') {
      opciones = opciones.map((o) =>
        o.id === body.id ? { ...o, habilitada: Boolean(body.habilitada) } : o,
      );
      return jsonResponse({ ok: true });
    }

    if (body.action === 'toggle_servicio') {
      servicios = servicios.map((s) =>
        s.id === body.id ? { ...s, habilitado: Boolean(body.habilitado) } : s,
      );
      return jsonResponse({ ok: true });
    }

    if (body.action === 'crear_servicio') {
      const nuevo: StubServicio = {
        id: `servicio-${servicios.length + 1}`,
        nombre: body.nombre,
        descripcion: body.descripcion ?? null,
        proveedor: body.proveedor ?? null,
        precio_usd: body.precio_usd != null ? Number(body.precio_usd) : null,
        unidad_precio: body.unidad_precio ?? 'hora',
        duracion_min: body.duracion_min != null ? Number(body.duracion_min) : 60,
        hora_inicio: body.hora_inicio ?? '08:00',
        hora_fin: body.hora_fin ?? '18:00',
        habilitado: true,
        orden: servicios.length + 1,
      };
      servicios = [...servicios, nuevo];
      return jsonResponse({ servicio: nuevo });
    }

    if (body.action === 'reservar_servicio') {
      const key = `${body.servicio_id}:${body.fecha}`;
      const set = reservas.get(key) ?? new Set<string>();
      if (set.has(body.hora_inicio)) {
        return jsonResponse({ error: 'slot_taken' }, 409);
      }
      set.add(body.hora_inicio);
      reservas.set(key, set);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: 'unhandled_in_test' }, 400);
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, getOpciones: () => opciones, getServicios: () => servicios };
}
