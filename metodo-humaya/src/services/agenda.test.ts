import { beforeEach, describe, expect, it } from 'vitest';
import { agendaPorServicio, enOrdenDeHora, laProxima } from './agenda';
import { supabaseStub } from '@/test/supabaseStub';
import type { ReservaDeServicio } from '@/types';

const ENTRENADOR = '11111111-1111-1111-1111-111111111111';
const MASAJE = '22222222-2222-2222-2222-222222222222';
const BORRADO = '33333333-3333-3333-3333-333333333333';

function sembrar() {
  supabaseStub.tablas.humaya_servicios = [
    {
      id: ENTRENADOR,
      nombre: 'Entrenamiento personal',
      proveedor: 'Personal trainer',
      duracion_min: 60,
      habilitado: true,
      orden: 1,
    },
    {
      id: MASAJE,
      nombre: 'Masaje',
      proveedor: null,
      duracion_min: 90,
      habilitado: false,
      orden: 2,
    },
  ];

  supabaseStub.tablas.humaya_servicio_reservas = [
    {
      id: 'r-tarde',
      servicio_id: ENTRENADOR,
      stay_id: 's-weber',
      guest_name: 'Hannah Weber',
      fecha: '2026-11-17',
      hora_inicio: '16:00:00',
    },
    {
      id: 'r-manana',
      servicio_id: ENTRENADOR,
      stay_id: 's-mendez-rojas',
      guest_name: 'Valeria Méndez',
      fecha: '2026-11-17',
      hora_inicio: '08:00',
    },
    {
      id: 'r-otro-dia',
      servicio_id: ENTRENADOR,
      stay_id: 's-farah',
      guest_name: 'Farah',
      fecha: '2026-11-18',
      hora_inicio: '07:00',
    },
    {
      id: 'r-fuera-del-rango',
      servicio_id: ENTRENADOR,
      stay_id: 's-lima',
      guest_name: 'Lima',
      fecha: '2026-12-01',
      hora_inicio: '09:00',
    },
    {
      id: 'r-huerfana',
      servicio_id: BORRADO,
      stay_id: 's-keller',
      guest_name: 'Familia Keller',
      fecha: '2026-11-17',
      hora_inicio: '11:00',
    },
  ];
}

beforeEach(sembrar);

describe('la agenda de un día', () => {
  it('trae solo las reservas de ese día', async () => {
    const grupos = await agendaPorServicio('2026-11-17', '2026-11-17');
    const nombres = enOrdenDeHora(grupos).map((reserva) => reserva.guestName);

    expect(nombres).toEqual(['Valeria Méndez', 'Familia Keller', 'Hannah Weber']);
  });

  it('le pega al huésped el nombre del servicio, con quién y cuánto dura', async () => {
    const grupos = await agendaPorServicio('2026-11-17', '2026-11-17');
    const valeria = enOrdenDeHora(grupos)[0];

    expect(valeria.servicioNombre).toBe('Entrenamiento personal');
    expect(valeria.proveedor).toBe('Personal trainer');
    expect(valeria.duracionMin).toBe(60);
  });

  it('recorta los segundos de la hora, que la columna guarda a veces', async () => {
    const grupos = await agendaPorServicio('2026-11-17', '2026-11-17');
    const hannah = enOrdenDeHora(grupos).find((r) => r.guestName === 'Hannah Weber');

    expect(hannah?.horaInicio).toBe('16:00');
  });

  it('le pide a la base solo el rango, no la tabla entera', async () => {
    await agendaPorServicio('2026-11-17', '2026-11-17');

    const consulta = supabaseStub.consultas.find((c) => c.tabla === 'humaya_servicio_reservas');
    expect(consulta?.filtros).toContain('gte:fecha');
    expect(consulta?.filtros).toContain('lte:fecha');
  });
});

describe('lo que no se puede esconder', () => {
  it('una reserva cuyo servicio ya no está en el catálogo aparece igual', async () => {
    // La peor forma de fallar sería en silencio: esa persona va a llegar a
    // las 11:00 y alguien tiene que atenderla.
    const grupos = await agendaPorServicio('2026-11-17', '2026-11-17');
    const huerfana = enOrdenDeHora(grupos).find((r) => r.guestName === 'Familia Keller');

    expect(huerfana).toBeDefined();
    expect(huerfana?.servicioNombre).toBeNull();
  });

  it('un servicio sin nadie anotado aparece con la lista vacía', async () => {
    const grupos = await agendaPorServicio('2026-11-17', '2026-11-17');
    const masaje = grupos.find((grupo) => grupo.nombre === 'Masaje');

    expect(masaje).toBeDefined();
    expect(masaje?.reservas).toHaveLength(0);
    expect(masaje?.habilitado).toBe(false);
  });
});

describe('varios días', () => {
  it('ordena por día y después por hora', async () => {
    const grupos = await agendaPorServicio('2026-11-17', '2026-11-18');
    const orden = enOrdenDeHora(grupos).map((r) => `${r.fecha} ${r.horaInicio}`);

    expect(orden).toEqual([
      '2026-11-17 08:00',
      '2026-11-17 11:00',
      '2026-11-17 16:00',
      '2026-11-18 07:00',
    ]);
  });
});

const reserva = (fecha: string, horaInicio: string): ReservaDeServicio => ({
  id: `${fecha}-${horaInicio}`,
  servicioId: ENTRENADOR,
  servicioNombre: 'Entrenamiento personal',
  proveedor: null,
  duracionMin: 60,
  stayId: 's-weber',
  guestName: 'Hannah',
  fecha,
  horaInicio,
});

describe('la próxima', () => {
  const lista = [
    reserva('2026-11-17', '08:00'),
    reserva('2026-11-17', '16:00'),
    reserva('2026-11-18', '07:00'),
  ];

  it('es la primera que todavía no empezó', () => {
    expect(laProxima(lista, '2026-11-17T09:30')?.horaInicio).toBe('16:00');
  });

  it('la que empieza justo ahora todavía cuenta', () => {
    // Si a las 16:00 en punto desapareciera, recepción perdería de vista
    // justo la que está entrando por la puerta.
    expect(laProxima(lista, '2026-11-17T16:00')?.horaInicio).toBe('16:00');
  });

  it('cruza al día siguiente cuando ya pasaron las de hoy', () => {
    expect(laProxima(lista, '2026-11-17T20:00')?.fecha).toBe('2026-11-18');
  });

  it('es null cuando ya pasaron todas', () => {
    expect(laProxima(lista, '2026-11-19T06:00')).toBeNull();
  });

  it('es null cuando no hay ninguna', () => {
    expect(laProxima([], '2026-11-17T09:00')).toBeNull();
  });
});
