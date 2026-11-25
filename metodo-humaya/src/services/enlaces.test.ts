import { describe, expect, it } from 'vitest';
import { crearEnlace, direccionLimpia, getEnlaces, moverEnlace } from './enlaces';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';

/**
 * La dirección de un enlace interno la escribe una persona y termina dentro
 * de un `<a href>` que ve todo el equipo del hotel.
 *
 * ── POR QUÉ ESTO SE PRUEBA Y NO SOLO SE COMENTA ─────────────────────────
 * Porque es el único filtro que separa «un enlace mal escrito» de «código
 * corriendo en la sesión de recepción de cualquiera que toque la ficha». Un
 * `javascript:…` guardado en esa columna es exactamente eso.
 */
describe('una dirección antes de guardarla', () => {
  it('rechaza javascript:, que es el caso peligroso', () => {
    expect(direccionLimpia('javascript:alert(document.cookie)')).toBeNull();
    expect(direccionLimpia('JavaScript:alert(1)')).toBeNull();
    expect(direccionLimpia('  javascript:void(0)  ')).toBeNull();
  });

  it('rechaza cualquier otro protocolo que no sea web', () => {
    expect(direccionLimpia('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(direccionLimpia('file:///c:/windows')).toBeNull();
    expect(direccionLimpia('mailto:hola@stayhumaya.com')).toBeNull();
  });

  it('le pone https:// a lo que viene pelado', () => {
    // Sin esto, `liderax10.com` se leería como ruta relativa y el enlace
    // llevaría a /staff/liderax10.com.
    expect(direccionLimpia('liderax10.com')).toBe('https://liderax10.com/');
    expect(direccionLimpia('hotels.cloudbeds.com/connect')).toBe(
      'https://hotels.cloudbeds.com/connect',
    );
  });

  it('deja en paz lo que ya está bien, y dice no a lo vacío', () => {
    expect(direccionLimpia('https://stayhumaya.com/reservar')).toBe(
      'https://stayhumaya.com/reservar',
    );
    expect(direccionLimpia('http://localhost:5173/staff')).toBe('http://localhost:5173/staff');
    expect(direccionLimpia('   ')).toBeNull();
    expect(direccionLimpia('')).toBeNull();
  });
});

describe('crear un enlace', () => {
  it('no deja entrar una dirección que no es web', async () => {
    supabaseStub.tablas.humaya_enlaces = [];

    await expect(crearEnlace({ etiqueta: 'Trampa', url: 'javascript:alert(1)' })).rejects.toThrow(
      'enlace_direccion_invalida',
    );

    // Y lo que importa: no quedó nada escrito.
    expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(0);
  });

  it('exige nombre, porque una ficha sin nombre no se puede tocar', async () => {
    supabaseStub.tablas.humaya_enlaces = [];
    await expect(crearEnlace({ etiqueta: '   ', url: 'liderax10.com' })).rejects.toThrow(
      'enlace_sin_nombre',
    );
    expect(supabaseStub.tablas.humaya_enlaces).toHaveLength(0);
  });

  it('entra al final y con el hotel puesto', async () => {
    supabaseStub.tablas.humaya_enlaces = [
      { id: 'e1', negocio_id: NEGOCIO_DE_PRUEBA, etiqueta: 'Recepción', url: 'x', orden: 1 },
      { id: 'e2', negocio_id: NEGOCIO_DE_PRUEBA, etiqueta: 'App', url: 'x', orden: 2 },
    ];

    const nuevo = await crearEnlace({ etiqueta: 'Contabilidad', url: 'conta.example.com' });

    expect(nuevo.orden).toBe(3);
    expect(nuevo.url).toBe('https://conta.example.com/');
    expect(nuevo.icono).toBe('link');
    const guardado = supabaseStub.tablas.humaya_enlaces.at(-1);
    expect(guardado?.negocio_id).toBe(NEGOCIO_DE_PRUEBA);
  });
});

describe('la lista de enlaces', () => {
  it('no trae los del hotel de al lado', async () => {
    supabaseStub.tablas.humaya_enlaces = [
      { id: 'mio', negocio_id: NEGOCIO_DE_PRUEBA, etiqueta: 'Mío', url: 'x', orden: 1 },
      { id: 'ajeno', negocio_id: 'otro-hotel', etiqueta: 'Ajeno', url: 'x', orden: 2 },
    ];

    const lista = await getEnlaces();

    expect(lista.map((enlace) => enlace.etiqueta)).toEqual(['Mío']);
  });
});

describe('mover una ficha', () => {
  function lista(ordenes: number[]) {
    return ordenes.map((orden, i) => ({
      id: `e${i + 1}`,
      clave: null,
      etiqueta: `E${i + 1}`,
      descripcion: null,
      url: 'https://x.test/',
      icono: null,
      orden,
      habilitado: true,
    }));
  }

  function sembrar(ordenes: number[]) {
    supabaseStub.tablas.humaya_enlaces = lista(ordenes).map((enlace) => ({
      ...enlace,
      negocio_id: NEGOCIO_DE_PRUEBA,
    }));
  }

  function ordenDe(id: string) {
    return supabaseStub.tablas.humaya_enlaces.find((fila) => fila.id === id)?.orden;
  }

  it('intercambia el orden con la vecina', async () => {
    sembrar([1, 2, 3]);

    expect(await moverEnlace(lista([1, 2, 3]), 'e3', 'arriba')).toBe(true);

    expect(ordenDe('e3')).toBe(2);
    expect(ordenDe('e2')).toBe(3);
    expect(ordenDe('e1')).toBe(1);
  });

  it('no hace nada con la primera hacia arriba ni la última hacia abajo', async () => {
    sembrar([1, 2, 3]);

    expect(await moverEnlace(lista([1, 2, 3]), 'e1', 'arriba')).toBe(false);
    expect(await moverEnlace(lista([1, 2, 3]), 'e3', 'abajo')).toBe(false);
    expect([ordenDe('e1'), ordenDe('e2'), ordenDe('e3')]).toEqual([1, 2, 3]);
  });

  /**
   * El caso que un intercambio a secas no arregla: dos fichas con el mismo
   * orden. Intercambiárselo las deja igual de empatadas y el botón «subir»
   * no haría nada visible — un botón que no hace nada es peor que no tenerlo.
   */
  it('desempata en vez de intercambiar cuando dos tienen el mismo orden', async () => {
    sembrar([1, 1, 1]);

    expect(await moverEnlace(lista([1, 1, 1]), 'e3', 'arriba')).toBe(true);

    expect(ordenDe('e3')).toBe(2);
    expect(ordenDe('e2')).toBe(3);
  });
});
