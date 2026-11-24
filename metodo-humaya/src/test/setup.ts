import { configure } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import '@/i18n';

/**
 * Los servicios mock simulan 200–400 ms de red, y varias pantallas encadenan
 * cuatro consultas antes de pintar. El segundo por defecto de Testing Library
 * queda corto y genera fallos intermitentes.
 */
configure({ asyncUtilTimeout: 3000 });

/**
 * El SDK de Supabase se falsifica para toda la suite. La factory tiene que
 * importar el stub adentro: `vi.mock` se iza sobre los imports del archivo, así
 * que una variable del módulo todavía no existiría cuando corre.
 *
 * Lo que se falsifica es el SDK, no nuestro servicio de sesión: así el código
 * que decide quién entra a recepción se ejecuta de verdad en los tests.
 */
vi.mock('@supabase/supabase-js', async () => {
  const { clienteFalso } = await import('./supabaseStub');
  return { createClient: () => clienteFalso() };
});

/**
 * Cada test arranca con una sesión de recepción abierta.
 *
 * Las pantallas de recepción prueban la pantalla, no la puerta: si cada una
 * tuviera que autenticarse primero, el test diría menos y tardaría más. La
 * puerta tiene sus propios tests —Puerta.test.tsx— y ahí la sesión se cierra a
 * propósito para comprobar que nadie entra sin ella.
 */
beforeEach(async () => {
  // Navegador limpio en cada test. Varias pantallas recuerdan cosas acá —el
  // idioma elegido, la estadía— y lo que guarda un test no debe decidir lo que
  // ve el siguiente.
  try {
    window.localStorage.clear();
  } catch {
    // Sin almacenamiento no hay nada que limpiar.
  }

  const { resetSupabaseStub, stubSesionAbierta, NEGOCIO_DE_PRUEBA } =
    await import('./supabaseStub');
  resetSupabaseStub();
  stubSesionAbierta();

  // Toda pantalla corre dentro de un hotel, igual que en produccion: ahi lo
  // resuelve `resolverHotel()` antes de pintar. Sin esto, `elNegocio()` falla
  // —a proposito— y ninguna consulta sabria de quien son los datos.
  const { aplicarHotel } = await import('@/marca');
  aplicarHotel({
    negocioId: NEGOCIO_DE_PRUEBA,
    codigo: 'humaya',
    marcaExperiencia: 'HUMAYA Experience',
    marcaHotel: 'HUMAYA',
    correo: 'reservations@stayhumaya.com',
    esDemo: false,
    portadaTitulo: null,
    portadaBajada: null,
    // Los colores quedan en los de siempre —el tema de un hotel se prueba
    // aparte, en tema.test.ts— pero el LOGO va, porque en produccion HUMAYA
    // lo tiene en su tema desde el 21 de noviembre de 2026. Sin esto los
    // tests probarian una HUMAYA sin logotipo, que no existe.
    tema: { logo: '/wordmark-white.png', logoMarca: '/mark-gold.png' },
  });
});
