import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, PartyPopper, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '@/components/ui';
import {
  useAsignacion,
  useAsignar,
  useBorrarNota,
  useCrearNota,
  useGuestProfile,
  useNotasInternas,
  useStayBookings,
} from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import { getToday } from '@/services/clock';
import { ahora } from '@/services/reloj';
import type { ChatMessage, Stay } from '@/types';
import { useQuienEntro } from '../puerta/contexto';
import { panelCopy as copy } from './copyPanel';
import { esperaDesde } from './espera';
import { momentoDeLaEstadia, type Momento } from './estadia';

function haceCuanto(iso: string): string {
  // `ahora()` y no `Date.now()`: el reloj de la máquina puede ir corrido —
  // el 16 de noviembre de 2026 el de Tony iba 4 minutos adelantado, y una
  // nota recién escrita aparecía como «hace 4 minutos». Un número que dice
  // cuánto lleva esperando un huésped no puede depender de eso.
  const minutos = Math.max(0, Math.round((ahora() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return copy.recienAhora;
  if (minutos < 60) return copy.minutos(minutos);
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return copy.horas(horas);
  return copy.dias(Math.floor(horas / 24));
}

function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
}

function hora(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Costa_Rica',
  }).format(new Date(iso));
}

/** La línea del reloj de la estadía, y si hay que mirarla dos veces. */
function lineaDelMomento(momento: Momento, stay: Stay): { texto: string; urgente: boolean } {
  switch (momento.clase) {
    case 'por-llegar':
      return { texto: copy.llegaEnDias(momento.dias), urgente: momento.dias <= 1 };
    case 'llega-hoy':
      return { texto: copy.llegaHoy(hora(stay.checkIn)), urgente: true };
    case 'se-va-hoy':
      return { texto: copy.seVaHoy(hora(stay.checkOut)), urgente: true };
    case 'se-fue':
      return { texto: copy.seFue(momento.dias), urgente: false };
    default:
      return {
        texto: momento.seVaManana
          ? `${copy.diaDe(momento.dia, momento.noches)} · ${copy.seVaManana(hora(stay.checkOut))}`
          : copy.diaDe(momento.dia, momento.noches),
        urgente: momento.seVaManana,
      };
  }
}

interface PlegableProps {
  titulo: string;
  /**
   * Abrilo solo cuando haya algo que leer. Llega tarde a propósito: las
   * notas se cargan después que la pantalla, y una nota que alguien dejó
   * tiene que verse sin que haya que ir a buscarla.
   */
  abrir?: boolean;
  children: ReactNode;
}

/** Una sección que se abre. `<details>` nativo: funciona con teclado y sin JS. */
function Plegable({ titulo, abrir = false, children }: PlegableProps) {
  const [abierto, setAbierto] = useState(abrir);
  const [vistoAntes, setVistoAntes] = useState(abrir);

  // Ajuste durante el render, no en un efecto: así no hay un parpadeo con la
  // sección cerrada antes de abrirse. Abre, pero nunca cierra — si alguien la
  // cerró a mano, una recarga de los datos no se la vuelve a abrir en la cara.
  if (abrir !== vistoAntes) {
    setVistoAntes(abrir);
    if (abrir) setAbierto(true);
  }

  return (
    <details
      open={abierto}
      onToggle={(event) => setAbierto(event.currentTarget.open)}
      className="group border-t border-line-soft pt-3"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[13px] font-medium text-text marker:content-none">
        {titulo}
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0 text-gold transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-2 pt-2.5">{children}</div>
    </details>
  );
}

interface PanelProps {
  stayId: string;
  messages: ChatMessage[];
}

/**
 * La ficha de quién está del otro lado, al lado del chat.
 *
 * ── POR QUÉ ACÁ Y NO EN OTRA PANTALLA ────────────────────────────────────
 * Todo esto ya existía en el perfil del huésped, a dos clics de distancia.
 * Dos clics de distancia es lo mismo que no existir: nadie se va de una
 * conversación abierta para ir a leer, y el que contesta termina contestando
 * de memoria. Por eso la ficha viene a la conversación, y no al revés.
 */
export function PanelHuesped({ stayId, messages }: PanelProps) {
  const perfil = useGuestProfile(stayId);
  const asignacion = useAsignacion(stayId);
  const asignar = useAsignar(stayId);
  const reservas = useStayBookings(stayId);
  const yo = useQuienEntro();

  const espera = esperaDesde(messages);

  // El idioma que mandó la app del huésped gana sobre el del perfil: es lo
  // que tiene puesto AHORA, no lo que decía la reserva.
  const delMensaje = [...messages].reverse().find((m) => m.from === 'guest' && m.lang)?.lang;
  const idioma = delMensaje ?? perfil.data?.guest.locale ?? null;

  const stay = perfil.data?.stay;
  const guest = perfil.data?.guest;
  const alertas = perfil.data?.alerts ?? [];
  const alergias = alertas.filter((a) => a.kind === 'allergy');
  const celebra = alertas.filter((a) => a.kind === 'celebration');
  const presente = alertas.filter((a) => a.kind === 'info');
  const pilares = (perfil.data?.pillars ?? []).filter((p) => p.text.trim());
  const momento = stay ? momentoDeLaEstadia(stay, getToday()) : null;
  const linea = momento && stay ? lineaDelMomento(momento, stay) : null;
  const mia = asignacion.data?.asignadoId === yo.id;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {idioma ? (
          <Badge tone="neutral">{idioma === 'en' ? copy.escribeIngles : copy.escribeEspanol}</Badge>
        ) : null}
        {espera ? <Badge tone="warning">{copy.esperando(haceCuanto(espera))}</Badge> : null}
      </div>

      {/* Lo que puede terminar en una ambulancia va primero y va en rojo.
          No se pliega, no se resume y no comparte renglón con nada. */}
      {alergias.length > 0 ? (
        <div className="flex flex-col gap-1 rounded-card bg-alert p-3">
          <span className="flex items-center gap-1.5 text-eyebrow text-on-alert">
            <TriangleAlert size={14} strokeWidth={1.8} aria-hidden="true" />
            {copy.cuidado}
          </span>
          {alergias.map((a) => (
            <p key={a.label.es} className="m-0 text-sm font-medium text-on-alert">
              {localizedText(a.label, 'es')}
            </p>
          ))}
        </div>
      ) : null}

      {/* El reloj de la estadía: el mismo pedido se contesta distinto el
          primer día que la última mañana. */}
      {linea ? (
        <p
          className={
            linea.urgente
              ? 'm-0 text-sm font-medium text-gold-bright'
              : 'm-0 text-sm font-medium text-text'
          }
        >
          {linea.texto}
        </p>
      ) : null}

      {stay ? (
        <p className="m-0 text-sm text-muted">
          {copy.villa} {stay.villa} · {fechaCorta(stay.checkIn)}–{fechaCorta(stay.checkOut)} ·{' '}
          {copy.personas(stay.partySize)}
        </p>
      ) : null}

      {guest && guest.companions.length > 0 ? (
        <p className="m-0 text-[13px] text-muted-soft">
          {copy.con} {guest.companions.map((c) => c.name).join(', ')}
        </p>
      ) : null}

      {/* Una celebración que nadie menciona es una celebración perdida. */}
      {celebra.length > 0 ? (
        <p className="m-0 flex items-center gap-1.5 text-sm text-gold">
          <PartyPopper size={15} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />
          {copy.celebra}: {celebra.map((a) => localizedText(a.label, 'es')).join(' · ')}
        </p>
      ) : null}

      {/* En sus palabras, no en las nuestras: si alguien pidió que le avisen
          antes de tocarle la puerta, eso cambia la respuesta que se escribe
          abajo, y por eso se lee antes de escribirla. */}
      {perfil.data?.preferredCare && perfil.data.preferredCare !== copy.sinEntrevista ? (
        <div className="flex flex-col gap-1 border-t border-line-soft pt-3">
          <span className="text-eyebrow text-muted-soft">{copy.comoAtenderlo}</span>
          <p className="m-0 font-display text-[15px] leading-snug text-text italic">
            «{perfil.data.preferredCare}»
          </p>
        </div>
      ) : null}

      {presente.length > 0 ? (
        <div className="flex flex-col gap-1 border-t border-line-soft pt-3">
          <span className="text-eyebrow text-muted-soft">{copy.presente}</span>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {presente.map((a) => (
              <li key={a.label.es} className="text-[13px] text-muted">
                {localizedText(a.label, 'es')}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pilares.length > 0 ? (
        <Plegable titulo={copy.yaNosDijo(pilares.length)}>
          <p className="m-0 text-xs text-muted-soft">{copy.yaNosDijoAyuda}</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {pilares.map((p) => (
              <li key={p.pillar} className="flex flex-col gap-0.5">
                <span className="text-eyebrow text-gold">{copy.pilares[p.pillar] ?? p.pillar}</span>
                <span className="text-[13px] leading-relaxed text-muted">{p.text}</span>
              </li>
            ))}
          </ul>
        </Plegable>
      ) : null}

      <Plegable titulo={copy.yaReservo(reservas.data?.length ?? 0)}>
        {reservas.data && reservas.data.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {reservas.data.map((r) => (
              <li key={`${r.facility}-${r.start}`} className="text-[13px] text-muted">
                {copy.instalaciones[r.facility] ?? r.facility} · {fechaCorta(r.start)}{' '}
                {hora(r.start)}
              </li>
            ))}
          </ul>
        ) : (
          // «Todavía no reservó nada» solo si de verdad lo sabemos. Si la
          // consulta falló, decirlo igual sería inventar un dato: alguien
          // podría contestarle que el sauna está libre a una hora que ya
          // tiene tomada.
          <p className="m-0 text-[13px] text-muted-soft">
            {reservas.isError ? copy.reservasNoCargaron : copy.sinReservas}
          </p>
        )}
      </Plegable>

      <NotasInternas stayId={stayId} />

      {/* Cuando la ficha no carga, la pantalla lo dice. Antes se quedaba
          vacía, que es lo mismo que decir «este huésped no tiene alergias». */}
      {perfil.isError ? (
        <div role="alert" className="flex flex-col items-start gap-1.5 border-t border-line pt-3">
          <p className="m-0 text-sm font-medium text-on-alert">{copy.sinFichaTitulo}</p>
          <p className="m-0 text-[13px] text-muted">{copy.sinFichaCuerpo}</p>
          <Button variant="ghost" onClick={() => void perfil.refetch()}>
            {copy.reintentar}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
        <span className="text-[13px] text-muted">
          {asignacion.data?.asignado ? copy.leToca(asignacion.data.asignado) : copy.sinAsignar}
        </span>
        <Button
          variant="ghost"
          disabled={asignar.isPending}
          onClick={() => asignar.mutate(mia ? null : { id: yo.id, nombre: yo.nombre ?? yo.correo })}
        >
          {mia ? copy.soltar : copy.tomar}
        </Button>
      </div>

      {asignar.isError ? (
        <p role="alert" className="m-0 text-[13px] text-on-alert">
          {copy.noSePudo}
        </p>
      ) : null}

      <Link
        to={`/staff/guests/${stayId}`}
        className="text-[13px] text-gold no-underline hover:underline"
      >
        {copy.fichaCompleta} →
      </Link>
    </Card>
  );
}

/**
 * Lo que el equipo se dice entre sí.
 *
 * Vive en otra tabla que el hilo del huésped a propósito: una nota que se
 * filtre no se puede deshacer.
 *
 * Se abre sola cuando hay notas y queda plegada cuando no: una nota que
 * alguien dejó tiene que verse sin ir a buscarla, y un cuadro vacío no
 * merece ocupar media pantalla de teléfono.
 */
function NotasInternas({ stayId }: { stayId: string }) {
  const notas = useNotasInternas(stayId);
  const crear = useCrearNota(stayId);
  const borrar = useBorrarNota(stayId);
  const yo = useQuienEntro();
  const [texto, setTexto] = useState('');

  function agregar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    crear.mutate(
      { texto: limpio, autor: { id: yo.id, nombre: yo.nombre ?? yo.correo } },
      { onSuccess: () => setTexto('') },
    );
  }

  const cuantas = notas.data?.length ?? 0;

  return (
    <Plegable titulo={copy.notasTitulo_(cuantas)} abrir={cuantas > 0}>
      <p className="m-0 text-xs text-muted-soft">{copy.notasCuerpo}</p>

      {notas.data && notas.data.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {notas.data.map((nota) => (
            <li key={nota.id} className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="m-0 whitespace-pre-wrap text-sm text-text">{nota.texto}</p>
                <span className="text-xs text-muted-soft">
                  {nota.autor ?? copy.alguien} · {haceCuanto(nota.creadoEn)}
                </span>
              </div>
              <Button
                variant="ghost"
                disabled={borrar.isPending}
                onClick={() => borrar.mutate(nota.id)}
              >
                {copy.borrar}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[13px] text-muted-soft">{copy.notasVacio}</p>
      )}

      <form onSubmit={agregar} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label={copy.notaLabel}
            hideLabel
            placeholder={copy.notaPlaceholder}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" disabled={crear.isPending || !texto.trim()}>
          {copy.anotar}
        </Button>
      </form>
    </Plegable>
  );
}
