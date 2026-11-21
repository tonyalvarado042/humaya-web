import type { Idioma } from '@/hooks/useIdiomaElegido';

/** El texto de la sección de respuestas guardadas en Admin. */
export interface RespuestasTextos {
  titulo: string;
  cuerpo: string;
  vacio: string;

  activa: string;
  inactiva: string;
  editar: string;
  encender: string;
  apagar: string;
  borrar: string;
  confirmarBorrar: string;
  cancelar: string;
  guardarCambios: string;
  guardando: string;
  soloAdmin: string;

  agregarTitulo: string;
  agregar: string;
  tituloLabel: string;
  tituloPlaceholder: string;
  textoLabel: string;
  textoPlaceholder: string;
  textoEnLabel: string;
  falta: string;
}

export const respuestasCopy: Record<Idioma, RespuestasTextos> = {
  es: {
    titulo: 'Respuestas guardadas',
    cuerpo:
      'Los textos que recepción manda una y otra vez. En el chat aparecen como botones: se tocan, quedan en el cuadro y se mandan después de leerlos. No pasan por el bot, así que salen exactamente como están escritos acá.',
    vacio: 'Todavía no hay ninguna respuesta guardada.',

    activa: 'Encendida',
    inactiva: 'Apagada',
    editar: 'Editar',
    encender: 'Encender',
    apagar: 'Apagar',
    borrar: 'Borrar',
    confirmarBorrar: 'Borrar de verdad',
    cancelar: 'Cancelar',
    guardarCambios: 'Guardar cambios',
    guardando: 'Guardando…',
    soloAdmin: 'Solo un administrador puede cambiar esto.',

    agregarTitulo: 'Agregar una respuesta',
    agregar: 'Agregar respuesta',
    tituloLabel: 'Cómo se llama el botón',
    tituloPlaceholder: 'Ej.: Lo estamos viendo',
    textoLabel: 'El texto que se manda',
    textoPlaceholder: 'Ej.: Ya lo estamos viendo. Te confirmo por acá en unos minutos.',
    // No es «el otro idioma»: es el inglés. El texto se guarda en los dos
    // porque el huésped puede leer en cualquiera de los dos, y eso no cambia
    // con el idioma de esta pantalla.
    textoEnLabel: 'En inglés (opcional)',
    falta: 'Escribí el nombre y el texto.',
  },

  en: {
    titulo: 'Saved replies',
    cuerpo:
      'The texts the front desk sends over and over. In the chat they show up as buttons: you tap one, it lands in the box, and you send it after reading it. They do not go through the bot, so they come out exactly as written here.',
    vacio: 'There are no saved replies yet.',

    activa: 'On',
    inactiva: 'Off',
    editar: 'Edit',
    encender: 'Turn on',
    apagar: 'Turn off',
    borrar: 'Delete',
    confirmarBorrar: 'Really delete',
    cancelar: 'Cancel',
    guardarCambios: 'Save changes',
    guardando: 'Saving…',
    soloAdmin: 'Only an administrator can change this.',

    agregarTitulo: 'Add a reply',
    agregar: 'Add reply',
    tituloLabel: 'What the button is called',
    tituloPlaceholder: 'E.g.: We are looking into it',
    textoLabel: 'The text that gets sent',
    textoPlaceholder: 'E.g.: We are already looking into it. I will confirm here in a few minutes.',
    textoEnLabel: 'In English (optional)',
    falta: 'Write the name and the text.',
  },
};
