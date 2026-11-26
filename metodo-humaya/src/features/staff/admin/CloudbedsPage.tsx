import { useCallback, useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useIdiomaRecepcion } from '../puerta/contexto';
import {
  conectarHotel,
  ErrorCloudbeds,
  estadoCloudbeds,
  guardarLlave,
  sincronizarHotel,
  type HotelCloudbeds,
  type Sincronizacion,
} from '@/services/cloudbeds';
import { cloudbedsCopy, type CloudbedsTextos } from './copyCloudbeds';

/**
 * Conectar cada hotel con su propiedad de Cloudbeds, y guardarle su llave.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 25 de noviembre de 2026, con Admin abierto en el iPad: «Ya tengo la
 * API de Cloudbeds, pero no hay pantalla donde ponerla».
 *
 * No la había. La única pantalla que guardaba llaves de Cloudbeds vivía en
 * el CRM, y ese es el CRM de Tony — no el panel de un hotel. Una llave de
 * Cloudbeds es de UN hotel, igual que sus villas, sus servicios y sus
 * enlaces; su lugar es acá, donde cuelga de `negocio_id` como todo lo demás.
 *
 * ── GUARDAR LA LLAVE ES CONECTAR EL HOTEL ──────────────────────────────
 * Tony, 26 de noviembre: «¿por qué dices que tienes que hacer unos botones
 * de suscribir o importar? Porque se supone que al pegar la llave
 * automáticamente se tiene que hacer eso, ¿o me equivoco?».
 *
 * No se equivocaba. Guardar la llave prueba la llave, registra los avisos y
 * trae las reservas que ya existían. Tres botones habrían sido enseñarle la
 * plomería: desde afuera, pegar la llave de HUMAYA trajo sus 68 reservas.
 *
 * El botón «traer otra vez» sí existe, pero para otra cosa: cuando Cloudbeds
 * se cayó a mitad, o cuando quedaron reservas sin traer. No es un paso del
 * camino normal; es la salida de un camino que falló.
 *
 * ── POR QUÉ LAS INSTRUCCIONES ESTÁN EN LA PANTALLA ─────────────────────
 * Porque el camino en Cloudbeds no se adivina: el formulario pide una
 * «Redirect URI» que con llave de API no se usa para nada, y la llave no
 * sale al guardar la integración — hay que deslizar la tabla a la derecha,
 * hasta una columna que no se ve, y apretar Create. Tony perdió una vuelta
 * ahí. Lo que cuesta explicar dos veces va escrito donde se usa.
 */

/** Un hotel: su propiedad, su llave, y lo que le falta. */
function Ficha({
  hotel,
  copy,
  onConectado,
}: {
  hotel: HotelCloudbeds;
  copy: CloudbedsTextos;
  onConectado: () => Promise<void>;
}) {
  const [numero, setNumero] = useState('');
  const [llave, setLlave] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const [listo, setListo] = useState<Sincronizacion | null>(null);

  function contar(e: unknown) {
    if (!(e instanceof ErrorCloudbeds)) {
      setFallo(copy.alFallar.desconocido);
      return;
    }
    const porque = copy.alFallar[e.motivo];
    // Que la llave haya quedado guardada cambia qué hacer después, así que se
    // dice. Si no, Tony volvería a buscar una llave que Cloudbeds ya no
    // muestra.
    setFallo(e.llaveGuardada ? `${copy.llaveGuardadaPeroFallo} ${porque}` : porque);
  }

  async function conectar() {
    setFallo(null);
    setListo(null);
    setOcupado(true);
    try {
      await conectarHotel(hotel.negocioId, numero);
      setNumero('');
      await onConectado();
    } catch (e) {
      contar(e);
    } finally {
      setOcupado(false);
    }
  }

  async function guardar() {
    if (!hotel.propertyId) return;
    setFallo(null);
    setListo(null);
    setOcupado(true);
    try {
      const s = await guardarLlave(hotel.propertyId, llave);
      // Se vacía el campo apenas se guarda: dejar la llave a la vista en una
      // pantalla que alguien puede tener abierta es regalar justamente lo
      // que la bóveda protege.
      setLlave('');
      setListo(s);
      await onConectado();
    } catch (e) {
      setLlave('');
      contar(e);
      await onConectado();
    } finally {
      setOcupado(false);
    }
  }

  async function traer() {
    if (!hotel.propertyId) return;
    setFallo(null);
    setListo(null);
    setOcupado(true);
    try {
      setListo(await sincronizarHotel(hotel.propertyId));
      await onConectado();
    } catch (e) {
      contar(e);
    } finally {
      setOcupado(false);
    }
  }

  const etiqueta = !hotel.propertyId
    ? copy.sinNumero
    : hotel.llavePropia
      ? copy.conLlave
      : copy.sinLlave;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 text-[15px] font-semibold text-text">{hotel.nombre}</h3>
        <span className="rounded-full bg-gold-track px-2 py-0.5 text-[12px] text-muted">
          {etiqueta}
        </span>
        <span className="ml-auto font-mono text-[12px] text-muted-soft">
          {hotel.propertyId ?? '—'} · {hotel.reservas} {copy.reservas}
        </span>
      </div>

      {hotel.origen !== 'cloudbeds' ? (
        <p className="m-0 text-[13px] text-muted">{copy.noUsaCloudbeds}</p>
      ) : null}

      {hotel.propertyId ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Input
              label={copy.llaveLabel}
              type="password"
              autoComplete="off"
              value={llave}
              placeholder={hotel.llavePropia ? copy.llaveReemplazar : copy.llavePlaceholder}
              onChange={(e) => setLlave(e.target.value)}
            />
          </div>
          <Button type="button" disabled={ocupado || !llave.trim()} onClick={() => void guardar()}>
            {ocupado ? copy.guardando : copy.guardar}
          </Button>
          {hotel.llavePropia ? (
            <Button type="button" variant="ghost" disabled={ocupado} onClick={() => void traer()}>
              {ocupado ? copy.trayendo : copy.traer}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Input
              label={copy.numeroLabel}
              inputMode="numeric"
              value={numero}
              placeholder={copy.numeroPlaceholder}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={ocupado || !numero.trim()}
            onClick={() => void conectar()}
          >
            {ocupado ? copy.conectando : copy.conectar}
          </Button>
        </div>
      )}

      {fallo ? (
        <p role="alert" className="m-0 text-[13px] text-on-alert">
          {fallo}
        </p>
      ) : null}

      {listo ? (
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[13px] text-muted">{copy.resumen(listo)}</p>
          {listo.webhooks.faltan.length > 0 ? (
            <p role="alert" className="m-0 text-[13px] text-on-alert">
              {copy.avisosFaltan(listo.webhooks.faltan)}
            </p>
          ) : null}
          {listo.reservas.hayMas ? (
            <p className="m-0 text-[13px] text-muted">{copy.hayMas}</p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function CloudbedsPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = cloudbedsCopy[idioma];

  const [hoteles, setHoteles] = useState<HotelCloudbeds[] | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setHoteles(await estadoCloudbeds());
      setFallo(null);
    } catch {
      setFallo(copy.noSePudoLeer);
    }
  }, [copy.noSePudoLeer]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-[26px] text-text">{copy.titulo}</h1>
        <p className="m-0 max-w-prose text-[14px] leading-relaxed text-muted">{copy.bajada}</p>
      </header>

      <div className="flex max-w-prose flex-col gap-2 rounded-2xl bg-gold-track p-4">
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.dondeSacarNumero}</p>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.dondeSacarLlave}</p>
      </div>

      {fallo ? <p className="m-0 text-[14px] text-on-alert">{fallo}</p> : null}
      {hoteles === null && !fallo ? (
        <p className="m-0 text-[14px] text-muted">{copy.cargando}</p>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {(hoteles ?? []).map((h) => (
          <Ficha key={h.negocioId} hotel={h} copy={copy} onConectado={cargar} />
        ))}
      </ul>
    </section>
  );
}
