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
  llegaElDia: (huesped: string, cuando: string) => string;
  nadieTodavia: string;
  entroAlguienMas: string;
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

  /** El bloque del hotel, que antes era de cada villa. */
  delHotelTitulo: string;
  delHotelCuerpo: string;
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
  guiaBienvenida: string;
  guiaBienvenidaAyuda: string;
  guiaReglas: string;
  guiaReglasAyuda: string;
  guiaComoFunciona: string;
  guiaComoFuncionaAyuda: string;
  guiaSalida: string;
  guiaSalidaAyuda: string;
  guiaHora: string;
  guiaPaso: string;
  guiaAgregarPaso: string;
  guiaEmergencias: string;
  guiaEmergenciasAyuda: string;
  guiaQuien: string;
  guiaTelefono: string;
  guiaTituloCampo: string;
  guiaTextoCampo: string;
  guiaAgregar: string;
  guiaQuitar: string;
  guiaNadaTodavia: string;

  /** Crear una villa, que antes solo se podía en la base. */
  nuevaVilla: string;
  nuevaVillaAyuda: string;
  nuevaVillaNombre: string;
  nuevaVillaNombreAyuda: string;
  crearVilla: string;
  creandoVilla: string;
  faltaNombreVilla: string;
  noSePudoCrear: string;
  cancelar: string;

  /** «Alrededor»: los lugares que el televisor recomienda. */
  alrededorTitulo: string;
  alrededorCuerpo: string;
  alrededorCuantos: (lugares: number) => string;
  categoriaLabel: string;
  lugarNombre: string;
  lugarDistancia: string;
  lugarNota: string;
  agregarLugar: string;
  quitarLugar: string;
  agregarCategoria: string;
  quitarCategoria: string;
  alrededorVacio: string;

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
    llegaElDia: (huesped, cuando) => `Llega el ${cuando}: ${huesped}.`,
    nadieTodavia: 'No hay ninguna reserva con esta villa asignada.',
    entroAlguienMas: '¿Entró alguien que no está en Cloudbeds?',
    deLaReservaFechas: (desde, hasta) => `Del ${desde} al ${hasta}.`,
    insigniaReserva: 'Automático',
    sinReserva:
      'Escribilo solo si entró alguien que todavía no está en Cloudbeds. En cuanto la reserva aparezca, manda la reserva.',
    horarioTitulo: 'Horario de la casa',
    huespedLabel: 'Nombre del huésped',
    huespedPlaceholder: 'Sarah Lovestad',
    llegadaLabel: 'Llegada',
    salidaLabel: 'Salida',
    checkinLabel: 'Hora de entrada',
    checkoutLabel: 'Hora de salida',
    vaciarVilla: 'Vaciar la villa',

    // ── Wi-Fi ─────────────────────────────────────────────────────────
    delHotelTitulo: 'Wi-Fi y foto, para todas las pantallas',
    delHotelCuerpo:
      'Se llena una sola vez y vale para las villas del hotel. Antes estaba en cada una: diez copias del mismo dato, y cambiar la clave del Wi-Fi eran diez ediciones.',
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
    fotoPorDefecto: 'Están usando la foto que viene con la pantalla.',
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
    alrededorTitulo: 'Alrededor',
    alrededorCuerpo:
      'Lo que el televisor le recomienda al huésped: dónde comer, qué hacer, las aguas termales. Es una sola lista para todas las pantallas del hotel, y se ve también en el teléfono del huésped.',
    alrededorCuantos: (lugares) => (lugares === 1 ? '1 lugar' : `${lugares} lugares`),
    categoriaLabel: 'Categoría',
    lugarNombre: 'Lugar',
    lugarDistancia: 'A qué distancia',
    lugarNota: 'Qué decirle al huésped',
    agregarLugar: 'Agregar lugar',
    quitarLugar: 'Quitar',
    agregarCategoria: 'Agregar categoría',
    quitarCategoria: 'Quitar la categoría',
    alrededorVacio: 'Todavía no hay ningún lugar.',

    guiaTitulo: 'La guía de la casa',
    guiaCuerpo:
      'Las reglas, cómo funciona la villa, los pasos de salida y las emergencias. Es la misma para todas las pantallas del hotel: cambiarla acá la cambia en todos los televisores a la vez.',
    guiaBienvenida: 'El saludo',
    guiaBienvenidaAyuda:
      'Lo primero que lee el huésped al encender el televisor. Una villa puede poner el suyo propio en «Editar».',
    guiaReglas: 'Las reglas de la casa',
    guiaReglasAyuda: 'Silencio, áreas comunes, fumado, animales, visitas.',
    guiaComoFunciona: 'Cómo funciona la villa',
    guiaComoFuncionaAyuda: 'El Wi-Fi, el aire, la cafetera, lo que haya que explicar.',
    guiaSalida: 'La salida',
    guiaSalidaAyuda:
      'Lo que le pedimos al huésped antes de irse. ⚠️ La hora de acá es la que muestra la tarjeta de la guía; la hora real de cada villa se pone en «Editar», y son dos campos distintos: si no coinciden, el televisor muestra las dos.',
    guiaHora: 'La hora que muestra la guía',
    guiaPaso: 'Paso',
    guiaAgregarPaso: 'Agregar paso',
    guiaEmergencias: 'Emergencias',
    guiaEmergenciasAyuda: 'A quién llamar. Un teléfono equivocado acá es peor que ninguno.',
    guiaQuien: 'Quién',
    guiaTelefono: 'Teléfono',
    guiaTituloCampo: 'Título',
    guiaTextoCampo: 'Qué dice',
    guiaAgregar: 'Agregar',
    guiaQuitar: 'Quitar',
    guiaNadaTodavia: 'Todavía no hay nada acá.',

    nuevaVilla: 'Agregar villa',
    nuevaVillaAyuda:
      'Se crea con su clave y su dirección para el televisor. Todo lo demás —el Wi-Fi, la foto, el mensaje— se llena después, en Editar.',
    nuevaVillaNombre: 'Nombre de la villa',
    nuevaVillaNombreAyuda:
      'Como la va a ver el huésped en la pantalla. Por ejemplo: V1 · CAPI CAPI.',
    crearVilla: 'Crear la villa',
    creandoVilla: 'Creando…',
    faltaNombreVilla: 'Ponele un nombre.',
    noSePudoCrear: 'No se pudo crear. Solo un administrador puede.',
    cancelar: 'Cancelar',

    cargando: 'las pantallas del TV',
    vacio: 'Todavía no hay ninguna villa',
    vacioCuerpo: 'Agregá la primera acá abajo y la pantalla de su televisor queda lista.',

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
    llegaElDia: (huesped, cuando) => `Arrives on ${cuando}: ${huesped}.`,
    nadieTodavia: 'No booking has this villa assigned.',
    entroAlguienMas: 'Did someone check in who is not in Cloudbeds?',
    deLaReservaFechas: (desde, hasta) => `From ${desde} to ${hasta}.`,
    insigniaReserva: 'Automatic',
    sinReserva:
      'Write this only if someone checked in who is not in Cloudbeds yet. As soon as the booking shows up, the booking wins.',
    horarioTitulo: 'House hours',
    huespedLabel: 'Guest name',
    huespedPlaceholder: 'Sarah Lovestad',
    llegadaLabel: 'Arrival',
    salidaLabel: 'Departure',
    checkinLabel: 'Check-in time',
    checkoutLabel: 'Check-out time',
    vaciarVilla: 'Empty the villa',

    delHotelTitulo: 'Wi-Fi and photo, for every screen',
    delHotelCuerpo:
      'Filled once and it applies to the hotel’s villas. It used to be on each one: ten copies of the same thing, and changing the Wi-Fi password meant ten edits.',
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
    fotoPorDefecto: 'They are using the photo that ships with the screen.',
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

    alrededorTitulo: 'Around here',
    alrededorCuerpo:
      'What the television recommends to the guest: where to eat, what to do, the hot springs. It is one list for every screen in the hotel, and it also shows on the guest’s phone.',
    alrededorCuantos: (lugares) => (lugares === 1 ? '1 place' : `${lugares} places`),
    categoriaLabel: 'Category',
    lugarNombre: 'Place',
    lugarDistancia: 'How far',
    lugarNota: 'What to tell the guest',
    agregarLugar: 'Add place',
    quitarLugar: 'Remove',
    agregarCategoria: 'Add category',
    quitarCategoria: 'Remove the category',
    alrededorVacio: 'There are no places yet.',

    guiaBienvenida: 'The welcome',
    guiaBienvenidaAyuda:
      'The first thing the guest reads when the TV turns on. A villa can set its own in “Edit”.',
    guiaReglas: 'House rules',
    guiaReglasAyuda: 'Quiet hours, shared areas, smoking, wildlife, visitors.',
    guiaComoFunciona: 'How the villa works',
    guiaComoFuncionaAyuda: 'Wi-Fi, air conditioning, the coffee maker, whatever needs explaining.',
    guiaSalida: 'Check-out',
    guiaSalidaAyuda:
      'What we ask the guest to do before leaving. ⚠️ The time here is the one the guide card shows; each villa’s real check-out time is set under “Edit”, and they are two separate fields: if they disagree, the television shows both.',
    guiaHora: 'The time the guide shows',
    guiaPaso: 'Step',
    guiaAgregarPaso: 'Add step',
    guiaEmergencias: 'Emergencies',
    guiaEmergenciasAyuda: 'Who to call. A wrong number here is worse than none.',
    guiaQuien: 'Who',
    guiaTelefono: 'Phone',
    guiaTituloCampo: 'Title',
    guiaTextoCampo: 'What it says',
    guiaAgregar: 'Add',
    guiaQuitar: 'Remove',
    guiaNadaTodavia: 'Nothing here yet.',

    nuevaVilla: 'Add villa',
    nuevaVillaAyuda:
      'It is created with its key and its TV address. Everything else — Wi-Fi, photo, message — is filled in afterwards, under Edit.',
    nuevaVillaNombre: 'Villa name',
    nuevaVillaNombreAyuda: 'As the guest will see it on screen. For example: V1 · CAPI CAPI.',
    crearVilla: 'Create the villa',
    creandoVilla: 'Creating…',
    faltaNombreVilla: 'Give it a name.',
    noSePudoCrear: 'It could not be created. Only an administrator can.',
    cancelar: 'Cancel',

    guiaTitulo: 'The house guide',
    guiaCuerpo:
      'The rules, how the villa works, the check-out steps and emergencies. It is the same for every screen in the hotel: changing it here changes it on every television at once.',

    cargando: 'the TV screens',
    vacio: 'There are no villas yet',
    vacioCuerpo: 'Add the first one below and its TV screen is ready.',

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
