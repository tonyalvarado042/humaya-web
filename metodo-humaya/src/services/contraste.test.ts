import { describe, expect, it } from 'vitest';
import { contraste, luminancia, textoQueSeLee, veredicto } from './contraste';

describe('luminancia', () => {
  /** Los dos extremos de la escala: la fórmula tiene que dar 0 y 1 exactos. */
  it('va de 0 en negro a 1 en blanco', () => {
    expect(luminancia('#000000')).toBe(0);
    expect(luminancia('#ffffff')).toBe(1);
  });

  it('no inventa un número para algo que no es un color', () => {
    expect(luminancia('verde')).toBeNull();
    expect(luminancia('#fff')).toBeNull();
  });
});

describe('contraste', () => {
  /** El máximo de WCAG: negro contra blanco son 21:1. */
  it('negro contra blanco son 21', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 2);
  });

  it('un color contra sí mismo es 1', () => {
    expect(contraste('#4a9d7f', '#4a9d7f')).toBeCloseTo(1, 5);
  });

  it('da igual el orden', () => {
    const uno = contraste('#87672e', '#ffffff');
    const otro = contraste('#ffffff', '#87672e');
    expect(uno).toBeCloseTo(otro!, 10);
  });

  /**
   * El caso real que justifica que el acento sean dos campos: el dorado de la
   * app del huésped NO se lee sobre el blanco de recepción, y el de recepción
   * sí. Si esto diera lo mismo, el formulario no tendría nada que avisar.
   */
  it('el dorado del huésped no pasa sobre blanco y el de recepción sí', () => {
    expect(contraste('#c8a565', '#ffffff')!).toBeLessThan(3);
    expect(contraste('#87672e', '#ffffff')!).toBeGreaterThan(4.5);
  });

  it('no inventa un número si un color no es un color', () => {
    expect(contraste('#ffffff', 'blanco')).toBeNull();
  });
});

describe('textoQueSeLee', () => {
  it('sobre un color claro, texto negro', () => {
    expect(textoQueSeLee('#e3c58a')).toBe('#000000');
  });

  it('sobre un color oscuro, texto blanco', () => {
    expect(textoQueSeLee('#2f6b56')).toBe('#ffffff');
  });

  it('sin color no propone nada', () => {
    expect(textoQueSeLee('dorado')).toBeNull();
  });
});

describe('veredicto', () => {
  it('traduce la razón a algo que se pueda poner en pantalla', () => {
    expect(veredicto(7)).toBe('bien');
    expect(veredicto(4.5)).toBe('bien');
    expect(veredicto(3.2)).toBe('justo');
    expect(veredicto(3)).toBe('justo');
    expect(veredicto(2.9)).toBe('mal');
    expect(veredicto(null)).toBe('desconocido');
  });
});
