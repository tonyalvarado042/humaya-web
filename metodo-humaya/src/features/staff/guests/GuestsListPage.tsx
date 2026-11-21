import { useState } from 'react';
import { Info } from 'lucide-react';
import {
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
  Tag,
  type SegmentedOption,
} from '@/components/ui';
import { useReservas } from '@/hooks';
import { hoyEnCostaRica } from '@/services/clock';
import type { Reserva } from '@/services/reservas';
import { localeDe, longDate } from '../format';
import { momentoDeLaEstadia, type Momento } from '../estadia';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { guestsCopy } from './copy';

/**
 * Quiénes están en la casa, de verdad.
 *
 * ── POR QUÉ EXISTE ESTA PANTALLA ────────────────────────────────────────
 * Hasta el 20 de noviembre de 2026, «Huéspedes» en el menú llevaba a la ficha
 * SIN estadía en la dirección, así que siempre decía «No encontramos a ese
 * huésped». Un elemento del menú que no lleva a ninguna parte.
 *
 * ── POR QUÉ NO ES «RESERVAS» OTRA VEZ ───────────────────────────────────
 * Reservas mira el libro —quién llega, de qué OTA, con qué código— y mira
 * hacia adelante. Acá se miran las personas que están AHORA en la casa y en
 * qué noche va cada una, que es lo que necesita quien atiende el mostrador.
 * Es el mismo dato de Cloudbeds leído con otra pregunta.
 */

type Cuando = 'en-casa' | 'llegan' | 'se-van';

/** La reserva con su momento ya calculado, para no repetir la cuenta. */
interface Fila {
  reserva: Reserva;
  momento: Momento;
}

function filasDe(reservas: Reserva[], hoy: string): Fila[] {
  return reservas
    .filter((reserva) => reserva.estado !== 'canceled')
    .map((reserva) => ({
      reserva,
      momento: momentoDeLaEstadia({ checkIn: reserva.checkin, checkOut: reserva.checkout }, hoy),
    }))
    .sort((a, b) => a.reserva.checkin.localeCompare(b.reserva.checkin));
}

function filtrar(filas: Fila[], cuando: Cuando): Fila[] {
  if (cuando === 'llegan') return filas.filter((fila) => fila.momento.clase === 'llega-hoy');
  if (cuando === 'se-van') return filas.filter((fila) => fila.momento.clase === 'se-va-hoy');
  // «En casa» incluye a quien llega hoy y a quien se va hoy: las tres clases
  // son gente que hoy está en la propiedad, y el mostrador las atiende igual.
  return filas.filter((fila) => ['llega-hoy', 'en-casa', 'se-va-hoy'].includes(fila.momento.clase));
}

function EnQueVa({ momento, copy }: { momento: Momento; copy: typeof guestsCopy.es }) {
  if (momento.clase === 'llega-hoy') return <Tag tone="info">{copy.llegaHoy}</Tag>;
  if (momento.clase === 'se-va-hoy') return <Tag tone="alert">{copy.seVaHoy}</Tag>;

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-[15px]">{copy.noche(momento.dia, momento.noches)}</span>
      {/* Se va mañana cambia todo lo que se le puede ofrecer: va marcado. */}
      {momento.seVaManana ? <Tag tone="alert">{copy.seVaManana}</Tag> : null}
    </span>
  );
}

export function GuestsListPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = guestsCopy[idioma];
  const hoy = hoyEnCostaRica();
  const [cuando, setCuando] = useState<Cuando>('en-casa');

  // «Próximas» ya deja fuera las canceladas y lo que terminó: es exactamente
  // el universo de gente que puede estar en la casa hoy o llegar después.
  const reservas = useReservas('proximas', hoy);

  if (reservas.isPending) {
    return <ScreenLoading label={copy.cargando} />;
  }

  if (reservas.isError || !reservas.data) {
    return <ScreenError onRetry={() => void reservas.refetch()} />;
  }

  const opciones: SegmentedOption<Cuando>[] = [
    { value: 'en-casa', label: copy.enCasa },
    { value: 'llegan', label: copy.lleganHoy },
    { value: 'se-van', label: copy.seVanHoy },
  ];

  const todas = filasDe(reservas.data, hoy);
  const enCasa = filtrar(todas, 'en-casa');
  const visibles = filtrar(todas, cuando);

  const personas = enCasa.reduce((suma, fila) => suma + (fila.reserva.personas ?? 0), 0);
  const villas = new Set(enCasa.map((fila) => fila.reserva.villa).filter(Boolean)).size;
  const seVanManana = enCasa.filter((fila) => fila.momento.seVaManana).length;

  const vacio =
    cuando === 'llegan'
      ? copy.vacioLleganHoy
      : cuando === 'se-van'
        ? copy.vacioSeVanHoy
        : copy.vacioEnCasa;

  return (
    <Screen>
      <ScreenHeading eyebrow={longDate(hoy, localeDe(idioma))} title={copy.title} />
      <p className="m-0 text-sm text-muted">{copy.subtitulo}</p>

      <SegmentedControl
        label={copy.cuandoLabel}
        options={opciones}
        value={cuando}
        onChange={setCuando}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label={copy.statPersonas} value={String(personas)} variant="ink" />
        <StatTile label={copy.statVillas} value={String(villas)} />
        <StatTile label={copy.statSeVanManana} value={String(seVanManana)} />
      </section>

      {visibles.length === 0 ? (
        <EmptyState title={vacio} description={copy.vacioCuerpo} />
      ) : (
        <>
          <div className="hidden rounded-card border border-line bg-surface p-5 lg:block">
            <Table aria-label={copy.tablaLabel}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{copy.colHuesped}</TableHeaderCell>
                  <TableHeaderCell>{copy.colVilla}</TableHeaderCell>
                  <TableHeaderCell>{copy.colMomento}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.map((fila) => (
                  <TableRow key={fila.reserva.id}>
                    <TableCell>
                      <span className="flex flex-col">
                        <span className="text-[15px] font-medium">{fila.reserva.huesped}</span>
                        {fila.reserva.personas ? (
                          <span className="text-[13px] text-muted">
                            {copy.personas(fila.reserva.personas)}
                          </span>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell>
                      {fila.reserva.villa ?? (
                        <span className="text-[13px] text-muted-soft">{copy.sinVilla}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EnQueVa momento={fila.momento} copy={copy} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 lg:hidden">
            {visibles.map((fila) => (
              <Card key={fila.reserva.id} className="flex flex-col gap-1.5">
                <span className="font-display text-xl">{fila.reserva.huesped}</span>
                <span className="text-[13px] text-muted">
                  {fila.reserva.villa ?? copy.sinVilla}
                  {fila.reserva.personas ? ` · ${copy.personas(fila.reserva.personas)}` : ''}
                </span>
                <EnQueVa momento={fila.momento} copy={copy} />
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Se dice por qué no hay botón de ficha, en vez de poner uno que
          rebote. Un botón que se sabe que no lleva a nada es peor que no
          tenerlo: el que lo toca concluye que la pantalla está rota. */}
      <aside className="flex items-start gap-2.5 rounded-card border border-line bg-surface-sunken p-4">
        <Info
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-gold"
        />
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.sinFichaPorQue}</p>
      </aside>
    </Screen>
  );
}
