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
} as const;
