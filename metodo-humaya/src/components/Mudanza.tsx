import { useEffect } from 'react';

/**
 * Manda al visitante al dominio que le corresponde, conservando la ruta.
 *
 * El huésped y el personal comparten el mismo código pero no el mismo dominio
 * (ver `ladoDe` en src/marca.ts). Quien pida /staff en el dominio del huésped
 * no debe ver recepción ni un 404: debe terminar en recepción, en su dominio.
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
