import type { Idioma } from '@/hooks/useIdiomaElegido';
import type { FalloCloudbeds } from '@/services/cloudbeds';

export interface CloudbedsTextos {
  titulo: string;
  bajada: string;
  cargando: string;
  noSePudoLeer: string;

  /** Lo que se explica una vez, arriba, y no en cada hotel. */
  dondeSacarNumero: string;
  dondeSacarLlave: string;

  numeroLabel: string;
  numeroPlaceholder: string;
  conectar: string;
  conectando: string;

  llaveLabel: string;
  llavePlaceholder: string;
  llaveReemplazar: string;
  guardar: string;
  guardando: string;
  guardada: string;

  sinNumero: string;
  conLlave: string;
  usaLaGeneral: string;
  sinLlave: string;
  reservas: string;
  noUsaCloudbeds: string;

  alFallar: Record<FalloCloudbeds, string>;
}

export const cloudbedsCopy: Record<Idioma, CloudbedsTextos> = {
  en: {
    titulo: 'Cloudbeds',
    bajada:
      'Each hotel connects to its own Cloudbeds property. Bookings from Airbnb, Booking, Expedia and the website all arrive through it.',
    cargando: 'Loading…',
    noSePudoLeer: 'We could not read this. It may be a connection problem.',

    dondeSacarNumero:
      'The property number is in the URL of that hotel’s Cloudbeds panel, after /connect/. Digits only.',
    dondeSacarLlave:
      'The key: in Cloudbeds, Marketplace → API Credentials → New API Integration (redirect URI can be https://localhost), then scroll the table right to the API Key column and press Create. Cloudbeds shows it once.',

    numeroLabel: 'Property number',
    numeroPlaceholder: '283417337204929',
    conectar: 'Connect',
    conectando: 'Connecting…',

    llaveLabel: 'API key',
    llavePlaceholder: 'Paste the cbat_… key',
    llaveReemplazar: 'Type a new one to replace it',
    guardar: 'Save key',
    guardando: 'Saving…',
    guardada: 'Key saved. It cannot be read again — not even here.',

    sinNumero: 'no property yet',
    conLlave: 'its own key',
    usaLaGeneral: 'uses the general key',
    sinLlave: 'no key',
    reservas: 'bookings',
    noUsaCloudbeds: 'This hotel’s bookings do not come from Cloudbeds. Change it in Hotels.',

    alFallar: {
      solo_plataforma: 'Only a platform account can connect a hotel.',
      property_id_invalido:
        'The Cloudbeds property number is digits only — between 6 and 24 of them. Check you did not paste the whole URL.',
      property_id_de_otro_hotel:
        'That property already belongs to another hotel. Two hotels cannot share one Cloudbeds property.',
      hotel_no_existe: 'That hotel no longer exists.',
      propiedad_no_registrada: 'Connect the property number first, then save its key.',
      llave_vacia: 'The key is empty.',
      llave_muy_corta: 'That key looks cut off. Cloudbeds keys are long — copy it whole.',
      desconocido: 'It did not work. Try again.',
    },
  },
  es: {
    titulo: 'Cloudbeds',
    bajada:
      'Cada hotel se conecta con su propia propiedad de Cloudbeds. Por ahí entran las reservas de Airbnb, Booking, Expedia y el sitio web.',
    cargando: 'Cargando…',
    noSePudoLeer: 'No pudimos leer esto. Puede ser un problema de conexión.',

    dondeSacarNumero:
      'El número de propiedad sale en la URL del panel de Cloudbeds de ese hotel, después de /connect/. Solo dígitos.',
    dondeSacarLlave:
      'La llave: en Cloudbeds, Marketplace → API Credentials → New API Integration (en redirect URI va https://localhost), y después deslizá la tabla a la derecha hasta la columna API Key y dale Create. Cloudbeds la muestra una sola vez.',

    numeroLabel: 'Número de propiedad',
    numeroPlaceholder: '283417337204929',
    conectar: 'Conectar',
    conectando: 'Conectando…',

    llaveLabel: 'Llave de API',
    llavePlaceholder: 'Pegá la llave cbat_…',
    llaveReemplazar: 'Escribí una nueva para reemplazarla',
    guardar: 'Guardar llave',
    guardando: 'Guardando…',
    guardada: 'Llave guardada. No se puede volver a leer — ni acá.',

    sinNumero: 'todavía sin propiedad',
    conLlave: 'con llave propia',
    usaLaGeneral: 'usa la llave general',
    sinLlave: 'sin llave',
    reservas: 'reservas',
    noUsaCloudbeds: 'Las reservas de este hotel no entran por Cloudbeds. Se cambia en Hoteles.',

    alFallar: {
      solo_plataforma: 'Solo una cuenta de plataforma puede conectar un hotel.',
      property_id_invalido:
        'El número de propiedad de Cloudbeds son solo dígitos, entre 6 y 24. Fijate que no hayas pegado la URL entera.',
      property_id_de_otro_hotel:
        'Esa propiedad ya es de otro hotel. Dos hoteles no pueden compartir una propiedad de Cloudbeds.',
      hotel_no_existe: 'Ese hotel ya no existe.',
      propiedad_no_registrada: 'Primero conectá el número de propiedad, después guardá su llave.',
      llave_vacia: 'La llave viene vacía.',
      llave_muy_corta: 'Esa llave se ve cortada. Las de Cloudbeds son largas — copiala entera.',
      desconocido: 'No se pudo. Probá de nuevo.',
    },
  },
};
