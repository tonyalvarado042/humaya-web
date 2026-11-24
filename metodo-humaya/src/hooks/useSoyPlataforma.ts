import { useEffect, useState } from 'react';
import { soyPlataforma } from '@/services/panelHoteles';

/**
 * Si quien entró manda sobre todos los hoteles.
 *
 * Sirve para no ofrecer el panel de hoteles a quien la base le va a decir
 * que no: la regla de la casa es que un botón que se sabe que va a rebotar
 * no se ofrece, se explica. Lo que protege de verdad son las funciones de
 * la base, que preguntan esto mismo antes de hacer nada.
 *
 * Arranca en `false` a propósito: mientras no se sepa, no se muestra. Al
 * revés —mostrar y después esconder— el enlace parpadearía para todos.
 */
export function useSoyPlataforma(): boolean {
  const [esPlataforma, setEsPlataforma] = useState(false);

  useEffect(() => {
    let vivo = true;
    // El setState ocurre después del await, ya fuera del cuerpo del efecto.
    void soyPlataforma().then((r) => {
      if (vivo) setEsPlataforma(r);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return esPlataforma;
}
