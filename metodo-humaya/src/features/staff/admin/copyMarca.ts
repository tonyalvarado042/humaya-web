export const marcaCopy = {
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
  contrasteRazon: (razon: number) => `${razon.toFixed(1)}:1`,

  probar: 'Ver cómo queda',
  probarAyuda: 'Lo pinta en esta pantalla sin guardar nada. Recargá para deshacerlo.',
  volver: 'Volver a lo guardado',
  guardar: 'Guardar la marca',
  guardando: 'Guardando…',
  guardado: 'Guardado. Ya lo está viendo el huésped.',
  limpiar: 'Quitar',

  error: 'No se pudo guardar. Probá de nuevo.',
  sinPermiso: 'Solo un administrador puede cambiar la marca.',
  noCargo: 'No pudimos leer la marca de este hotel.',
};
