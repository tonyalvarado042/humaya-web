import { afterEach, describe, expect, it, vi } from 'vitest';
import { bundleDelDocumento, bundleDelHtml, hayVersionNueva } from './version';

/**
 * El caso real: la pestaña de Tony corría `index-BjLNlYcC.js` y el servidor
 * ya servía `index-B5bwCd58.js`. La pantalla mostraba datos de ayer sin
 * decirlo.
 */
const VIEJO = '/assets/index-BjLNlYcC.js';
const NUEVO = '/assets/index-B5bwCd58.js';

function cargarBundle(src: string | null) {
  document.head.innerHTML = '';
  if (src) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    document.head.append(script);
  }
}

function sirveHtmlCon(src: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<!doctype html><script type="module" src="${src}"></script>`),
    }),
  );
}

afterEach(() => {
  document.head.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('de qué versión es lo que está en pantalla', () => {
  it('encuentra el bundle cargado en el documento', () => {
    cargarBundle(VIEJO);
    expect(bundleDelDocumento(document)).toBe(VIEJO);
  });

  it('en desarrollo no hay bundle con hash y no se inventa uno', () => {
    cargarBundle('/src/main.tsx');
    expect(bundleDelDocumento(document)).toBeNull();
  });

  it('encuentra el bundle al que apunta un index.html', () => {
    expect(bundleDelHtml(`<script type="module" crossorigin src="${NUEVO}"></script>`)).toBe(NUEVO);
  });
});

describe('si hay una versión más nueva', () => {
  it('avisa cuando el servidor ya sirve otro bundle', async () => {
    cargarBundle(VIEJO);
    sirveHtmlCon(NUEVO);
    await expect(hayVersionNueva()).resolves.toBe(true);
  });

  it('se queda callada cuando es la misma', async () => {
    cargarBundle(NUEVO);
    sirveHtmlCon(NUEVO);
    await expect(hayVersionNueva()).resolves.toBe(false);
  });

  it('le pasa por encima al service worker al preguntar', async () => {
    // Sin el parámetro, el service worker contesta con el index.html que
    // tiene guardado y la comparación siempre da «igual»: el aviso no
    // saltaría nunca, que es exactamente el bug que esto arregla.
    cargarBundle(VIEJO);
    sirveHtmlCon(NUEVO);
    await hayVersionNueva();

    const [url, opciones] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/index\.html\?v=\d+/);
    expect(opciones).toMatchObject({ cache: 'no-store' });
  });

  it('en desarrollo ni siquiera pregunta', async () => {
    cargarBundle('/src/main.tsx');
    sirveHtmlCon(NUEVO);
    await expect(hayVersionNueva()).resolves.toBe(false);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('sin red no molesta a nadie', async () => {
    cargarBundle(VIEJO);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));
    await expect(hayVersionNueva()).resolves.toBe(false);
  });

  it('un index.html roto tampoco dispara el aviso', async () => {
    cargarBundle(VIEJO);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<!doctype html>') }),
    );
    await expect(hayVersionNueva()).resolves.toBe(false);
  });
});
