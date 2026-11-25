import type { Idioma } from '@/hooks/useIdiomaElegido';
import type { FalloAlCrear, OrigenReservas } from '@/services/panelHoteles';

/**
 * Los textos del panel de hoteles.
 *
 * El aviso de Airbnb no es decoración: está puesto porque es un hecho
 * verificado por Tony el 25 de octubre de 2026 con el calendario real de la
 * Villa 1 de Bike & Bed. El .ics de Airbnb trae fechas, el código de la
 * reserva y los bloqueos, pero NO el nombre del huésped ni su correo. Si no
 * se dice acá, alguien elige esa opción creyendo que va a funcionar igual
 * que Cloudbeds y lo descubre con el huésped adentro.
 */
export interface HotelesTextos {
  titulo: string;
  bajada: string;
  nuevoTitulo: string;
  marcaHotelLabel: string;
  marcaHotelPlaceholder: string;
  codigoLabel: string;
  codigoPlaceholder: string;
  marcaExperienciaLabel: string;
  marcaExperienciaPlaceholder: string;
  correoLabel: string;
  correoPlaceholder: string;
  origenLabel: string;
  origen: Record<OrigenReservas, string>;
  avisoAirbnb: string;
  crear: string;
  creando: string;
  faltanCampos: string;
  alCrear: Record<FalloAlCrear, string>;
  listaTitulo: string;
  cargando: string;
  noSePudoLeer: string;
  etiquetaDemo: string;
  cuantos: (usuarios: number, reservas: number) => string;

  /** Las DOS direcciones del hotel. Antes solo se mostraba la del huésped. */
  dondeEntraElHuesped: string;
  dondeEntraRecepcion: string;
  sinDireccion: string;
  copiar: string;
  copiada: string;

  verEquipo: string;
  cerrarEquipo: string;
  equipoTitulo: string;
  equipoCuerpo: string;
  entra: string;
  cerrar: string;
}

export const hotelesCopy: Record<Idioma, HotelesTextos> = {
  en: {
    titulo: 'Hotels',
    bajada:
      'Create a hotel and say who works in it. A new hotel opens right away at its own address — no deploy, no new domain.',
    nuevoTitulo: 'New hotel',
    marcaHotelLabel: 'Hotel name',
    marcaHotelPlaceholder: 'ARENAL LODGE',
    codigoLabel: 'Code for the address',
    codigoPlaceholder: 'arenal',
    marcaExperienciaLabel: 'Experience name',
    marcaExperienciaPlaceholder: 'Arenal Experience',
    correoLabel: 'Email the guest writes to',
    correoPlaceholder: 'reservations@arenal.com',
    origenLabel: 'Where its bookings come from',
    origen: {
      cloudbeds: 'Cloudbeds — Airbnb, Booking, Expedia and the website come in through it',
      airbnb_ical: 'Airbnb directly — one calendar (.ics) per villa',
      ninguno: 'Nothing yet',
    },
    avisoAirbnb:
      "Airbnb's calendar brings dates, the booking code and blocks — but not the guest's name or email. With this option the guest can open the app from the TV's QR, but cannot look their stay up by last name, and nobody is greeted by name.",
    crear: 'Create hotel',
    creando: 'Creating…',
    faltanCampos: 'The hotel name and the code are needed.',
    alCrear: {
      codigo_invalido: 'The code only takes lowercase letters, numbers and dashes.',
      codigo_reservado: 'That code is one of ours. Pick another.',
      codigo_ocupado: 'There is already a hotel with that code.',
      origen_invalido: 'That source does not exist.',
      solo_plataforma: 'Only a platform account can create hotels.',
      desconocido: 'The hotel could not be created. Nothing was saved.',
    },
    listaTitulo: 'Hotels',
    cargando: 'Loading…',
    noSePudoLeer: "We couldn't load the hotels.",
    etiquetaDemo: 'Demo',
    cuantos: (usuarios, reservas) =>
      `${usuarios} ${usuarios === 1 ? 'person' : 'people'} · ${reservas} bookings`,

    dondeEntraElHuesped: 'The guest enters here',
    dondeEntraRecepcion: 'The front desk enters here',
    sinDireccion: 'No address yet',
    copiar: 'Copy',
    copiada: 'Copied',

    verEquipo: 'Who works here',
    cerrarEquipo: 'Hide who works here',
    equipoTitulo: 'Who works here',
    equipoCuerpo:
      'Only these accounts can open this hotel at the front desk. A platform account always can.',
    entra: 'Can enter',
    cerrar: 'Close',
  },
  es: {
    titulo: 'Hoteles',
    bajada:
      'Creá un hotel y decí quién trabaja en él. Un hotel nuevo abre al instante en su propia dirección — sin despliegue y sin dominio nuevo.',
    nuevoTitulo: 'Hotel nuevo',
    marcaHotelLabel: 'Nombre del hotel',
    marcaHotelPlaceholder: 'ARENAL LODGE',
    codigoLabel: 'Código para la dirección',
    codigoPlaceholder: 'arenal',
    marcaExperienciaLabel: 'Nombre de la experiencia',
    marcaExperienciaPlaceholder: 'Arenal Experience',
    correoLabel: 'Correo al que le escribe el huésped',
    correoPlaceholder: 'reservas@arenal.com',
    origenLabel: 'De dónde entran sus reservas',
    origen: {
      cloudbeds: 'Cloudbeds — por ahí entran Airbnb, Booking, Expedia y la web',
      airbnb_ical: 'Airbnb directo — un calendario (.ics) por villa',
      ninguno: 'Todavía ninguna',
    },
    avisoAirbnb:
      'El calendario de Airbnb trae fechas, el código de la reserva y los bloqueos — pero NO el nombre del huésped ni su correo. Con esta opción el huésped puede abrir la app desde el QR del televisor, pero no puede buscar su estadía por apellido, y nadie lo saluda por su nombre.',
    crear: 'Crear hotel',
    creando: 'Creando…',
    faltanCampos: 'Hacen falta el nombre del hotel y el código.',
    alCrear: {
      codigo_invalido: 'El código solo lleva minúsculas, números y guiones.',
      codigo_reservado: 'Ese código es de los nuestros. Elegí otro.',
      codigo_ocupado: 'Ya hay un hotel con ese código.',
      origen_invalido: 'Ese origen no existe.',
      solo_plataforma: 'Solo una cuenta de plataforma puede crear hoteles.',
      desconocido: 'No se pudo crear el hotel. No se guardó nada.',
    },
    listaTitulo: 'Hoteles',
    cargando: 'Cargando…',
    noSePudoLeer: 'No pudimos cargar los hoteles.',
    etiquetaDemo: 'Demo',
    cuantos: (usuarios, reservas) =>
      `${usuarios} ${usuarios === 1 ? 'persona' : 'personas'} · ${reservas} reservas`,

    dondeEntraElHuesped: 'Por acá entra el huésped',
    dondeEntraRecepcion: 'Por acá entra recepción',
    sinDireccion: 'Todavía sin dirección',
    copiar: 'Copiar',
    copiada: 'Copiada',

    verEquipo: 'Quién trabaja acá',
    cerrarEquipo: 'Ocultar quién trabaja acá',
    equipoTitulo: 'Quién trabaja acá',
    equipoCuerpo:
      'Solo estas cuentas pueden abrir este hotel en recepción. Una cuenta de plataforma siempre puede.',
    entra: 'Entra',
    cerrar: 'Cerrar',
  },
};
