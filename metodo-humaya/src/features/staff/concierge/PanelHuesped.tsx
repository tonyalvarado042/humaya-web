import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input } from '@/components/ui';
import {
  useAsignacion,
  useAsignar,
  useBorrarNota,
  useCrearNota,
  useGuestProfile,
  useNotasInternas,
} from '@/hooks';
import { ahora } from '@/services/reloj';
import type { ChatMessage } from '@/types';
import { useQuienEntro } from '../puerta/contexto';
import { panelCopy as copy } from './copyPanel';
import { esperaDesde } from './espera';

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

interface PanelProps {
  stayId: string;
  messages: ChatMessage[];
}

/** El contexto de quién está del otro lado, al lado del chat. */
export function PanelHuesped({ stayId, messages }: PanelProps) {
  const perfil = useGuestProfile(stayId);
  const asignacion = useAsignacion(stayId);
  const asignar = useAsignar(stayId);
  const yo = useQuienEntro();

  const espera = esperaDesde(messages);

  // El idioma que mandó la app del huésped gana sobre el del perfil: es lo
  // que tiene puesto AHORA, no lo que decía la reserva.
  const delMensaje = [...messages].reverse().find((m) => m.from === 'guest' && m.lang)?.lang;
  const idioma = delMensaje ?? perfil.data?.guest.locale ?? null;

  const stay = perfil.data?.stay;
  const guest = perfil.data?.guest;
  const alergias = (perfil.data?.alerts ?? []).filter((a) => a.kind === 'allergy');
  const mia = asignacion.data?.asignadoId === yo.id;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {idioma ? (
          <Badge tone="neutral">{idioma === 'en' ? copy.escribeIngles : copy.escribeEspanol}</Badge>
        ) : null}
        {espera ? <Badge tone="warning">{copy.esperando(haceCuanto(espera))}</Badge> : null}
      </div>

      {/* Lo que el perfil sabe. Si no hay perfil no se inventa: no se muestra. */}
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

      {/* Las alergias van arriba y en rojo: es lo único de acá que puede
          terminar en una ambulancia. */}
      {alergias.length > 0 ? (
        <p className="m-0 text-sm text-on-alert">
          {copy.alergias} {alergias.map((a) => a.label.es).join(' · ')}
        </p>
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
    </Card>
  );
}

/**
 * Lo que el equipo se dice entre sí.
 *
 * Vive en otra tabla que el hilo del huésped a propósito: una nota que se
 * filtre no se puede deshacer.
 */
export function NotasInternas({ stayId }: { stayId: string }) {
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

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="m-0 font-display text-base font-medium">{copy.notasTitulo}</h3>
        <p className="m-0 text-[13px] text-muted">{copy.notasCuerpo}</p>
      </div>

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
    </Card>
  );
}
