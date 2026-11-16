import { useEffect, useState } from 'react';

/** Los dos idiomas de las pantallas que no tienen estadía de donde sacarlo. */
export type Idioma = 'en' | 'es';

/**
 * El idioma de una pantalla que se elige a mano y se recuerda.
 *
 * ── POR QUÉ NO SE ADIVINA DEL NAVEGADOR ─────────────────────────────────
 * Un huésped alemán que reservó en inglés espera inglés, no alemán a medias.
 * Y en recepción, el navegador de la computadora del hotel no dice nada del
 * idioma de quien está sentado ahí. Así que arranca en inglés —decisión de
 * Tony del 15 de noviembre de 2026— y quien lo necesite lo cambia una vez.
 *
 * ── POR QUÉ NO USA i18next ──────────────────────────────────────────────
 * i18next lee la preferencia de la estadía, que en estas pantallas todavía no
 * existe: /entrada es justamente la que la encuentra, y la puerta de recepción
 * atiende a alguien que no es huésped.
 *
 * localStorage puede fallar o venir vacío (ventana privada, datos borrados),
 * así que todo va envuelto: sin él la pantalla igual funciona, solo que no
 * recuerda la elección.
 */
export function useIdiomaElegido(llave: string): [Idioma, (idioma: Idioma) => void] {
  const [idioma, setIdioma] = useState<Idioma>(() => {
    try {
      return localStorage.getItem(llave) === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = idioma;
    try {
      localStorage.setItem(llave, idioma);
    } catch {
      // Sin almacenamiento la pantalla sirve igual; solo no recuerda.
    }
  }, [idioma, llave]);

  return [idioma, setIdioma];
}
