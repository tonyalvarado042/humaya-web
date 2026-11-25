import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PantallaTv } from './PantallaTv';

/**
 * Crear villas y escribir la guía de la casa, desde el panel.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «un hotel nace vacío y no se puede
 * llenar… arregla eso». Esta pantalla lo decía con todas las letras: «las
 * villas se crean en la base, en humaya_tv_villas», y la guía «se cambia en
 * la base, en humaya_tv_ajustes». Para que un hotel nuevo tuviera una sola
 * pantalla de televisor, alguien tenía que escribirle SQL.
 */

beforeEach(() => {
  supabaseStub.tablas.humaya_tv_villas = [];
  supabaseStub.tablas.humaya_tv_ajustes = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      guia: {
        // Los lugares de alrededor se editan en OTRO formulario de la misma
        // pantalla, y viven en la misma columna jsonb.
        local: [{ category: 'Comer', items: [{ name: 'Soda', distance: '5 min', note: '' }] }],
      },
    },
  ];
});

function villas() {
  return supabaseStub.tablas.humaya_tv_villas;
}

describe('crear una villa', () => {
  it('cuando no hay ninguna, dice cómo agregarla en vez de mandar a la base', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });

    expect(await screen.findByText('Todavía no hay ninguna villa')).toBeInTheDocument();
    expect(
      screen.getByText('Agregá la primera acá abajo y la pantalla de su televisor queda lista.'),
    ).toBeInTheDocument();
    // Lo que decía antes:
    expect(screen.queryByText(/se crean en la base/)).not.toBeInTheDocument();
  });

  /**
   * La llave primaria de `humaya_tv_villas` es el `id` SOLO, sin el hotel.
   * Sin el código delante, dos hoteles que creen su «Villa 1» chocarían y el
   * segundo vería un error de llave repetida sin entender por qué.
   */
  it('la crea con el código del hotel en el id y con su negocio', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    await screen.findByText('Todavía no hay ninguna villa');

    await userEvent.click(screen.getByRole('button', { name: 'Agregar villa' }));
    await userEvent.type(screen.getByLabelText('Nombre de la villa'), 'V1 · CAPI CAPI');
    await userEvent.click(screen.getByRole('button', { name: 'Crear la villa' }));

    const creada = await vi.waitFor(() => {
      const fila = villas()[0];
      if (!fila) throw new Error('todavía no');
      return fila;
    });

    expect(creada.id).toBe('humaya-v1-capi-capi');
    expect(creada.negocio_id).toBe(NEGOCIO_DE_PRUEBA);
    expect(creada.nombre).toBe('V1 · CAPI CAPI');
    expect(creada.orden).toBe(1);
  });

  it('dos villas con el mismo nombre no chocan', async () => {
    supabaseStub.tablas.humaya_tv_villas = [
      { negocio_id: NEGOCIO_DE_PRUEBA, id: 'humaya-casa-grande', nombre: 'Casa grande', orden: 1 },
    ];
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    await screen.findByText('Casa grande');

    await userEvent.click(screen.getByRole('button', { name: 'Agregar villa' }));
    await userEvent.type(screen.getByLabelText('Nombre de la villa'), 'Casa grande');
    await userEvent.click(screen.getByRole('button', { name: 'Crear la villa' }));

    await vi.waitFor(() => expect(villas()).toHaveLength(2));
    expect(villas()[1].id).toBe('humaya-casa-grande-2');
  });

  it('pide nombre antes de crear', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    await screen.findByText('Todavía no hay ninguna villa');

    await userEvent.click(screen.getByRole('button', { name: 'Agregar villa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Crear la villa' }));

    expect(await screen.findByText('Ponele un nombre.')).toBeInTheDocument();
    expect(villas()).toHaveLength(0);
  });
});

describe('la guía de la casa', () => {
  function guiaGuardada() {
    return supabaseStub.tablas.humaya_tv_ajustes[0].guia as Record<string, unknown>;
  }

  /**
   * La pantalla tiene tres formularios con un «Guardar» cada uno —el Wi-Fi
   * del hotel, los lugares de alrededor y la guía—, así que las consultas
   * van acotadas al de la guía. Sin esto la prueba apretaría el botón
   * equivocado y pasaría o fallaría por el motivo equivocado.
   */
  async function abrirGuia() {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    const titulo = await screen.findByText('La guía de la casa');
    const form = titulo.closest('form');
    if (!form) throw new Error('la guía no está dentro de un formulario');
    return within(form);
  }

  it('se escribe desde la pantalla, no desde la base', async () => {
    const guia = await abrirGuia();

    await userEvent.type(guia.getByLabelText('El saludo'), 'Bienvenido a casa.');
    await userEvent.click(guia.getByRole('button', { name: 'Guardar' }));

    await vi.waitFor(() => expect(guiaGuardada().welcome).toBe('Bienvenido a casa.'));
  });

  /**
   * ── POR QUÉ ESTA PRUEBA ─────────────────────────────────────────────
   * Porque `guia` es UNA columna jsonb que comparten dos formularios de la
   * misma pantalla. Escribirla de cero —en vez de leer y mezclar— le
   * borraría al hotel todos los lugares de alrededor sin un solo error.
   */
  it('guardar la guía no borra los lugares de alrededor', async () => {
    const guia = await abrirGuia();

    await userEvent.type(guia.getByLabelText('El saludo'), 'Hola.');
    await userEvent.click(guia.getByRole('button', { name: 'Guardar' }));

    await vi.waitFor(() => expect(guiaGuardada().welcome).toBe('Hola.'));
    expect(guiaGuardada().local).toEqual([
      { category: 'Comer', items: [{ name: 'Soda', distance: '5 min', note: '' }] },
    ]);
  });

  it('una regla en blanco no llega al televisor', async () => {
    const guia = await abrirGuia();
    const reglas = within(guia.getByRole('group', { name: 'Las reglas de la casa' }));

    // Dos fichas: una con texto y otra que se queda vacía.
    await userEvent.click(reglas.getByRole('button', { name: 'Agregar' }));
    await userEvent.type(reglas.getByLabelText('Título'), 'Silencio');
    await userEvent.click(reglas.getByRole('button', { name: 'Agregar' }));
    await userEvent.click(guia.getByRole('button', { name: 'Guardar' }));

    await vi.waitFor(() => expect(guiaGuardada().rules).toEqual([{ title: 'Silencio', body: '' }]));
  });
});
