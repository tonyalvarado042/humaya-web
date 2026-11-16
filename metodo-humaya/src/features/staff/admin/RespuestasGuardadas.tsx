import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import {
  useBorrarRespuesta,
  useCrearRespuesta,
  useEditarRespuesta,
  useRespuestasGuardadas,
} from '@/hooks';
import type { RespuestaGuardada } from '@/services/conciergeBase';
import { respuestasCopy as copy } from './copyRespuestas';

/**
 * Los textos que recepción manda una y otra vez.
 *
 * ── POR QUÉ NO SON LO MISMO QUE LA BASE DEL BOT ─────────────────────────
 * La base es lo que el bot puede *afirmar*: entra en un prompt y el modelo la
 * redacta. Esto son mensajes enteros que manda una persona, tal cual, sin
 * pasar por ningún modelo. Mezclarlos sería dejar que el bot improvise sobre
 * un texto que alguien escribió para mandarse palabra por palabra.
 *
 * ── POR QUÉ NACEN ENCENDIDAS ────────────────────────────────────────────
 * Al revés que un tema de la base. Un tema lo va a afirmar el bot solo, así
 * que se lee antes de encenderlo; una respuesta guardada la manda una persona
 * que la está leyendo en ese momento.
 */
export function RespuestasGuardadas() {
  const respuestas = useRespuestasGuardadas();
  const crear = useCrearRespuesta();

  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [falta, setFalta] = useState(false);

  function agregar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo.trim() || !texto.trim()) {
      setFalta(true);
      return;
    }
    setFalta(false);
    crear.mutate(
      { titulo: titulo.trim(), texto: texto.trim() },
      {
        onSuccess: () => {
          setTitulo('');
          setTexto('');
        },
      },
    );
  }

  return (
    <>
      <div>
        <h3 className="m-0 font-display text-lg font-medium">{copy.titulo}</h3>
        <p className="m-0 text-sm text-muted">{copy.cuerpo}</p>
      </div>

      {respuestas.isPending ? null : respuestas.data && respuestas.data.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {respuestas.data.map((respuesta) => (
            <li key={respuesta.id}>
              <Fila respuesta={respuesta} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-muted-soft">{copy.vacio}</p>
      )}

      <Card>
        <form onSubmit={agregar} className="flex flex-col gap-3">
          <h3 className="m-0 font-display text-lg font-medium">{copy.agregarTitulo}</h3>
          <Input
            label={copy.tituloLabel}
            placeholder={copy.tituloPlaceholder}
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            error={falta ? copy.falta : undefined}
          />
          <Textarea
            label={copy.textoLabel}
            placeholder={copy.textoPlaceholder}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
          <div>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? copy.guardando : copy.agregar}
            </Button>
          </div>
          {crear.isError ? (
            <p role="alert" className="m-0 text-sm text-on-alert">
              {copy.soloAdmin}
            </p>
          ) : null}
        </form>
      </Card>
    </>
  );
}

function Fila({ respuesta }: { respuesta: RespuestaGuardada }) {
  const editar = useEditarRespuesta();
  const borrar = useBorrarRespuesta();
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  if (abierto) {
    return (
      <Card>
        <Formulario
          respuesta={respuesta}
          guardando={editar.isPending}
          fallo={editar.isError}
          onCancelar={() => setAbierto(false)}
          onGuardar={(cambios) =>
            editar.mutate({ id: respuesta.id, cambios }, { onSuccess: () => setAbierto(false) })
          }
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-[14rem] flex-1 flex-col gap-1">
        <h4 className="m-0 font-medium text-text">{respuesta.titulo}</h4>
        <p className="m-0 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
          {respuesta.texto}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge tone={respuesta.activo ? 'success' : 'neutral'}>
          {respuesta.activo ? copy.activa : copy.inactiva}
        </Badge>
        <Button variant="ghost" onClick={() => setAbierto(true)}>
          {copy.editar}
        </Button>
        <Button
          variant="outline"
          disabled={editar.isPending}
          onClick={() =>
            editar.mutate({ id: respuesta.id, cambios: { activo: !respuesta.activo } })
          }
        >
          {respuesta.activo ? copy.apagar : copy.encender}
        </Button>
        {confirmando ? (
          <Button
            variant="outline"
            disabled={borrar.isPending}
            onClick={() => borrar.mutate(respuesta.id)}
          >
            {copy.confirmarBorrar}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmando(true)}>
            {copy.borrar}
          </Button>
        )}
      </div>
    </Card>
  );
}

interface FormularioProps {
  respuesta: RespuestaGuardada;
  guardando: boolean;
  fallo: boolean;
  onCancelar: () => void;
  onGuardar: (cambios: { titulo: string; texto: string; textoEn: string | null }) => void;
}

/** Existe solo mientras se edita, para que cancelar cancele de verdad. */
function Formulario({ respuesta, guardando, fallo, onCancelar, onGuardar }: FormularioProps) {
  const [titulo, setTitulo] = useState(respuesta.titulo);
  const [texto, setTexto] = useState(respuesta.texto);
  const [textoEn, setTextoEn] = useState(respuesta.textoEn ?? '');
  const [falta, setFalta] = useState(false);

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo.trim() || !texto.trim()) {
      setFalta(true);
      return;
    }
    setFalta(false);
    onGuardar({
      titulo: titulo.trim(),
      texto: texto.trim(),
      textoEn: textoEn.trim() || null,
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <Input
        label={copy.tituloLabel}
        value={titulo}
        onChange={(event) => setTitulo(event.target.value)}
        error={falta ? copy.falta : undefined}
      />
      <Textarea
        label={copy.textoLabel}
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
      />
      <Textarea
        label={copy.textoEnLabel}
        value={textoEn}
        onChange={(event) => setTextoEn(event.target.value)}
      />
      {fallo ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {copy.soloAdmin}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={guardando}>
          {guardando ? copy.guardando : copy.guardarCambios}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancelar} disabled={guardando}>
          {copy.cancelar}
        </Button>
      </div>
    </form>
  );
}
