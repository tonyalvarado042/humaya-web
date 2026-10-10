import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import {
  useAdminOpciones,
  useAdminServicios,
  useCrearServicio,
  useToggleOpcion,
  useToggleServicio,
} from '@/hooks';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { adminCopy as copy } from './copy';

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
  const toggleOpcion = useToggleOpcion();
  const toggleServicio = useToggleServicio();
  const crearServicio = useCrearServicio();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precio, setPrecio] = useState('');
  const [unidad, setUnidad] = useState('hora');
  const [duracion, setDuracion] = useState('60');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [nombreError, setNombreError] = useState(false);

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

  return (
    <Screen>
      <ScreenHeading eyebrow="Recepción" title={copy.title} />

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
                <Card className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="m-0 font-medium text-text">{servicio.nombre}</h3>
                    <span className="text-[13px] text-muted">
                      {servicio.proveedor ? `${servicio.proveedor} · ` : ''}
                      {servicio.precioUsd != null
                        ? `$${servicio.precioUsd}/${servicio.unidadPrecio} · `
                        : ''}
                      {servicio.horaInicio}–{servicio.horaFin}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={servicio.habilitado ? 'success' : 'neutral'}>
                      {servicio.habilitado ? copy.habilitada : copy.deshabilitada}
                    </Badge>
                    <Button
                      variant="outline"
                      disabled={toggleServicio.isPending}
                      onClick={() =>
                        toggleServicio.mutate({ id: servicio.id, habilitado: !servicio.habilitado })
                      }
                    >
                      {servicio.habilitado ? copy.deshabilitar : copy.habilitar}
                    </Button>
                  </div>
                </Card>
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
    </Screen>
  );
}
