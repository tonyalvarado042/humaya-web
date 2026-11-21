// HUMAYA · La llave de estadía: entrar desde el QR sin escribir nada
//
// ⚠️ ESTE ARCHIVO ESTÁ DOS VECES, a propósito: una copia la FIRMA
// (`humaya-tv`) y la otra la ABRE (`humaya-entrada`). Son funciones
// desplegables distintas y cada una viaja con lo suyo. Si las dos copias se
// separan, las llaves que firma una dejan de abrir en la otra y el huésped
// ve «este enlace ya no sirve» sin que nadie haya roto nada visible — de los
// errores más caros que hay. Por eso `llave.copias.test.ts` las compara
// carácter por carácter en cada `npm test`.
//
// ── QUÉ RESUELVE ──────────────────────────────────────────────────
// Tony, 21 de noviembre de 2026: «si ya la villa está ocupada y tienen los
// datos de la reservación, ¿no es mejor que automáticamente, cuando le hace
// QR, ya venga con los datos precargados?». Sí. La pantalla ya sabe quién
// está adentro; pedirle el código de Airbnb al que ya está durmiendo en la
// villa es fricción pura.
//
// ── POR QUÉ NO ALCANZA LA LLAVE DE LA VILLA ───────────────────────
// La `clave` de `humaya_tv_villas` es de la VILLA y no cambia nunca: está en
// la dirección que tiene escrita el televisor. Si el QR entrara con ella, el
// huésped de diciembre que le tomó una foto a la pantalla abriría en enero la
// estadía del huésped de enero. Por eso el QR lleva ADEMÁS esta llave, que es
// de la ESTADÍA: se vence con ella y la pantalla dibuja una nueva sola.
//
// ── QUÉ ES Y QUÉ NO ES ────────────────────────────────────────────
// Es una afirmación firmada —«en la villa X está la reserva Y, hasta el día
// Z»— que viaja a la vista de todos dentro de un QR. No es una contraseña y
// no se guarda en ninguna tabla. Quien la abre NO le cree: vuelve a
// preguntarle a la base si esa reserva sigue en esa villa. Así una reserva
// cancelada o movida deja de abrir en el acto, sin tener que revocar nada.

/** Nunca se firma con la llave de servicio directamente: de ella se deriva
 *  otra, para este uso y nada más. Si mañana hace falta firmar otra cosa,
 *  lleva su propia etiqueta y las llaves no se cruzan. */
const ETIQUETA = 'humaya.llave-estadia.v1';

const MS_POR_DIA = 86_400_000;

/** 16 bytes de HMAC-SHA256. Truncar la firma es normal y 128 bits sobran
 *  para esto; lo que se gana es un QR que se escanea de lejos, desde el sofá
 *  y no pegado al televisor. */
const BYTES_DE_FIRMA = 16;

const VILLA_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const RESERVA_RE = /^[A-Za-z0-9]{1,40}$/;

const texto = new TextEncoder();

function base64url(bytes: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function claveDe(secreto: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw',
    texto.encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const derivada = await crypto.subtle.sign('HMAC', base, texto.encode(ETIQUETA));
  return crypto.subtle.importKey('raw', derivada, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
}

async function firmaDe(secreto: string, cuerpo: string): Promise<string> {
  const firma = await crypto.subtle.sign('HMAC', await claveDe(secreto), texto.encode(cuerpo));
  return base64url(firma.slice(0, BYTES_DE_FIRMA));
}

/** Comparar sin delatar en cuánto tiempo falló. Acá el ataque por tiempos es
 *  poco realista —cada intento es un viaje por internet—, pero comparar así
 *  no cuesta nada y no hay que volver a pensarlo. */
function igualesSinApuro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i += 1) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

/** El día de una fecha ISO (`2026-12-21`), contado desde 1970. Los días del
 *  hotel son fechas sin hora: tratarlas como instantes las corre un día para
 *  medio mundo. */
export function diaDe(iso: string): number {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(ms) ? NaN : Math.floor(ms / MS_POR_DIA);
}

/** El día de hoy, para comparar contra el vencimiento. */
export function hoyEnDias(ahora: number = Date.now()): number {
  return Math.floor(ahora / MS_POR_DIA);
}

/**
 * Firma la llave que va dentro del QR.
 *
 * `vence` es un día (ver `diaDe`): el de la salida más uno, para que el QR
 * sirva hasta que el huésped se va de verdad y ni un día más.
 */
export async function firmarLlave(
  secreto: string,
  villa: string,
  reserva: string,
  vence: number,
): Promise<string | null> {
  if (!secreto || !VILLA_RE.test(villa) || !RESERVA_RE.test(reserva)) return null;
  if (!Number.isFinite(vence)) return null;
  const cuerpo = `${villa}.${reserva}.${Math.trunc(vence)}`;
  return `${cuerpo}.${await firmaDe(secreto, cuerpo)}`;
}

export interface LlaveAbierta {
  villa: string;
  reserva: string;
  vence: number;
}

/**
 * Abre la llave: devuelve qué dice, o `null` si no la firmamos nosotros o si
 * ya se venció.
 *
 * Lo que devuelve es lo que la llave AFIRMA, no un permiso. Quien la llama
 * tiene que ir a la base a comprobar que esa reserva siga en esa villa.
 */
export async function abrirLlave(
  secreto: string,
  llave: string,
  hoy: number = hoyEnDias(),
): Promise<LlaveAbierta | null> {
  if (!secreto || typeof llave !== 'string' || llave.length > 160) return null;

  const partes = llave.split('.');
  if (partes.length !== 4) return null;
  const [villa, reserva, dias, firma] = partes;
  if (!VILLA_RE.test(villa) || !RESERVA_RE.test(reserva) || !/^\d{1,7}$/.test(dias)) return null;

  const esperada = await firmaDe(secreto, `${villa}.${reserva}.${dias}`);
  if (!igualesSinApuro(firma, esperada)) return null;

  const vence = Number(dias);
  if (hoy > vence) return null;

  return { villa, reserva, vence };
}
