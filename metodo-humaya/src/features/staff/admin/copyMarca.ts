import type { Idioma } from '@/hooks/useIdiomaElegido';

/** El texto de Admin → Marca: los nombres, los colores y las letras. */
export interface MarcaTextos {
  titulo: string;
  cuerpo: string;

  nombresTitulo: string;
  nombresCuerpo: string;
  marcaExperienciaLabel: string;
  marcaExperienciaAyuda: string;
  marcaHotelLabel: string;
  correoLabel: string;
  correoAyuda: string;

  coloresTitulo: string;
  coloresCuerpo: string;

  acentoLabel: string;
  acentoAyuda: string;
  acentoStaffLabel: string;
  acentoStaffAyuda: string;
  sobreAcentoLabel: string;
  sobreAcentoAyuda: string;
  sugerir: string;

  huespedTitulo: string;
  staffTitulo: string;
  fondoLabel: string;
  superficieLabel: string;
  textoLabel: string;

  fuentesTitulo: string;
  fuentesCuerpo: string;
  fuenteTitulosLabel: string;
  fuenteTextoLabel: string;
  fuenteGoogleLabel: string;
  fuenteGoogleAyuda: string;

  contrasteBien: string;
  contrasteJusto: string;
  contrasteMal: string;
  contrasteRazon: (razon: number) => string;

  probar: string;
  probarAyuda: string;
  volver: string;
  guardar: string;
  guardando: string;
  guardado: string;
  limpiar: string;
  /** Estaba escrito dentro del JSX de CampoDeColor, en espanol. */
  noEsColor: string;

  error: string;
  sinPermiso: string;
  noCargo: string;
}

export const marcaCopy: Record<Idioma, MarcaTextos> = {
  es: {
    titulo: 'Marca',
    cuerpo:
      'Cómo se llama este hotel y con qué se ve. Lo que se guarda acá cambia la app del huésped y recepción en el momento, sin volver a publicar nada.',

    nombresTitulo: 'Los nombres',
    nombresCuerpo:
      'El nombre de la experiencia es nombre propio y no se traduce: va igual en español y en inglés.',
    marcaExperienciaLabel: 'Nombre de la experiencia',
    marcaExperienciaAyuda: 'Lo que el huésped lee como el marco de su estadía.',
    marcaHotelLabel: 'Nombre del hotel',
    correoLabel: 'Correo de reservas',
    correoAyuda: 'De acá sale el correo, y a acá escribe el huésped si algo falla.',

    coloresTitulo: 'Los colores',
    coloresCuerpo:
      'Dejá un color en blanco y se usa el de siempre. Los bordes y las variantes más claras y más apagadas se calculan solas a partir del acento: no hace falta elegirlas.',

    acentoLabel: 'Acento, sobre fondo oscuro',
    acentoAyuda: 'La app del huésped y la barra lateral de recepción. Es el color de los botones.',
    acentoStaffLabel: 'Acento, sobre fondo claro',
    acentoStaffAyuda:
      'Las pantallas de recepción. Suele ser el mismo color más oscuro: el que se lee sobre blanco casi nunca se lee sobre negro.',
    sobreAcentoLabel: 'Texto encima del acento',
    sobreAcentoAyuda: 'El de las letras dentro de un botón lleno.',
    sugerir: 'Usar el que se lee',

    huespedTitulo: 'App del huésped',
    staffTitulo: 'Recepción',
    fondoLabel: 'Fondo',
    superficieLabel: 'Fondo de las fichas',
    textoLabel: 'Texto',

    fuentesTitulo: 'Las letras',
    fuentesCuerpo:
      'En blanco quedan las de siempre: Cormorant Garamond en los títulos y Jost en el texto.',
    fuenteTitulosLabel: 'Títulos',
    fuenteTextoLabel: 'Texto',
    fuenteGoogleLabel: 'Bajar estas fuentes de Google Fonts',
    fuenteGoogleAyuda:
      'Hace falta si la fuente no viene con la app, que es el caso de casi todas. Si no llegan, la pantalla sale con las de siempre en vez de quedarse en blanco.',

    contrasteBien: 'Se lee bien',
    contrasteJusto: 'Se lee en grande, pero no en texto chico',
    contrasteMal: 'No se lee: elegí uno más contrastado',
    contrasteRazon: (razon) => `${razon.toFixed(1)}:1`,

    probar: 'Ver cómo queda',
    probarAyuda: 'Lo pinta en esta pantalla sin guardar nada. Recargá para deshacerlo.',
    volver: 'Volver a lo guardado',
    guardar: 'Guardar la marca',
    guardando: 'Guardando…',
    guardado: 'Guardado. Ya lo está viendo el huésped.',
    limpiar: 'Quitar',
    noEsColor: 'Escribilo como #rrggbb. Así no se guarda.',

    error: 'No se pudo guardar. Probá de nuevo.',
    sinPermiso: 'Solo un administrador puede cambiar la marca.',
    noCargo: 'No pudimos leer la marca de este hotel.',
  },

  en: {
    titulo: 'Brand',
    cuerpo:
      'What this hotel is called and what it looks like. What you save here changes the guest app and the front desk right away, without publishing anything again.',

    nombresTitulo: 'The names',
    nombresCuerpo:
      'The name of the experience is a proper name and is not translated: it goes the same in Spanish and in English.',
    marcaExperienciaLabel: 'Name of the experience',
    marcaExperienciaAyuda: 'What the guest reads as the frame around their stay.',
    marcaHotelLabel: 'Name of the hotel',
    correoLabel: 'Bookings email',
    correoAyuda: 'Email goes out from here, and here is where the guest writes if something fails.',

    coloresTitulo: 'The colors',
    coloresCuerpo:
      'Leave a color blank and the usual one is used. Borders and the lighter and dimmer variants are worked out on their own from the accent: you do not have to pick them.',

    acentoLabel: 'Accent, on a dark background',
    acentoAyuda: 'The guest app and the front-desk sidebar. It is the color of the buttons.',
    acentoStaffLabel: 'Accent, on a light background',
    acentoStaffAyuda:
      'The front-desk screens. It is usually the same color, darker: what reads on white almost never reads on black.',
    sobreAcentoLabel: 'Text on top of the accent',
    sobreAcentoAyuda: 'The letters inside a filled button.',
    sugerir: 'Use the one that reads',

    huespedTitulo: 'Guest app',
    staffTitulo: 'Front desk',
    fondoLabel: 'Background',
    superficieLabel: 'Card background',
    textoLabel: 'Text',

    fuentesTitulo: 'The fonts',
    fuentesCuerpo:
      'Left blank, the usual ones stay: Cormorant Garamond for headings and Jost for text.',
    fuenteTitulosLabel: 'Headings',
    fuenteTextoLabel: 'Text',
    fuenteGoogleLabel: 'Download these fonts from Google Fonts',
    fuenteGoogleAyuda:
      'This is needed if the font does not ship with the app, which is the case for almost all of them. If they do not arrive, the screen shows the usual ones instead of going blank.',

    contrasteBien: 'Reads well',
    contrasteJusto: 'Reads at large sizes, but not in small text',
    contrasteMal: 'Does not read: pick one with more contrast',
    contrasteRazon: (razon) => `${razon.toFixed(1)}:1`,

    probar: 'See how it looks',
    probarAyuda: 'This paints it on this screen without saving anything. Reload to undo it.',
    volver: 'Back to what is saved',
    guardar: 'Save the brand',
    guardando: 'Saving…',
    guardado: 'Saved. The guest is already seeing it.',
    limpiar: 'Clear',
    noEsColor: 'Write it as #rrggbb. Like this it is not saved.',

    error: 'It could not be saved. Try again.',
    sinPermiso: 'Only an administrator can change the brand.',
    noCargo: 'We could not read this hotel’s brand.',
  },
};
