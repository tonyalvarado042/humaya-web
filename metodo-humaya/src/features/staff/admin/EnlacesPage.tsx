import { ArrowDown, ArrowUp, ExternalLink, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { IconoDeEnlace } from '@/components/IconoDeEnlace';
import { Badge, Button, Card, Input } from '@/components/ui';
import {
  useBorrarEnlace,
  useCrearEnlace,
  useEditarEnlace,
  useEnlaces,
  useMoverEnlace,
  useToggleEnlace,
} from '@/hooks';
import { direccionLimpia, ICONOS_DE_ENLACE, type Enlace } from '@/services/enlaces';
import { ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useEsAdministrador, useIdiomaRecepcion } from '../puerta/contexto';
import { enlacesCopy, type EnlacesTextos } from './copyEnlaces';

/**
 * Los enlaces de la portada interna, administrados por hotel.
 *
 * ── DE DÓNDE SALE ───────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «debe ser para cada hotel que se cree
 * entonces desde admin de hotel exp se puede configurar».
 *
 * ── POR QUÉ ESTA PANTALLA EXISTE Y NO ALCANZABA CON SEMBRARLOS ──────────
 * Porque los cuatro que siembra la base son los que el PRODUCTO conoce:
 * recepción, la app, X10 Vision y el PMS. El sitio web de cada hotel, su
 * panel de contabilidad, su carpeta compartida — eso solo lo sabe el hotel.
 * Sin esta pantalla, agregar un enlace volvería a ser una fila a mano.
 *
 * ── POR QUÉ SE VE APAGADO Y NO SE BORRA ─────────────────────────────────
 * Porque un enlace apagado se puede volver a encender, y borrado hay que
 * escribirlo otra vez. Lo que se deja de usar por un tiempo se apaga; borrar
 * queda para lo que estaba mal.
 */
export function EnlacesPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = enlacesCopy[idioma];
  const esAdmin = useEsAdministrador();
  const enlaces = useEnlaces();
  const [agregando, setAgregando] = useState(false);

  if (enlaces.isPending) return <ScreenLoading label={copy.titulo} />;
  if (enlaces.isError || !enlaces.data) {
    return <ScreenError onRetry={() => void enlaces.refetch()} />;
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
        <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">{copy.cuerpo}</p>
      </div>

      <Link
        to="/staff/inicio"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] text-muted no-underline transition-colors hover:text-text"
      >
        <ExternalLink size={14} strokeWidth={1.6} aria-hidden="true" />
        {copy.verPortada}
      </Link>

      {/* Regla de la casa: si se sabe de antemano que un botón va a rebotar,
          no se ofrece el botón — se explica por qué no está. RLS deja LEER a
          todo recepción y escribir solo al rol `administrador`. */}
      {esAdmin ? null : (
        <Card variant="accent">
          <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.soloAdmin}</p>
        </Card>
      )}

      {enlaces.data.length === 0 ? (
        <Card>
          <p className="m-0 font-display text-xl">{copy.vacio}</p>
          <p className="m-0 text-sm text-muted">{copy.vacioCuerpo}</p>
        </Card>
      ) : (
        <ul aria-label={copy.lista} className="m-0 flex list-none flex-col gap-2 p-0">
          {enlaces.data.map((enlace, i) => (
            <li key={enlace.id}>
              <Fila
                enlace={enlace}
                lista={enlaces.data}
                esPrimero={i === 0}
                esUltimo={i === enlaces.data.length - 1}
                puedeEditar={esAdmin}
              />
            </li>
          ))}
        </ul>
      )}

      {esAdmin ? (
        agregando ? (
          <Card>
            <Formulario
              titulo={copy.nuevo}
              onCancelar={() => setAgregando(false)}
              onListo={() => setAgregando(false)}
            />
          </Card>
        ) : (
          <Button className="w-fit" onClick={() => setAgregando(true)}>
            <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
            {copy.agregar}
          </Button>
        )
      ) : null}
    </section>
  );
}

interface FilaProps {
  enlace: Enlace;
  lista: Enlace[];
  esPrimero: boolean;
  esUltimo: boolean;
  puedeEditar: boolean;
}

function Fila({ enlace, lista, esPrimero, esUltimo, puedeEditar }: FilaProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = enlacesCopy[idioma];
  const toggle = useToggleEnlace();
  const mover = useMoverEnlace();
  const borrar = useBorrarEnlace();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  if (editando) {
    return (
      <Card>
        <Formulario
          titulo={copy.editar}
          enlace={enlace}
          onCancelar={() => setEditando(false)}
          onListo={() => setEditando(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-[14rem] flex-1 items-start gap-3">
        <IconoDeEnlace nombre={enlace.icono} size={22} className="mt-0.5 shrink-0 text-gold" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="m-0 font-medium text-text">{enlace.etiqueta}</h3>
          {enlace.descripcion ? (
            <span className="text-[13px] text-muted">{enlace.descripcion}</span>
          ) : null}
          {/* La dirección completa, no el dominio: es lo que hay que poder
              revisar cuando un enlace no lleva a donde debía. */}
          <span className="text-[13px] break-all text-muted-soft">{enlace.url}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge tone={enlace.habilitado ? 'success' : 'neutral'}>
          {enlace.habilitado ? copy.encendido : copy.apagado}
        </Badge>

        {puedeEditar ? (
          <>
            <button
              type="button"
              aria-label={copy.subir}
              disabled={esPrimero || mover.isPending}
              onClick={() => mover.mutate({ lista, id: enlace.id, hacia: 'arriba' })}
              className="flex size-9 items-center justify-center rounded-xl border border-line-strong text-text transition-colors enabled:hover:border-text disabled:text-disabled"
            >
              <ArrowUp size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={copy.bajar}
              disabled={esUltimo || mover.isPending}
              onClick={() => mover.mutate({ lista, id: enlace.id, hacia: 'abajo' })}
              className="flex size-9 items-center justify-center rounded-xl border border-line-strong text-text transition-colors enabled:hover:border-text disabled:text-disabled"
            >
              <ArrowDown size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <Button variant="ghost" onClick={() => setEditando(true)}>
              {copy.editar}
            </Button>
            <Button
              variant="outline"
              disabled={toggle.isPending}
              onClick={() => toggle.mutate({ id: enlace.id, habilitado: !enlace.habilitado })}
            >
              {enlace.habilitado ? copy.apagar : copy.encender}
            </Button>
            {confirmando ? (
              <Button
                variant="outline"
                disabled={borrar.isPending}
                onClick={() => borrar.mutate(enlace.id)}
              >
                {copy.confirmarBorrar}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmando(true)}>
                {copy.borrar}
              </Button>
            )}
          </>
        ) : null}
      </div>

      {toggle.isError || mover.isError || borrar.isError ? (
        <p role="alert" className="m-0 basis-full text-sm text-on-alert">
          {copy.sinPermiso}
        </p>
      ) : null}
    </Card>
  );
}

interface FormularioProps {
  titulo: string;
  /** Sin enlace es el formulario de uno nuevo. */
  enlace?: Enlace;
  onCancelar: () => void;
  onListo: () => void;
}

/**
 * El formulario existe SOLO mientras se usa, y eso no es casualidad: así
 * cada vez que se abre, el estado se siembra con lo que está guardado. Si
 * viviera arriba, cancelar y volver a entrar mostraría lo que alguien
 * tecleó y descartó — lo contrario de cancelar.
 */
function Formulario({ titulo, enlace, onCancelar, onListo }: FormularioProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = enlacesCopy[idioma];
  const crear = useCrearEnlace();
  const editar = useEditarEnlace();

  const [etiqueta, setEtiqueta] = useState(enlace?.etiqueta ?? '');
  const [url, setUrl] = useState(enlace?.url ?? '');
  const [descripcion, setDescripcion] = useState(enlace?.descripcion ?? '');
  const [icono, setIcono] = useState<string>(enlace?.icono ?? 'link');
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorUrl, setErrorUrl] = useState<string | null>(null);

  const guardando = crear.isPending || editar.isPending;
  const fallo = crear.isError || editar.isError;

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Se avisa ACÁ y no después de que la base rechace: la dirección se
    // revisa con el mismo `direccionLimpia` que usa el servicio, así que lo
    // que esta pantalla acepta es exactamente lo que se va a guardar.
    const faltaNombre = !etiqueta.trim();
    const limpia = direccionLimpia(url);
    setErrorNombre(faltaNombre ? copy.faltaNombre : null);
    setErrorUrl(limpia ? null : copy.direccionMala);
    if (faltaNombre || !limpia) return;

    if (enlace) {
      editar.mutate(
        { id: enlace.id, cambios: { etiqueta, url, descripcion, icono } },
        { onSuccess: onListo },
      );
      return;
    }
    crear.mutate({ etiqueta, url, descripcion, icono }, { onSuccess: onListo });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <h3 className="m-0 font-display text-lg font-medium">{titulo}</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={copy.nombre}
          hint={copy.nombrePista}
          value={etiqueta}
          error={errorNombre ?? undefined}
          onChange={(event) => setEtiqueta(event.target.value)}
        />
        <Input
          label={copy.direccion}
          hint={copy.direccionPista}
          inputMode="url"
          placeholder="hotels.cloudbeds.com"
          value={url}
          error={errorUrl ?? undefined}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>

      <Input
        label={copy.explicacion}
        hint={copy.explicacionPista}
        value={descripcion}
        onChange={(event) => setDescripcion(event.target.value)}
      />

      <ElegirIcono valor={icono} onElegir={setIcono} copy={copy} />

      {fallo ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {copy.sinPermiso}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={guardando}>
          {guardando ? (enlace ? copy.guardando : copy.agregando) : copy.guardar}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancelar} disabled={guardando}>
          {copy.cancelar}
        </Button>
      </div>
    </form>
  );
}

/**
 * El ícono se elige viéndolo, no escribiendo su nombre.
 *
 * Es un grupo de radios de verdad —`role="radiogroup"` con botones que dicen
 * si están elegidos— y no una lista de botones: con el teclado se recorre
 * como un solo control, que es lo que es.
 */
function ElegirIcono({
  valor,
  onElegir,
  copy,
}: {
  valor: string;
  onElegir: (icono: string) => void;
  copy: EnlacesTextos;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-text">{copy.icono}</span>
      <div role="radiogroup" aria-label={copy.icono} className="flex flex-wrap gap-2">
        {ICONOS_DE_ENLACE.map((nombre) => (
          <button
            key={nombre}
            type="button"
            role="radio"
            aria-checked={valor === nombre}
            aria-label={nombre}
            onClick={() => onElegir(nombre)}
            className={
              valor === nombre
                ? 'flex size-11 items-center justify-center rounded-xl border-2 border-gold bg-celebration text-on-celebration'
                : 'flex size-11 items-center justify-center rounded-xl border border-line-strong text-muted transition-colors hover:border-text hover:text-text'
            }
          >
            <IconoDeEnlace nombre={nombre} size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
