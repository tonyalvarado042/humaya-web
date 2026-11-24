import { useEffect } from 'react';
import { codigoActual, MARCA } from '@/marca';

/**
 * Manda al visitante al dominio que le corresponde, conservando la ruta.
 *
 * El huésped y el personal comparten el mismo código pero no el mismo dominio
 * (ver `ladoDe` en src/marca.ts). Quien pida /staff en el dominio del huésped
 * no debe ver recepción ni un 404: debe terminar en recepción, en su dominio.
 *
 * ── POR QUÉ SE QUITA EL PREFIJO DEL HOTEL ───────────────────────────────
 * Porque los dos lados no numeran igual. En el dominio del huésped el hotel
 * va en la ruta —`guestexp.liderax10.com/demo/app`—, y en el de recepción no
 * va en ninguna parte: lo dice la cuenta. Recepción del hotel demo vive en
 * `hotelexp.liderax10.com/staff`, no en `/demo/staff`.
 *
 * Sin esto, el botón «Recepción» del hotel demo terminaba en
 * `staff.stayhumaya.com/demo/staff`: dominio equivocado y ruta inexistente,
 * las dos cosas a la vez. Comprobado en vivo el 24 de noviembre de 2026 —
 * «Esta dirección no existe».
 *
 * ── Y POR QUÉ, AL REVÉS, HAY QUE PONERLO ───────────────────────────────
 * Por lo mismo, en espejo. Del lado del personal el hotel no va en la ruta,
 * así que al mandar a alguien a la app del huésped **hay que agregárselo**.
 *
 * Sin esto, «Abrir la app del huésped» del menú de recepción caía en
 * `guestexp.liderax10.com/app` —sin hotel— y el huésped de nadie veía
 * «Falta el hotel en la dirección». Comprobado en vivo el 24 de noviembre
 * de 2026, en el teléfono, con la recepción de Bike & Bed.
 *
 * Usa `replace` y no `assign` para no dejar el dominio equivocado en el
 * historial: el botón de atrás volvería a rebotar.
 */
export function Mudanza({
  base,
  aviso,
  quitar = '',
  agregar = '',
}: {
  base: string;
  aviso: string;
  /** El prefijo del hotel (`/demo`), que no viaja al otro lado. */
  quitar?: string;
  /** El prefijo del hotel que hay que PONER del otro lado (`/demo`). */
  agregar?: string;
}) {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const limpio =
      quitar && (pathname === quitar || pathname.startsWith(`${quitar}/`))
        ? pathname.slice(quitar.length) || '/'
        : pathname;
    window.location.replace(`${base}${agregar}${limpio}${search}${hash}`);
  }, [base, quitar, agregar]);

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
 * Existe como componente aparte porque el prefijo **no se sabe cuando se
 * arma el router**: del lado del personal el hotel lo dice la cuenta, y la
 * cuenta se resuelve después de entrar. Acá se lee en el momento de pintar,
 * que ya es después.
 *
 * `compartido` es del dominio desde el que se sale. En el dominio propio de
 * un hotel —`staff.stayhumaya.com`— la app del huésped tampoco lleva
 * prefijo, así que no se le pone ninguno.
 */
export function MudanzaAlHuesped({ compartido = false }: { compartido?: boolean }) {
  const codigo = codigoActual();
  return (
    <Mudanza
      base={MARCA.dominioHuesped}
      agregar={compartido && codigo ? `/${codigo}` : ''}
      aviso="Taking you to the guest app…"
    />
  );
}
