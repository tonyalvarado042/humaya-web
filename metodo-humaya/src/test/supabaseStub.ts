/**
 * Un Supabase de mentira para los tests.
 *
 * ── POR QUÉ SE FALSIFICA EL SDK Y NO NUESTRO SERVICIO ───────────────────
 * Si mockeáramos `@/services/sesion`, los tests pasarían sin ejecutar ni una
 * línea de la lógica que de verdad decide quién entra a recepción: el mapeo de
 * errores, la lectura del rol en `cta_usuarios`, el fallar-cerrado cuando no
 * hay fila. Falsificando solo el SDK —la pieza ajena— ese código sí corre.
 *
 * El cliente falso aplica los filtros de verdad (eq, gte, lte, in, is), así
 * que sirve para probar consultas y no solo el camino feliz.
 */

/**
 * El hotel de las pruebas.
 *
 * Desde el 20 de noviembre de 2026 las consultas van acotadas por hotel, asi
 * que una fila sembrada SIN `negocio_id` no la devuelve nadie — igual que en
 * produccion. `setup.ts` deja este hotel puesto antes de cada prueba.
 */
export const NEGOCIO_DE_PRUEBA = 'negocio-de-prueba';

export interface FilaUsuario {
  id: string;
  email: string;
  nombre: string | null;
  rol: string | null;
}

/** El estado que los tests mueven. Se reinicia con `resetSupabaseStub()`. */
export const supabaseStub = {
  /** Null = nadie entró. */
  usuario: null as FilaUsuario | null,
  /** Lo que devuelve cada tabla. La llave es el nombre de la tabla. */
  tablas: {} as Record<string, Record<string, unknown>[]>,
  /** Qué responde `signInWithPassword`. */
  errorAlEntrar: null as string | null,
  /** Para afirmar sobre lo que se le pidió a la base. */
  consultas: [] as { tabla: string; filtros: string[] }[],
  /** Cuántas veces se firmó la salida. */
  salidas: 0,
};

export const USUARIO_RECEPCION: FilaUsuario = {
  id: 'u-recepcion',
  email: 'andres@stayhumaya.com',
  nombre: 'Andrés',
  rol: 'operaciones',
};

export function resetSupabaseStub(): void {
  supabaseStub.usuario = null;
  supabaseStub.tablas = {};
  supabaseStub.errorAlEntrar = null;
  supabaseStub.consultas = [];
  supabaseStub.salidas = 0;
}

/** Deja una sesión abierta con rol de recepción. Lo normal en los tests. */
export function stubSesionAbierta(usuario: FilaUsuario = USUARIO_RECEPCION): void {
  supabaseStub.usuario = usuario;
  supabaseStub.tablas.cta_usuarios = [{ ...usuario }];
}

type Fila = Record<string, unknown>;

/** Para los `id` que la base pondria sola en un insert. */
let contador = 0;

/**
 * El encadenado de PostgREST: cada filtro devuelve el mismo objeto y el await
 * resuelve. `then` lo hace esperable sin ser una promesa de verdad, que es
 * justo como se comporta el builder real.
 */
class Consulta implements PromiseLike<{ data: Fila[] | Fila | null; error: null }> {
  private filas: Fila[];
  private readonly filtros: string[] = [];
  private uno = false;
  private cambios: Fila | null = null;
  private borrando = false;

  private readonly nombreTabla: string;

  // Sin parameter properties: el proyecto compila con `erasableSyntaxOnly`.
  constructor(tabla: string, filas: Fila[]) {
    this.nombreTabla = tabla;
    this.filas = [...filas];
    supabaseStub.consultas.push({ tabla, filtros: this.filtros });
  }

  select() {
    return this;
  }

  order(columna: string, opciones?: { ascending?: boolean }) {
    const factor = opciones?.ascending === false ? -1 : 1;
    this.filas.sort((a, b) => factor * String(a[columna]).localeCompare(String(b[columna])));
    this.filtros.push(`order:${columna}`);
    return this;
  }

  limit(cuantas: number) {
    this.filas = this.filas.slice(0, cuantas);
    return this;
  }

  eq(columna: string, valor: unknown) {
    this.filtros.push(`eq:${columna}`);
    this.filas = this.filas.filter((fila) => fila[columna] === valor);
    return this;
  }

  neq(columna: string, valor: unknown) {
    this.filtros.push(`neq:${columna}`);
    this.filas = this.filas.filter((fila) => fila[columna] !== valor);
    return this;
  }

  gte(columna: string, valor: string) {
    this.filtros.push(`gte:${columna}`);
    this.filas = this.filas.filter((fila) => String(fila[columna]) >= valor);
    return this;
  }

  lte(columna: string, valor: string) {
    this.filtros.push(`lte:${columna}`);
    this.filas = this.filas.filter((fila) => String(fila[columna]) <= valor);
    return this;
  }

  in(columna: string, valores: unknown[]) {
    this.filtros.push(`in:${columna}`);
    this.filas = this.filas.filter((fila) => valores.includes(fila[columna]));
    return this;
  }

  is(columna: string, valor: unknown) {
    this.filtros.push(`is:${columna}`);
    this.filas = this.filas.filter((fila) => (fila[columna] ?? null) === valor);
    return this;
  }

  /** Escribe en la tabla del stub, como haría PostgREST. */
  upsert(filas: Fila | Fila[]) {
    const lista = Array.isArray(filas) ? filas : [filas];
    const tabla = supabaseStub.tablas[this.nombreTabla] ?? [];
    for (const nueva of lista) {
      const i = tabla.findIndex(
        (vieja) => vieja.negocio_id === nueva.negocio_id && vieja.clave === nueva.clave,
      );
      if (i >= 0) tabla[i] = { ...tabla[i], ...nueva };
      else tabla.push({ ...nueva });
    }
    supabaseStub.tablas[this.nombreTabla] = tabla;
    this.filas = tabla;
    return this;
  }

  /**
   * Como PostgREST: el cambio se guarda y se aplica DESPUES de los filtros.
   *
   * En la cadena real, `.update(x).eq('id', 1)` cambia la fila 1 y no todas:
   * el update se escribe primero pero manda el filtro. Si el stub aplicara el
   * cambio al llamarlo, pisaria la tabla entera y una prueba de permisos
   * pasaria por el motivo equivocado.
   */
  update(cambios: Fila) {
    this.cambios = cambios;
    this.filtros.push('update');
    return this;
  }

  maybeSingle() {
    this.uno = true;
    return this;
  }

  single() {
    this.uno = true;
    return this;
  }

  /**
   * Filas nuevas, como PostgREST: quedan en la tabla y `select()` las
   * devuelve. El `id` se inventa solo si la fila no trae uno, porque la base
   * lo pone por omision y el codigo que llama cuenta con recibirlo.
   */
  insert(filas: Fila | Fila[]) {
    const lista = (Array.isArray(filas) ? filas : [filas]).map((fila) => ({
      id: `fila-${++contador}`,
      ...fila,
    }));
    const tabla = supabaseStub.tablas[this.nombreTabla] ?? [];
    tabla.push(...lista);
    supabaseStub.tablas[this.nombreTabla] = tabla;
    this.filas = lista;
    this.filtros.push('insert');
    return this;
  }

  /**
   * Igual que `update`: se marca y se aplica DESPUES de los filtros.
   *
   * Si borrara al llamarlo, `.delete().eq('id', 1)` vaciaria la tabla entera
   * y una prueba de aislamiento entre hoteles pasaria sin probar nada.
   */
  delete() {
    this.borrando = true;
    this.filtros.push('delete');
    return this;
  }

  then<R1 = { data: Fila[] | Fila | null; error: null }, R2 = never>(
    alCumplir?:
      ((valor: { data: Fila[] | Fila | null; error: null }) => R1 | PromiseLike<R1>) | null,
    alFallar?: ((razon: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    if (this.cambios) {
      const tabla = supabaseStub.tablas[this.nombreTabla] ?? [];
      for (const fila of this.filas) {
        const i = tabla.indexOf(fila);
        if (i >= 0) tabla[i] = { ...fila, ...this.cambios };
      }
      supabaseStub.tablas[this.nombreTabla] = tabla;
      this.filas = this.filas.map((fila) => ({ ...fila, ...this.cambios }));
    }
    if (this.borrando) {
      const tabla = supabaseStub.tablas[this.nombreTabla] ?? [];
      supabaseStub.tablas[this.nombreTabla] = tabla.filter((fila) => !this.filas.includes(fila));
    }
    const data = this.uno ? (this.filas[0] ?? null) : this.filas;
    return Promise.resolve({ data, error: null }).then(alCumplir, alFallar);
  }
}

function sesionDe(usuario: FilaUsuario | null) {
  return usuario
    ? {
        access_token: `token-de-prueba-${usuario.id}`,
        user: { id: usuario.id, email: usuario.email },
      }
    : null;
}

/**
 * El cliente que recibe `createClient`. Lo monta `setup.ts`: `vi.mock` se iza
 * al tope del archivo, así que la llamada tiene que estar en el nivel superior
 * de un archivo que corra antes que los tests, no dentro de una función.
 */
export function clienteFalso() {
  const oyentes = new Set<() => void>();

  return {
    auth: {
      getSession: async () => ({ data: { session: sesionDe(supabaseStub.usuario) } }),
      signInWithPassword: async ({ email }: { email: string }) => {
        if (supabaseStub.errorAlEntrar) {
          return { data: null, error: { message: supabaseStub.errorAlEntrar } };
        }
        // Solo entra quien exista en cta_usuarios, igual que en la base real.
        const fila = (supabaseStub.tablas.cta_usuarios ?? []).find(
          (candidato) => candidato.email === email,
        ) as FilaUsuario | undefined;
        if (!fila) {
          return { data: null, error: { message: 'Invalid login credentials' } };
        }
        supabaseStub.usuario = fila;
        oyentes.forEach((avisar) => avisar());
        return { data: { session: sesionDe(fila) }, error: null };
      },
      signOut: async () => {
        supabaseStub.salidas += 1;
        supabaseStub.usuario = null;
        oyentes.forEach((avisar) => avisar());
        return { error: null };
      },
      onAuthStateChange: (hacer: () => void) => {
        oyentes.add(hacer);
        return {
          data: { subscription: { unsubscribe: () => oyentes.delete(hacer) } },
        };
      },
    },
    from: (tabla: string) => new Consulta(tabla, supabaseStub.tablas[tabla] ?? []),
  };
}
