import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * La puerta de recepción: quién entra a /staff y con qué permiso.
 *
 * ── POR QUÉ NO HAY UN SISTEMA DE CUENTAS NUEVO ──────────────────────────
 * Porque ya existe. El CRM de Tony (crm-tony-alvarado) autentica con Supabase
 * Auth contra `cta_usuarios`, con roles y con `cta_usuario_negocios` para
 * decidir qué negocio ve cada persona. Andrés y Natalia entran a recepción con
 * la misma cuenta y la misma clave del CRM. Inventar un segundo padrón de
 * usuarios habría significado dos listas que se desincronizan y dos lugares
 * donde revocarle el acceso a alguien que se va.
 *
 * ── POR QUÉ LA LLAVE PUEDE VIVIR EN EL NAVEGADOR ────────────────────────
 * Es la llave *publicable*: está hecha para eso. Lo que protege los datos es
 * RLS, y las políticas de las tablas `humaya_*` exigen un rol del CRM. Un
 * anónimo con esta llave en la mano no lee ni una fila — está comprobado
 * contra la API, no supuesto.
 *
 * ── POR QUÉ EL SDK SE CARGA APARTE ──────────────────────────────────────
 * Con `import()` dinámico. El huésped entra desde el teléfono y nunca necesita
 * autenticarse: no tiene por qué descargar el SDK de Auth para ver la clave
 * del wifi. Solo lo baja quien abre recepción.
 */
export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co';

export const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_KEY as string | undefined) ??
  'sb_publishable__NtpRbRq44qFQ1UD1KofCQ_09yVSwvF';

/**
 * Los roles del CRM que alcanzan para recepción. `externo` queda fuera a
 * propósito: en el CRM es el rol de quien no debe ver clientes ajenos, y los
 * huéspedes del hotel son exactamente eso. La lista es la misma que exigen las
 * políticas RLS de las tablas `humaya_*`, para que la pantalla no prometa algo
 * que la base va a negar después.
 */
export const ROLES_RECEPCION = ['administrador', 'operaciones', 'vendedor', 'lectura'] as const;

export interface Persona {
  id: string;
  correo: string;
  nombre: string | null;
  rol: string | null;
  /** Falso también cuando no hay fila en `cta_usuarios`: se falla cerrado. */
  entra: boolean;
}

export type FalloDeEntrada = 'credenciales' | 'sin_confirmar' | 'muchos_intentos' | 'red';

/** Un error de entrada con motivo, para que la pantalla diga algo útil. */
export class ErrorDeEntrada extends Error {
  // Campo declarado y asignado a mano: el proyecto compila con
  // `erasableSyntaxOnly`, que no permite declarar el campo en el constructor.
  readonly motivo: FalloDeEntrada;

  constructor(motivo: FalloDeEntrada) {
    super(motivo);
    this.name = 'ErrorDeEntrada';
    this.motivo = motivo;
  }
}

let clientePromesa: Promise<SupabaseClient> | null = null;

/** El cliente, creado una sola vez y solo cuando alguien lo pide. */
export function cliente(): Promise<SupabaseClient> {
  clientePromesa ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Llave propia: si algún día el CRM y recepción comparten dominio, no
        // se pisan la sesión.
        storageKey: 'humaya.recepcion.sesion',
      },
    }),
  );
  return clientePromesa;
}

/** Traduce el mensaje de Supabase a un motivo que la pantalla sabe explicar. */
function motivoDe(mensaje: string): FalloDeEntrada {
  const texto = mensaje.toLowerCase();
  if (texto.includes('not confirmed') || texto.includes('confirm')) return 'sin_confirmar';
  if (texto.includes('rate limit') || texto.includes('too many')) return 'muchos_intentos';
  if (texto.includes('fetch') || texto.includes('network')) return 'red';
  return 'credenciales';
}

export async function entrar(correo: string, clave: string): Promise<Persona> {
  const db = await cliente();
  const { error } = await db.auth.signInWithPassword({
    email: correo.trim().toLowerCase(),
    password: clave,
  });
  if (error) throw new ErrorDeEntrada(motivoDe(error.message));

  const persona = await quienSoy();
  if (!persona) throw new ErrorDeEntrada('credenciales');
  return persona;
}

export async function salir(): Promise<void> {
  const db = await cliente();
  await db.auth.signOut();
}

/**
 * Quién está adentro ahora, o null. El rol NO viene del token: viene de
 * `cta_usuarios`, que es donde el CRM lo administra. Si esa lectura devuelve
 * vacío —sin fila, o rol sin permiso— la persona queda sin entrar, que es lo
 * que debe pasar mientras un administrador no le asigne nada.
 */
export async function quienSoy(): Promise<Persona | null> {
  const db = await cliente();
  const {
    data: { session },
  } = await db.auth.getSession();
  if (!session?.user) return null;

  const { data } = await db
    .from('cta_usuarios')
    .select('id,email,nombre,rol')
    .eq('id', session.user.id)
    .maybeSingle();

  const rol = (data?.rol as string | null | undefined) ?? null;
  return {
    id: session.user.id,
    correo: (data?.email as string | undefined) ?? session.user.email ?? '',
    nombre: (data?.nombre as string | null | undefined) ?? null,
    rol,
    entra: !!rol && (ROLES_RECEPCION as readonly string[]).includes(rol),
  };
}

/** Avisa cuando la sesión cambia —entrar, salir, expirar—. Devuelve el corte. */
export async function alCambiar(hacer: () => void): Promise<() => void> {
  const db = await cliente();
  const {
    data: { subscription },
  } = db.auth.onAuthStateChange(() => hacer());
  return () => subscription.unsubscribe();
}

/** El token para hablarle a las Edge Functions como la persona que entró. */
export async function token(): Promise<string | null> {
  const db = await cliente();
  const {
    data: { session },
  } = await db.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * La cabecera `Authorization` de quien esta en recepcion, o vacia si no hay
 * sesion.
 *
 * Las funciones que cambian lo que ve el huesped —la configuracion del menu,
 * el catalogo de servicios, la bandeja del Concierge— la exigen. Hasta el 16
 * de noviembre de 2026 no exigian nada: usan la llave de servicio, asi que
 * RLS no las frena, y cualquiera en internet podia llamarlas.
 *
 * Devuelve un objeto vacio en vez de fallar: quien llama decide. Asi la misma
 * funcion sirve para una llamada del huesped, que no tiene cuenta, sin tener
 * que envolverla en un try.
 */
export async function cabeceraDeRecepcion(): Promise<Record<string, string>> {
  try {
    const db = await cliente();
    const {
      data: { session },
    } = await db.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch {
    // Sin SDK o sin red no hay cabecera. El servidor respondera 401 y la
    // pantalla lo dira: es mejor que romperse antes de pedir.
    return {};
  }
}
