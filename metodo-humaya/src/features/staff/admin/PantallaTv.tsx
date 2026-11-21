import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { useGuardarVillaTv, useSubirFotoTv, useVillasTv } from '@/hooks';
import { direccionDelTv, urlDeFoto } from '@/services/tv';
import type { CambiosVillaTv, VillaTv } from '@/types';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { tvCopy } from './copyTv';

/**
 * Las pantallas de los televisores, administradas desde recepción.
 *
 * ── POR QUE ESTA SECCION EXISTE ─────────────────────────────────────────
 * La pantalla del TV traía su propio panel de administración, en el Worker,
 * con su propia clave guardada como secreto de Cloudflare. Dos puertas, dos
 * listas de quién puede entrar y una clave más que recordar — para configurar
 * el mismo hotel que ya se configura acá.
 *
 * ── POR QUE SE MUESTRA LA DIRECCION COMPLETA ────────────────────────────
 * Porque es lo único que hay que escribir en el televisor, y lleva la clave
 * de la villa adentro. Sin verla, no hay forma de colgar un televisor nuevo.
 */
export function PantallaTv() {
  const [idioma] = useIdiomaRecepcion();
  const copy = tvCopy[idioma];
  const villas = useVillasTv();
  const [abierta, setAbierta] = useState<string | null>(null);

  if (villas.isPending) return <Cargando />;
  if (villas.isError || !villas.data) return <NoCargo onRetry={() => void villas.refetch()} />;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
        <p className="m-0 text-sm text-muted">{copy.cuerpo}</p>
      </div>

      {villas.data.length === 0 ? (
        <Card>
          <p className="m-0 font-display text-xl">{copy.vacio}</p>
          <p className="m-0 text-sm text-muted">{copy.vacioCuerpo}</p>
        </Card>
      ) : (
        villas.data.map((villa) => (
          <FilaVilla
            key={villa.id}
            villa={villa}
            abierta={abierta === villa.id}
            onAbrir={() => setAbierta(abierta === villa.id ? null : villa.id)}
          />
        ))
      )}

      <Card variant="accent">
        <h3 className="m-0 font-display text-lg font-medium">{copy.guiaTitulo}</h3>
        <p className="m-0 text-sm leading-relaxed text-muted">{copy.guiaCuerpo}</p>
      </Card>
    </section>
  );
}

function Cargando() {
  const [idioma] = useIdiomaRecepcion();
  const copy = tvCopy[idioma];
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
      <p className="m-0 text-sm text-muted" aria-live="polite">
        Cargando {copy.cargando}…
      </p>
    </section>
  );
}

function NoCargo({ onRetry }: { onRetry: () => void }) {
  const [idioma] = useIdiomaRecepcion();
  const copy = tvCopy[idioma];
  return (
    <section className="flex flex-col items-start gap-2" role="alert">
      <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
      <p className="m-0 text-sm text-on-alert">No pudimos leer las pantallas del TV.</p>
      <Button variant="ghost" onClick={onRetry}>
        Reintentar
      </Button>
    </section>
  );
}

interface FilaProps {
  villa: VillaTv;
  abierta: boolean;
  onAbrir: () => void;
}

function FilaVilla({ villa, abierta, onAbrir }: FilaProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = tvCopy[idioma];
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 font-display text-lg font-medium">{villa.nombre}</h3>
        {villa.habilitada ? null : <Badge tone="warning">{copy.apagada}</Badge>}
        <span className="text-[13px] text-muted">
          {villa.huesped ? copy.conHuesped(villa.huesped) : copy.vacia}
        </span>
        <Button variant="ghost" onClick={onAbrir} className="ml-auto">
          {abierta ? copy.cerrar : copy.editar}
        </Button>
      </div>

      {abierta ? <Editor villa={villa} /> : null}
    </Card>
  );
}

/** Un campo que arranca en lo guardado y recuerda lo que la persona escribió. */
function useCampo(inicial: string | null) {
  const [valor, setValor] = useState(inicial ?? '');
  return { valor, setValor, oNull: () => (valor.trim() ? valor.trim() : null) };
}

function Editor({ villa }: { villa: VillaTv }) {
  const [idioma] = useIdiomaRecepcion();
  const copy = tvCopy[idioma];
  const guardar = useGuardarVillaTv();
  const subir = useSubirFotoTv();
  const archivo = useRef<HTMLInputElement>(null);
  const [copiada, setCopiada] = useState(false);

  const huesped = useCampo(villa.huesped);
  const llegada = useCampo(villa.llegada);
  const salida = useCampo(villa.salida);
  const checkin = useCampo(villa.checkin);
  const checkout = useCampo(villa.checkout);
  const ssid = useCampo(villa.wifiSsid);
  const claveWifi = useCampo(villa.wifiClave);
  const bienvenida = useCampo(villa.bienvenida);
  const notaTitulo = useCampo(villa.notaTitulo);
  const notaTexto = useCampo(villa.notaTexto);
  const [siempre, setSiempre] = useState(villa.wifiSiempre);
  const [reloj, setReloj] = useState(villa.relojPosicion);

  const direccion = direccionDelTv(villa);

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cambios: CambiosVillaTv = {
      huesped: huesped.oNull(),
      llegada: llegada.oNull(),
      salida: salida.oNull(),
      checkin: checkin.valor.trim() || '15:00',
      checkout: checkout.valor.trim() || '11:00',
      wifiSsid: ssid.oNull(),
      wifiClave: claveWifi.oNull(),
      wifiSiempre: siempre,
      bienvenida: bienvenida.oNull(),
      notaTitulo: notaTitulo.oNull(),
      notaTexto: notaTexto.oNull(),
      relojPosicion: reloj,
    };
    guardar.mutate({ id: villa.id, cambios });
  }

  function vaciar() {
    huesped.setValor('');
    llegada.setValor('');
    salida.setValor('');
    guardar.mutate({ id: villa.id, cambios: { huesped: null, llegada: null, salida: null } });
  }

  return (
    <form className="flex flex-col gap-5 border-t border-line pt-4" onSubmit={enviar}>
      {/* ── La dirección del televisor ─────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <h4 className="m-0 text-eyebrow text-muted">{copy.direccionTitulo}</h4>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.direccionCuerpo}</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-card bg-surface-sunken px-3 py-2 text-[13px] break-all text-text">
            {direccion}
          </code>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigator.clipboard?.writeText(direccion);
              setCopiada(true);
            }}
          >
            {copiada ? copy.copiada : copy.copiar}
          </Button>
          <a
            href={direccion}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-gold no-underline hover:underline"
          >
            {copy.verPantalla} →
          </a>
        </div>
      </div>

      {/* ── Quién está ─────────────────────────────────────────────── */}
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="p-0 text-eyebrow text-muted">{copy.huespedTitulo}</legend>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.huespedCuerpo}</p>
        <Input
          label={copy.huespedLabel}
          placeholder={copy.huespedPlaceholder}
          value={huesped.valor}
          onChange={(e) => huesped.setValor(e.target.value)}
        />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Input
            label={copy.llegadaLabel}
            type="date"
            value={llegada.valor}
            onChange={(e) => llegada.setValor(e.target.value)}
          />
          <Input
            label={copy.salidaLabel}
            type="date"
            value={salida.valor}
            onChange={(e) => salida.setValor(e.target.value)}
          />
          <Input
            label={copy.checkinLabel}
            type="time"
            value={checkin.valor}
            onChange={(e) => checkin.setValor(e.target.value)}
          />
          <Input
            label={copy.checkoutLabel}
            type="time"
            value={checkout.valor}
            onChange={(e) => checkout.setValor(e.target.value)}
          />
        </div>
        {villa.huesped ? (
          <Button type="button" variant="ghost" onClick={vaciar}>
            {copy.vaciarVilla}
          </Button>
        ) : null}
      </fieldset>

      {/* ── Wi-Fi ──────────────────────────────────────────────────── */}
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="p-0 text-eyebrow text-muted">{copy.wifiTitulo}</legend>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.wifiCuerpo}</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Input
            label={copy.wifiSsidLabel}
            value={ssid.valor}
            onChange={(e) => ssid.setValor(e.target.value)}
          />
          <Input
            label={copy.wifiClaveLabel}
            value={claveWifi.valor}
            onChange={(e) => claveWifi.setValor(e.target.value)}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={siempre}
            onChange={(e) => setSiempre(e.target.checked)}
            className="mt-1"
          />
          <span>
            {copy.wifiSiempreLabel}
            <span className="block text-[13px] text-muted">{copy.wifiSiempreAyuda}</span>
          </span>
        </label>
      </fieldset>

      {/* ── La foto ────────────────────────────────────────────────── */}
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="p-0 text-eyebrow text-muted">{copy.fotoTitulo}</legend>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{copy.fotoCuerpo}</p>

        {villa.foto ? (
          <img
            src={urlDeFoto(villa.foto)}
            alt=""
            className="aspect-video w-full max-w-md rounded-card object-cover"
          />
        ) : (
          <p className="m-0 text-[13px] text-muted-soft">{copy.fotoPorDefecto}</p>
        )}

        <input
          ref={archivo}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) subir.mutate({ id: villa.id, archivo: f });
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={subir.isPending}
            onClick={() => archivo.current?.click()}
          >
            {subir.isPending ? copy.fotoSubiendo : copy.fotoElegir}
          </Button>
          {subir.isError ? (
            <span role="alert" className="text-[13px] text-on-alert">
              {copy.fotoError}
            </span>
          ) : null}
        </div>

        <p className="m-0 text-eyebrow text-muted">{copy.relojTitulo}</p>
        <p className="m-0 text-[13px] text-muted">{copy.relojCuerpo}</p>
        <div className="flex flex-wrap gap-2">
          {(['izquierda', 'centro', 'derecha'] as const).map((donde) => (
            <Button
              key={donde}
              type="button"
              variant={reloj === donde ? 'primary' : 'outline'}
              onClick={() => setReloj(donde)}
            >
              {donde === 'izquierda'
                ? copy.relojIzquierda
                : donde === 'centro'
                  ? copy.relojCentro
                  : copy.relojDerecha}
            </Button>
          ))}
        </div>
      </fieldset>

      {/* ── Los textos ─────────────────────────────────────────────── */}
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="p-0 text-eyebrow text-muted">{copy.textosTitulo}</legend>
        <Textarea
          label={copy.bienvenidaLabel}
          rows={3}
          value={bienvenida.valor}
          onChange={(e) => bienvenida.setValor(e.target.value)}
        />
        <p className="m-0 text-[13px] text-muted">{copy.bienvenidaAyuda}</p>
        <Input
          label={copy.notaTituloLabel}
          value={notaTitulo.valor}
          onChange={(e) => notaTitulo.setValor(e.target.value)}
        />
        <Textarea
          label={copy.notaTextoLabel}
          rows={3}
          value={notaTexto.valor}
          onChange={(e) => notaTexto.setValor(e.target.value)}
        />
        <p className="m-0 text-[13px] text-muted">{copy.notaAyuda}</p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? copy.guardando : copy.guardar}
        </Button>
        {guardar.isSuccess ? (
          <span role="status" className="text-[13px] text-muted">
            {copy.guardado}
          </span>
        ) : null}
        {guardar.isError ? (
          <span role="alert" className="text-[13px] text-on-alert">
            {copy.errorGuardar}
          </span>
        ) : null}
      </div>
    </form>
  );
}
