import { describe, expect, it } from 'vitest';
import type { AdminOpcion } from '@/types';
import { descripcionDeOpcion, etiquetaDeOpcion, textoPorIdioma } from './opciones';

const RESERVAS: AdminOpcion = {
  id: 'opcion-bookings',
  clave: 'bookings',
  etiqueta: 'Reservas',
  descripcion: 'Sauna y cold plunge.',
  icono: 'calendar',
  habilitada: true,
  orden: 5,
  etiquetas: {},
  descripciones: {},
};

describe('textoPorIdioma', () => {
  it('gana lo que escribió el hotel en el idioma del huésped', () => {
    expect(textoPorIdioma({ es: 'Rituales', en: 'Rituals' }, 'en', 'Bookings')).toBe('Rituals');
  });

  /**
   * El orden que importa: un hotel que solo llenó el español NO quiso que un
   * huésped en inglés leyera «Rituales». Quiso dejar el inglés como estaba.
   */
  it('con un solo idioma llenado, el otro sigue saliendo del texto por defecto', () => {
    expect(textoPorIdioma({ es: 'Rituales' }, 'en', 'Bookings')).toBe('Bookings');
  });

  /** Para una opción nueva no hay texto por defecto: ahí sí vale el otro idioma. */
  it('sin texto por defecto cae al otro idioma antes que a nada', () => {
    expect(textoPorIdioma({ es: 'Sauna seca' }, 'en', null)).toBe('Sauna seca');
  });

  it('un texto en blanco no cuenta como texto', () => {
    expect(textoPorIdioma({ es: '   ' }, 'es', 'Reservas')).toBe('Reservas');
    expect(textoPorIdioma({}, 'es', '  ')).toBeNull();
  });

  it('sin nada devuelve nada en vez de una cadena vacía', () => {
    expect(textoPorIdioma({}, 'es', null)).toBeNull();
  });
});

describe('etiquetaDeOpcion', () => {
  it('sin nada escrito usa la traducción de la app', () => {
    expect(etiquetaDeOpcion(RESERVAS, 'en')).toBe('Bookings');
    expect(etiquetaDeOpcion(RESERVAS, 'es')).toBe('Reservas');
  });

  /** Lo que antes no pasaba: renombrar en admin y que el huésped lo vea. */
  it('lo que escribió el hotel le gana a la traducción', () => {
    const renombrada = { ...RESERVAS, etiquetas: { es: 'Rituales', en: 'Rituals' } };
    expect(etiquetaDeOpcion(renombrada, 'en')).toBe('Rituals');
    expect(etiquetaDeOpcion(renombrada, 'es')).toBe('Rituales');
  });

  it('renombrar solo el español deja el inglés traducido', () => {
    const renombrada = { ...RESERVAS, etiquetas: { es: 'Rituales' } };
    expect(etiquetaDeOpcion(renombrada, 'es')).toBe('Rituales');
    expect(etiquetaDeOpcion(renombrada, 'en')).toBe('Bookings');
  });

  /**
   * Una opción que el hotel agregó no tiene llave en nav.*: ahí `t()`
   * devolvería «nav.sauna», que en pantalla es peor que nada.
   */
  it('una opción nueva no muestra la llave de traducción', () => {
    const nueva: AdminOpcion = { ...RESERVAS, clave: 'sauna', etiqueta: 'Sauna' };
    expect(etiquetaDeOpcion(nueva, 'en')).toBe('Sauna');
    expect(etiquetaDeOpcion(nueva, 'en')).not.toContain('nav.');
  });

  it('una opción nueva escrita en un solo idioma se lee en los dos', () => {
    const nueva: AdminOpcion = {
      ...RESERVAS,
      clave: 'sauna',
      etiqueta: '',
      etiquetas: { es: 'Sauna seca' },
    };
    expect(etiquetaDeOpcion(nueva, 'en')).toBe('Sauna seca');
  });

  it('una opción sin ningún texto cae a la clave y no queda sin nombre', () => {
    const muda: AdminOpcion = { ...RESERVAS, clave: 'spa', etiqueta: '', etiquetas: {} };
    expect(etiquetaDeOpcion(muda, 'en')).toBe('spa');
  });

  /** Las filas viejas de la base no traen las columnas nuevas. */
  it('aguanta una fila sin las columnas nuevas', () => {
    const vieja: Partial<AdminOpcion> = { ...RESERVAS };
    delete vieja.etiquetas;
    expect(etiquetaDeOpcion(vieja as AdminOpcion, 'es')).toBe('Reservas');
  });
});

describe('descripcionDeOpcion', () => {
  it('sin nada escrito queda la descripción de siempre', () => {
    expect(descripcionDeOpcion(RESERVAS, 'en')).toBe('Sauna y cold plunge.');
  });

  it('lo que escribió el hotel en su idioma gana', () => {
    const conDescripciones = { ...RESERVAS, descripciones: { en: 'Sauna and cold plunge.' } };
    expect(descripcionDeOpcion(conDescripciones, 'en')).toBe('Sauna and cold plunge.');
  });

  /**
   * Lo encontró este test: escribir solo el inglés NO debe taparle al huésped
   * en español la descripción que ya tenía.
   */
  it('escribir un idioma no le cambia el texto al otro', () => {
    const conDescripciones = { ...RESERVAS, descripciones: { en: 'Sauna and cold plunge.' } };
    expect(descripcionDeOpcion(conDescripciones, 'es')).toBe('Sauna y cold plunge.');
  });

  it('sin descripción no inventa una', () => {
    expect(descripcionDeOpcion({ ...RESERVAS, descripcion: null }, 'es')).toBeNull();
  });
});
