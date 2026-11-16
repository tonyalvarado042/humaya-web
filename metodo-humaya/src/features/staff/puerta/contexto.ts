import { createContext, useContext } from 'react';
import type { Idioma } from '@/hooks/useIdiomaElegido';
import type { Persona } from '@/services/sesion';

export interface Recepcion {
  persona: Persona;
  idioma: Idioma;
  cambiarIdioma: () => void;
}

/**
 * Lo que comparte recepción: quién entró y en qué idioma trabaja.
 *
 * Vive aparte de la pantalla porque un archivo que exporta componentes y además
 * funciones rompe el recargado en caliente de Vite: al tocar un hook se
 * recargaría la página entera en vez del componente.
 *
 * El idioma va acá y no en cada pantalla para que el botón del menú lo cambie
 * en todas a la vez. Si cada una leyera `localStorage` por su cuenta, cambiarlo
 * en una dejaría a las otras en el idioma viejo hasta recargar.
 */
export const PuertaContexto = createContext<Recepcion | null>(null);

function useRecepcion(): Recepcion {
  const valor = useContext(PuertaContexto);
  if (!valor) {
    throw new Error('Esta pantalla se montó fuera de la puerta de recepción');
  }
  return valor;
}

/**
 * La persona que entró. Las pantallas pueden contar con que no es null: la
 * puerta no las monta sin sesión con rol.
 */
export function useQuienEntro(): Persona {
  return useRecepcion().persona;
}

/** El idioma de recepción y el botón para cambiarlo. */
export function useIdiomaRecepcion(): [Idioma, () => void] {
  const { idioma, cambiarIdioma } = useRecepcion();
  return [idioma, cambiarIdioma];
}
