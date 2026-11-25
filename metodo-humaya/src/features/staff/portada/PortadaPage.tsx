import { ArrowUpRight, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IconoDeEnlace } from '@/components/IconoDeEnlace';
import { LogoDelHotel } from '@/components/LogoDelHotel';
import { useEnlaces } from '@/hooks';
import { MARCA } from '@/marca';
import type { Enlace } from '@/services/enlaces';
import { useEsAdministrador, useIdiomaRecepcion } from '../puerta/contexto';
import { portadaCopy } from './copy';

/**
 * La portada interna del hotel.
 *
 * ── DE DÓNDE SALE ───────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «generé una landing configurable para cada
 * hotel desde admin con todos links… Visión x10, Panel guest, Panel
 * recepción, Cloud beds, Sitio web. Algo bonito y llamativo para uso
 * interno».
 *
 * ── POR QUÉ DETRÁS DE LA PUERTA ─────────────────────────────────────────
 * Porque la lista de herramientas internas de un hotel es información del
 * hotel: dice con qué PMS trabaja y qué dominios usa. Y porque el hotel lo
 * dice la CUENTA: `hotelexp.liderax10.com` es la misma dirección para todos,
 * así que sin sesión esta pantalla no sabría de quién es la portada que está
 * mostrando.
 *
 * ── POR QUÉ NO USA EL MARCO DE RECEPCIÓN ────────────────────────────────
 * Porque es una portada, no una pantalla más del panel. Con la barra lateral
 * al lado se leería como «otra sección», y la mitad de las fichas llevan
 * FUERA del panel. Va a pantalla completa, sobre el fondo oscuro: ahí el
 * logotipo largo del hotel se ve —en el crema de recepción el wordmark
 * blanco desaparece, comprobado en pantalla— y las fichas doradas resaltan.
 *
 * ── POR QUÉ CASI TODO ABRE EN OTRA PESTAÑA ──────────────────────────────
 * Porque es un tablero del que se sale y al que se vuelve todo el día. Lo
 * que vive en este mismo dominio abre acá mismo, que es lo que uno espera de
 * un enlace a su propia casa.
 */
export function PortadaPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = portadaCopy[idioma];
  const esAdmin = useEsAdministrador();
  const enlaces = useEnlaces(true);

  return (
    <div data-theme="staff" className="relative min-h-dvh overflow-hidden bg-nav text-on-ink">
      {/* Un respiro de color, con el acento DEL HOTEL: `--gold` lo redefine
          su tema, así que esta misma línea se ve verde en un hotel verde.
          Decorativo y nada más, por eso `aria-hidden`. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-100 bg-[radial-gradient(70%_100%_at_50%_0%,var(--gold-dim),transparent_72%)] opacity-40"
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-4xl flex-col justify-center gap-12 px-5 py-14 sm:px-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="text-[11px] tracking-[0.22em] text-gold-on-ink uppercase">
            {MARCA.experiencia} · {copy.cejilla}
          </span>
          <LogoDelHotel className="mx-auto w-full max-w-150 text-4xl text-on-ink sm:text-5xl" />
          <p className="m-0 max-w-prose text-[15px] leading-relaxed text-ink-muted">
            {copy.bajada}
          </p>
        </header>

        <main>
          {enlaces.isPending ? (
            <p aria-live="polite" className="m-0 text-sm text-ink-muted">
              {copy.cargando}
            </p>
          ) : enlaces.isError || !enlaces.data ? (
            <div role="alert" className="flex flex-col items-start gap-3">
              <p className="m-0 text-sm text-on-alert">{copy.noCargo}</p>
              <button
                type="button"
                onClick={() => void enlaces.refetch()}
                className="rounded-pill border border-line-strong px-4 py-1.5 text-[13px] text-on-ink transition-colors hover:border-gold-on-ink"
              >
                {copy.reintentar}
              </button>
            </div>
          ) : enlaces.data.length === 0 ? (
            <div className="max-w-prose rounded-2xl border border-line bg-ink p-6">
              <h2 className="m-0 font-display text-2xl font-medium text-on-ink">
                {copy.vacioTitulo}
              </h2>
              <p className="m-0 mt-2 text-sm leading-relaxed text-ink-muted">{copy.vacioCuerpo}</p>
            </div>
          ) : (
            /* `auto-rows-fr` solo desde `sm`: en una sola columna iguala
               todas las fichas a la más alta y deja huecos enormes en el
               teléfono. */
            <ul
              aria-label={copy.lista}
              className="m-0 grid list-none gap-3 p-0 sm:auto-rows-fr sm:grid-cols-2"
            >
              {enlaces.data.map((enlace) => (
                <li key={enlace.id}>
                  <Ficha enlace={enlace} aparte={copy.seAbreAparte} />
                </li>
              ))}
            </ul>
          )}
        </main>

        <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-[13px]">
          <Link
            to="/staff"
            className="text-ink-muted no-underline transition-colors hover:text-on-ink"
          >
            {copy.alPanel}
          </Link>
          {/* Solo el administrador: RLS deja escribir estos enlaces nada más
              a ese rol, y ofrecerle el camino a quien va a rebotar es hacerle
              perder el tiempo. */}
          {esAdmin ? (
            <Link
              to="/staff/admin/enlaces"
              className="inline-flex items-center gap-1.5 text-ink-muted no-underline transition-colors hover:text-on-ink"
            >
              <Settings2 size={14} strokeWidth={1.6} aria-hidden="true" />
              {copy.configurar}
            </Link>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

/**
 * Una ficha. El dominio va escrito abajo a propósito: es lo que deja saber a
 * dónde lleva antes de tocar, y en un tablero de enlaces ajenos eso importa.
 */
function Ficha({ enlace, aparte }: { enlace: Enlace; aparte: string }) {
  const fuera = esDeAfuera(enlace.url);
  return (
    <a
      href={enlace.url}
      {...(fuera ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="group flex h-full flex-col gap-2.5 rounded-2xl border border-line bg-ink p-6 text-on-ink no-underline transition-colors hover:border-gold-on-ink hover:bg-surface/5"
    >
      <span className="flex items-start justify-between gap-2">
        {/* El ícono sobre una placa: en un fondo casi negro, un trazo dorado
            de 26 px suelto se pierde. */}
        <span className="flex size-12 items-center justify-center rounded-xl bg-gold-on-ink/12 text-gold-on-ink transition-colors group-hover:bg-gold-on-ink/20">
          <IconoDeEnlace nombre={enlace.icono} size={24} />
        </span>
        <ArrowUpRight
          size={18}
          strokeWidth={1.6}
          aria-hidden="true"
          className="mt-1 shrink-0 text-ink-muted transition-colors group-hover:text-gold-on-ink"
        />
      </span>
      <span className="font-display text-[26px] leading-tight font-medium">{enlace.etiqueta}</span>
      {enlace.descripcion ? (
        <span className="text-[13px] leading-relaxed text-ink-muted">{enlace.descripcion}</span>
      ) : null}
      {/* `ink-muted` y no `muted-soft`: este fondo es casi negro y
          `muted-soft` es un marrón apagado que ahí no se lee. */}
      <span className="mt-auto pt-3 text-[12px] break-all text-ink-muted/75">
        {dominioDe(enlace.url)}
        {fuera ? <span className="sr-only"> ({aparte})</span> : null}
      </span>
    </a>
  );
}

/** El dominio pelado, para mostrarlo. Una dirección rara se muestra entera. */
function dominioDe(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * Si el enlace sale de este dominio. Lo de afuera abre en otra pestaña para
 * no perder la portada; lo de casa abre acá mismo.
 */
function esDeAfuera(url: string): boolean {
  try {
    return new URL(url).origin !== window.location.origin;
  } catch {
    return true;
  }
}
