import type { Idioma } from '@/hooks/useIdiomaElegido';

export interface EnlacesTextos {
  titulo: string;
  cuerpo: string;
  verPortada: string;
  lista: string;

  vacio: string;
  vacioCuerpo: string;

  nombre: string;
  nombrePista: string;
  direccion: string;
  direccionPista: string;
  explicacion: string;
  explicacionPista: string;
  icono: string;

  agregar: string;
  agregando: string;
  nuevo: string;
  cancelar: string;
  guardar: string;
  guardando: string;
  editar: string;
  borrar: string;
  confirmarBorrar: string;
  subir: string;
  bajar: string;
  encendido: string;
  apagado: string;
  encender: string;
  apagar: string;

  faltaNombre: string;
  direccionMala: string;
  sinPermiso: string;
  soloAdmin: string;
}

export const enlacesCopy: Record<Idioma, EnlacesTextos> = {
  en: {
    titulo: 'Links',
    cuerpo:
      'The internal home page for this hotel: what its team opens every day. The front desk panel, the guest app, the PMS, the website — whatever this hotel works with.',
    verPortada: 'Open the internal home page',
    lista: 'Internal links',

    vacio: 'No links yet',
    vacioCuerpo: 'Add the first one and it shows up on the internal home page right away.',

    nombre: 'Name',
    nombrePista: 'What the card says. For example: Cloudbeds.',
    direccion: 'Address',
    direccionPista: 'Where it goes. We add https:// if you leave it out.',
    explicacion: 'One line about it',
    explicacionPista: 'Optional. What this is for, so nobody has to guess.',
    icono: 'Icon',

    agregar: 'Add link',
    agregando: 'Adding…',
    nuevo: 'New link',
    cancelar: 'Cancel',
    guardar: 'Save',
    guardando: 'Saving…',
    editar: 'Edit',
    borrar: 'Delete',
    confirmarBorrar: 'Delete for good',
    subir: 'Move up',
    bajar: 'Move down',
    encendido: 'On',
    apagado: 'Off',
    encender: 'Turn on',
    apagar: 'Turn off',

    faltaNombre: 'Give it a name.',
    direccionMala: 'That address does not look like a web address.',
    sinPermiso: 'Only an administrator can change this.',
    soloAdmin:
      'Only an administrator can add or change links. You can see the ones already set up.',
  },
  es: {
    titulo: 'Enlaces',
    cuerpo:
      'La portada interna de este hotel: lo que su equipo abre todos los días. El panel de recepción, la app del huésped, el PMS, el sitio web — lo que use este hotel.',
    verPortada: 'Ver la portada interna',
    lista: 'Enlaces internos',

    vacio: 'Todavía no hay ningún enlace',
    vacioCuerpo: 'Agregá el primero y aparece en la portada interna de una vez.',

    nombre: 'Nombre',
    nombrePista: 'Lo que dice la ficha. Por ejemplo: Cloudbeds.',
    direccion: 'Dirección',
    direccionPista: 'A dónde lleva. Si no escribís el https://, lo ponemos nosotros.',
    explicacion: 'Una línea de qué es',
    explicacionPista: 'Opcional. Para qué sirve, para que nadie tenga que adivinar.',
    icono: 'Ícono',

    agregar: 'Agregar enlace',
    agregando: 'Agregando…',
    nuevo: 'Enlace nuevo',
    cancelar: 'Cancelar',
    guardar: 'Guardar',
    guardando: 'Guardando…',
    editar: 'Editar',
    borrar: 'Borrar',
    confirmarBorrar: 'Borrar de verdad',
    subir: 'Subir',
    bajar: 'Bajar',
    encendido: 'Encendido',
    apagado: 'Apagado',
    encender: 'Encender',
    apagar: 'Apagar',

    faltaNombre: 'Ponele un nombre.',
    direccionMala: 'Esa dirección no parece una dirección web.',
    sinPermiso: 'Solo un administrador puede cambiar esto.',
    soloAdmin:
      'Solo un administrador agrega o cambia enlaces. Los que ya están configurados sí los podés ver.',
  },
};
