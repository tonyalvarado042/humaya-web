import { useCallback, useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useIdiomaRecepcion } from '../puerta/contexto';
import {
  asignarAlHotel,
  cambiarOrigen,
  crearHotel,
  equipoDelHotel,
  ErrorAlCrearHotel,
  todosLosHoteles,
  type HotelDelPanel,
  type MiembroDelEquipo,
  type OrigenReservas,
} from '@/services/panelHoteles';
import { hotelesCopy, type HotelesTextos } from './copyHoteles';

/**
 * Crear hoteles y decir quién trabaja en cada uno.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «dónde está el panel súper admin para
 * crear nuevos hoteles, voy a crear uno. Este debe dejarme seleccionar si
 * conecta con airbnb o con cloud beds etc. Recuerda que debe ser en lidera
 * los hoteles nuevos».
 *
 * Antes de esto, crear un hotel era meter filas a mano en la base.
 *
 * ── SOLO LO VE EL SUPER ADMIN ──────────────────────────────────────────
 * Y lo que lo impide de verdad es la base: cada función pregunta primero si
 * quien llama es de plataforma. Que esta pantalla no aparezca en el menú es
 * para no ofrecer un botón que iba a rebotar, no la protección.
 */

const ORIGENES: OrigenReservas[] = ['cloudbeds', 'airbnb_ical', 'ninguno'];

function Ficha({
  hotel,
  copy,
  dominio,
  onOrigen,
  onEquipo,
}: {
  hotel: HotelDelPanel;
  copy: HotelesTextos;
  dominio: string;
  onOrigen: (origen: OrigenReservas) => void;
  onEquipo: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line-strong p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="m-0 text-[17px] text-text">{hotel.marcaHotel || hotel.codigo}</h3>
        {hotel.esDemo ? (
          <span className="rounded-pill border border-line-strong px-2 py-0.5 text-[12px] text-muted">
            {copy.etiquetaDemo}
          </span>
        ) : null}
      </div>
      <p className="m-0 font-mono text-[13px] break-all text-muted">
        {dominio}/{hotel.codigo}
      </p>
      <p className="m-0 text-[13px] text-muted">{copy.cuantos(hotel.usuarios, hotel.reservas)}</p>
      <label className="flex flex-col gap-1.5 text-[13px] text-text">
        {copy.origenLabel}
        <select
          value={hotel.origen}
          onChange={(e) => onOrigen(e.target.value as OrigenReservas)}
          className="h-11 rounded-xl border border-line-strong bg-transparent px-3 text-[15px] text-text"
        >
          {ORIGENES.map((o) => (
            <option key={o} value={o}>
              {copy.origen[o]}
            </option>
          ))}
        </select>
      </label>
      {hotel.origen === 'airbnb_ical' ? (
        <p className="m-0 rounded-xl bg-gold-track px-3 py-2 text-[12px] leading-relaxed text-muted">
          {copy.avisoAirbnb}
        </p>
      ) : null}
      <Button variant="outline" onClick={onEquipo}>
        {copy.verEquipo}
      </Button>
    </li>
  );
}

function Equipo({
  copy,
  miembros,
  onCambiar,
  onCerrar,
}: {
  copy: HotelesTextos;
  miembros: MiembroDelEquipo[];
  onCambiar: (usuarioId: string, asignado: boolean) => void;
  onCerrar: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line-strong p-4">
      <h3 className="m-0 text-[17px] text-text">{copy.equipoTitulo}</h3>
      <p className="m-0 text-[13px] text-muted">{copy.equipoCuerpo}</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {miembros.map((m) => (
          <li key={m.usuarioId} className="flex items-center justify-between gap-3">
            <span className="text-[14px] text-text">
              {m.nombre ?? m.correo}
              <span className="ml-2 text-[12px] text-muted-soft">{m.rol}</span>
            </span>
            <label className="flex items-center gap-2 text-[13px] text-muted">
              <input
                type="checkbox"
                checked={m.asignado}
                onChange={(e) => onCambiar(m.usuarioId, e.target.checked)}
              />
              {copy.entra}
            </label>
          </li>
        ))}
      </ul>
      <Button variant="outline" onClick={onCerrar}>
        {copy.cerrar}
      </Button>
    </div>
  );
}

export function HotelesPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = hotelesCopy[idioma];

  const [hoteles, setHoteles] = useState<HotelDelPanel[] | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [miembros, setMiembros] = useState<MiembroDelEquipo[]>([]);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [marcaHotel, setMarcaHotel] = useState('');
  const [marcaExperiencia, setMarcaExperiencia] = useState('');
  const [correo, setCorreo] = useState('');
  const [origen, setOrigen] = useState<OrigenReservas>('cloudbeds');
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  const dominio = 'https://guestexp.liderax10.com';

  const cargar = useCallback(async () => {
    try {
      setHoteles(await todosLosHoteles());
      setFallo(null);
    } catch {
      setFallo(copy.noSePudoLeer);
    }
  }, [copy.noSePudoLeer]);

  useEffect(() => {
    // Primera carga. El setState ocurre después del await, ya fuera del
    // cuerpo del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErrorCrear(null);
    if (!codigo.trim() || !marcaHotel.trim()) {
      setErrorCrear(copy.faltanCampos);
      return;
    }
    setCreando(true);
    try {
      await crearHotel({
        codigo,
        nombre: nombre || marcaHotel,
        marcaHotel,
        marcaExperiencia: marcaExperiencia || `${marcaHotel} Experience`,
        correo,
        origen,
      });
      setCodigo('');
      setNombre('');
      setMarcaHotel('');
      setMarcaExperiencia('');
      setCorreo('');
      await cargar();
    } catch (e) {
      setErrorCrear(
        e instanceof ErrorAlCrearHotel ? copy.alCrear[e.motivo] : copy.alCrear.desconocido,
      );
    } finally {
      setCreando(false);
    }
  }

  async function abrirEquipo(negocioId: string) {
    setAbierto(negocioId);
    setMiembros(await equipoDelHotel(negocioId));
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-[26px] text-text">{copy.titulo}</h1>
        <p className="m-0 max-w-prose text-[14px] leading-relaxed text-muted">{copy.bajada}</p>
      </header>

      <form onSubmit={enviar} className="flex max-w-md flex-col gap-3">
        <h2 className="m-0 text-[18px] text-text">{copy.nuevoTitulo}</h2>
        <Input
          label={copy.marcaHotelLabel}
          value={marcaHotel}
          placeholder={copy.marcaHotelPlaceholder}
          onChange={(e) => setMarcaHotel(e.target.value)}
        />
        <Input
          label={copy.codigoLabel}
          value={codigo}
          placeholder={copy.codigoPlaceholder}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <p className="m-0 font-mono text-[12px] break-all text-muted-soft">
          {dominio}/{codigo.trim().toLowerCase() || copy.codigoPlaceholder}
        </p>
        <Input
          label={copy.marcaExperienciaLabel}
          value={marcaExperiencia}
          placeholder={copy.marcaExperienciaPlaceholder}
          onChange={(e) => setMarcaExperiencia(e.target.value)}
        />
        <Input
          label={copy.correoLabel}
          type="email"
          value={correo}
          placeholder={copy.correoPlaceholder}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <label className="flex flex-col gap-1.5 text-[13px] text-text">
          {copy.origenLabel}
          <select
            value={origen}
            onChange={(e) => setOrigen(e.target.value as OrigenReservas)}
            className="h-11 rounded-xl border border-line-strong bg-transparent px-3 text-[15px] text-text"
          >
            {ORIGENES.map((o) => (
              <option key={o} value={o}>
                {copy.origen[o]}
              </option>
            ))}
          </select>
        </label>
        {origen === 'airbnb_ical' ? (
          <p className="m-0 rounded-xl bg-gold-track px-3 py-2 text-[12px] leading-relaxed text-muted">
            {copy.avisoAirbnb}
          </p>
        ) : null}
        {errorCrear ? (
          <p role="alert" className="m-0 text-[13px] text-on-alert">
            {errorCrear}
          </p>
        ) : null}
        <Button type="submit" disabled={creando}>
          {creando ? copy.creando : copy.crear}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-[18px] text-text">{copy.listaTitulo}</h2>
        {fallo ? <p className="m-0 text-[14px] text-on-alert">{fallo}</p> : null}
        {hoteles === null && !fallo ? (
          <p className="m-0 text-[14px] text-muted">{copy.cargando}</p>
        ) : null}
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {(hoteles ?? []).map((h) => (
            <Ficha
              key={h.negocioId}
              hotel={h}
              copy={copy}
              dominio={dominio}
              onOrigen={(o) => void cambiarOrigen(h.negocioId, o).then(cargar)}
              onEquipo={() => void abrirEquipo(h.negocioId)}
            />
          ))}
        </ul>
        {abierto ? (
          <Equipo
            copy={copy}
            miembros={miembros}
            onCambiar={(usuarioId, asignado) =>
              void asignarAlHotel(abierto, usuarioId, asignado)
                .then(() => equipoDelHotel(abierto))
                .then(setMiembros)
                .then(cargar)
            }
            onCerrar={() => setAbierto(null)}
          />
        ) : null}
      </div>
    </section>
  );
}
