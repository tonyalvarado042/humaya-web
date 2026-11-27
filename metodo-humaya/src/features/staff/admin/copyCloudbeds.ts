import type { Idioma } from '@/hooks/useIdiomaElegido';
import type { FalloCloudbeds, Sincronizacion } from '@/services/cloudbeds';

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

  /** Traer reservas sin volver a pegar la llave. */
  traer: string;
  trayendo: string;

  /** Qué pasó al final: lo que de verdad quedó, no «listo». */
  resumen: (s: Sincronizacion) => string;
  avisosFaltan: (faltan: string[]) => string;
  hayMas: string;
  llaveGuardadaPeroFallo: string;

  sinNumero: string;
  conLlave: string;
  sinLlave: string;
  reservas: string;
  noUsaCloudbeds: string;
  /** Cuando la base no devuelve ficha para este hotel. */
  sinFicha: string;

  alFallar: Record<FalloCloudbeds, string>;
}

export const cloudbedsCopy: Record<Idioma, CloudbedsTextos> = {
  en: {
    titulo: 'Cloudbeds',
    bajada:
      'This hotel’s own Cloudbeds property, with its own key. Nothing is shared with any other hotel. Bookings from Airbnb, Booking, Expedia and the website all arrive through it.',
    cargando: 'Loading…',
    noSePudoLeer: 'We could not read this. It may be a connection problem.',

    dondeSacarNumero:
      'The property number is in the URL of this hotel’s Cloudbeds panel, after /connect/. Digits only.',
    dondeSacarLlave:
      'The key: in Cloudbeds, Marketplace → API Credentials → New API Integration (redirect URI can be https://localhost), then scroll the table right to the API Key column and press Create. Cloudbeds shows it once.',

    numeroLabel: 'Property number',
    numeroPlaceholder: '000000000000000',
    conectar: 'Connect',
    conectando: 'Connecting…',

    llaveLabel: 'API key',
    llavePlaceholder: 'Paste the cbat_… key',
    llaveReemplazar: 'Type a new one to replace it',
    guardar: 'Save key',
    guardando: 'Testing the key and pulling bookings…',

    traer: 'Pull bookings again',
    trayendo: 'Pulling…',

    resumen: (s) =>
      `Key saved and accepted by Cloudbeds. ${s.reservas.guardadas} of ` +
      `${s.reservas.encontradas} bookings pulled` +
      (s.reservas.fallaron > 0 ? `, ${s.reservas.fallaron} failed` : '') +
      (s.webhooks.ok ? ', and new ones will now arrive on their own.' : '.'),
    avisosFaltan: (faltan) =>
      `These alerts did not register: ${faltan.join(', ')}. New bookings may not arrive on their own.`,
    hayMas: 'There are more bookings left. Press “Pull bookings again” to continue.',
    llaveGuardadaPeroFallo: 'The key was saved. What failed was pulling the bookings:',

    sinNumero: 'no property yet',
    conLlave: 'its own key',
    sinLlave: 'no key',
    reservas: 'bookings',
    noUsaCloudbeds: 'This hotel’s bookings do not come from Cloudbeds. Change it in Hotels.',
    sinFicha:
      'There is no Cloudbeds record for this hotel. Only platform accounts can see or change it.',

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
      sin_llave: 'This hotel has no key of its own yet. There is no shared key to fall back on.',
      llave_rechazada: 'Cloudbeds did not accept that key.',
      llave_de_otro_hotel:
        'That key belongs to a different Cloudbeds property. Each hotel needs the key issued by its own property.',
      no_contesto: 'The server did not answer. Try again.',
      desconocido: 'It did not work. Try again.',
    },
  },
  es: {
    titulo: 'Cloudbeds',
    bajada:
      'La propiedad de Cloudbeds de este hotel, con su propia llave. Nada se comparte con ningún otro hotel. Por ahí entran las reservas de Airbnb, Booking, Expedia y el sitio web.',
    cargando: 'Cargando…',
    noSePudoLeer: 'No pudimos leer esto. Puede ser un problema de conexión.',

    dondeSacarNumero:
      'El número de propiedad sale en la URL del panel de Cloudbeds de este hotel, después de /connect/. Solo dígitos.',
    dondeSacarLlave:
      'La llave: en Cloudbeds, Marketplace → API Credentials → New API Integration (en redirect URI va https://localhost), y después deslizá la tabla a la derecha hasta la columna API Key y dale Create. Cloudbeds la muestra una sola vez.',

    numeroLabel: 'Número de propiedad',
    numeroPlaceholder: '000000000000000',
    conectar: 'Conectar',
    conectando: 'Conectando…',

    llaveLabel: 'Llave de API',
    llavePlaceholder: 'Pegá la llave cbat_…',
    llaveReemplazar: 'Escribí una nueva para reemplazarla',
    guardar: 'Guardar llave',
    guardando: 'Probando la llave y trayendo las reservas…',

    traer: 'Traer las reservas otra vez',
    trayendo: 'Trayendo…',

    resumen: (s) =>
      `Llave guardada y aceptada por Cloudbeds. Se trajeron ${s.reservas.guardadas} de ` +
      `${s.reservas.encontradas} reservas` +
      (s.reservas.fallaron > 0 ? `, fallaron ${s.reservas.fallaron}` : '') +
      (s.webhooks.ok ? ', y las nuevas ya van a llegar solas.' : '.'),
    avisosFaltan: (faltan) =>
      `No quedaron registrados estos avisos: ${faltan.join(', ')}. Las reservas nuevas pueden no llegar solas.`,
    hayMas: 'Quedaron reservas sin traer. Dale a «Traer las reservas otra vez» para seguir.',
    llaveGuardadaPeroFallo: 'La llave quedó guardada. Lo que falló fue traer las reservas:',

    sinNumero: 'todavía sin propiedad',
    conLlave: 'con llave propia',
    sinLlave: 'sin llave',
    reservas: 'reservas',
    noUsaCloudbeds: 'Las reservas de este hotel no entran por Cloudbeds. Se cambia en Hoteles.',
    sinFicha:
      'Este hotel no tiene ficha de Cloudbeds. Solo las cuentas de plataforma pueden verla o cambiarla.',

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
      sin_llave:
        'Este hotel todavía no tiene llave propia. No hay ninguna llave compartida que lo cubra.',
      llave_rechazada: 'Cloudbeds no aceptó esa llave.',
      llave_de_otro_hotel:
        'Esa llave es de otra propiedad de Cloudbeds. Cada hotel necesita la llave que emite su propia propiedad.',
      no_contesto: 'El servidor no contestó. Probá de nuevo.',
      desconocido: 'No se pudo. Probá de nuevo.',
    },
  },
};
