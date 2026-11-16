import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, StatTile, Textarea } from '@/components/ui';
import {
  useBorrarTema,
  useCrearTema,
  useEditarTema,
  useEstadoBot,
  useGuardarAjustesBot,
  useProbarBot,
  useTemasBase,
} from '@/hooks';
import type { TemaBase } from '@/services/conciergeBase';
import { botCopy as copy } from './copyBot';

/**
 * El Concierge, en settings: qué sabe, si está encendido y cuánto va gastando.
 *
 * ── POR QUÉ LA BASE ES CERRADA ──────────────────────────────────────────
 * Comprobado contra el modelo el 16 de noviembre de 2026: se le preguntó «¿a
 * qué hora es el desayuno? si no lo sabés, decilo», sin darle un dato del
 * hotel, y contestó «de 7:00 a 10:00 hrs». Se lo inventó con la instrucción
 * de no hacerlo delante. Por eso el bot solo puede decir lo que está acá.
 *
 * ── POR QUÉ UN TEMA NUEVO NACE APAGADO ──────────────────────────────────
 * Un texto que todavía nadie leyó no puede salir por boca del hotel. Se
 * escribe, se lee, y recién ahí se enciende.
 */
export function ConciergeBot() {
  const estado = useEstadoBot();
  const temas = useTemasBase();
  const probar = useProbarBot();
  const guardar = useGuardarAjustesBot();
  const crear = useCrearTema();

  const [temaNuevo, setTemaNuevo] = useState('');
  const [contenidoNuevo, setContenidoNuevo] = useState('');
  const [sinTema, setSinTema] = useState(false);
  const [precioEntrada, setPrecioEntrada] = useState<string | null>(null);
  const [precioSalida, setPrecioSalida] = useState<string | null>(null);

  const datos = estado.data;
  const activos = temas.data?.filter((t) => t.activo).length ?? 0;
  // Una llave puesta no es una llave que sirve: hasta que la prueba pase, no
  // se promete nada en verde ni se deja encender el bot.
  const llaveRota = datos?.prueba?.ok === false;
  const llaveSirve = !!datos?.hayLlave && !llaveRota;

  function agregar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limpio = temaNuevo.trim();
    if (!limpio || !contenidoNuevo.trim()) {
      setSinTema(true);
      return;
    }
    setSinTema(false);
    crear.mutate(
      { tema: limpio, contenido: contenidoNuevo.trim() },
      {
        onSuccess: () => {
          setTemaNuevo('');
          setContenidoNuevo('');
        },
      },
    );
  }

  function guardarTarifas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const leer = (valor: string | null, actual: number | null) => {
      if (valor === null) return actual;
      const limpio = valor.trim();
      return limpio ? Number(limpio) : null;
    };
    guardar.mutate({
      precioEntrada: leer(precioEntrada, datos?.gasto.precioEntrada ?? null),
      precioSalida: leer(precioSalida, datos?.gasto.precioSalida ?? null),
    });
  }

  const dinero = (usd: number | null) => (usd === null ? copy.sinTarifa : `$${usd.toFixed(2)}`);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
        <p className="m-0 text-sm text-muted">{copy.cuerpo}</p>
      </div>

      {/* ── Estado ─────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 font-display text-lg font-medium">{copy.estadoTitulo}</h3>
            {estado.isPending ? null : (
              <>
                <Badge tone={datos?.encendido ? 'success' : 'neutral'}>
                  {datos?.encendido ? copy.encendido : copy.apagado}
                </Badge>
                <Badge tone={llaveSirve ? 'success' : 'warning'}>
                  {!datos?.hayLlave ? copy.sinLlave : llaveRota ? copy.llaveRota : copy.conLlave}
                </Badge>
                <Badge tone={activos > 0 ? 'success' : 'warning'}>
                  {activos > 0 ? copy.temasEncendidos(activos) : copy.sinTemas}
                </Badge>
              </>
            )}
          </div>

          {estado.isError ? (
            <p role="alert" className="m-0 text-sm text-on-alert">
              {copy.noSePudoLeer}
            </p>
          ) : null}

          {/* El motivo por el que NO se puede encender se dice antes de
              ofrecer el botón: un botón que se sabe que rebota es peor que
              no tenerlo. */}
          {datos && !datos.hayLlave ? (
            <p className="m-0 text-sm leading-relaxed text-on-alert">{copy.faltaLlave}</p>
          ) : null}
          {llaveRota ? (
            <p className="m-0 text-sm leading-relaxed text-on-alert">{copy.llaveNoSirve}</p>
          ) : null}
          {datos?.hayLlave && activos === 0 ? (
            <p className="m-0 text-sm leading-relaxed text-muted">{copy.faltanTemas}</p>
          ) : null}

          {datos ? (
            <p className="m-0 text-sm text-muted">
              {copy.modelo}: <strong className="text-text">{datos.modelo}</strong>
              {datos.llaveDesde ? ` · ${copy.llaveDesde} ${datos.llaveDesde}` : ''}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              disabled={probar.isPending || !datos?.hayLlave}
              onClick={() => probar.mutate()}
            >
              {probar.isPending ? copy.probando : copy.probar}
            </Button>
            <Button
              disabled={guardar.isPending || !llaveSirve || activos === 0}
              onClick={() => guardar.mutate({ encendido: !datos?.encendido })}
            >
              {datos?.encendido ? copy.apagar : copy.encender}
            </Button>
          </div>

          {datos?.prueba ? (
            <p
              className={`m-0 text-sm ${datos.prueba.ok ? 'text-muted' : 'text-on-alert'}`}
              role={datos.prueba.ok ? undefined : 'alert'}
            >
              {datos.prueba.ok ? copy.pruebaOk : copy.pruebaMal} {datos.prueba.detalle}
            </p>
          ) : null}

          {guardar.isError ? (
            <p role="alert" className="m-0 text-sm text-on-alert">
              {copy.soloAdmin}
            </p>
          ) : null}
        </div>
      </Card>

      {/* ── Gasto ──────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col gap-3">
          <h3 className="m-0 font-display text-lg font-medium">{copy.gastoTitulo}</h3>
          {datos ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label={copy.esteMes} value={dinero(datos.gasto.mes.usd)} />
                <StatTile label={copy.respuestasMes} value={String(datos.gasto.mes.llamadas)} />
                <StatTile label={copy.desdeSiempre} value={dinero(datos.gasto.total.usd)} />
                <StatTile label={copy.respuestasTotal} value={String(datos.gasto.total.llamadas)} />
              </div>
              <p className="m-0 text-[13px] text-muted-soft">
                {copy.tokens(datos.gasto.mes.tokensEntrada, datos.gasto.mes.tokensSalida)}
              </p>
            </>
          ) : null}

          {/* Las tarifas las pone Tony. No se inventa un precio: una cifra
              inventada que parece una factura es peor que no mostrar nada. */}
          <form onSubmit={guardarTarifas} className="flex flex-col gap-3">
            <p className="m-0 text-sm leading-relaxed text-muted">{copy.tarifasCuerpo}</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={copy.precioEntrada}
                type="number"
                min="0"
                step="0.01"
                value={precioEntrada ?? datos?.gasto.precioEntrada ?? ''}
                onChange={(event) => setPrecioEntrada(event.target.value)}
              />
              <Input
                label={copy.precioSalida}
                type="number"
                min="0"
                step="0.01"
                value={precioSalida ?? datos?.gasto.precioSalida ?? ''}
                onChange={(event) => setPrecioSalida(event.target.value)}
              />
            </div>
            <div>
              <Button type="submit" variant="outline" disabled={guardar.isPending}>
                {copy.guardarTarifas}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* ── La base ────────────────────────────────────────────────────── */}
      <div>
        <h3 className="m-0 font-display text-lg font-medium">{copy.baseTitulo}</h3>
        <p className="m-0 text-sm text-muted">{copy.baseCuerpo}</p>
      </div>

      {temas.isPending ? null : temas.data && temas.data.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {temas.data.map((tema) => (
            <li key={tema.id}>
              <FilaTema tema={tema} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-muted-soft">{copy.baseVacia}</p>
      )}

      <Card>
        <form onSubmit={agregar} className="flex flex-col gap-3">
          <h3 className="m-0 font-display text-lg font-medium">{copy.agregarTitulo}</h3>
          <Input
            label={copy.temaLabel}
            placeholder={copy.temaPlaceholder}
            value={temaNuevo}
            onChange={(event) => setTemaNuevo(event.target.value)}
            error={sinTema ? copy.faltaAlgo : undefined}
          />
          <Textarea
            label={copy.contenidoLabel}
            placeholder={copy.contenidoPlaceholder}
            value={contenidoNuevo}
            onChange={(event) => setContenidoNuevo(event.target.value)}
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
    </section>
  );
}

/**
 * Un tema de la base. Se edita en el lugar, y el formulario solo existe
 * mientras se edita: así al abrirlo se siembra con lo guardado, y cancelar
 * cancela de verdad.
 */
function FilaTema({ tema }: { tema: TemaBase }) {
  const editar = useEditarTema();
  const borrar = useBorrarTema();
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  if (abierto) {
    return (
      <Card>
        <FormularioTema
          tema={tema}
          guardando={editar.isPending}
          fallo={editar.isError}
          onCancelar={() => setAbierto(false)}
          onGuardar={(cambios) =>
            editar.mutate({ id: tema.id, cambios }, { onSuccess: () => setAbierto(false) })
          }
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-[14rem] flex-1 flex-col gap-1">
        <h4 className="m-0 font-medium text-text">{tema.tema}</h4>
        <p className="m-0 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
          {tema.contenido}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge tone={tema.activo ? 'success' : 'neutral'}>
          {tema.activo ? copy.activo : copy.inactivo}
        </Badge>
        <Button variant="ghost" onClick={() => setAbierto(true)}>
          {copy.editar}
        </Button>
        <Button
          variant="outline"
          disabled={editar.isPending}
          onClick={() => editar.mutate({ id: tema.id, cambios: { activo: !tema.activo } })}
        >
          {tema.activo ? copy.apagarTema : copy.encenderTema}
        </Button>
        {confirmando ? (
          <Button
            variant="outline"
            disabled={borrar.isPending}
            onClick={() => borrar.mutate(tema.id)}
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

interface FormularioTemaProps {
  tema: TemaBase;
  guardando: boolean;
  fallo: boolean;
  onCancelar: () => void;
  onGuardar: (cambios: { tema: string; contenido: string }) => void;
}

function FormularioTema({ tema, guardando, fallo, onCancelar, onGuardar }: FormularioTemaProps) {
  const [titulo, setTitulo] = useState(tema.tema);
  const [contenido, setContenido] = useState(tema.contenido);
  const [vacio, setVacio] = useState(false);

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo.trim() || !contenido.trim()) {
      setVacio(true);
      return;
    }
    setVacio(false);
    onGuardar({ tema: titulo.trim(), contenido: contenido.trim() });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <Input
        label={copy.temaLabel}
        value={titulo}
        onChange={(event) => setTitulo(event.target.value)}
        error={vacio ? copy.faltaAlgo : undefined}
      />
      <Textarea
        label={copy.contenidoLabel}
        value={contenido}
        onChange={(event) => setContenido(event.target.value)}
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
