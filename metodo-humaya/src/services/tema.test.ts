import { afterEach, describe, expect, it } from 'vitest';
import {
  aplicarTema,
  comoTema,
  cssDelTema,
  esColor,
  esFuente,
  urlDeFuentes,
  type Tema,
} from './tema';

afterEach(() => {
  aplicarTema(null);
});

describe('esColor', () => {
  it('acepta un hex de seis', () => {
    expect(esColor('#4a9d7f')).toBe(true);
    expect(esColor('  #FFFFFF  ')).toBe(true);
  });

  it('rechaza lo que no es un color', () => {
    expect(esColor('red')).toBe(false);
    expect(esColor('#fff')).toBe(false);
    expect(esColor('')).toBe(false);
    expect(esColor(null)).toBe(false);
    expect(esColor(42)).toBe(false);
  });

  /**
   * El que importa: esto se concatena dentro de una hoja de estilos. Un valor
   * con `}` cerraría la regla y lo que siguiera entraría como CSS propio.
   */
  it('rechaza algo que cerraría la regla de CSS', () => {
    expect(esColor('#fff}body{display:none')).toBe(false);
    expect(esColor('red;}html{opacity:0')).toBe(false);
  });
});

describe('esFuente', () => {
  it('acepta un nombre de familia', () => {
    expect(esFuente('Playfair Display')).toBe(true);
    expect(esFuente('Inter')).toBe(true);
  });

  it('rechaza comillas y puntos y coma', () => {
    expect(esFuente("Inter', sans-serif; }html{opacity:0")).toBe(false);
    expect(esFuente('Inter"')).toBe(false);
    expect(esFuente('')).toBe(false);
  });
});

describe('cssDelTema', () => {
  it('sin nada que pisar no escribe nada', () => {
    expect(cssDelTema({})).toBe('');
  });

  it('un color que no es un color no entra', () => {
    expect(cssDelTema({ acento: 'chocolate' })).toBe('');
  });

  /**
   * El acento del lado oscuro NO debe aparecer como `--gold` del lado claro:
   * ahí vale `#87672e` justamente porque el claro no se lee sobre blanco.
   * Esta es la trampa que tenía el primer borrador.
   */
  it('el acento del huésped no pisa el de recepción', () => {
    const css = cssDelTema({ acento: '#c8a565', acentoStaff: '#87672e' });
    const guest = css.match(/\[data-theme='guest'\]\{([^}]*(?:\}[^{]*\{[^}]*)*)\}\n/);
    expect(guest).not.toBeNull();
    expect(css).toContain("[data-theme='guest']{--gold:#c8a565;");
    expect(css).toContain("[data-theme='staff']{--gold:#87672e;");
  });

  it('sin acento de recepción se usa el del huésped', () => {
    const css = cssDelTema({ acento: '#4a9d7f' });
    expect(css).toContain("[data-theme='staff']{--gold:#4a9d7f;");
  });

  it('deriva los dorados de la familia en vez de dejarlos dorados', () => {
    const css = cssDelTema({ acento: '#4a9d7f' });
    expect(css).toContain('--gold-bright:color-mix(in oklab, #4a9d7f 72%, white);');
    expect(css).toContain('--gold-dim:color-mix(in oklab, #4a9d7f 55%, var(--bg));');
    expect(css).toContain('--gold-track:color-mix(in oklab, #4a9d7f 18%, var(--bg));');
  });

  it('el texto sobre el acento vale en los dos lados', () => {
    const css = cssDelTema({ sobreAcento: '#071210' });
    expect(css).toContain('[data-theme]{--on-gold:#071210;}');
  });

  it('las fuentes van en :root porque no dependen del lado', () => {
    const css = cssDelTema({ fuenteTitulos: 'Playfair Display', fuenteTexto: 'Inter' });
    expect(css).toContain(":root{--font-display:'Playfair Display',ui-serif,Georgia,serif;");
    expect(css).toContain("--font-sans:'Inter',ui-sans-serif,system-ui,sans-serif;");
  });

  it('un campo suelto no arrastra a los demás', () => {
    const css = cssDelTema({ staffFondo: '#eef4f1' });
    expect(css).toBe("[data-theme='staff']{--bg:#eef4f1;}");
  });
});

describe('urlDeFuentes', () => {
  it('sin fuenteGoogle no se baja nada', () => {
    expect(urlDeFuentes({ fuenteTitulos: 'Playfair Display' })).toBeNull();
  });

  it('con fuenteGoogle pide las dos familias', () => {
    const url = urlDeFuentes({
      fuenteGoogle: true,
      fuenteTitulos: 'Playfair Display',
      fuenteTexto: 'Inter',
    });
    expect(url).toContain('family=Playfair%20Display:wght@400;500;600');
    expect(url).toContain('family=Inter:wght@400;500;600');
    // Sin esto, una fuente lenta deja la pantalla sin texto.
    expect(url).toContain('display=swap');
  });

  it('fuenteGoogle sin familias no pide nada', () => {
    expect(urlDeFuentes({ fuenteGoogle: true })).toBeNull();
  });
});

describe('comoTema', () => {
  it('un objeto con campos es un tema', () => {
    expect(comoTema({ acento: '#4a9d7f' })).toEqual({ acento: '#4a9d7f' });
  });

  it('vacío, null o lo que no sea objeto es «la paleta de siempre»', () => {
    expect(comoTema({})).toBeNull();
    expect(comoTema(null)).toBeNull();
    expect(comoTema(undefined)).toBeNull();
    expect(comoTema('#4a9d7f')).toBeNull();
    expect(comoTema([1, 2])).toBeNull();
  });
});

describe('aplicarTema', () => {
  const tema: Tema = {
    acento: '#4a9d7f',
    fuenteGoogle: true,
    fuenteTitulos: 'Playfair Display',
  };

  it('deja una sola etiqueta de estilo y una de fuentes', () => {
    aplicarTema(tema);
    aplicarTema(tema);

    expect(document.querySelectorAll('#humaya-tema')).toHaveLength(1);
    expect(document.querySelectorAll('#humaya-tema-fuentes')).toHaveLength(1);
  });

  it('un tema nuevo reemplaza al anterior en vez de sumarse', () => {
    aplicarTema({ acento: '#4a9d7f' });
    aplicarTema({ acento: '#c8a565' });

    const estilo = document.getElementById('humaya-tema');
    expect(estilo?.textContent).toContain('#c8a565');
    expect(estilo?.textContent).not.toContain('#4a9d7f');
  });

  it('sin tema no queda nada puesto', () => {
    aplicarTema(tema);
    aplicarTema(null);

    expect(document.getElementById('humaya-tema')).toBeNull();
    expect(document.getElementById('humaya-tema-fuentes')).toBeNull();
  });

  it('un tema sin nada que pisar no deja una etiqueta vacía', () => {
    aplicarTema({});
    expect(document.getElementById('humaya-tema')).toBeNull();
  });
});
