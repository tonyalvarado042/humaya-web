import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * El texto de la sección del Concierge en Admin.
 *
 * Vive aparte de `copy.ts` porque la sección es grande y porque así se puede
 * leer de corrido lo que la pantalla le dice a quien la usa, sin el resto.
 *
 * ── OJO CON LOS NÚMEROS Y LAS FECHAS ────────────────────────────────────
 * `tokens` y `llaveDetalle` formatean con `toLocaleString`, y el locale va
 * adentro de cada idioma: en español «1.250.000» y «21 de noviembre», en
 * inglés «1,250,000» y «November 21». Estaban clavados en `es-CR`.
 */
export interface BotTextos {
  titulo: string;
  cuerpo: string;

  estadoTitulo: string;
  encendido: string;
  apagado: string;
  conLlave: string;
  sinLlave: string;
  llaveRota: string;
  sinTemas: string;
  temasEncendidos: (cuantos: number) => string;
  modelo: string;
  llaveDesde: string;
  probar: string;
  probando: string;
  pruebaOk: string;
  pruebaMal: string;
  encender: string;
  apagar: string;
  noSePudoLeer: string;
  soloAdmin: string;

  faltaLlave: string;
  llaveNoSirve: string;
  faltanTemas: string;

  llaveTitulo: string;
  llavePuesta: string;
  llaveNoPuesta: string;
  llaveCuerpo: string;
  llaveLabel: string;
  llavePlaceholder: string;
  llaveGuardada: string;
  guardarLlave: string;
  llaveDetalle: (terminaEn: string | null, cuando: string | null) => string;

  gastoTitulo: string;
  esteMes: string;
  desdeSiempre: string;
  respuestasMes: string;
  respuestasTotal: string;
  sinTarifa: string;
  tokens: (entrada: number, salida: number) => string;
  tarifasCuerpo: string;
  precioEntrada: string;
  precioSalida: string;
  guardarTarifas: string;

  baseTitulo: string;
  baseCuerpo: string;
  baseVacia: string;
  activo: string;
  inactivo: string;
  editar: string;
  encenderTema: string;
  apagarTema: string;
  borrar: string;
  confirmarBorrar: string;
  cancelar: string;
  guardarCambios: string;
  guardando: string;

  agregarTitulo: string;
  agregar: string;
  temaLabel: string;
  temaPlaceholder: string;
  contenidoLabel: string;
  contenidoPlaceholder: string;
  faltaAlgo: string;
}

export const botCopy: Record<Idioma, BotTextos> = {
  es: {
    titulo: 'El Concierge',
    cuerpo:
      'El bot que le contesta al huésped en el chat. Solo puede decir lo que esté escrito acá abajo: lo que no esté, se lo pasa al equipo.',

    estadoTitulo: 'Estado',
    encendido: 'Encendido',
    apagado: 'Apagado',
    conLlave: 'Con llave',
    sinLlave: 'Sin llave',
    llaveRota: 'Llave inválida',
    sinTemas: 'Sin temas encendidos',
    temasEncendidos: (cuantos) =>
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

    // Se dice POR QUÉ no se puede encender, en vez de dejar un botón que
    // rebota.
    faltaLlave:
      'Falta la llave de Anthropic. Mientras no esté, el bot no se puede encender y el Concierge sigue contestando «ya se lo paso al equipo», que es verdad. Pegála acá abajo.',
    llaveNoSirve:
      'La llave de Anthropic está puesta pero el modelo la rechaza. Pegá una nueva acá abajo y volvé a tocar Probar. Mientras tanto el bot no se enciende y el Concierge sigue pasando todo al equipo.',
    faltanTemas:
      'Todavía no hay ningún tema encendido. Un bot sin datos inventa: por eso no se deja encender hasta que haya al menos uno.',

    llaveTitulo: 'La llave de Anthropic',
    llavePuesta: 'Puesta',
    llaveNoPuesta: 'Sin poner',
    llaveCuerpo:
      'Pegá acá la llave de tu cuenta de Anthropic. Se guarda cifrada en la bóveda del servidor y no vuelve nunca a esta pantalla: de acá en adelante solo se ve si está puesta, cuándo y en qué termina. Después de guardarla, tocá Probar.',
    llaveLabel: 'Llave de Anthropic',
    llavePlaceholder: 'sk-ant-…',
    llaveGuardada: 'Guardada. Tocá Probar para confirmar que sirve.',
    guardarLlave: 'Guardar la llave',
    llaveDetalle: (terminaEn, cuando) => {
      const fin = terminaEn ? `termina en …${terminaEn}` : 'guardada';
      if (!cuando) return `Hay una llave ${fin}.`;
      const fecha = new Date(cuando).toLocaleDateString('es-CR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return `Hay una llave ${fin}, puesta el ${fecha}.`;
    },

    gastoTitulo: 'Gasto',
    esteMes: 'Este mes',
    desdeSiempre: 'Desde siempre',
    respuestasMes: 'Respuestas este mes',
    respuestasTotal: 'Respuestas en total',
    sinTarifa: 'falta la tarifa',
    tokens: (entrada, salida) =>
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
  },

  en: {
    titulo: 'The Concierge',
    cuerpo:
      'The bot that answers the guest in the chat. It can only say what is written below: whatever is not there, it hands to the team.',

    estadoTitulo: 'Status',
    encendido: 'On',
    apagado: 'Off',
    conLlave: 'Key in place',
    sinLlave: 'No key',
    llaveRota: 'Invalid key',
    sinTemas: 'No topics turned on',
    temasEncendidos: (cuantos) => (cuantos === 1 ? '1 topic on' : `${cuantos} topics on`),
    modelo: 'Model',
    // De DÓNDE sale la llave, no desde cuándo. Se vio en pantalla: decía
    // «key since settings», que no quiere decir nada.
    llaveDesde: 'key from',
    probar: 'Test',
    probando: 'Testing…',
    pruebaOk: 'It works.',
    pruebaMal: 'It does not work:',
    encender: 'Turn the bot on',
    apagar: 'Turn the bot off',
    noSePudoLeer: 'The bot status could not be read. Try again in a moment.',
    soloAdmin: 'Only an administrator can change this.',

    faltaLlave:
      'The Anthropic key is missing. Until it is there the bot cannot be turned on, and the Concierge keeps answering “I am passing this to the team”, which is true. Paste it below.',
    llaveNoSirve:
      'The Anthropic key is in place but the model rejects it. Paste a new one below and press Test again. In the meantime the bot does not turn on and the Concierge keeps handing everything to the team.',
    faltanTemas:
      'There is no topic turned on yet. A bot with no data makes things up: that is why it cannot be turned on until there is at least one.',

    llaveTitulo: 'The Anthropic key',
    llavePuesta: 'In place',
    llaveNoPuesta: 'Not set',
    llaveCuerpo:
      'Paste your Anthropic account key here. It is stored encrypted in the server vault and never comes back to this screen: from here on you only see whether it is set, when, and what it ends in. After saving it, press Test.',
    llaveLabel: 'Anthropic key',
    llavePlaceholder: 'sk-ant-…',
    llaveGuardada: 'Saved. Press Test to confirm it works.',
    guardarLlave: 'Save the key',
    llaveDetalle: (terminaEn, cuando) => {
      const fin = terminaEn ? `ending in …${terminaEn}` : 'saved';
      if (!cuando) return `There is a key ${fin}.`;
      const fecha = new Date(cuando).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return `There is a key ${fin}, set on ${fecha}.`;
    },

    gastoTitulo: 'Spend',
    esteMes: 'This month',
    desdeSiempre: 'All time',
    respuestasMes: 'Replies this month',
    respuestasTotal: 'Replies in total',
    sinTarifa: 'rate missing',
    tokens: (entrada, salida) =>
      `This month: ${entrada.toLocaleString('en-US')} input tokens and ${salida.toLocaleString('en-US')} output.`,
    tarifasCuerpo:
      'Put your Anthropic account rate here, in dollars per million tokens, and the spend works itself out. With no rate, only the tokens are shown and nothing else: a made-up figure that looks like an invoice is worse than showing none.',
    precioEntrada: 'USD per million · input',
    precioSalida: 'USD per million · output',
    guardarTarifas: 'Save rates',

    baseTitulo: 'What the Concierge knows',
    baseCuerpo:
      'Each topic is a piece of what the bot can answer. A new topic is born off: you write it, you read it, and only then you turn it on.',
    baseVacia: 'There are no topics yet.',
    activo: 'On',
    inactivo: 'Off',
    editar: 'Edit',
    encenderTema: 'Turn on',
    apagarTema: 'Turn off',
    borrar: 'Delete',
    confirmarBorrar: 'Really delete',
    cancelar: 'Cancel',
    guardarCambios: 'Save changes',
    guardando: 'Saving…',

    agregarTitulo: 'Add a topic',
    agregar: 'Add topic',
    temaLabel: 'Topic',
    temaPlaceholder: 'E.g.: Breakfast',
    contenidoLabel: 'What the bot can say about this',
    contenidoPlaceholder:
      'E.g.: Breakfast is served from 7:00 to 9:30 a.m. in the main house. If someone has a restriction, it is prepared separately.',
    faltaAlgo: 'Write the topic and what it can say.',
  },
};
