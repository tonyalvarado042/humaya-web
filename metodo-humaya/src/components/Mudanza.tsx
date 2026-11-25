import { useEffect } from 'react';
import { MARCA } from '@/marca';

/**
 * Manda al visitante al dominio que le corresponde, conservando la ruta.
 *
 * El huésped y el personal comparten el mismo código pero no el mismo dominio
 * (ver `ladoDe` en src/marca.ts). Quien pida /staff en el dominio del huésped
 * no debe ver recepción ni un 404: debe terminar en recepción, en su dominio.
 *
 * ── POR QUÉ LA RUTA VIAJA TAL CUAL ──────────────────────────────────────
 * Porque desde el 24 de noviembre de 2026 los dos lados numeran IGUAL: el
 * código del hotel va en la ruta de los dos.
 *
 *   guestexp.liderax10.com/bikeandbed/staff → hotelexp.liderax10.com/bikeandbed/staff
 *   hotelexp.liderax10.com/bikeandbed/app   → guestexp.liderax10.com/bikeandbed/app
 *
 * Cambia el dominio y nada más. En el dominio propio de un hotel no hay
 * prefijo en ninguno de los dos lados, así que tampoco hay nada que traducir.
 *
 * ── POR QUÉ YA NO TRADUCE PREFIJOS, Y QUÉ COSTÓ ─────────────────────────
 * Tenía dos perillas, `quitar` y `agregar`, de cuando los lados numeraban
 * distinto: del personal el hotel lo decía la cuenta y no iba en la ruta.
 * Cuando el código pasó a la ruta de los dos lados, `quitar` se sacó pero
 * `agregar` quedó, y entonces pegaba el prefijo sobre una ruta que YA lo
 * traía. Comprobado en vivo el 25 de noviembre de 2026:
 * `hotelexp.liderax10.com/bikeandbed/app` terminaba en
 * `guestexp.liderax10.com/bikeandbed/bikeandbed/app` — «Esta dirección no
 * existe».
 *
 * Su prueba estaba en verde porque fingía `pathname = '/app'`, que era el de
 * antes del cambio. Un test con una premisa vieja no protege nada: afirma
 * que el mundo sigue siendo como era.
 *
 * Las perillas no se arreglaron: se quitaron. Mientras existan, alguien las
 * va a volver a usar para tapar una diferencia entre los dos lados que hoy
 * no existe.
 *
 * Usa `replace` y no `assign` para no dejar el dominio equivocado en el
 * historial: el botón de atrás volvería a rebotar.
 */
export function Mudanza({ base, aviso }: { base: string; aviso: string }) {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    window.location.replace(`${base}${pathname}${search}${hash}`);
  }, [base]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <p aria-live="polite" className="m-0 text-center text-[14px] text-muted">
        {aviso}
      </p>
    </div>
  );
}

/**
 * La mudanza de recepción a la app del huésped.
 *
 * ⚠️ `MARCA.dominioHuesped` sale de variables de entorno: `aplicarHotel()`
 * pisa el nombre y el correo con los del hotel resuelto, pero NO los
 * dominios. Con un segundo hotel con dominio propio, esto lo mandaría al
 * dominio de HUMAYA — peor que no mudarlo. Antes de darle dominio propio a
 * otro hotel, los dominios tienen que salir de su fila, no del entorno.
 */
export function MudanzaAlHuesped() {
  return <Mudanza base={MARCA.dominioHuesped} aviso="Taking you to the guest app…" />;
}
