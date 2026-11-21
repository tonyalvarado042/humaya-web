import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * El texto de la sección «Pantallas del TV» en Admin.
 *
 * Vive aparte de `copy.ts` por lo mismo que `copyBot.ts`: la sección es
 * grande y así se puede leer de corrido lo que la pantalla le dice a quien
 * la usa, sin el resto en medio.
 */
export interface TvTextos {
  titulo: string;
  cuerpo: string;

  villa: string;
  conHuesped: (quien: string) => string;
  vacia: string;
  apagada: string;
  editar: string;
  cerrar: string;
  verPantalla: string;

  direccionTitulo: string;
  direccionCuerpo: string;
  copiar: string;
  copiada: string;

  huespedTitulo: string;
  huespedCuerpo: string;
  deLaReserva: (huesped: string) => string;
  deLaReservaFechas: (desde: string, hasta: string) => string;
  insigniaReserva: string;
  sinReserva: string;
  horarioTitulo: string;
  huespedLabel: string;
  huespedPlaceholder: string;
  llegadaLabel: string;
  salidaLabel: string;
  checkinLabel: string;
  checkoutLabel: string;
  vaciarVilla: string;

  wifiTitulo: string;
  wifiCuerpo: string;
  wifiSsidLabel: string;
  wifiClaveLabel: string;
  wifiSiempreLabel: string;
  wifiSiempreAyuda: string;

  fotoTitulo: string;
  fotoCuerpo: string;
  fotoElegir: string;
  fotoSubiendo: string;
  fotoPorDefecto: string;
  fotoError: string;
  relojTitulo: string;
  relojCuerpo: string;
  relojIzquierda: string;
  relojCentro: string;
  relojDerecha: string;

  textosTitulo: string;
  bienvenidaLabel: string;
  bienvenidaAyuda: string;
  notaTituloLabel: string;
  notaTextoLabel: string;
  notaAyuda: string;

  guardar: string;
  guardando: string;
  guardado: string;
  errorGuardar: string;

  guiaTitulo: string;
  guiaCuerpo: string;

  cargando: string;
  vacio: string;
  vacioCuerpo: string;

  /** Qué hay que hacerle al televisor. Siempre visible, no escondido. */
  instructivoTitulo: string;
  instructivoCuerpo: string;
  instructivoPaso1: string;
  instructivoPaso2: string;
  instructivoPaso3: string;
}

export const tvCopy: Record<Idioma, TvTextos> = {
  es: {
    titulo: 'Pantallas del TV',
    cuerpo:
      'Lo que ve el huésped en el televisor de su villa: su nombre, el Wi-Fi, la foto y la guía de la casa. Cada villa tiene su pantalla.',

    // ── La lista ──────────────────────────────────────────────────────
    villa: 'Villa',
    conHuesped: (quien) => `Con ${quien}`,
    vacia: 'Vacía',
    apagada: 'Apagada',
    editar: 'Editar',
    cerrar: 'Cerrar',
    verPantalla: 'Ver la pantalla',

    // ── La dirección del televisor ────────────────────────────────────
    direccionTitulo: 'La dirección de este televisor',
    direccionCuerpo:
      'Se escribe UNA vez en el televisor, en la app Guest TV. Lleva la clave de la villa: sin ella, cualquiera que adivine la dirección leería el nombre de quien duerme acá. No la pongas en un papel a la vista del huésped.',
    copiar: 'Copiar',
    copiada: 'Copiada',

    // ── El huésped ────────────────────────────────────────────────────
    huespedTitulo: 'Quién está en la villa',
    huespedCuerpo:
      'El televisor saluda por el nombre y cuenta en qué noche va. Esto se llena solo con las reservas: la pantalla toma el nombre y las fechas de quien tenga esta villa asignada en Cloudbeds.',
    deLaReserva: (huesped) => `${huesped}, de la reserva de Cloudbeds.`,
    deLaReservaFechas: (desde, hasta) => `Del ${desde} al ${hasta}.`,
    insigniaReserva: 'Automático',
    sinReserva:
      'Hoy ninguna reserva tiene esta villa asignada. Si entró alguien que todavía no está en Cloudbeds, escribilo acá abajo; en cuanto la reserva aparezca, manda la reserva.',
    horarioTitulo: 'Horario de la casa',
    huespedLabel: 'Nombre del huésped',
    huespedPlaceholder: 'Sarah Lovestad',
    llegadaLabel: 'Llegada',
    salidaLabel: 'Salida',
    checkinLabel: 'Hora de entrada',
    checkoutLabel: 'Hora de salida',
    vaciarVilla: 'Vaciar la villa',

    // ── Wi-Fi ─────────────────────────────────────────────────────────
    wifiTitulo: 'Wi-Fi',
    wifiCuerpo:
      'Sale en la pantalla y en el código QR que el huésped escanea para conectarse sin escribir nada.',
    wifiSsidLabel: 'Red',
    wifiClaveLabel: 'Clave',
    wifiSiempreLabel: 'Mostrarlo también entre huéspedes',
    wifiSiempreAyuda: 'Quien entra a limpiar o a revisar la villa también lo necesita.',

    // ── La foto ───────────────────────────────────────────────────────
    fotoTitulo: 'Foto de fondo',
    fotoCuerpo:
      'Se recorta a 16:9 por el centro, sin deformarla. También se guarda una copia desenfocada: es la que rellena los números del reloj.',
    fotoElegir: 'Subir una foto',
    fotoSubiendo: 'Subiendo…',
    fotoPorDefecto: 'Está usando la foto que viene con la pantalla.',
    fotoError: 'No se pudo subir la foto. Probá de nuevo.',
    relojTitulo: 'Dónde va el reloj',
    relojCuerpo: 'Si la foto trae el logo en el centro, el reloj se corre para no taparlo.',
    relojIzquierda: 'Izquierda',
    relojCentro: 'Centro',
    relojDerecha: 'Derecha',

    // ── Los textos ────────────────────────────────────────────────────
    textosTitulo: 'Lo que dice la pantalla',
    bienvenidaLabel: 'Mensaje de bienvenida',
    bienvenidaAyuda: 'Si lo dejás vacío, usa el del hotel.',
    notaTituloLabel: 'Nota del anfitrión · título',
    notaTextoLabel: 'Nota del anfitrión · texto',
    notaAyuda: 'Aparece como una tarjeta más en la pantalla. Vacío, no aparece.',

    // ── Guardar ───────────────────────────────────────────────────────
    guardar: 'Guardar',
    guardando: 'Guardando…',
    guardado: 'Guardado. El televisor lo toma en menos de un minuto.',
    errorGuardar: 'No se pudo guardar. Solo un administrador puede cambiar esto.',

    // ── La guía ───────────────────────────────────────────────────────
    guiaTitulo: 'La guía de la casa',
    guiaCuerpo:
      'Las reglas, cómo funciona la villa, los lugares cercanos, los pasos de salida y las emergencias. Es la misma para todas las pantallas del hotel, y por eso todavía no se edita acá: con una copia por villa, cambiar una regla significaría cambiarla en cada una. Hoy se cambia en la base, en humaya_tv_ajustes.',

    cargando: 'las pantallas del TV',
    vacio: 'Todavía no hay ninguna villa',
    vacioCuerpo: 'Las villas se crean en la base, en humaya_tv_villas.',

    instructivoTitulo: 'Cómo se prepara un televisor',
    instructivoCuerpo:
      'Se hace una sola vez por televisor, y no hace falta ninguna computadora en el hotel.',
    instructivoPaso1:
      'En el televisor (Google TV o Android TV), abrir Downloader y bajar la app Guest TV con el código 1061533.',
    instructivoPaso2:
      'Abrir Guest TV y escribir la dirección de esa villa, la que aparece acá abajo al tocar Editar. Lleva la clave: se escribe una sola vez y no se deja a la vista del huésped.',
    instructivoPaso3:
      'Listo. Desde la pantalla se abren Netflix, YouTube y las demás apps, y el nombre del huésped entra solo con las reservas.',
  },

  en: {
    titulo: 'TV screens',
    cuerpo:
      'What the guest sees on the television in their villa: their name, the Wi-Fi, the photo and the house guide. Each villa has its own screen.',

    villa: 'Villa',
    conHuesped: (quien) => `With ${quien}`,
    vacia: 'Empty',
    apagada: 'Off',
    editar: 'Edit',
    cerrar: 'Close',
    verPantalla: 'View the screen',

    direccionTitulo: 'This television’s address',
    direccionCuerpo:
      'It is typed ONCE into the television, in the Guest TV app. It carries the villa’s key: without it, anyone who guessed the address would read the name of whoever sleeps here. Do not leave it on paper where the guest can see it.',
    copiar: 'Copy',
    copiada: 'Copied',

    huespedTitulo: 'Who is in the villa',
    huespedCuerpo:
      'The television greets them by name and tells them which night they are on. This fills itself from the bookings: the screen takes the name and the dates from whoever has this villa assigned in Cloudbeds.',
    deLaReserva: (huesped) => `${huesped}, from the Cloudbeds booking.`,
    deLaReservaFechas: (desde, hasta) => `From ${desde} to ${hasta}.`,
    insigniaReserva: 'Automatic',
    sinReserva:
      'No booking has this villa assigned today. If someone checked in who is not in Cloudbeds yet, write it below; as soon as the booking shows up, the booking wins.',
    horarioTitulo: 'House hours',
    huespedLabel: 'Guest name',
    huespedPlaceholder: 'Sarah Lovestad',
    llegadaLabel: 'Arrival',
    salidaLabel: 'Departure',
    checkinLabel: 'Check-in time',
    checkoutLabel: 'Check-out time',
    vaciarVilla: 'Empty the villa',

    wifiTitulo: 'Wi-Fi',
    wifiCuerpo:
      'It shows on the screen and in the QR code the guest scans to connect without typing anything.',
    wifiSsidLabel: 'Network',
    wifiClaveLabel: 'Password',
    wifiSiempreLabel: 'Show it between guests too',
    wifiSiempreAyuda: 'Whoever comes in to clean or check the villa needs it as well.',

    fotoTitulo: 'Background photo',
    fotoCuerpo:
      'It is cropped to 16:9 from the center, without distorting it. A blurred copy is also stored: that is the one that fills the numbers on the clock.',
    fotoElegir: 'Upload a photo',
    fotoSubiendo: 'Uploading…',
    fotoPorDefecto: 'It is using the photo that ships with the screen.',
    fotoError: 'The photo could not be uploaded. Try again.',
    relojTitulo: 'Where the clock goes',
    relojCuerpo:
      'If the photo has the logo in the center, the clock moves aside so as not to cover it.',
    relojIzquierda: 'Left',
    relojCentro: 'Center',
    relojDerecha: 'Right',

    textosTitulo: 'What the screen says',
    bienvenidaLabel: 'Welcome message',
    bienvenidaAyuda: 'If you leave it empty, it uses the hotel’s.',
    notaTituloLabel: 'Host note · title',
    notaTextoLabel: 'Host note · text',
    notaAyuda: 'It shows as one more card on the screen. Empty, it does not show.',

    guardar: 'Save',
    guardando: 'Saving…',
    guardado: 'Saved. The television picks it up in under a minute.',
    errorGuardar: 'It could not be saved. Only an administrator can change this.',

    guiaTitulo: 'The house guide',
    guiaCuerpo:
      'The rules, how the villa works, the places nearby, the check-out steps and emergencies. It is the same for every screen in the hotel, which is why it is not edited here yet: with one copy per villa, changing a rule would mean changing it in each one. Today it is changed in the database, in humaya_tv_ajustes.',

    cargando: 'the TV screens',
    vacio: 'There are no villas yet',
    vacioCuerpo: 'Villas are created in the database, in humaya_tv_villas.',

    instructivoTitulo: 'How to set up a television',
    instructivoCuerpo: 'Done once per television, and no computer is needed in the hotel.',
    instructivoPaso1:
      'On the television (Google TV or Android TV), open Downloader and get the Guest TV app with code 1061533.',
    instructivoPaso2:
      'Open Guest TV and type that villa’s address, the one shown below when you press Edit. It carries the key: typed once, and never left where the guest can see it.',
    instructivoPaso3:
      'That is it. Netflix, YouTube and the other apps open from the screen, and the guest name arrives on its own from the bookings.',
  },
};
