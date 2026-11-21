import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import {
  useAdminOpciones,
  useAjustes,
  useCambiarDemo,
  useAdminServicios,
  useCrearServicio,
  useEditarServicio,
  useToggleOpcion,
  useToggleServicio,
} from '@/hooks';
import type { CambiosServicio } from '@/services/admin';
import type { Servicio } from '@/types';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { adminCopy as copy } from './copy';
import { ConciergeBot } from './ConciergeBot';
import { PantallaTv } from './PantallaTv';

/**
 * Lo que se configura acá maneja, en el mismo momento, el Home del huésped
 * (las fichas) y el menú de abajo (GuestLayout): las dos leen
 * humaya_admin_opciones. Sauna y Cold Plunge no están acá porque siguen
 * siendo datos de ejemplo (src/mocks/spa.ts); esto agrega servicios más allá
 * de esos dos.
 */
export function AdminPage() {
  const opciones = useAdminOpciones();
  const servicios = useAdminServicios();
  const ajustes = useAjustes();
  const cambiarDemo = useCambiarDemo();
  const toggleOpcion = useToggleOpcion();
  const toggleServicio = useToggleServicio();
  const crearServicio = useCrearServicio();
  const editarServicio = useEditarServicio();

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

  if (opciones.isPending || servicios.isPending) {
    return <ScreenLoading label={copy.title} />;
  }

  if (opciones.isError || servicios.isError || !opciones.data || !servicios.data) {
    return (
      <ScreenError
        onRetry={() => {
          void opciones.refetch();
          void servicios.refetch();
        }}
      />
    );
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

  const demoVisible = ajustes.data?.demoVisible ?? false;

  return (
    <Screen>
      <ScreenHeading eyebrow="Recepción" title={copy.title} />

      <section className="flex flex-col gap-3">
        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="m-0 font-display text-xl text-text">{copy.demoTitulo}</h2>
              <Badge tone={demoVisible ? 'success' : 'neutral'}>
                {demoVisible ? copy.demoEncendido : copy.demoApagado}
              </Badge>
            </div>
            <p className="m-0 text-sm leading-relaxed text-muted">{copy.demoCuerpo}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                disabled={cambiarDemo.isPending}
                onClick={() => cambiarDemo.mutate(!demoVisible)}
              >
                {demoVisible ? copy.demoApagar : copy.demoEncender}
              </Button>
              {cambiarDemo.isError ? (
                <span role="alert" className="text-[13px] text-on-alert">
                  {copy.demoSoloAdmin}
                </span>
              ) : null}
            </div>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="m-0 font-display text-2xl font-medium">{copy.opcionesTitle}</h2>
          <p className="m-0 text-sm text-muted">{copy.opcionesBody}</p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {opciones.data.map((opcion) => (
            <li key={opcion.id}>
              <Card className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="m-0 font-medium text-text">{opcion.etiqueta}</h3>
                  {opcion.descripcion ? (
                    <span className="text-[13px] text-muted">{opcion.descripcion}</span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={opcion.habilitada ? 'success' : 'neutral'}>
                    {opcion.habilitada ? copy.habilitada : copy.deshabilitada}
                  </Badge>
                  <Button
                    variant="outline"
                    disabled={toggleOpcion.isPending}
                    onClick={() =>
                      toggleOpcion.mutate({ id: opcion.id, habilitada: !opcion.habilitada })
                    }
                  >
                    {opcion.habilitada ? copy.deshabilitar : copy.habilitar}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <ConciergeBot />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="m-0 font-display text-2xl font-medium">{copy.serviciosTitle}</h2>
          <p className="m-0 text-sm text-muted">{copy.serviciosBody}</p>
        </div>

        {servicios.data.length === 0 ? (
          <p className="m-0 text-sm text-muted-soft">{copy.serviciosEmpty}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {servicios.data.map((servicio) => (
              <li key={servicio.id}>
                <FilaServicio
                  servicio={servicio}
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

      <PantallaTv />
    </Screen>
  );
}

interface FilaServicioProps {
  servicio: Servicio;
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
  editando,
  guardando,
  fallo,
  toggleando,
  onEditar,
  onCancelar,
  onGuardar,
  onToggle,
}: FilaServicioProps) {
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
        <Button variant="ghost" onClick={onEditar}>
          {copy.editar}
        </Button>
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
 * viviera en AdminPage, cancelar y volver a entrar mostraria lo que alguien
 * tecleo y descarto — lo contrario de cancelar.
 */
function FormularioServicio({
  servicio,
  guardando,
  fallo,
  onCancelar,
  onGuardar,
}: FormularioServicioProps) {
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
