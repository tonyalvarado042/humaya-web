import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Badge,
  Card,
  EmptyState,
  SegmentedControl,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type SegmentedOption,
} from '@/components/ui';
import { useAgendaPorServicio } from '@/hooks';
import { ahoraEnCostaRica, diaSiguiente, diasDesde, hoyEnCostaRica } from '@/services/clock';
import { enOrdenDeHora, laProxima } from '@/services/agenda';
import type { ReservaDeServicio, ServicioConReservas } from '@/types';
import { localeDe, longDate } from '../format';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { spaCopy, type SpaTextos } from './copy';

/**
 * La agenda de recepción: lo que los huéspedes tienen reservado, de verdad.
 *
 * ── QUÉ CAMBIÓ Y POR QUÉ ────────────────────────────────────────────────
 * Hasta el 17 de noviembre de 2026 esta pantalla mostraba la agenda de
 * ejemplo del 15 de noviembre, con fecha fija en el código y nombres
 * inventados. Mientras tanto la app del huésped ya reservaba de verdad en
 * `humaya_servicio_reservas`, y esas reservas no aparecían en ninguna parte.
 * Recepción tenía una pantalla que parecía su agenda y no lo era.
 *
 * ── POR QUÉ DOS SELECTORES Y NO UNO ─────────────────────────────────────
 * Son dos preguntas distintas y se mezclaban mal en un solo control:
 * «qué días miro» y «cómo lo quiero ver». Por hora sirve para atender el día;
 * por servicio, para saber cómo viene la semana del entrenador.
 *
 * ── POR QUÉ LOS TEXTOS LLEGAN POR PROPIEDAD ─────────────────────────────
 * Porque el idioma lo lee la pantalla, una sola vez, y lo reparte. Si cada
 * componente de abajo llamara al hook, `PantallaTv` —que su prueba monta
 * fuera de la puerta de recepción— reventaría, y los selectores de arriba,
 * que son constantes de módulo, se quedarían en el idioma del primer render.
 */

type Cuando = 'hoy' | 'manana' | 'semana';
type Como = 'hora' | 'servicio';

function diasAMirar(copy: SpaTextos): SegmentedOption<Cuando>[] {
  return [
    { value: 'hoy', label: copy.hoy },
    { value: 'manana', label: copy.manana },
    { value: 'semana', label: copy.semana },
  ];
}

function formasDeVerlo(copy: SpaTextos): SegmentedOption<Como>[] {
  return [
    { value: 'hora', label: copy.porHora },
    { value: 'servicio', label: copy.porServicio },
  ];
}

function rangoDe(cuando: Cuando, hoy: string): { desde: string; hasta: string } {
  if (cuando === 'manana') {
    const manana = diaSiguiente(hoy);
    return { desde: manana, hasta: manana };
  }
  if (cuando === 'semana') {
    const dias = diasDesde(hoy, 7);
    return { desde: dias[0], hasta: dias[dias.length - 1] };
  }
  return { desde: hoy, hasta: hoy };
}

/** "3:00 p.m." a partir de un HH:MM suelto, sin inventar un huso. */
function horaLegible(hhmm: string): string {
  const [hora, minuto] = hhmm.split(':').map(Number);
  const sufijo = hora < 12 ? 'a.m.' : 'p.m.';
  const enDoce = hora % 12 === 0 ? 12 : hora % 12;
  return `${enDoce}:${String(minuto).padStart(2, '0')} ${sufijo}`;
}

/** El día en corto, para cuando el rango abarca varios. */
function diaCorto(fecha: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Costa_Rica',
  }).format(new Date(`${fecha}T12:00:00-06:00`));
}

function NombreDelServicio({ reserva, copy }: { reserva: ReservaDeServicio; copy: SpaTextos }) {
  // Sin nombre significa que el servicio ya no está en el catálogo. Se dice,
  // porque la persona va a llegar igual y alguien tiene que atenderla.
  if (!reserva.servicioNombre) {
    return <span className="text-sm text-on-alert">{copy.servicioBorrado}</span>;
  }

  const detalles = [
    reserva.proveedor ? copy.con(reserva.proveedor) : null,
    reserva.duracionMin ? copy.minutos(reserva.duracionMin) : null,
  ].filter(Boolean);

  return (
    <span className="flex flex-col">
      <span className="text-[15px] text-text">{reserva.servicioNombre}</span>
      {detalles.length > 0 ? (
        <span className="text-[13px] text-muted">{detalles.join(' · ')}</span>
      ) : null}
    </span>
  );
}

export function SpaPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = spaCopy[idioma];
  const locale = localeDe(idioma);
  const hoy = hoyEnCostaRica();
  const [cuando, setCuando] = useState<Cuando>('hoy');
  const [como, setComo] = useState<Como>('hora');

  const { desde, hasta } = rangoDe(cuando, hoy);
  const agenda = useAgendaPorServicio(desde, hasta);

  if (agenda.isPending) {
    return <ScreenLoading label={copy.cargando} />;
  }

  if (agenda.isError || !agenda.data) {
    return <ScreenError onRetry={() => void agenda.refetch()} />;
  }

  const grupos = agenda.data;
  const reservas = enOrdenDeHora(grupos);
  const variosDias = desde !== hasta;
  const proxima = laProxima(reservas, ahoraEnCostaRica());
  const activos = grupos.filter((grupo) => grupo.habilitado).length;

  return (
    <Screen>
      <ScreenHeading
        eyebrow={
          variosDias
            ? `${diaCorto(desde, locale)} – ${diaCorto(hasta, locale)}`
            : longDate(desde, locale)
        }
        title={copy.title}
      />

      <div className="flex flex-wrap gap-3">
        <SegmentedControl
          label={copy.cuandoLabel}
          options={diasAMirar(copy)}
          value={cuando}
          onChange={setCuando}
        />
        <SegmentedControl
          label={copy.comoLabel}
          options={formasDeVerlo(copy)}
          value={como}
          onChange={setComo}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label={copy.statReservas} value={String(reservas.length)} />
        <StatTile
          label={copy.statProxima}
          value={proxima ? horaLegible(proxima.horaInicio) : copy.nada}
          suffix={
            proxima
              ? variosDias
                ? diaCorto(proxima.fecha, locale)
                : proxima.guestName
              : reservas.length > 0
                ? copy.yaPasaron
                : undefined
          }
        />
        <StatTile label={copy.statServicios} value={String(activos)} />
      </section>

      {grupos.length === 0 ? (
        <EmptyState title={copy.sinCatalogoTitulo} description={copy.sinCatalogoCuerpo} />
      ) : reservas.length === 0 && como === 'hora' ? (
        <EmptyState title={copy.vacioTitulo} description={copy.vacioCuerpo} />
      ) : como === 'hora' ? (
        <PorHora reservas={reservas} variosDias={variosDias} copy={copy} locale={locale} />
      ) : (
        <PorServicio grupos={grupos} variosDias={variosDias} copy={copy} locale={locale} />
      )}

      {/* Se dice antes de que alguien lo busque. Callarlo haría que recepción
          concluya que nadie usa el sauna. */}
      <aside className="flex items-start gap-2.5 rounded-card border border-line bg-surface-sunken p-4">
        <Info
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-gold"
        />
        <div className="flex flex-col gap-1">
          <p className="m-0 text-sm font-medium text-text">{copy.faltaSaunaTitulo}</p>
          <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.faltaSaunaCuerpo}</p>
        </div>
      </aside>
    </Screen>
  );
}

interface PorHoraProps {
  reservas: ReservaDeServicio[];
  variosDias: boolean;
  copy: SpaTextos;
  locale: string;
}

function PorHora({ reservas, variosDias, copy, locale }: PorHoraProps) {
  return (
    <>
      {/* Tabla completa desde 1024 px; abajo, tarjetas. */}
      <div className="hidden rounded-card border border-line bg-surface p-5 lg:block">
        <Table aria-label={copy.tableLabel}>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-44">{copy.colCuando}</TableHeaderCell>
              <TableHeaderCell>{copy.colHuesped}</TableHeaderCell>
              <TableHeaderCell>{copy.colServicio}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCell className="text-[15px] font-medium">
                  {variosDias ? `${diaCorto(reserva.fecha, locale)} · ` : ''}
                  {horaLegible(reserva.horaInicio)}
                </TableCell>
                <TableCell className="text-[15px]">{reserva.guestName}</TableCell>
                <TableCell>
                  <NombreDelServicio reserva={reserva} copy={copy} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {reservas.map((reserva) => (
          <Card key={reserva.id} className="flex flex-col gap-1.5">
            <span className="font-display text-xl">
              {variosDias ? `${diaCorto(reserva.fecha, locale)} · ` : ''}
              {horaLegible(reserva.horaInicio)}
            </span>
            <span className="text-[15px] font-medium text-text">{reserva.guestName}</span>
            <NombreDelServicio reserva={reserva} copy={copy} />
          </Card>
        ))}
      </div>
    </>
  );
}

interface PorServicioProps {
  grupos: ServicioConReservas[];
  variosDias: boolean;
  copy: SpaTextos;
  locale: string;
}

function PorServicio({ grupos, variosDias, copy, locale }: PorServicioProps) {
  return (
    <div className="flex flex-col gap-3">
      {grupos.map((grupo) => (
        <Card key={grupo.servicioId} className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 font-display text-xl font-medium">
              {grupo.nombre || copy.servicioBorrado}
            </h2>
            {grupo.habilitado ? null : <Badge tone="warning">{copy.apagado}</Badge>}
            <span className="text-[13px] text-muted">
              {grupo.proveedor ? copy.con(grupo.proveedor) : ''}
            </span>
          </div>

          {grupo.reservas.length === 0 ? (
            <p className="m-0 text-sm text-muted-soft">{copy.sinNadie}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {grupo.reservas.map((reserva) => (
                <li key={reserva.id} className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="text-[15px] font-medium text-text">
                    {variosDias ? `${diaCorto(reserva.fecha, locale)} · ` : ''}
                    {horaLegible(reserva.horaInicio)}
                  </span>
                  <span className="text-[15px] text-text">{reserva.guestName}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}
