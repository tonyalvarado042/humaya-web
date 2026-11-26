import { useCallback, useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useIdiomaRecepcion } from '../puerta/contexto';
import {
  conectarHotel,
  ErrorCloudbeds,
  estadoCloudbeds,
  guardarLlave,
  type HotelCloudbeds,
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
  const [listo, setListo] = useState<string | null>(null);

  function contar(e: unknown) {
    setFallo(e instanceof ErrorCloudbeds ? copy.alFallar[e.motivo] : copy.alFallar.desconocido);
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
      await guardarLlave(hotel.propertyId, llave);
      // Se vacía el campo apenas se guarda: dejar la llave a la vista en una
      // pantalla que alguien puede tener abierta es regalar justamente lo
      // que la bóveda protege.
      setLlave('');
      setListo(copy.guardada);
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
      : hotel.llaveGeneral
        ? copy.usaLaGeneral
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
      {listo ? <p className="m-0 text-[13px] text-muted">{listo}</p> : null}
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
