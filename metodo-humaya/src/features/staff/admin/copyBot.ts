/**
 * El texto de la sección del Concierge en Admin.
 *
 * Vive aparte de `copy.ts` porque la sección es grande y porque así se puede
 * leer de corrido lo que la pantalla le dice a quien la usa, sin el resto.
 */
export const botCopy = {
  titulo: 'El Concierge',
  cuerpo:
    'El bot que le contesta al huésped en el chat. Solo puede decir lo que esté escrito acá abajo: lo que no esté, se lo pasa al equipo.',

  estadoTitulo: 'Estado',
  encendido: 'Encendido',
  apagado: 'Apagado',
  conLlave: 'Con llave',
  sinLlave: 'Sin llave',
  sinTemas: 'Sin temas encendidos',
  temasEncendidos: (cuantos: number) =>
    cuantos === 1 ? '1 tema encendido' : `${cuantos} temas encendidos`,
  modelo: 'Modelo',
  llaveDesde: 'llave desde',
  probar: 'Probar',
  probando: 'Probando…',
  pruebaOk: 'Funciona.',
  pruebaMal: 'No funciona:',
  encender: 'Encender el bot',
  apagar: 'Apagar el bot',
  noSePudoLeer: 'No se pudo leer el estado del bot. Probá de nuevo en un momento.',
  soloAdmin: 'Solo un administrador puede cambiar esto.',

  // Se dice POR QUÉ no se puede encender, en vez de dejar un botón que rebota.
  faltaLlave:
    'Falta la llave de Anthropic. Mientras no esté, el bot no se puede encender y el Concierge sigue contestando «ya se lo paso al equipo», que es verdad. La llave se guarda en los secretos del proyecto en Supabase, nunca acá ni en el código.',
  faltanTemas:
    'Todavía no hay ningún tema encendido. Un bot sin datos inventa: por eso no se deja encender hasta que haya al menos uno.',

  gastoTitulo: 'Gasto',
  esteMes: 'Este mes',
  desdeSiempre: 'Desde siempre',
  respuestasMes: 'Respuestas este mes',
  respuestasTotal: 'Respuestas en total',
  sinTarifa: 'falta la tarifa',
  tokens: (entrada: number, salida: number) =>
    `Este mes: ${entrada.toLocaleString('es-CR')} tokens de entrada y ${salida.toLocaleString('es-CR')} de salida.`,
  tarifasCuerpo:
    'Poné acá la tarifa de tu cuenta de Anthropic, en dólares por millón de tokens, y el gasto se calcula solo. Sin tarifa se muestran los tokens y nada más: una cifra inventada que parece una factura es peor que no mostrar ninguna.',
  precioEntrada: 'USD por millón · entrada',
  precioSalida: 'USD por millón · salida',
  guardarTarifas: 'Guardar tarifas',

  baseTitulo: 'Lo que el Concierge sabe',
  baseCuerpo:
    'Cada tema es un pedazo de lo que el bot puede contestar. Un tema nuevo nace apagado: se escribe, se lee y recién ahí se enciende.',
  baseVacia: 'Todavía no hay ningún tema.',
  activo: 'Encendido',
  inactivo: 'Apagado',
  editar: 'Editar',
  encenderTema: 'Encender',
  apagarTema: 'Apagar',
  borrar: 'Borrar',
  confirmarBorrar: 'Borrar de verdad',
  cancelar: 'Cancelar',
  guardarCambios: 'Guardar cambios',
  guardando: 'Guardando…',

  agregarTitulo: 'Agregar un tema',
  agregar: 'Agregar tema',
  temaLabel: 'Tema',
  temaPlaceholder: 'Ej.: Desayuno',
  contenidoLabel: 'Qué puede decir el bot sobre esto',
  contenidoPlaceholder:
    'Ej.: El desayuno se sirve de 7:00 a 9:30 a.m. en la casa principal. Si alguien tiene una restricción, se prepara aparte.',
  faltaAlgo: 'Escribí el tema y qué puede decir.',
} as const;
