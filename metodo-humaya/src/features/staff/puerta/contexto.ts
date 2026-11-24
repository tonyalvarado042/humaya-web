import { createContext, useContext } from 'react';
import type { Idioma } from '@/hooks/useIdiomaElegido';
import type { Persona } from '@/services/sesion';

export interface Recepcion {
  persona: Persona;
  idioma: Idioma;
  cambiarIdioma: () => void;
  /**
   * Volver a elegir hotel, o null cuando esta cuenta trabaja en uno solo.
   *
   * Null y no una función que no hace nada: la regla de la casa es que un
   * botón que se sabe que no lleva a ninguna parte no se ofrece.
   */
  cambiarHotel: (() => void) | null;
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

/**
 * Si quien entró puede cambiar la configuración del hotel.
 *
 * ── PARA QUÉ SE PREGUNTA ANTES ──────────────────────────────────────────
 * Regla de la casa: si se sabe de antemano que un botón va a rebotar, no se
 * ofrece el botón — se explica por qué no está. Las tablas `humaya_*` dejan
 * LEER a todo recepción y escribir solo al rol `administrador`, así que sin
 * esto el formulario de marca se llenaría entero para terminar en «solo un
 * administrador puede cambiar esto» al apretar Guardar.
 *
 * Esto NO es lo que protege los datos: eso lo hace RLS en la base, y sigue
 * haciéndolo. Esto es para no hacerle perder el tiempo a nadie.
 */
export function useEsAdministrador(): boolean {
  return useRecepcion().persona.rol === 'administrador';
}

/** El idioma de recepción y el botón para cambiarlo. */
export function useIdiomaRecepcion(): [Idioma, () => void] {
  const { idioma, cambiarIdioma } = useRecepcion();
  return [idioma, cambiarIdioma];
}

/** Volver a elegir hotel, o null si esta cuenta solo tiene uno. */
export function useCambiarHotel(): (() => void) | null {
  return useRecepcion().cambiarHotel;
}
