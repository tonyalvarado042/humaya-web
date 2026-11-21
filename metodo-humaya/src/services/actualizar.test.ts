import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { actualizarLaApp, alDiaConElServidor, esPantallaVieja } from './actualizar';
import { getOpciones } from './admin';

/**
 * Cuando la pantalla quedó más vieja que el servidor, se actualiza sola.
 *
 * ── LO QUE PASÓ, Y POR QUÉ ESTO EXISTE ──────────────────────────────────
 * Tony, 21 de noviembre de 2026, con una captura de
 * `staff.stayhumaya.com/app`: «No pudimos cargar esta pantalla · Puede ser un
 * problema de conexión». No era la conexión: era una pestaña con el código de
 * antes del 20 de noviembre, cuando las funciones todavía no exigían el
 * hotel. Llamaba sin `hotel`, la función contestaba 400 `falta_hotel` —que es
 * lo correcto— y la app lo mostraba como un problema de red.
 *
 * El service worker es lo que mantiene vivo ese código viejo hasta que la
 * pestaña se recargue, así que puede durar días.
 */

const recargar = vi.fn();

beforeEach(() => {
  sessionStorage.clear();
  recargar.mockClear();
  vi.stubGlobal('location', { reload: recargar } as unknown as Location);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('qué cuenta como pantalla vieja', () => {
  it('un 400 con falta_hotel, sí', () => {
    expect(esPantallaVieja(400, '{"error":"falta_hotel"}')).toBe(true);
  });

  it('cualquier otro 400, NO', () => {
    // EL CASO QUE IMPORTA: esos vienen de lo que alguien está haciendo en la
    // pantalla. Recargarle el formulario encima le borra lo que escribió.
    expect(esPantallaVieja(400, '{"error":"missing_nombre"}')).toBe(false);
    expect(esPantallaVieja(400, '{"error":"missing_fields"}')).toBe(false);
  });

  it('un 500, tampoco: eso es el servidor, no la pantalla', () => {
    expect(esPantallaVieja(500, '{"error":"falta_hotel"}')).toBe(false);
  });
});

describe('actualizar la app', () => {
  it('recarga', async () => {
    expect(actualizarLaApp()).toBe(true);

    await vi.waitFor(() => expect(recargar).toHaveBeenCalledTimes(1));
  });

  it('una sola vez por sesión: si vuelve a pasar, no entra en ciclo', async () => {
    actualizarLaApp();
    await vi.waitFor(() => expect(recargar).toHaveBeenCalledTimes(1));

    expect(actualizarLaApp()).toBe(false);
    expect(recargar).toHaveBeenCalledTimes(1);
  });
});

describe('desde una llamada de verdad', () => {
  it('un falta_hotel de la función actualiza la app', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"error":"falta_hotel"}', { status: 400 })),
    );
    vi.stubGlobal('location', { reload: recargar } as unknown as Location);

    await expect(getOpciones()).rejects.toThrow('admin_desactualizado');
    await vi.waitFor(() => expect(recargar).toHaveBeenCalledTimes(1));
  });

  it('un error que NO es de contrato se muestra como error, sin recargar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"error":"db_error"}', { status: 500 })),
    );
    vi.stubGlobal('location', { reload: recargar } as unknown as Location);

    await expect(getOpciones()).rejects.toThrow('admin_http_500');
    expect(recargar).not.toHaveBeenCalled();
  });
});

describe('ponerse al día cuando sale una versión nueva', () => {
  /** Un `ServiceWorkerContainer` de mentira, con su oyente. */
  function contenedor(hayControlador: boolean) {
    const oyentes: Array<() => void> = [];
    return {
      sw: {
        controller: hayControlador ? {} : null,
        addEventListener: (_: string, f: () => void) => oyentes.push(f),
      } as unknown as ServiceWorkerContainer,
      sueltaElEvento: () => oyentes.forEach((f) => f()),
      cuantosOyentes: () => oyentes.length,
    };
  }

  it('recarga cuando un service worker nuevo toma el control', () => {
    const { sw, sueltaElEvento } = contenedor(true);

    alDiaConElServidor(sw);
    sueltaElEvento();

    expect(recargar).toHaveBeenCalledTimes(1);
  });

  it('una sola vez, aunque el evento salte de nuevo', () => {
    const { sw, sueltaElEvento } = contenedor(true);

    alDiaConElServidor(sw);
    sueltaElEvento();
    sueltaElEvento();

    expect(recargar).toHaveBeenCalledTimes(1);
  });

  it('en la PRIMERA visita no recarga: no hay nada viejo que reemplazar', () => {
    // `controllerchange` también salta al instalar el primer service worker.
    // Recargar ahí sería recargarle la página a quien recién llega.
    const { sw, cuantosOyentes } = contenedor(false);

    alDiaConElServidor(sw);

    expect(cuantosOyentes()).toBe(0);
    expect(recargar).not.toHaveBeenCalled();
  });

  it('sin service worker no hace nada', () => {
    alDiaConElServidor(undefined);

    expect(recargar).not.toHaveBeenCalled();
  });
});
