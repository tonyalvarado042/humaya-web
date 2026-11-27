import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { CloudbedsPage } from './CloudbedsPage';

/**
 * La pantalla donde se conecta ESTE hotel con su Cloudbeds.
 *
 * ── POR QUÉ ESTA PRUEBA EXISTE ──────────────────────────────────────────
 * Tony, 25 de noviembre de 2026: «Ya tengo la API de Cloudbeds, pero no hay
 * pantalla donde ponerla».
 *
 * La pantalla se abrió en vivo contra el servidor de desarrollo y monta
 * bien, pero con una cuenta que NO es de plataforma: no sale ficha, que es
 * lo correcto. Elevar una cuenta de prueba a plataforma habría sido darle el
 * permiso más alto del sistema a una cuenta temporal, así que las fichas se
 * fijan acá, con datos de mentira.
 *
 * ── Y POR QUÉ SE FIJA QUE SEA UN SOLO HOTEL ─────────────────────────────
 * Tony, 26 de noviembre de 2026, con Bike & Bed abierto: «sigues aún
 * revolviendo hoteles, te he dicho mil veces, estoy en bike and bed y sale
 * Humaya. ¿Por qué?».
 *
 * Porque esto era una lista de todos. Un hotel de más en esta pantalla no
 * rompe nada que se note —no revienta, no sale rojo—, así que si no se fija
 * en una prueba vuelve en silencio.
 */

/** El hotel en el que se está: el que la base devuelve cuando le preguntan. */
const SIN_PROPIEDAD = {
  negocio_id: NEGOCIO_DE_PRUEBA,
  codigo: 'bikeandbed',
  nombre: 'Bike & Bed by Humaya',
  origen_reservas: 'cloudbeds',
  property_id: null as string | null,
  llave_propia: false,
  llave_propia_desde: null as string | null,
  reservas: 0,
};

/** Con propiedad pero todavía sin llave: el caso de Bike & Bed hoy. */
const SIN_LLAVE = { ...SIN_PROPIEDAD, property_id: '294717227995328' };

const CONECTADO = {
  ...SIN_LLAVE,
  llave_propia: true,
  llave_propia_desde: '2026-11-16T01:26:50Z',
  reservas: 34,
};

/**
 * OTRO hotel. Está en la base y NO tiene que aparecer en ninguna prueba: su
 * número de propiedad y sus 68 reservas son justo lo que Tony vio estando
 * dentro de Bike & Bed.
 */
const EL_OTRO = {
  negocio_id: 'n-humaya',
  codigo: 'humaya',
  nombre: 'HUMAYA',
  origen_reservas: 'cloudbeds',
  property_id: '283417337204929' as string | null,
  llave_propia: true,
  llave_propia_desde: '2026-11-16T01:26:50Z' as string | null,
  reservas: 68,
};

type Fila = typeof EL_OTRO;

/**
 * La base de mentira acota por hotel, igual que la de verdad.
 *
 * Sembrar la respuesta tal cual —una lista fija— dejaría pasar una pantalla
 * que no dice de qué hotel está hablando: devolvería lo mismo preguntara lo
 * que preguntara.
 */
function laBaseTiene(...filas: Fila[]) {
  supabaseStub.rpcs.humaya_cloudbeds_estado = (args: Record<string, unknown>) =>
    filas.filter((f) => f.negocio_id === args.p_negocio);
}

function respuesta(status: number, cuerpo: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  });
}

beforeEach(() => {
  laBaseTiene(SIN_PROPIEDAD, EL_OTRO);
  supabaseStub.rpcs.humaya_cloudbeds_guardar_llave = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('la pantalla es de un hotel: el que se está mirando', () => {
  it('le pide a la base ESE hotel, y no todos', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(supabaseStub.llamadas).toContainEqual({
      nombre: 'humaya_cloudbeds_estado',
      args: { p_negocio: NEGOCIO_DE_PRUEBA },
    });
  });

  it('no muestra nada del otro hotel', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.queryByRole('heading', { name: 'HUMAYA' })).not.toBeInTheDocument();
    expect(screen.queryByText(/283417337204929/)).not.toBeInTheDocument();
    expect(screen.queryByText(/68 reservas/)).not.toBeInTheDocument();
  });

  it('ni siquiera usa el número de otro hotel como ejemplo', async () => {
    // El campo vacío traía `283417337204929` de placeholder: el número de
    // propiedad REAL de HUMAYA, puesto como ejemplo dentro de otro hotel.
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.queryByPlaceholderText('283417337204929')).not.toBeInTheDocument();
  });

  it('si la base no devuelve ficha, lo dice en vez de quedarse en blanco', async () => {
    // Pasa con una cuenta que no es de plataforma: la función acota por
    // permiso y devuelve cero filas.
    laBaseTiene(EL_OTRO);
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });

    expect(await screen.findByText(/no tiene ficha de Cloudbeds/i)).toBeInTheDocument();
  });
});

describe('un hotel que todavía no tiene propiedad', () => {
  it('pide el número, y no ofrece el campo de la llave', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.getByLabelText('Número de propiedad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Conectar' })).toBeInTheDocument();
    // El de la llave NO: primero la propiedad.
    expect(screen.queryByLabelText('Llave de API')).not.toBeInTheDocument();
    expect(screen.getByText('todavía sin propiedad')).toBeInTheDocument();
  });

  it('no se puede conectar con el campo vacío', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.getByRole('button', { name: 'Conectar' })).toBeDisabled();
  });
});

describe('un hotel ya conectado', () => {
  beforeEach(() => {
    laBaseTiene(CONECTADO, EL_OTRO);
  });

  it('muestra su número y pide la llave, tapada', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.getByText(/294717227995328/)).toBeInTheDocument();
    expect(screen.getByText(/34 reservas/)).toBeInTheDocument();

    // Tapada: una llave a la vista en una pantalla abierta es una llave
    // regalada a quien pase por detrás.
    const campo = screen.getByLabelText('Llave de API');
    expect(campo).toHaveAttribute('type', 'password');
    expect(campo).toHaveValue('');
  });

  it('dice que ya tiene llave propia, sin mostrarla', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.getByText('con llave propia')).toBeInTheDocument();
    // Ni rastro de un valor: la base nunca lo devuelve y la pantalla tampoco
    // lo inventa.
    expect(screen.queryByText(/cbat_/)).not.toBeInTheDocument();
  });
});

describe('guardar la llave', () => {
  beforeEach(() => {
    laBaseTiene(SIN_LLAVE, EL_OTRO);
  });

  it('nunca dice que un hotel «usa la llave general»', async () => {
    // Esa etiqueta existió hasta el 26 de noviembre de 2026 y describía un
    // respaldo que ya no existe: cada hotel pregunta con la suya o no
    // pregunta. Una etiqueta que promete cobertura que no hay es peor que
    // ninguna.
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.queryByText(/llave general/i)).not.toBeInTheDocument();
    expect(screen.getByText('sin llave')).toBeInTheDocument();
  });

  it('trae las reservas sola, sin otro botón', async () => {
    // Tony, 26 de noviembre de 2026: «se supone que al pegar la llave
    // automáticamente se tiene que hacer eso, ¿o me equivoco?».
    // La URL se guarda al vuelo en vez de sacarla de `mock.calls`: tipar ese
    // arreglo obliga a declarar parametros que el mock no usa, y eso lo
    // rechaza el linter.
    const pedidas: string[] = [];
    const fetchFalso = vi.fn((url: unknown) => {
      pedidas.push(String(url));
      return respuesta(200, {
        ok: true,
        property_id: '294717227995328',
        llave: { ok: true, alcanza: [{ property_id: '294717227995328', nombre: 'Bike And Bed' }] },
        webhooks: { ok: true, registrados: ['reservation/created'], faltan: [] },
        reservas: { encontradas: 34, guardadas: 34, sin_correo: 2, fallaron: 0, hay_mas: false },
      });
    });
    vi.stubGlobal('fetch', fetchFalso);

    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    await userEvent.type(screen.getByLabelText('Llave de API'), 'cbat_una-llave-larga-de-prueba');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar llave' }));

    expect(await screen.findByText(/34 de 34 reservas/)).toBeInTheDocument();
    expect(pedidas[0]).toContain('/cloudbeds-conectar');
    // Y el campo queda vacío: la llave no se deja a la vista.
    expect(screen.getByLabelText('Llave de API')).toHaveValue('');
  });

  it('con la llave de otro hotel, lo dice y no finge que funcionó', async () => {
    // El caso concreto: pegar la llave de HUMAYA en Bike & Bed. Antes esto
    // habría "funcionado" usando la llave general.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => respuesta(400, { error: 'llave_de_otro_hotel' })),
    );

    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    await userEvent.type(screen.getByLabelText('Llave de API'), 'cbat_la-llave-de-humaya-pegada');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar llave' }));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent(/otra propiedad de Cloudbeds/);
    // Y avisa que la llave YA quedó guardada: Cloudbeds no la vuelve a
    // mostrar, así que mandarlo a buscarla otra vez sería mandarlo a la nada.
    expect(aviso).toHaveTextContent(/quedó guardada/);
  });

  it('cuando faltan avisos por registrar, lo dice en vez de celebrar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        respuesta(200, {
          ok: false,
          property_id: '294717227995328',
          llave: { ok: true, alcanza: [] },
          webhooks: { ok: false, registrados: [], faltan: ['reservation/deleted'] },
          reservas: { encontradas: 5, guardadas: 5, sin_correo: 0, fallaron: 0, hay_mas: false },
        }),
      ),
    );

    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    await userEvent.type(screen.getByLabelText('Llave de API'), 'cbat_una-llave-larga-de-prueba');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar llave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/reservation\/deleted/);
  });
});

describe('las instrucciones de Cloudbeds', () => {
  it('dicen dónde sale el número y cómo se saca la llave', async () => {
    // Tony perdió una vuelta buscando la llave: el formulario de Cloudbeds
    // pide una Redirect URI que con llave de API no se usa, y la llave no
    // sale al guardar — hay que deslizar la tabla a la derecha.
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 2 });

    expect(screen.getByText(/después de \/connect\//)).toBeInTheDocument();
    expect(screen.getByText(/deslizá la tabla a la derecha/)).toBeInTheDocument();
  });
});
