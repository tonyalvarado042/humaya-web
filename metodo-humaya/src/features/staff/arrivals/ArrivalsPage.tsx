import { useMemo, useState } from 'react';
import {
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
} from '@/components/ui';
import { useAjustes, useReservas } from '@/hooks';
import { getToday } from '@/services/clock';
import { resumirReservas, type FiltroReservas, type Reserva } from '@/services/reservas';
import { longDate } from '../format';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { arrivalsCopy, type ArrivalsTextos } from './copy';
import { LlegadasDemo } from './LlegadasDemo';

/** El rango de la estadía en una línea: "Dec 17 → Dec 21". */
function rango(reserva: Reserva, locale: string): string {
  const dia = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
  return `${dia(reserva.checkin)} → ${dia(reserva.checkout)}`;
}

function EstadoTag({ estado, copy }: { estado: string; copy: ArrivalsTextos }) {
  if (estado === 'canceled') return <Tag tone="alert">{copy.estadoCancelada}</Tag>;
  if (estado === 'not_confirmed') return <Tag tone="info">{copy.estadoSinConfirmar}</Tag>;
  return <span className="text-[13px] text-muted">{copy.estadoConfirmada}</span>;
}

const filtros: FiltroReservas[] = ['proximas', 'todas', 'sin_correo'];

/**
 * "demo" no es un filtro de reservas: es la pantalla vieja entera. Va en el
 * mismo control porque para recepción es una vista más de Llegadas, y porque
 * un segundo control solo para eso sobraría el día que el demo se apague.
 */
type Vista = FiltroReservas | 'demo';

/**
 * Llegadas: las reservas de verdad.
 *
 * ── QUÉ CAMBIÓ ──────────────────────────────────────────────────────────
 * Esta pantalla mostraba dos estadías de ejemplo —Valeria y Hannah— con su
 * progreso de entrevista, sus alertas y su tablero de villas, todo inventado
 * para la demo. Ahora muestra lo que hay en la base: las reservas que entraron
 * de Cloudbeds, con su villa, su gente, su código de confirmación y, lo más
 * importante para las próximas semanas, si tenemos un correo al que escribirles.
 *
 * Los componentes de la demo —PrepareToday, VillaBoard, ArrivalRow— se
 * quitaron del árbol: solo servían a esta pantalla y dependían de campos que
 * no existen fuera de los datos de ejemplo. Siguen en el historial de git, y
 * el día que la entrevista y las alertas vivan en la base se recuperan de ahí
 * en vez de arrastrarlos sin compilar.
 */
export function ArrivalsPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = arrivalsCopy[idioma];
  const locale = idioma === 'es' ? 'es-CR' : 'en-US';
  const hoy = getToday();

  const ajustes = useAjustes();
  const [vista, setVista] = useState<Vista>('proximas');
  // La vista demo no pide reservas: se queda con las próximas detrás, para que
  // los indicadores de arriba no parpadeen al entrar y salir del demo.
  const filtro: FiltroReservas = vista === 'demo' ? 'proximas' : vista;
  const reservas = useReservas(filtro, hoy);

  // El resumen se calcula sobre el filtro "próximas", que es la lista de
  // trabajo real: las canceladas y lo que ya pasó no cuentan para nada.
  const todas = useReservas('proximas', hoy);
  const resumen = useMemo(() => resumirReservas(todas.data ?? [], hoy), [todas.data, hoy]);

  const demoEncendido = ajustes.data?.demoVisible ?? false;

  if (reservas.isPending) {
    return <ScreenLoading label={copy.loading} />;
  }

  if (reservas.isError || !reservas.data) {
    return <ScreenError onRetry={() => void reservas.refetch()} />;
  }

  const filas = reservas.data;

  const opciones = [
    ...filtros.map((valor) => ({
      value: valor as Vista,
      label: valor === 'proximas' ? copy.proximas : valor === 'todas' ? copy.todas : copy.sinCorreo,
    })),
    // El demo solo se ofrece mientras Admin lo deje encendido. Si Tony lo
    // apaga, la opción desaparece y `vista` vuelve sola a las reservas reales.
    ...(demoEncendido ? [{ value: 'demo' as Vista, label: copy.demo }] : []),
  ];
  const enDemo = vista === 'demo' && demoEncendido;

  return (
    <Screen>
      <ScreenHeading
        eyebrow={longDate(hoy, locale)}
        title={copy.title}
        action={
          <SegmentedControl
            label={copy.rangeLabel}
            options={opciones}
            value={vista}
            onChange={setVista}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label={copy.statProximas} value={String(resumen.proximas)} variant="ink" />
        <StatTile label={copy.statPersonas} value={String(resumen.personas)} />
        <StatTile label={copy.statSinCorreo} value={String(resumen.sinCorreo)} />
        <StatTile
          label={copy.statPrimera}
          value={
            resumen.primeraLlegada
              ? new Intl.DateTimeFormat(locale, {
                  day: 'numeric',
                  month: 'short',
                  timeZone: 'UTC',
                }).format(new Date(`${resumen.primeraLlegada}T12:00:00Z`))
              : copy.sinFecha
          }
        />
      </div>

      {enDemo ? (
        <>
          <p className="m-0 rounded-card border border-line bg-surface px-4 py-3 text-[13px] text-muted">
            {copy.demoAviso}
          </p>
          <LlegadasDemo />
        </>
      ) : filas.length === 0 ? (
        <EmptyState
          title={copy.vacioTitulo}
          description={filtro === 'sin_correo' ? copy.vacioSinCorreo : copy.vacioCuerpo}
        />
      ) : (
        <Table aria-label={copy.title}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{copy.colHuesped}</TableHeaderCell>
              <TableHeaderCell>{copy.colFechas}</TableHeaderCell>
              <TableHeaderCell>{copy.colVilla}</TableHeaderCell>
              <TableHeaderCell>{copy.colPersonas}</TableHeaderCell>
              <TableHeaderCell>{copy.colFuente}</TableHeaderCell>
              <TableHeaderCell>{copy.colCodigo}</TableHeaderCell>
              <TableHeaderCell>{copy.colEstado}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-text">{reserva.huesped}</span>
                    {reserva.email ? (
                      <span className="text-[12px] text-muted">{reserva.email}</span>
                    ) : (
                      <span className="text-[12px] text-on-alert">{copy.sinCorreoFila}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{rango(reserva, locale)}</TableCell>
                <TableCell>
                  {reserva.villa ?? <span className="text-muted-soft">{copy.sinVilla}</span>}
                </TableCell>
                <TableCell>{reserva.personas ?? '—'}</TableCell>
                <TableCell>{reserva.fuente ?? '—'}</TableCell>
                <TableCell>
                  <span className="font-mono text-[13px]">
                    {reserva.codigoOta ?? copy.sinCodigo}
                  </span>
                </TableCell>
                <TableCell>
                  <EstadoTag estado={reserva.estado} copy={copy} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {enDemo ? null : <p className="m-0 text-[13px] text-muted-soft">{copy.fuenteDatos}</p>}
    </Screen>
  );
}
