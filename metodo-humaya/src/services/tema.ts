/**
 * La marca visual de cada hotel: colores y tipografía.
 *
 * ── POR QUÉ NO SON LOS CUARENTA TOKENS ──────────────────────────────────
 * `styles/tokens.css` define unas cuarenta variables. Un formulario de
 * cuarenta colores no lo llena nadie, y la mayoría —los bordes, los estados
 * de alerta— no definen una marca: la definen el acento y los fondos.
 *
 * Un hotel pisa lo que quiera de este puñado. **Lo que no manda, no se
 * toca**: su tema vacío no es un olvido, es «usá la paleta de siempre».
 *
 * ── POR QUÉ EL ACENTO SON DOS CAMPOS Y NO UNO ───────────────────────────
 * Porque `--gold` NO es el mismo color en los dos temas, y eso no es un
 * descuido de la paleta: en la app del huésped vale `#c8a565` (dorado claro
 * sobre negro) y en recepción `#87672e` (dorado oscuro sobre blanco). El
 * mismo hex en los dos lados deja uno de los dos ilegible.
 *
 * Así que se piden dos: el acento sobre fondo oscuro y el acento sobre fondo
 * claro. `acentoStaff` puede quedar vacío —se usa el mismo— y el formulario
 * mide el contraste y lo dice cuando eso no se lee.
 *
 * ── POR QUÉ LOS DORADOS DERIVADOS NO SE PIDEN ───────────────────────────
 * `--gold-bright`, `--gold-dim` y `--gold-track` son el mismo color más
 * claro, más apagado y casi disuelto en el fondo. Pedirlos sería pedir
 * cuatro colores para elegir uno, y dejarlos quietos haría que un hotel
 * verde tuviera bordes dorados. Se derivan con `color-mix()`, que ya
 * entienden todos los navegadores que esta app soporta.
 *
 * ── POR QUÉ SE APLICA ANTES DE PINTAR ───────────────────────────────────
 * Por lo mismo que el nombre. Aplicarlo después haría que el huésped viera
 * la paleta de OTRO hotel durante un instante, que es peor que cualquier
 * color.
 *
 * ── LA REGLA QUE ESTO NO ROMPE ──────────────────────────────────────────
 * ARCHITECTURE.md dice: ningún color hex suelto fuera de `tokens.css`. Sigue
 * valiendo. Acá no hay ni un hex escrito: solo se copian los que mandó el
 * hotel a las variables que `tokens.css` ya definió. `white` y `black`
 * aparecen dentro de `color-mix` como «más claro» y «más oscuro», que es
 * estructura, no marca.
 */

export interface Tema {
  /** El acento sobre fondo oscuro: la app del huésped y la barra lateral. */
  acento?: string;
  /** El acento sobre fondo claro: recepción. Vacío usa el mismo `acento`. */
  acentoStaff?: string;
  /** El texto encima de un botón lleno de acento. */
  sobreAcento?: string;

  huespedFondo?: string;
  huespedSuperficie?: string;
  huespedTexto?: string;

  staffFondo?: string;
  staffTexto?: string;

  fuenteTitulos?: string;
  fuenteTexto?: string;
  /** Si las fuentes hay que bajarlas de Google en vez de las que ya vienen. */
  fuenteGoogle?: boolean;

  /**
   * El logo largo, para fondos oscuros, y el cuadrado.
   *
   * ── POR QUÉ SON DATO Y NO CÓDIGO ────────────────────────────────────────
   * Porque lo eran y estaba mal: `HumayaLogo` pintaba `/wordmark-white.png`
   * siempre, así que el hotel demo mostraba el logotipo de HUMAYA en la barra
   * de recepción y en el Home del huésped. Comprobado en vivo el 21 de
   * noviembre de 2026.
   *
   * Un hotel sin logo propio NO muestra el de otro: muestra su nombre.
   */
  logo?: string;
  logoMarca?: string;
}

/** Un color de verdad y no cualquier texto: esto termina dentro de una hoja de estilos. */
const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Una dirección de imagen que se puede poner en un `src`.
 *
 * Solo una ruta de este mismo sitio o un `https://`. Sin esto, un `tema`
 * escrito a mano podría meter `javascript:` en el `src` de una etiqueta que
 * se pinta en todas las pantallas.
 */
const IMAGEN = /^(\/[A-Za-z0-9._/-]{1,200}|https:\/\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]{1,400})$/;

export function esImagen(valor: unknown): valor is string {
  return typeof valor === 'string' && IMAGEN.test(valor.trim());
}

/** Un nombre de fuente, sin comillas ni nada que cierre una declaración CSS. */
const NOMBRE_DE_FUENTE = /^[A-Za-z0-9 ]{1,40}$/;

export function esColor(valor: unknown): valor is string {
  return typeof valor === 'string' && HEX.test(valor.trim());
}

export function esFuente(valor: unknown): valor is string {
  return typeof valor === 'string' && NOMBRE_DE_FUENTE.test(valor.trim());
}

/** Lo que mandó el hotel, o nada, pero nunca un texto que no sea un color. */
function color(tema: Tema, campo: keyof Tema): string | null {
  const valor = tema[campo];
  return esColor(valor) ? valor.trim() : null;
}

/**
 * Las declaraciones del tema del huésped (fondo oscuro).
 *
 * El acento se reparte en cinco variables porque en la paleta el dorado es
 * una familia y no un color: el botón, su versión encendida, la apagada de
 * los bordes, la casi invisible de las barras de progreso, y la que va sobre
 * la barra lateral —que es oscura en los dos lados, así que ahí vale el mismo
 * acento del lado oscuro.
 */
function declaracionesHuesped(tema: Tema): string[] {
  const lineas: string[] = [];
  const acento = color(tema, 'acento');

  if (acento) {
    lineas.push(`--gold:${acento};`);
    lineas.push(`--gold-bright:color-mix(in oklab, ${acento} 72%, white);`);
    lineas.push(`--gold-dim:color-mix(in oklab, ${acento} 55%, var(--bg));`);
    lineas.push(`--gold-track:color-mix(in oklab, ${acento} 18%, var(--bg));`);
    lineas.push(`--gold-on-ink:color-mix(in oklab, ${acento} 82%, white);`);
  }

  const fondo = color(tema, 'huespedFondo');
  if (fondo) {
    lineas.push(`--bg:${fondo};`);
    // El fondo de la barra lateral es el mismo fondo un poco más hundido. Sin
    // esto, un hotel con fondo verde tendría la barra negra de Humaya.
    lineas.push(`--nav:color-mix(in oklab, ${fondo} 88%, black);`);
  }

  const superficie = color(tema, 'huespedSuperficie');
  if (superficie) {
    lineas.push(`--surface:${superficie};`);
    lineas.push(`--surface-raised:color-mix(in oklab, ${superficie} 88%, white);`);
    lineas.push(`--surface-sunken:color-mix(in oklab, ${superficie} 88%, black);`);
    lineas.push(`--ink:${superficie};`);
  }

  const texto = color(tema, 'huespedTexto');
  if (texto) {
    lineas.push(`--text:${texto};`);
    lineas.push(`--on-ink:${texto};`);
    lineas.push(`--muted:color-mix(in oklab, ${texto} 64%, var(--bg));`);
    lineas.push(`--muted-soft:color-mix(in oklab, ${texto} 52%, var(--bg));`);
    lineas.push(`--ink-muted:color-mix(in oklab, ${texto} 64%, var(--bg));`);
  }

  return lineas;
}

/** Las declaraciones del tema de recepción (fondo claro). */
function declaracionesStaff(tema: Tema): string[] {
  const lineas: string[] = [];

  // Sin acento propio se usa el del otro lado. No es lo ideal —puede no
  // leerse sobre blanco— y por eso el formulario mide el contraste y avisa;
  // pero un acento de otra marca sería peor que uno con poco contraste.
  const acento = color(tema, 'acentoStaff') ?? color(tema, 'acento');

  if (acento) {
    lineas.push(`--gold:${acento};`);
    lineas.push(`--gold-bright:color-mix(in oklab, ${acento} 80%, black);`);
    lineas.push(`--gold-dim:color-mix(in oklab, ${acento} 55%, white);`);
    lineas.push(`--gold-track:color-mix(in oklab, ${acento} 15%, white);`);
  }

  // La barra lateral de recepción es oscura, así que el acento que va encima
  // es el del lado oscuro y no el de recepción.
  const sobreOscuro = color(tema, 'acento');
  if (sobreOscuro) {
    lineas.push(`--gold-on-ink:color-mix(in oklab, ${sobreOscuro} 82%, white);`);
    lineas.push(`--nav:color-mix(in oklab, ${sobreOscuro} 12%, black);`);
  }

  const fondo = color(tema, 'staffFondo');
  if (fondo) lineas.push(`--bg:${fondo};`);

  const texto = color(tema, 'staffTexto');
  if (texto) {
    lineas.push(`--text:${texto};`);
    lineas.push(`--ink:${texto};`);
    lineas.push(`--muted:color-mix(in oklab, ${texto} 62%, var(--bg));`);
    lineas.push(`--muted-soft:color-mix(in oklab, ${texto} 54%, var(--bg));`);
  }

  return lineas;
}

/**
 * El CSS que pisa la paleta por defecto.
 *
 * Se arma como texto y se mete en una etiqueta `<style>` en vez de tocar
 * `document.documentElement.style`: los tokens viven en `[data-theme=...]`,
 * y un estilo en línea sobre `<html>` no los alcanza.
 *
 * **Todo valor pasa por una expresión regular antes de entrar.** Esto es una
 * hoja de estilos que se arma con datos de la base: sin filtrar, un texto
 * con `}` cerraría la regla y lo que siguiera entraría como CSS propio.
 */
export function cssDelTema(tema: Tema): string {
  const reglas: string[] = [];

  const huesped = declaracionesHuesped(tema);
  if (huesped.length > 0) reglas.push(`[data-theme='guest']{${huesped.join('')}}`);

  const staff = declaracionesStaff(tema);
  if (staff.length > 0) reglas.push(`[data-theme='staff']{${staff.join('')}}`);

  // El texto sobre el acento es el mismo en los dos lados: depende del acento,
  // no del fondo de la pantalla.
  const sobre = color(tema, 'sobreAcento');
  if (sobre) reglas.push(`[data-theme]{--on-gold:${sobre};}`);

  // Se pisa `--typeface-*` y NO `--font-*`. Tailwind incrusta el valor
  // literal de `--font-*` en cada utilidad al compilar —genera
  // `.font-display{font-family:Cormorant Garamond,…}`, no un `var()`—, así
  // que pisar `--font-display` no cambia una sola pantalla. Comprobado en
  // vivo el 20 de noviembre de 2026: los colores del hotel demo salían
  // verdes y los títulos seguían en Cormorant. Ver `styles/tokens.css`.
  const fuentes: string[] = [];
  if (esFuente(tema.fuenteTitulos)) {
    fuentes.push(`--typeface-display:'${tema.fuenteTitulos.trim()}',ui-serif,Georgia,serif;`);
  }
  if (esFuente(tema.fuenteTexto)) {
    fuentes.push(
      `--typeface-sans:'${tema.fuenteTexto.trim()}',ui-sans-serif,system-ui,sans-serif;`,
    );
  }
  if (fuentes.length > 0) reglas.push(`:root{${fuentes.join('')}}`);

  return reglas.join('\n');
}

/** La dirección de Google Fonts para las dos familias, o null si no hace falta. */
export function urlDeFuentes(tema: Tema): string | null {
  if (!tema.fuenteGoogle) return null;
  const familias = [tema.fuenteTitulos, tema.fuenteTexto]
    .filter(esFuente)
    .map((f) => `family=${encodeURIComponent(f.trim())}:wght@400;500;600`);
  if (familias.length === 0) return null;
  // `display=swap`: el texto se ve con la fuente de respaldo mientras baja la
  // otra. Sin eso, una fuente lenta deja la pantalla en blanco.
  return `https://fonts.googleapis.com/css2?${familias.join('&')}&display=swap`;
}

/**
 * Lo que vino de la base convertido en un tema, o null si no hay ninguno.
 *
 * La columna es `jsonb`: puede traer un objeto, `{}`, null, o —si alguien
 * escribe a mano— una lista o un número. `cssDelTema` valida cada campo, pero
 * no se le puede pedir campos a algo que no es un objeto. Null significa «este
 * hotel usa la paleta de siempre», que es distinto de «no pude leer el tema».
 */
export function comoTema(valor: unknown): Tema | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null;
  return Object.keys(valor).length > 0 ? (valor as Tema) : null;
}

const ID = 'humaya-tema';

/**
 * Deja el tema puesto. Sin tema, quita el que hubiera.
 *
 * Las fuentes de Google se piden en paralelo y NO se esperan: si tardan o no
 * llegan, la pantalla sale con las que ya vienen en la app. Una marca a
 * medias es mejor que una pantalla que no abre.
 */
export function aplicarTema(tema: Tema | null, doc: Document = document): void {
  doc.getElementById(ID)?.remove();
  doc.getElementById(`${ID}-fuentes`)?.remove();
  if (!tema) return;

  const css = cssDelTema(tema);
  if (css) {
    const etiqueta = doc.createElement('style');
    etiqueta.id = ID;
    etiqueta.textContent = css;
    doc.head.appendChild(etiqueta);
  }

  const url = urlDeFuentes(tema);
  if (url) {
    const enlace = doc.createElement('link');
    enlace.id = `${ID}-fuentes`;
    enlace.rel = 'stylesheet';
    enlace.href = url;
    doc.head.appendChild(enlace);
  }
}
