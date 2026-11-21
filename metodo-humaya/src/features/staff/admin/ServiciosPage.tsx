import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { useAdminServicios, useCrearServicio, useEditarServicio, useToggleServicio } from '@/hooks';
import type { CambiosServicio } from '@/services/admin';
import type { Servicio } from '@/types';
import { ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useEsAdministrador } from '../puerta/contexto';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { adminCopy } from './copy';

/**
 * El catálogo de servicios reservables.
 *
 * Esto vivía dentro de una sola pantalla de Admin que tenía además el
 * interruptor del demo, el menú del huésped, el bot del Concierge y las
 * pantallas de los televisores. Se separó el 20 de noviembre de 2026 a pedido
 * de Tony: para cambiarle el precio a un servicio había que pasar de largo
 * por la llave de la API de Anthropic.
 *
 * Sauna y Cold Plunge no están acá porque siguen siendo datos de ejemplo
 * (src/mocks/spa.ts); esto agrega servicios más allá de esos dos.
 */
export function ServiciosPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = adminCopy[idioma];
  const servicios = useAdminServicios();
  const toggleServicio = useToggleServicio();
  const crearServicio = useCrearServicio();
  const editarServicio = useEditarServicio();
  const esAdmin = useEsAdministrador();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precio, setPrecio] = useState('');
  const [unidad, setUnidad] = useState('hora');
  const [duracion, setDuracion] = useState('60');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [nombreError, setNombreError] = useState(false);
  /** El servicio que se esta editando, o null. Solo uno a la vez. */
  const [editando, setEditando] = useState<string | null>(null);

  if (servicios.isPending) return <ScreenLoading label={copy.serviciosTitle} />;
  if (servicios.isError || !servicios.data) {
    return <ScreenError onRetry={() => void servicios.refetch()} />;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = nombre.trim();
    if (!clean) {
      setNombreError(true);
      return;
    }
    setNombreError(false);
    crearServicio.mutate(
      {
        nombre: clean,
        descripcion: descripcion.trim() || undefined,
        proveedor: proveedor.trim() || undefined,
        precioUsd: precio ? Number(precio) : undefined,
        unidadPrecio: unidad.trim() || undefined,
        duracionMin: duracion ? Number(duracion) : undefined,
        horaInicio,
        horaFin,
      },
      {
        onSuccess: () => {
          setNombre('');
          setDescripcion('');
          setProveedor('');
          setPrecio('');
          setDuracion('60');
        },
      },
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 font-display text-2xl font-medium">{copy.serviciosTitle}</h2>
        <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">{copy.serviciosBody}</p>
      </div>

      {servicios.data.length === 0 ? (
        <p className="m-0 text-sm text-muted-soft">{copy.serviciosEmpty}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {servicios.data.map((servicio) => (
            <li key={servicio.id}>
              <FilaServicio
                servicio={servicio}
                esAdmin={esAdmin}
                editando={editando === servicio.id}
                guardando={editarServicio.isPending}
                fallo={editarServicio.isError}
                toggleando={toggleServicio.isPending}
                onEditar={() => {
                  editarServicio.reset();
                  setEditando(servicio.id);
                }}
                onCancelar={() => setEditando(null)}
                onGuardar={(cambios) =>
                  editarServicio.mutate(
                    { id: servicio.id, cambios },
                    { onSuccess: () => setEditando(null) },
                  )
                }
                onToggle={() =>
                  toggleServicio.mutate({ id: servicio.id, habilitado: !servicio.habilitado })
                }
              />
            </li>
          ))}
        </ul>
      )}

      {/* Crear un servicio y encenderlo pasan por la funcion `humaya-admin`,
          que acepta cualquier rol de recepcion. EDITARLO va directo a la
          tabla, y ahi RLS exige `administrador`: por eso el boton de editar
          sí se esconde y estos no. Comprobado leyendo las dos puertas, no
          supuesto. */}
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <h3 className="m-0 font-display text-lg font-medium">{copy.nuevoServicio}</h3>
          <Input
            label={copy.nombreLabel}
            placeholder={copy.nombrePlaceholder}
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            error={nombreError ? copy.nombreRequerido : undefined}
          />
          <Textarea
            label={copy.descripcionLabel}
            placeholder={copy.descripcionPlaceholder}
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
          <Input
            label={copy.proveedorLabel}
            placeholder={copy.proveedorPlaceholder}
            value={proveedor}
            onChange={(event) => setProveedor(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={copy.precioLabel}
              type="number"
              min="0"
              value={precio}
              onChange={(event) => setPrecio(event.target.value)}
            />
            <Input
              label={copy.unidadLabel}
              value={unidad}
              onChange={(event) => setUnidad(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label={copy.duracionLabel}
              type="number"
              min="15"
              step="15"
              value={duracion}
              onChange={(event) => setDuracion(event.target.value)}
            />
            <Input
              label={copy.horaInicioLabel}
              type="time"
              value={horaInicio}
              onChange={(event) => setHoraInicio(event.target.value)}
            />
            <Input
              label={copy.horaFinLabel}
              type="time"
              value={horaFin}
              onChange={(event) => setHoraFin(event.target.value)}
            />
          </div>
          {crearServicio.isError ? (
            <p role="alert" className="m-0 text-sm text-on-alert">
              {copy.error}
            </p>
          ) : null}
          <Button type="submit" disabled={crearServicio.isPending}>
            {crearServicio.isPending ? copy.guardando : copy.guardar}
          </Button>
        </form>
      </Card>
    </section>
  );
}

interface FilaServicioProps {
  servicio: Servicio;
  esAdmin: boolean;
  editando: boolean;
  guardando: boolean;
  fallo: boolean;
  toggleando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
  onGuardar: (cambios: CambiosServicio) => void;
  onToggle: () => void;
}

/**
 * Un servicio de la lista: se lee, se habilita y ahora tambien se edita.
 *
 * Hasta el 16 de noviembre de 2026 un servicio solo se podia crear o apagar.
 * Si el precio subia o cambiaba quien lo da, habia que crear otro y apagar el
 * viejo — y las reservas quedaban colgando del apagado. Lo encontro Tony
 * mirando "Entrenamiento personal".
 */
function FilaServicio({
  servicio,
  esAdmin,
  editando,
  guardando,
  fallo,
  toggleando,
  onEditar,
  onCancelar,
  onGuardar,
  onToggle,
}: FilaServicioProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = adminCopy[idioma];
  if (editando) {
    return (
      <Card>
        <FormularioServicio
          servicio={servicio}
          guardando={guardando}
          fallo={fallo}
          onCancelar={onCancelar}
          onGuardar={onGuardar}
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-[12rem] flex-1 flex-col gap-0.5">
        <h3 className="m-0 font-medium text-text">{servicio.nombre}</h3>
        {servicio.descripcion ? (
          <span className="text-[13px] text-muted">{servicio.descripcion}</span>
        ) : null}
        <span className="text-[13px] text-muted-soft">
          {servicio.proveedor ? `${servicio.proveedor} · ` : ''}
          {servicio.precioUsd != null ? `$${servicio.precioUsd}/${servicio.unidadPrecio} · ` : ''}
          {servicio.horaInicio}–{servicio.horaFin}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={servicio.habilitado ? 'success' : 'neutral'}>
          {servicio.habilitado ? copy.habilitada : copy.deshabilitada}
        </Badge>
        {/* Editar va directo a la tabla: `administrador` o nada. */}
        {esAdmin ? (
          <Button variant="ghost" onClick={onEditar}>
            {copy.editar}
          </Button>
        ) : null}
        <Button variant="outline" disabled={toggleando} onClick={onToggle}>
          {servicio.habilitado ? copy.deshabilitar : copy.habilitar}
        </Button>
      </div>
    </Card>
  );
}

interface FormularioServicioProps {
  servicio: Servicio;
  guardando: boolean;
  fallo: boolean;
  onCancelar: () => void;
  onGuardar: (cambios: CambiosServicio) => void;
}

/**
 * El formulario existe SOLO mientras se edita, y eso no es casualidad: asi
 * cada vez que se abre, el estado se siembra con lo que esta guardado. Si
 * viviera en ServiciosPage, cancelar y volver a entrar mostraria lo que
 * alguien tecleo y descarto — lo contrario de cancelar.
 */
function FormularioServicio({
  servicio,
  guardando,
  fallo,
  onCancelar,
  onGuardar,
}: FormularioServicioProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = adminCopy[idioma];
  // Postgres devuelve `time` como "08:00:00" y un <input type="time"> espera
  // "08:00": sin recortar, el campo aparece vacio y guardar borraria la hora.
  const hhmm = (valor: string) => valor.slice(0, 5);

  const [nombre, setNombre] = useState(servicio.nombre);
  const [descripcion, setDescripcion] = useState(servicio.descripcion ?? '');
  const [proveedor, setProveedor] = useState(servicio.proveedor ?? '');
  const [precio, setPrecio] = useState(
    servicio.precioUsd != null ? String(servicio.precioUsd) : '',
  );
  const [unidad, setUnidad] = useState(servicio.unidadPrecio);
  const [duracion, setDuracion] = useState(String(servicio.duracionMin));
  const [horaInicio, setHoraInicio] = useState(hhmm(servicio.horaInicio));
  const [horaFin, setHoraFin] = useState(hhmm(servicio.horaFin));
  const [sinNombre, setSinNombre] = useState(false);

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) {
      setSinNombre(true);
      return;
    }
    setSinNombre(false);
    onGuardar({
      nombre: limpio,
      // Vacio se guarda como null, no como cadena vacia: la pantalla pregunta
      // `proveedor ? ...` y una cadena vacia es falsa igual, pero null es lo
      // que significa "no hay".
      descripcion: descripcion.trim() || null,
      proveedor: proveedor.trim() || null,
      precioUsd: precio.trim() ? Number(precio) : null,
      unidadPrecio: unidad.trim() || 'hora',
      duracionMin: duracion ? Number(duracion) : undefined,
      horaInicio,
      horaFin,
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <Input
        label={copy.nombreLabel}
        value={nombre}
        onChange={(event) => setNombre(event.target.value)}
        error={sinNombre ? copy.nombreRequerido : undefined}
      />
      <Textarea
        label={copy.descripcionLabel}
        value={descripcion}
        onChange={(event) => setDescripcion(event.target.value)}
      />
      <Input
        label={copy.proveedorLabel}
        value={proveedor}
        onChange={(event) => setProveedor(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={copy.precioLabel}
          type="number"
          min="0"
          value={precio}
          onChange={(event) => setPrecio(event.target.value)}
        />
        <Input
          label={copy.unidadLabel}
          value={unidad}
          onChange={(event) => setUnidad(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label={copy.duracionLabel}
          type="number"
          min="15"
          step="15"
          value={duracion}
          onChange={(event) => setDuracion(event.target.value)}
        />
        <Input
          label={copy.horaInicioLabel}
          type="time"
          value={horaInicio}
          onChange={(event) => setHoraInicio(event.target.value)}
        />
        <Input
          label={copy.horaFinLabel}
          type="time"
          value={horaFin}
          onChange={(event) => setHoraFin(event.target.value)}
        />
      </div>
      {fallo ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {copy.servicioSoloAdmin}
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
