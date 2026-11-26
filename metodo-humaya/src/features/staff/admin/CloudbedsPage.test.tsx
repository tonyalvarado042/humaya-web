import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { supabaseStub } from '@/test/supabaseStub';
import { CloudbedsPage } from './CloudbedsPage';

/**
 * La pantalla donde se conecta cada hotel con su Cloudbeds.
 *
 * ── POR QUÉ ESTA PRUEBA EXISTE ──────────────────────────────────────────
 * Tony, 25 de noviembre de 2026: «Ya tengo la API de Cloudbeds, pero no hay
 * pantalla donde ponerla».
 *
 * La pantalla se abrió en vivo contra el servidor de desarrollo y monta
 * bien, pero con una cuenta que NO es de plataforma: la lista sale vacía, que
 * es lo correcto y también lo que impide ver las fichas. Elevar una cuenta de
 * prueba a plataforma habría sido darle el permiso más alto del sistema a una
 * cuenta temporal, así que las fichas se fijan acá, con datos de mentira.
 *
 * Lo que se prueba es lo que decide si la pantalla sirve: que un hotel sin
 * propiedad pida el número y NO la llave —guardar una llave antes de conectar
 * la propiedad rebota en la base con `propiedad_no_registrada`, así que
 * ofrecer ese campo sería ofrecer un botón que va a fallar— y que guardar la
 * llave traiga las reservas sin pedir nada más.
 */

const SIN_PROPIEDAD = {
  negocio_id: 'n-bikeandbed',
  codigo: 'bikeandbed',
  nombre: 'Bike & Bed by Humaya',
  origen_reservas: 'cloudbeds',
  property_id: null,
  llave_propia: false,
  llave_propia_desde: null,
  reservas: 0,
};

const CONECTADO = {
  negocio_id: 'n-humaya',
  codigo: 'humaya',
  nombre: 'HUMAYA',
  origen_reservas: 'cloudbeds',
  property_id: '283417337204929',
  llave_propia: true,
  llave_propia_desde: '2026-11-16T01:26:50Z',
  reservas: 68,
};

/** Con propiedad pero todavía sin llave: el caso de Bike & Bed hoy. */
const SIN_LLAVE = {
  ...SIN_PROPIEDAD,
  property_id: '294717227995328',
};

function respuesta(status: number, cuerpo: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  });
}

beforeEach(() => {
  supabaseStub.rpcs.humaya_cloudbeds_estado = [SIN_PROPIEDAD, CONECTADO];
  supabaseStub.rpcs.humaya_cloudbeds_guardar_llave = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** La ficha de un hotel, para no preguntarle a la página entera. */
function ficha(nombre: string) {
  const titulo = screen.getByRole('heading', { name: nombre, level: 3 });
  const li = titulo.closest('li');
  if (!li) throw new Error(`la ficha de ${nombre} no está en un <li>`);
  return within(li);
}

describe('un hotel que todavía no tiene propiedad', () => {
  it('pide el número, y no ofrece el campo de la llave', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    expect(bike.getByLabelText('Número de propiedad')).toBeInTheDocument();
    expect(bike.getByRole('button', { name: 'Conectar' })).toBeInTheDocument();
    // El de la llave NO: primero la propiedad.
    expect(bike.queryByLabelText('Llave de API')).not.toBeInTheDocument();
    expect(bike.getByText('todavía sin propiedad')).toBeInTheDocument();
  });

  it('no se puede conectar con el campo vacío', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    expect(ficha('Bike & Bed by Humaya').getByRole('button', { name: 'Conectar' })).toBeDisabled();
  });
});

describe('un hotel ya conectado', () => {
  it('muestra su número y pide la llave, tapada', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'HUMAYA', level: 3 });

    const humaya = ficha('HUMAYA');
    expect(humaya.getByText(/283417337204929/)).toBeInTheDocument();
    expect(humaya.getByText(/68 reservas/)).toBeInTheDocument();

    // Tapada: una llave a la vista en una pantalla abierta es una llave
    // regalada a quien pase por detrás.
    const campo = humaya.getByLabelText('Llave de API');
    expect(campo).toHaveAttribute('type', 'password');
    expect(campo).toHaveValue('');
  });

  it('dice que ya tiene llave propia, sin mostrarla', async () => {
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'HUMAYA', level: 3 });

    const humaya = ficha('HUMAYA');
    expect(humaya.getByText('con llave propia')).toBeInTheDocument();
    // Ni rastro de un valor: la base nunca lo devuelve y la pantalla
    // tampoco lo inventa.
    expect(humaya.queryByText(/cbat_/)).not.toBeInTheDocument();
  });

  it('nunca dice que un hotel «usa la llave general»', async () => {
    // Esa etiqueta existió hasta el 26 de noviembre de 2026 y describía un
    // respaldo que ya no existe: cada hotel pregunta con la suya o no
    // pregunta. Una etiqueta que promete cobertura que no hay es peor que
    // ninguna.
    supabaseStub.rpcs.humaya_cloudbeds_estado = [SIN_LLAVE];
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    expect(screen.queryByText(/llave general/i)).not.toBeInTheDocument();
    expect(ficha('Bike & Bed by Humaya').getByText('sin llave')).toBeInTheDocument();
  });
});

describe('guardar la llave', () => {
  it('trae las reservas sola, sin otro botón', async () => {
    // Tony, 26 de noviembre de 2026: «se supone que al pegar la llave
    // automáticamente se tiene que hacer eso, ¿o me equivoco?».
    supabaseStub.rpcs.humaya_cloudbeds_estado = [SIN_LLAVE];
    const fetchFalso = vi.fn((..._args: unknown[]) =>
      respuesta(200, {
        ok: true,
        property_id: '294717227995328',
        llave: { ok: true, alcanza: [{ property_id: '294717227995328', nombre: 'Bike And Bed' }] },
        webhooks: { ok: true, registrados: ['reservation/created'], faltan: [] },
        reservas: { encontradas: 34, guardadas: 34, sin_correo: 2, fallaron: 0, hay_mas: false },
      }),
    );
    vi.stubGlobal('fetch', fetchFalso);

    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    await userEvent.type(bike.getByLabelText('Llave de API'), 'cbat_una-llave-larga-de-prueba');
    await userEvent.click(bike.getByRole('button', { name: 'Guardar llave' }));

    expect(await screen.findByText(/34 de 34 reservas/)).toBeInTheDocument();
    expect(String(fetchFalso.mock.calls[0]?.[0])).toContain('/cloudbeds-conectar');
    // Y el campo queda vacío: la llave no se deja a la vista.
    expect(bike.getByLabelText('Llave de API')).toHaveValue('');
  });

  it('con la llave de otro hotel, lo dice y no finge que funcionó', async () => {
    // El caso concreto: pegar la llave de HUMAYA en Bike & Bed. Antes esto
    // habría "funcionado" usando la llave general.
    supabaseStub.rpcs.humaya_cloudbeds_estado = [SIN_LLAVE];
    vi.stubGlobal(
      'fetch',
      vi.fn(() => respuesta(400, { error: 'llave_de_otro_hotel' })),
    );

    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    await userEvent.type(bike.getByLabelText('Llave de API'), 'cbat_la-llave-de-humaya-pegada');
    await userEvent.click(bike.getByRole('button', { name: 'Guardar llave' }));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent(/otra propiedad de Cloudbeds/);
    // Y avisa que la llave YA quedó guardada: Cloudbeds no la vuelve a
    // mostrar, así que mandarlo a buscarla otra vez sería mandarlo a la nada.
    expect(aviso).toHaveTextContent(/quedó guardada/);
  });

  it('cuando faltan avisos por registrar, lo dice en vez de celebrar', async () => {
    supabaseStub.rpcs.humaya_cloudbeds_estado = [SIN_LLAVE];
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
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    await userEvent.type(bike.getByLabelText('Llave de API'), 'cbat_una-llave-larga-de-prueba');
    await userEvent.click(bike.getByRole('button', { name: 'Guardar llave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/reservation\/deleted/);
  });
});

describe('las instrucciones de Cloudbeds', () => {
  it('dicen dónde sale el número y cómo se saca la llave', async () => {
    // Tony perdió una vuelta buscando la llave: el formulario de Cloudbeds
    // pide una Redirect URI que con llave de API no se usa, y la llave no
    // sale al guardar — hay que deslizar la tabla a la derecha.
    renderWithProviders(<CloudbedsPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'HUMAYA', level: 3 });

    expect(screen.getByText(/después de \/connect\//)).toBeInTheDocument();
    expect(screen.getByText(/deslizá la tabla a la derecha/)).toBeInTheDocument();
  });
});
