import { useEffect } from 'react';

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
 * Usa `replace` y no `assign` para no dejar el dominio equivocado en el
 * historial: el botón de atrás volvería a rebotar.
 */
export function Mudanza({
  base,
  aviso,
  quitar = '',
}: {
  base: string;
  aviso: string;
  /** El prefijo del hotel (`/demo`), que no viaja al otro lado. */
  quitar?: string;
}) {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const limpio =
      quitar && (pathname === quitar || pathname.startsWith(`${quitar}/`))
        ? pathname.slice(quitar.length) || '/'
        : pathname;
    window.location.replace(`${base}${limpio}${search}${hash}`);
  }, [base, quitar]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <p aria-live="polite" className="m-0 text-center text-[14px] text-muted">
        {aviso}
      </p>
    </div>
  );
}
