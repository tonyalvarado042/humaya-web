import { beforeEach, describe, expect, it } from 'vitest';
import { direccionDelTv, getVillasTv, guardarVillaTv, urlDeFoto } from './tv';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';

function sembrar() {
  supabaseStub.tablas.humaya_tv_villas = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: 'v4-bruma',
      clave: 'abc123def456',
      nombre: 'V4 · BRUMA',
      tipo: 'Wellness villa',
      anfitrion: 'Tony',
      wifi_ssid: 'HUMAYA_Villas',
      wifi_clave: 'temporal-2026',
      wifi_siempre: true,
      huesped: 'Sarah Lovestad',
      llegada: '2026-11-20',
      salida: '2026-11-23',
      checkin: '15:00',
      checkout: '11:00',
      bienvenida: null,
      nota_titulo: null,
      nota_texto: null,
      foto: null,
      reloj_posicion: 'izquierda',
      habilitada: true,
      orden: 4,
    },
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: 'v1-capi-capi',
      clave: 'otra-clave',
      nombre: 'V1 · CAPI CAPI',
      tipo: null,
      anfitrion: null,
      wifi_ssid: null,
      wifi_clave: null,
      wifi_siempre: true,
      huesped: null,
      llegada: null,
      salida: null,
      checkin: '15:00',
      checkout: '11:00',
      bienvenida: null,
      nota_titulo: null,
      nota_texto: null,
      foto: 'v1-capi-capi-1795',
      reloj_posicion: 'centro',
      habilitada: false,
      orden: 1,
    },
  ];
}

beforeEach(sembrar);

describe('la dirección del televisor', () => {
  it('lleva la clave de la villa adentro', () => {
    // Sin la clave, cualquiera que adivine ?home=v4-bruma lee el nombre de
    // quien duerme ahí esta noche.
    const url = direccionDelTv({ id: 'v4-bruma', clave: 'abc123def456' });

    expect(url).toContain('home=v4-bruma');
    expect(url).toContain('k=abc123def456');
    expect(url.startsWith('https://tv.stayhumaya.com/tv/')).toBe(true);
  });

  it('escapa lo que no es seguro en una dirección', () => {
    const url = direccionDelTv({ id: 'villa rara', clave: 'a/b+c' });

    expect(url).toContain('home=villa%20rara');
    expect(url).toContain('k=a%2Fb%2Bc');
  });
});

describe('otro hotel en la misma tabla', () => {
  it('NO se le cuelan sus villas a este hotel', async () => {
    // Comprobado contra la base el 20 de noviembre de 2026, con el hotel
    // demo recién creado: las consultas sin filtro devolvían las filas de
    // LOS DOS. Con un solo hotel nunca se iba a notar — devolvían lo
    // correcto por casualidad.
    supabaseStub.tablas.humaya_tv_villas = [
      ...(supabaseStub.tablas.humaya_tv_villas ?? []),
      {
        ...(supabaseStub.tablas.humaya_tv_villas?.[0] ?? {}),
        negocio_id: 'otro-hotel',
        id: 'demo-1',
        nombre: 'Demo 1',
      },
    ];

    const villas = await getVillasTv();
    expect(villas.map((v) => v.id)).not.toContain('demo-1');
  });

  it('tampoco se le puede escribir encima a una villa de otro hotel', async () => {
    supabaseStub.tablas.humaya_tv_villas = [
      {
        ...(supabaseStub.tablas.humaya_tv_villas?.[0] ?? {}),
        negocio_id: 'otro-hotel',
        id: 'demo-1',
      },
    ];

    await expect(guardarVillaTv('demo-1', { huesped: 'Intruso' })).rejects.toThrow(
      'tv_villa_sin_permiso',
    );
  });
});

describe('leer las villas', () => {
  it('las trae en el orden que tienen puesto', async () => {
    const villas = await getVillasTv();
    expect(villas.map((v) => v.id)).toEqual(['v1-capi-capi', 'v4-bruma']);
  });

  it('traduce las columnas de la base a los nombres de la app', async () => {
    const villas = await getVillasTv();
    const bruma = villas.find((v) => v.id === 'v4-bruma');

    expect(bruma?.wifiSsid).toBe('HUMAYA_Villas');
    expect(bruma?.wifiSiempre).toBe(true);
    expect(bruma?.relojPosicion).toBe('izquierda');
    expect(bruma?.huesped).toBe('Sarah Lovestad');
  });
});

describe('guardar una villa', () => {
  it('solo manda lo que viene: un campo ausente no pisa lo que hay', async () => {
    await guardarVillaTv('v4-bruma', { huesped: 'Otro Huésped' });

    const villas = await getVillasTv();
    const bruma = villas.find((v) => v.id === 'v4-bruma');
    expect(bruma?.huesped).toBe('Otro Huésped');
    // No se mandó: tiene que seguir como estaba.
    expect(bruma?.wifiSsid).toBe('HUMAYA_Villas');
    expect(bruma?.checkin).toBe('15:00');
  });

  it('vaciar la villa es mandar null, no mandar nada', async () => {
    // `undefined` significa «no lo toques» y `null` significa «bórralo». Si
    // se confundieran, vaciar una villa dejaría al huésped anterior en
    // pantalla después de que se fue.
    await guardarVillaTv('v4-bruma', { huesped: null, llegada: null, salida: null });

    const bruma = (await getVillasTv()).find((v) => v.id === 'v4-bruma');
    expect(bruma?.huesped).toBeNull();
    expect(bruma?.llegada).toBeNull();
  });

  it('toca solo la villa pedida', async () => {
    await guardarVillaTv('v4-bruma', { huesped: 'Cambiada' });

    const capi = (await getVillasTv()).find((v) => v.id === 'v1-capi-capi');
    expect(capi?.huesped).toBeNull();
  });

  it('falla fuerte cuando RLS no deja tocar la fila', async () => {
    // Un update que no cambió ninguna fila devuelve éxito con cero filas. Sin
    // el `select()`, la pantalla diría que guardó algo que no guardó.
    await expect(guardarVillaTv('no-existe', { huesped: 'X' })).rejects.toThrow(
      'tv_villa_sin_permiso',
    );
  });
});

describe('la foto', () => {
  it('se arma la dirección pública del bucket', () => {
    expect(urlDeFoto('v4-bruma-1795')).toContain('/storage/v1/object/public/humaya-tv/');
    expect(urlDeFoto('v4-bruma-1795')).toContain('v4-bruma-1795.jpg');
  });
});
