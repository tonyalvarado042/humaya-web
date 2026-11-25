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

/**
 * Una de las TRES direcciones del hotel, con su botón de copiar.
 *
 * ── LA TERCERA, LA LANDING ──────────────────────────────────────────────
 * Tony, horas después del arreglo de abajo: «no veo la dirección de landing
 * de Bike & Bed. No es ninguna de estas». Tenía razón otra vez: esta
 * pantalla mostraba por dónde entra el huésped y por dónde entra recepción,
 * pero no la portada interna —la landing que él pidió—, que vive en
 * `/staff/inicio`. Y para un hotel del dominio compartido esa dirección ni
 * existía: hacía falta `?hotel=<codigo>` para decir de cuál es.
 *
 * ── POR QUÉ SE MUESTRAN LAS DOS ─────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «no sale ambos enlaces de huésped y de
 * staff, ¿por qué?». Tenía razón: la ficha mostraba una sola, y encima
 * armada a mano pegándole el código a `guestexp.liderax10.com`. Para HUMAYA
 * eso era falso —su dirección es `experience.stayhumaya.com`— y la de
 * recepción no aparecía en ninguna parte.
 *
 * Son dos direcciones distintas de verdad: el huésped y el personal viven
 * separados desde el 15 de noviembre. Mandarle a un hotel la del huésped
 * cuando pidió la de su recepción es mandarlo a la pantalla equivocada.
 */
function Direccion({
  etiqueta,
  url,
  copy,
}: {
  etiqueta: string;
  url: string | null;
  copy: HotelesTextos;
}) {
  const [copiada, setCopiada] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] text-muted-soft">{etiqueta}</span>
      {url ? (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[13px] break-all text-text underline-offset-4 hover:underline"
          >
            {url}
          </a>
          <button
            type="button"
            onClick={() => {
              // Sin `navigator.clipboard` —http sin candado, un navegador
              // viejo— el enlace sigue a la vista para copiarlo a mano. No se
              // dice «Copiada» si no se copió.
              void navigator.clipboard
                ?.writeText(url)
                .then(() => setCopiada(true))
                .catch(() => setCopiada(false));
            }}
            className="rounded-pill border border-line-strong px-2.5 py-0.5 text-[12px] text-muted transition-colors hover:text-text"
          >
            {copiada ? copy.copiada : copy.copiar}
          </button>
        </div>
      ) : (
        <span className="text-[13px] text-muted-soft">{copy.sinDireccion}</span>
      )}
    </div>
  );
}

function Ficha({
  hotel,
  copy,
  abierto,
  miembros,
  onOrigen,
  onEquipo,
  onCerrarEquipo,
  onCambiarMiembro,
}: {
  hotel: HotelDelPanel;
  copy: HotelesTextos;
  abierto: boolean;
  miembros: MiembroDelEquipo[];
  onOrigen: (origen: OrigenReservas) => void;
  onEquipo: () => void;
  onCerrarEquipo: () => void;
  onCambiarMiembro: (usuarioId: string, asignado: boolean) => void;
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

      {/* La portada va PRIMERA: es la que uno manda cuando le dice a un
          hotel «entrá acá y de ahí sale todo», y es la que Tony no encontraba
          en esta pantalla. Las otras dos salen de ella. */}
      <Direccion etiqueta={copy.laPortadaDelHotel} url={hotel.urlPortada} copy={copy} />
      <Direccion etiqueta={copy.dondeEntraElHuesped} url={hotel.urlHuesped} copy={copy} />
      <Direccion etiqueta={copy.dondeEntraRecepcion} url={hotel.urlPersonal} copy={copy} />

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

      {/* El equipo se abre ACÁ ADENTRO, no al final de la página.
          Tony, 24 de noviembre de 2026: «botones sin click». El botón sí
          funcionaba: abría un panel pegado al final de la lista, debajo de
          los tres hoteles y muchas veces fuera de la pantalla, sin decir
          siquiera de qué hotel era. Clic sin cambio visible es, para quien
          lo usa, un botón que no hace nada. */}
      <Button variant="outline" onClick={abierto ? onCerrarEquipo : onEquipo}>
        {abierto ? copy.cerrarEquipo : copy.verEquipo}
      </Button>
      {abierto ? <Equipo copy={copy} miembros={miembros} onCambiar={onCambiarMiembro} /> : null}
    </li>
  );
}

function Equipo({
  copy,
  miembros,
  onCambiar,
}: {
  copy: HotelesTextos;
  miembros: MiembroDelEquipo[];
  onCambiar: (usuarioId: string, asignado: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-sunken p-3">
      <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.equipoCuerpo}</p>
      {miembros.length === 0 ? (
        <p className="m-0 text-[13px] text-muted-soft">{copy.cargando}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {miembros.map((m) => (
            <li key={m.usuarioId} className="flex flex-wrap items-center justify-between gap-2">
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
      )}
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

  /**
   * Dónde va a vivir un hotel NUEVO.
   *
   * Esto sí se arma acá y no sale de la base, porque el hotel todavía no
   * existe: no hay fila en `humaya_dominios` que consultar. Un hotel nuevo
   * nace siempre en el dominio compartido —«debe ser en lidera los hoteles
   * nuevos», Tony, 24 de noviembre de 2026—, así que la dirección es
   * predecible. Las de los hoteles que YA existen salen de la base, porque
   * ahí sí hay hoteles con dominio propio.
   */
  const DOMINIO_NUEVO = {
    huesped: 'https://guestexp.liderax10.com',
    personal: 'https://hotelexp.liderax10.com/staff',
  };

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

  /**
   * Se vacía la lista ANTES de pedirla: sin eso, abrir el equipo de un hotel
   * mostraba por un instante quién trabaja en el anterior — con sus casillas
   * marcadas, que es lo peor que puede mostrar de más esta pantalla.
   *
   * Y si la consulta falla se dice, en vez de dejar la ficha abierta y vacía
   * para siempre: una lista vacía se lee como «no hay nadie», que es otra
   * cosa muy distinta de «no se pudo preguntar».
   */
  async function abrirEquipo(negocioId: string) {
    setAbierto(negocioId);
    setMiembros([]);
    setFallo(null);
    try {
      setMiembros(await equipoDelHotel(negocioId));
    } catch {
      setAbierto(null);
      setFallo(copy.noSePudoLeer);
    }
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
          {/* La landing primero, que es la que uno manda. Nace en el dominio
              compartido, así que lleva `?hotel=` igual que la de los otros
              hoteles de ahí. */}
          {DOMINIO_NUEVO.personal}/inicio?hotel=
          {codigo.trim().toLowerCase() || copy.codigoPlaceholder}
          <br />
          {DOMINIO_NUEVO.huesped}/{codigo.trim().toLowerCase() || copy.codigoPlaceholder}
          <br />
          {DOMINIO_NUEVO.personal}
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
        <ul className="m-0 grid list-none items-start gap-3 p-0 sm:grid-cols-2">
          {(hoteles ?? []).map((h) => (
            <Ficha
              key={h.negocioId}
              hotel={h}
              copy={copy}
              abierto={abierto === h.negocioId}
              miembros={abierto === h.negocioId ? miembros : []}
              onOrigen={(o) => void cambiarOrigen(h.negocioId, o).then(cargar)}
              onEquipo={() => void abrirEquipo(h.negocioId)}
              onCerrarEquipo={() => setAbierto(null)}
              onCambiarMiembro={(usuarioId, asignado) =>
                void asignarAlHotel(h.negocioId, usuarioId, asignado)
                  .then(() => equipoDelHotel(h.negocioId))
                  .then(setMiembros)
                  .then(cargar)
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
