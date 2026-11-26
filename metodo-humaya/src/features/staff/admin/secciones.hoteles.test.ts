import { describe, expect, it, vi } from 'vitest';
import { seccionesAdmin } from './secciones';
import { soyPlataforma } from '@/services/panelHoteles';

/**
 * El panel de hoteles solo lo ve una cuenta de plataforma.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «dónde está el panel súper admin para
 * crear nuevos hoteles, voy a crear uno».
 *
 * ── LO QUE ESTO NO ES ───────────────────────────────────────────────────
 * No es la protección. Lo que impide crear un hotel es la base: las
 * funciones son `security definer` y preguntan por `es_plataforma` antes de
 * hacer nada. Probado contra la API: un anónimo, y hasta una cuenta con rol
 * `administrador` del CRM que no es de plataforma, reciben
 * `solo_plataforma`.
 *
 * Esto de acá es la otra regla de la casa: si se sabe de antemano que un
 * botón va a rebotar, no se ofrece el botón.
 */

describe('la sección Hoteles del menú de Admin', () => {
  it('no aparece para quien no es de plataforma', () => {
    const rutas = seccionesAdmin('es', false).map((s) => s.ruta);

    expect(rutas).not.toContain('hoteles');
    // Y las de siempre siguen estando.
    expect(rutas).toContain('marca');
    expect(rutas).toContain('tv');
  });

  it('aparece para quien sí lo es, en los dos idiomas', () => {
    expect(seccionesAdmin('es', true).map((s) => s.ruta)).toContain('hoteles');
    expect(seccionesAdmin('en', true).map((s) => s.ruta)).toContain('hoteles');

    const es = seccionesAdmin('es', true).find((s) => s.ruta === 'hoteles');
    const en = seccionesAdmin('en', true).find((s) => s.ruta === 'hoteles');
    expect(es?.titulo).toBe('Hoteles');
    expect(en?.titulo).toBe('Hotels');
  });

  it('por omisión no aparece: en la duda, no se ofrece', () => {
    expect(seccionesAdmin('es').map((s) => s.ruta)).not.toContain('hoteles');
  });
});

/**
 * Cloudbeds va en la misma puerta que Hoteles.
 *
 * Tony, 25 de noviembre de 2026: «Ya tengo la API de Cloudbeds, pero no hay
 * pantalla donde ponerla». La hay desde hoy, y es de plataforma por la misma
 * razón: `humaya_cloudbeds_conectar` y `humaya_cloudbeds_guardar_llave`
 * piden `humaya_soy_plataforma()` antes de tocar nada. Comprobado contra la
 * base: sin cuenta, las dos levantan `solo_plataforma`.
 */
describe('la sección Cloudbeds del menú de Admin', () => {
  it('no aparece para quien no es de plataforma', () => {
    expect(seccionesAdmin('es', false).map((s) => s.ruta)).not.toContain('cloudbeds');
    expect(seccionesAdmin('en', false).map((s) => s.ruta)).not.toContain('cloudbeds');
  });

  it('aparece para quien sí lo es, en los dos idiomas', () => {
    expect(seccionesAdmin('es', true).map((s) => s.ruta)).toContain('cloudbeds');
    expect(seccionesAdmin('en', true).map((s) => s.ruta)).toContain('cloudbeds');
  });

  it('no se llama igual que Hoteles: son dos pantallas distintas', () => {
    const rutas = seccionesAdmin('es', true).map((s) => s.ruta);
    expect(new Set(rutas).size).toBe(rutas.length);
  });
});

describe('preguntar si soy de plataforma', () => {
  it('ante cualquier error dice que NO, y no tumba la pantalla', async () => {
    // Pasó de verdad: el cliente de prueba no tenía `rpc` y la promesa
    // rechazada dejaba 39 errores sin manejar en la corrida. El menú de
    // Admin llama a esto en cada carga: una excepción acá tumba una
    // pantalla entera por un enlace de más.
    vi.resetModules();
    vi.doMock('@/services/sesion', () => ({
      cliente: () =>
        Promise.resolve({
          rpc: () => {
            throw new Error('sin rpc');
          },
        }),
    }));
    const { soyPlataforma: conFallo } = await import('@/services/panelHoteles');

    await expect(conFallo()).resolves.toBe(false);

    vi.doUnmock('@/services/sesion');
    vi.resetModules();
  });

  it('existe y devuelve una promesa booleana', async () => {
    await expect(soyPlataforma()).resolves.toBe(false);
  });
});
