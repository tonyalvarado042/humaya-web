/**
 * El texto de la sección «Pantallas del TV» en Admin.
 *
 * Vive aparte de `copy.ts` por lo mismo que `copyBot.ts`: la sección es
 * grande y así se puede leer de corrido lo que la pantalla le dice a quien
 * la usa, sin el resto en medio.
 */
export const tvCopy = {
  titulo: 'Pantallas del TV',
  cuerpo:
    'Lo que ve el huésped en el televisor de su villa: su nombre, el Wi-Fi, la foto y la guía de la casa. Cada villa tiene su pantalla.',

  // ── La lista ────────────────────────────────────────────────────────
  villa: 'Villa',
  conHuesped: (quien: string) => `Con ${quien}`,
  vacia: 'Vacía',
  apagada: 'Apagada',
  editar: 'Editar',
  cerrar: 'Cerrar',
  verPantalla: 'Ver la pantalla',

  // ── La dirección del televisor ──────────────────────────────────────
  direccionTitulo: 'La dirección de este televisor',
  direccionCuerpo:
    'Se escribe UNA vez en el televisor, en la app Guest TV. Lleva la clave de la villa: sin ella, cualquiera que adivine la dirección leería el nombre de quien duerme acá. No la pongas en un papel a la vista del huésped.',
  copiar: 'Copiar',
  copiada: 'Copiada',

  // ── El huésped ──────────────────────────────────────────────────────
  huespedTitulo: 'Quién está en la villa',
  huespedCuerpo:
    'El televisor saluda por el nombre y cuenta en qué noche va. Si lo dejás vacío, la pantalla pasa a modo «entre huéspedes» y no muestra ningún nombre.',
  huespedLabel: 'Nombre del huésped',
  huespedPlaceholder: 'Sarah Lovestad',
  llegadaLabel: 'Llegada',
  salidaLabel: 'Salida',
  checkinLabel: 'Hora de entrada',
  checkoutLabel: 'Hora de salida',
  vaciarVilla: 'Vaciar la villa',

  // ── Wi-Fi ───────────────────────────────────────────────────────────
  wifiTitulo: 'Wi-Fi',
  wifiCuerpo:
    'Sale en la pantalla y en el código QR que el huésped escanea para conectarse sin escribir nada.',
  wifiSsidLabel: 'Red',
  wifiClaveLabel: 'Clave',
  wifiSiempreLabel: 'Mostrarlo también entre huéspedes',
  wifiSiempreAyuda: 'Quien entra a limpiar o a revisar la villa también lo necesita.',

  // ── La foto ─────────────────────────────────────────────────────────
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

  // ── Los textos ──────────────────────────────────────────────────────
  textosTitulo: 'Lo que dice la pantalla',
  bienvenidaLabel: 'Mensaje de bienvenida',
  bienvenidaAyuda: 'Si lo dejás vacío, usa el del hotel.',
  notaTituloLabel: 'Nota del anfitrión · título',
  notaTextoLabel: 'Nota del anfitrión · texto',
  notaAyuda: 'Aparece como una tarjeta más en la pantalla. Vacío, no aparece.',

  // ── Guardar ─────────────────────────────────────────────────────────
  guardar: 'Guardar',
  guardando: 'Guardando…',
  guardado: 'Guardado. El televisor lo toma en menos de un minuto.',
  errorGuardar: 'No se pudo guardar. Solo un administrador puede cambiar esto.',

  // ── La guía ─────────────────────────────────────────────────────────
  guiaTitulo: 'La guía de la casa',
  guiaCuerpo:
    'Las reglas, cómo funciona la villa, los lugares cercanos, los pasos de salida y las emergencias. Es la misma para las diez pantallas, y por eso todavía no se edita acá: con una copia por villa, cambiar una regla significaría cambiarla diez veces. Hoy se cambia en la base, en humaya_tv_ajustes.',

  cargando: 'las pantallas del TV',
  vacio: 'Todavía no hay ninguna villa',
  vacioCuerpo: 'Las villas se crean en la base, en humaya_tv_villas.',
} as const;
