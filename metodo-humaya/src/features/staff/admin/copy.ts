import type { Idioma } from '@/hooks/useIdiomaElegido';

/** El texto del marco de Admin, de la portada, de Ajustes y de Servicios. */
export interface AdminTextos {
  /** El marco: encabezado, menú de secciones y el aviso de permiso. */
  area: string;
  title: string;
  todo: string;
  navLabel: string;
  avisoSinPermiso: string;
  /**
   * Partida en dos a proposito: el nombre del hotel va en negrita en medio
   * de la frase, y con el hotel administrando dos propiedades saber cual se
   * esta configurando no es un detalle de diseno.
   */
  portadaAntes: string;
  portadaDespues: string;
  portadaLista: string;

  demoTitulo: string;
  demoCuerpo: string;
  demoEncendido: string;
  demoApagado: string;
  demoApagar: string;
  demoEncender: string;
  demoSoloAdmin: string;

  opcionesTitle: string;
  opcionesBody: string;
  habilitada: string;
  deshabilitada: string;
  habilitar: string;
  deshabilitar: string;

  serviciosTitle: string;
  serviciosBody: string;
  serviciosEmpty: string;
  nuevoServicio: string;
  nombreLabel: string;
  nombrePlaceholder: string;
  descripcionLabel: string;
  descripcionPlaceholder: string;
  proveedorLabel: string;
  proveedorPlaceholder: string;
  precioLabel: string;
  unidadLabel: string;
  duracionLabel: string;
  horaInicioLabel: string;
  horaFinLabel: string;
  editar: string;
  cancelar: string;
  guardarCambios: string;
  servicioSoloAdmin: string;
  guardar: string;
  guardando: string;
  nombreRequerido: string;
  error: string;
}

export const adminCopy: Record<Idioma, AdminTextos> = {
  es: {
    area: 'Recepción',
    title: 'Admin',
    todo: 'Todo',
    navLabel: 'Secciones de Admin',
    avisoSinPermiso:
      'Podés ver todo y encender o apagar lo que ya existe. Cambiar los nombres, la marca, los precios y los datos de ejemplo lo hace un administrador: esos botones no aparecen por eso, no porque falte algo.',
    portadaAntes: 'Todo lo que se configura de ',
    portadaDespues:
      ' vive acá. Cada sección cambia lo que el huésped ve en el momento en que se guarda.',
    portadaLista: 'Lo que se configura',

    // El interruptor del demo. Tony, 15 de noviembre de 2026: «el demo debería
    // quedar como opción temporal hasta que yo lo publique o en settings lo
    // quite». Esta es esa parte de settings.
    demoTitulo: 'Datos de ejemplo',
    demoCuerpo:
      'Mientras esté encendido, recepción puede ver las dos estadías inventadas de la demo desde el filtro de Reservas. Apagalo cuando publiques: los datos reales de Cloudbeds no se tocan.',
    demoEncendido: 'Encendido',
    demoApagado: 'Apagado',
    demoApagar: 'Apagar el demo',
    demoEncender: 'Encender el demo',
    demoSoloAdmin: 'Solo un administrador puede cambiar esto.',

    opcionesTitle: 'Opciones del menú',
    opcionesBody: 'Lo que ves acá es lo que el huésped ve en el Home y en el menú de abajo.',
    habilitada: 'Habilitada',
    deshabilitada: 'Deshabilitada',
    habilitar: 'Habilitar',
    deshabilitar: 'Deshabilitar',

    serviciosTitle: 'Servicios de Reservas',
    serviciosBody: 'Sauna y Cold Plunge siempre están. Acá se agregan otros servicios.',
    serviciosEmpty: 'Todavía no agregaste ningún servicio.',
    nuevoServicio: 'Agregar servicio',
    nombreLabel: 'Nombre',
    nombrePlaceholder: 'Ej.: Entrenamiento personal',
    descripcionLabel: 'Descripción',
    descripcionPlaceholder: 'Ej.: Sesión de entrenamiento personalizado.',
    proveedorLabel: 'Con quién',
    proveedorPlaceholder: 'Ej.: Alex Quesada',
    precioLabel: 'Precio (USD)',
    unidadLabel: 'Por',
    duracionLabel: 'Duración (minutos)',
    horaInicioLabel: 'Desde',
    horaFinLabel: 'Hasta',
    editar: 'Editar',
    cancelar: 'Cancelar',
    guardarCambios: 'Guardar cambios',
    servicioSoloAdmin: 'Solo un administrador puede editar un servicio.',
    guardar: 'Guardar servicio',
    guardando: 'Guardando…',
    nombreRequerido: 'Escribí un nombre.',
    error: 'No se pudo guardar. Probá de nuevo.',
  },

  en: {
    area: 'Front desk',
    title: 'Admin',
    todo: 'All',
    navLabel: 'Admin sections',
    avisoSinPermiso:
      'You can see everything and turn on or off what already exists. Changing the names, the brand, the prices and the sample data is done by an administrator: that is why those buttons are not here, not because something is missing.',
    portadaAntes: 'Everything that is configured for ',
    portadaDespues: ' lives here. Each section changes what the guest sees the moment it is saved.',
    portadaLista: 'What you configure',

    demoTitulo: 'Sample data',
    demoCuerpo:
      'While this is on, the front desk can see the two made-up demo stays from the Bookings filter. Turn it off when you go live: the real Cloudbeds data is never touched.',
    demoEncendido: 'On',
    demoApagado: 'Off',
    demoApagar: 'Turn the demo off',
    demoEncender: 'Turn the demo on',
    demoSoloAdmin: 'Only an administrator can change this.',

    opcionesTitle: 'Menu options',
    opcionesBody: 'What you see here is what the guest sees on the Home and in the bottom menu.',
    habilitada: 'Enabled',
    deshabilitada: 'Disabled',
    habilitar: 'Enable',
    deshabilitar: 'Disable',

    serviciosTitle: 'Bookable services',
    serviciosBody: 'Sauna and Cold Plunge are always there. Other services are added here.',
    serviciosEmpty: 'You have not added any service yet.',
    nuevoServicio: 'Add service',
    nombreLabel: 'Name',
    nombrePlaceholder: 'E.g.: Personal training',
    descripcionLabel: 'Description',
    descripcionPlaceholder: 'E.g.: A personalized training session.',
    proveedorLabel: 'With whom',
    proveedorPlaceholder: 'E.g.: Alex Quesada',
    precioLabel: 'Price (USD)',
    unidadLabel: 'Per',
    duracionLabel: 'Duration (minutes)',
    horaInicioLabel: 'From',
    horaFinLabel: 'To',
    editar: 'Edit',
    cancelar: 'Cancel',
    guardarCambios: 'Save changes',
    servicioSoloAdmin: 'Only an administrator can edit a service.',
    guardar: 'Save service',
    guardando: 'Saving…',
    nombreRequerido: 'Write a name.',
    error: 'It could not be saved. Try again.',
  },
};
