import type { Idioma } from '@/hooks/useIdiomaElegido';

export interface PortadaTextos {
  /** Lo chiquito de arriba. Dice para quién es esta pantalla. */
  cejilla: string;
  bajada: string;
  lista: string;
  cargando: string;
  noCargo: string;
  reintentar: string;
  vacioTitulo: string;
  vacioCuerpo: string;
  configurar: string;
  alPanel: string;
  seAbreAparte: string;
}

export const portadaCopy: Record<Idioma, PortadaTextos> = {
  en: {
    cejilla: 'Internal use',
    bajada: 'Everything this hotel runs on, in one place.',
    lista: 'Internal shortcuts',
    cargando: 'Loading the shortcuts…',
    noCargo: 'We could not load the shortcuts.',
    reintentar: 'Try again',
    vacioTitulo: 'No shortcuts yet',
    vacioCuerpo:
      'An administrator can add them in Admin → Links: the front desk panel, the guest app, the PMS, the website — whatever this hotel works with.',
    configurar: 'Set up these shortcuts',
    alPanel: 'Go to the front desk',
    seAbreAparte: 'opens in a new tab',
  },
  es: {
    cejilla: 'Uso interno',
    bajada: 'Todo con lo que trabaja el hotel, en un solo lugar.',
    lista: 'Accesos internos',
    cargando: 'Cargando los accesos…',
    noCargo: 'No pudimos cargar los accesos.',
    reintentar: 'Reintentar',
    vacioTitulo: 'Todavía no hay ningún acceso',
    vacioCuerpo:
      'Un administrador los agrega en Admin → Enlaces: el panel de recepción, la app del huésped, el PMS, el sitio web — lo que use este hotel.',
    configurar: 'Configurar estos accesos',
    alPanel: 'Ir a recepción',
    seAbreAparte: 'se abre en otra pestaña',
  },
};
