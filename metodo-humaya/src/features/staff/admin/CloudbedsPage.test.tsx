import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
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
 * ofrecer ese campo sería ofrecer un botón que va a fallar.
 */

const SIN_PROPIEDAD = {
  negocio_id: 'n-bikeandbed',
  codigo: 'bikeandbed',
  nombre: 'Bike & Bed by Humaya',
  origen_reservas: 'cloudbeds',
  property_id: null,
  llave_propia: false,
  llave_propia_desde: null,
  llave_general: true,
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
  llave_general: true,
  reservas: 68,
};

beforeEach(() => {
  supabaseStub.rpcs.humaya_cloudbeds_estado = [SIN_PROPIEDAD, CONECTADO];
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
