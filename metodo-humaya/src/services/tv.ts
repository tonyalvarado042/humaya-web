import type { CambiosVillaTv, VillaTv } from '@/types';
import { cliente, SUPABASE_URL } from './sesion';
import { elNegocio } from './negocio';

/**
 * Las pantallas de los televisores de las villas.
 *
 * ── POR QUE NO PASA POR UNA EDGE FUNCTION ───────────────────────────────
 * Porque RLS ya hace el trabajo: `humaya_tv_villas` deja leer al equipo y
 * cambiar solo a un administrador. Lo mismo que `editarServicio`. La función
 * `humaya-tv` existe para OTRA cosa: el televisor, que no tiene cuenta y no
 * puede pasar por RLS.
 *
 * ── DONDE VIVE LA PANTALLA ──────────────────────────────────────────────
 * En un Worker aparte, `tv.stayhumaya.com`. No dentro de esta app: el service
 * worker de la PWA controla su origen y se comería las rutas del televisor.
 */

/** El dominio donde está colgada la pantalla. */
export const TV_BASE = 'https://tv.stayhumaya.com';

/** La dirección exacta que se escribe en el televisor de una villa. */
export function direccionDelTv(villa: Pick<VillaTv, 'id' | 'clave'>): string {
  return `${TV_BASE}/tv/?home=${encodeURIComponent(villa.id)}&k=${encodeURIComponent(villa.clave)}`;
}

interface Fila {
  id: string;
  clave: string;
  nombre: string;
  tipo: string | null;
  anfitrion: string | null;
  wifi_ssid: string | null;
  wifi_clave: string | null;
  wifi_siempre: boolean;
  huesped: string | null;
  llegada: string | null;
  salida: string | null;
  checkin: string;
  checkout: string;
  bienvenida: string | null;
  nota_titulo: string | null;
  nota_texto: string | null;
  foto: string | null;
  reloj_posicion: VillaTv['relojPosicion'];
  habilitada: boolean;
  orden: number;
}

function aVilla(fila: Fila): VillaTv {
  return {
    id: fila.id,
    clave: fila.clave,
    nombre: fila.nombre,
    tipo: fila.tipo,
    anfitrion: fila.anfitrion,
    wifiSsid: fila.wifi_ssid,
    wifiClave: fila.wifi_clave,
    wifiSiempre: fila.wifi_siempre,
    huesped: fila.huesped,
    llegada: fila.llegada,
    salida: fila.salida,
    checkin: fila.checkin,
    checkout: fila.checkout,
    bienvenida: fila.bienvenida,
    notaTitulo: fila.nota_titulo,
    notaTexto: fila.nota_texto,
    foto: fila.foto,
    relojPosicion: fila.reloj_posicion,
    habilitada: fila.habilitada,
    orden: fila.orden,
  };
}

export async function getVillasTv(): Promise<VillaTv[]> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_tv_villas')
    .select('*')
    .eq('negocio_id', elNegocio())
    .order('orden', { ascending: true });

  if (error) throw new Error(`tv_villas_${error.code ?? 'error'}`);
  return ((data ?? []) as unknown as Fila[]).map(aVilla);
}

const COLUMNA: Record<keyof CambiosVillaTv, string> = {
  nombre: 'nombre',
  tipo: 'tipo',
  anfitrion: 'anfitrion',
  wifiSsid: 'wifi_ssid',
  wifiClave: 'wifi_clave',
  wifiSiempre: 'wifi_siempre',
  huesped: 'huesped',
  llegada: 'llegada',
  salida: 'salida',
  checkin: 'checkin',
  checkout: 'checkout',
  bienvenida: 'bienvenida',
  notaTitulo: 'nota_titulo',
  notaTexto: 'nota_texto',
  foto: 'foto',
  relojPosicion: 'reloj_posicion',
  habilitada: 'habilitada',
};

/**
 * Guarda los cambios de una villa.
 *
 * `select()` después del update no es decorativo: sin él, una fila que RLS no
 * deja tocar devuelve éxito con cero filas, y la pantalla diría que guardó
 * algo que no guardó.
 */
export async function guardarVillaTv(id: string, cambios: CambiosVillaTv): Promise<void> {
  const db = await cliente();

  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  for (const [clave, columna] of Object.entries(COLUMNA)) {
    const valor = cambios[clave as keyof CambiosVillaTv];
    if (valor !== undefined) fila[columna] = valor;
  }

  // Acotado al hotel aunque el id ya sea unico: si manana dos hoteles
  // llegaran a tener una villa con el mismo id, esto impide que uno le
  // escriba encima al otro.
  const { data, error } = await db
    .from('humaya_tv_villas')
    .update(fila)
    .eq('id', id)
    .eq('negocio_id', elNegocio())
    .select('id');

  if (error) throw new Error(`tv_villa_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('tv_villa_sin_permiso');
}

// ── La foto ─────────────────────────────────────────────────────────────

/** 16:9, el tamaño de un televisor. */
const ANCHO = 1920;
const ALTO = 1080;

/**
 * Recorta la foto a 16:9 SIN deformarla: se escala al lado que falte y se
 * recorta el sobrante por el centro. Estirar una foto para que calce es la
 * forma más rápida de que una pantalla cara se vea barata.
 *
 * Devuelve dos: la foto y una copia desenfocada. La desenfocada es lo que
 * rellena los números del reloj de vidrio; sin ella, el reloj se ve plano.
 */
export async function prepararFoto(archivo: File): Promise<{ foto: Blob; vidrio: Blob }> {
  const bitmap = await createImageBitmap(archivo);

  const dibujar = (desenfoque: number): Promise<Blob> => {
    const lienzo = document.createElement('canvas');
    lienzo.width = ANCHO;
    lienzo.height = ALTO;
    const ctx = lienzo.getContext('2d');
    if (!ctx) throw new Error('foto_sin_canvas');

    // `cover`: la escala la manda el lado que se queda corto.
    const escala = Math.max(ANCHO / bitmap.width, ALTO / bitmap.height);
    const ancho = bitmap.width * escala;
    const alto = bitmap.height * escala;
    if (desenfoque) ctx.filter = `blur(${desenfoque}px)`;
    ctx.drawImage(bitmap, (ANCHO - ancho) / 2, (ALTO - alto) / 2, ancho, alto);

    return new Promise((listo, falla) => {
      lienzo.toBlob(
        (blob) => (blob ? listo(blob) : falla(new Error('foto_sin_blob'))),
        'image/jpeg',
        desenfoque ? 0.7 : 0.86,
      );
    });
  };

  const foto = await dibujar(0);
  const vidrio = await dibujar(24);
  bitmap.close();
  return { foto, vidrio };
}

/**
 * Sube la foto de una villa y devuelve el nombre con el que quedó guardada.
 *
 * El nombre lleva la hora: si se reemplazara siempre el mismo archivo, los
 * televisores seguirían mostrando la foto vieja durante un día entero —la
 * guardan en caché— y nadie entendería por qué.
 */
export async function subirFotoTv(villaId: string, archivo: File): Promise<string> {
  const { foto, vidrio } = await prepararFoto(archivo);
  const nombre = `${villaId}-${Date.now()}`;

  const db = await cliente();
  const subir = async (ruta: string, blob: Blob) => {
    const { error } = await db.storage
      .from('humaya-tv')
      .upload(ruta, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(`tv_foto_${error.message}`);
  };

  await subir(`${nombre}.jpg`, foto);
  await subir(`${nombre}-glass.jpg`, vidrio);
  return nombre;
}

/** Cómo se ve esa foto, para mostrarla en el admin. */
export function urlDeFoto(nombre: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/humaya-tv/${encodeURIComponent(nombre)}.jpg`;
}
