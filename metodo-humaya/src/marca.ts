/**
 * La marca de esta instalación de la app.
 *
 * ── POR QUÉ ESTO EXISTE ─────────────────────────────────────────────────
 * Tony, 15 de noviembre de 2026: «más adelante venderemos esta app, así que
 * cada hotel puede configurar el nombre del app y el domain».
 *
 * Por eso el nombre NO se escribe suelto en diez pantallas. Vive acá, y acá
 * es donde se va a enchufar la configuración por hotel cuando llegue: hoy
 * sale de variables de entorno (una por despliegue), mañana de la base.
 * Las pantallas ya no van a tener que cambiar.
 *
 * ── EL NOMBRE ───────────────────────────────────────────────────────────
 * Se llama **HUMAYA Experience**. Decisión de Tony del 11 de noviembre:
 *
 *   «Método Humaya… esa la veo como remedio.»
 *
 * Tenía razón: *método* nombra un sistema, y lo que hay que nombrar es algo
 * que la persona se lleva puesto. Además suena clínico, que es lo contrario
 * de lo que vende un hotel de bienestar.
 *
 * ⚠️ «Protocolo» queda PROHIBIDO por la misma razón — suena todavía más a
 * hospital. Donde haga falta esa idea se escribe «el orden» o «la secuencia».
 *
 * Es nombre propio: **no se traduce**. Va igual en inglés y en español, y por
 * eso entra en los archivos de traducción como la variable {{experiencia}}
 * en vez de estar escrito dos veces.
 */
export const MARCA = {
  /** El marco de la estadía. Nombre propio, no se traduce. */
  experiencia:
    (import.meta.env.VITE_MARCA_EXPERIENCIA as string | undefined) ?? 'HUMAYA Experience',
  /** El hotel. El día que esto se venda, cada uno pone el suyo. */
  hotel: (import.meta.env.VITE_MARCA_HOTEL as string | undefined) ?? 'HUMAYA',
  /** De dónde sale el correo y a dónde escribe el huésped si algo falla. */
  correo:
    (import.meta.env.VITE_MARCA_CORREO as string | undefined) ?? 'reservations@stayhumaya.com',

  /**
   * Los dos dominios de esta instalación. El huésped y el personal viven
   * separados a pedido de Tony (15 de noviembre de 2026): la app del huésped en
   * experience.stayhumaya.com, recepción en staff.stayhumaya.com.
   *
   * Sirven para mandar a cada quien a su casa: quien pida /staff en el dominio
   * del huésped sale para el del personal, y al revés. Un hotel que compre la
   * app pone sus dos dominios acá y no toca una pantalla.
   */
  dominioHuesped:
    (import.meta.env.VITE_DOMINIO_HUESPED as string | undefined) ??
    'https://experience.stayhumaya.com',
  dominioPersonal:
    (import.meta.env.VITE_DOMINIO_PERSONAL as string | undefined) ?? 'https://staff.stayhumaya.com',

  /**
   * ¿El dominio del personal ya existe de verdad?
   *
   * **Sí, desde el 16 de noviembre de 2026.** Ese día se agregó
   * staff.stayhumaya.com como dominio personalizado del Worker
   * `humaya-experience` en Cloudflare, y se comprobó desde fuera:
   *
   *   nslookup  → 104.21.5.31 / 172.67.132.218 (+ IPv6)
   *   curl      → 200 text/html, sirviendo el mismo bundle
   *
   * El 15 de noviembre esto estaba APAGADO porque el nombre no resolvía:
   * mandar a alguien para allá habría sido mandarlo a un error del navegador.
   * Ahora resuelve, así que la separación va ENCENDIDA por defecto.
   *
   * Lo que protege los datos sigue siendo la puerta, no el subdominio: /staff
   * exige cuenta y clave del CRM en cualquiera de los dos dominios.
   *
   * Para apagarla otra vez (si el dominio se cayera): VITE_DOMINIOS_SEPARADOS=false.
   */
  dominiosSeparados: import.meta.env.VITE_DOMINIOS_SEPARADOS !== 'false',
} as const;

/** Qué lado de la app sirve este dominio. */
export type Lado = 'huesped' | 'personal' | 'ambos';

/**
 * El huésped y el personal comparten código pero no dominio. Quien entre por
 * el dominio equivocado se manda al correcto en vez de ver una pantalla que no
 * le toca. En local y en los previews no se separa: ahí se prueban los dos.
 *
 * Mira el subdominio y no el dominio completo, para que siga funcionando
 * cuando la app se venda y los dominios sean otros.
 */
export function ladoDe(hostname: string): Lado {
  if (hostname.startsWith('staff.')) return 'personal';
  if (hostname.startsWith('experience.')) return 'huesped';
  return 'ambos';
}
