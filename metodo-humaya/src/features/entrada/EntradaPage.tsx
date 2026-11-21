import { useEffect, useState, type FormEvent } from 'react';
import { LogoDelHotel } from '@/components/LogoDelHotel';
import { Button, Input } from '@/components/ui';
import { useCheckReservation } from '@/hooks';
import { miEstadia, olvidarEstadia, recordarEstadia } from '@/services/miEstadia';
import { entradaCopy, type Idioma } from './copy';

const LLAVE_IDIOMA = 'humaya.entrada.idioma';

/** Se recuerda la elección, pero NO se adivina el idioma del navegador: un
 *  tico mirando el sitio en inglés es menos confuso que un alemán al que le
 *  sale todo en español porque su teléfono está en «es» por otra razón.
 *  Inglés por defecto; el botón está arriba y a la vista. */
function idiomaGuardado(): Idioma {
  try {
    return localStorage.getItem(LLAVE_IDIOMA) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

/** Las fechas vienen ISO de Cloudbeds. Se formatean según el idioma elegido,
 *  en UTC: una fecha de llegada no tiene hora, y dejar que el navegador la
 *  interprete en su zona la corre un día para medio mundo. */
function fecha(iso: string | null | undefined, idioma: Idioma) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(idioma === 'es' ? 'es-CR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/**
 * El huésped llega acá por el enlace corto del hotel: por correo, por el chat
 * de Airbnb, por un QR en la villa o porque recepción se lo dictó.
 *
 * Pide CÓDIGO (o correo) y APELLIDO. El código solo sería una contraseña de un
 * factor para ver el nombre y las fechas de otra persona; pidiendo los dos hay
 * que saber dos cosas de la misma reserva.
 *
 * No hay estadía todavía —esta es la pantalla que la encuentra—, así que vive
 * fuera de /app y no usa StayProvider ni i18n.
 */
/**
 * El código que viene en el enlace, si viene.
 *
 * Los tres correos al huésped llevan un botón a `/entrada?c=HMJW3AJKN5`. Sin
 * esto, ese botón abría un formulario vacío y el huésped tenía que copiar el
 * código a mano — justo lo contrario de lo que el correo le promete («toma
 * diez segundos»). Un botón que se sabe que va a rebotar es peor que no
 * ofrecerlo.
 *
 * Se lee una sola vez, al montar: después manda lo que la persona escriba.
 */
function codigoDelEnlace(): string {
  try {
    return new URLSearchParams(window.location.search).get('c')?.trim().slice(0, 40) ?? '';
  } catch {
    return '';
  }
}

/**
 * La llave de estadía que venía en el QR del televisor, si venía.
 *
 * ── POR QUÉ NO SE LE PIDE NADA AL HUÉSPED ─────────────────────────
 * Tony, 21 de noviembre de 2026: «si ya la villa está ocupada y tienen los
 * datos de la reservación, ¿no es mejor que automáticamente, cuando le hace
 * QR, ya venga con los datos precargados?». El QR está dentro de la villa,
 * en la pantalla: el código de Airbnb no agrega nada que la villa no diga.
 *
 * No es una sesión ni una contraseña: es una afirmación firmada que el
 * servidor vuelve a comprobar contra las reservas. Si la estadía terminó o
 * la foto del televisor es de otro huésped, no abre. Ver
 * `supabase/functions/humaya-entrada/llave.ts`.
 */
function llaveDelEnlace(): string {
  try {
    return new URLSearchParams(window.location.search).get('s')?.trim().slice(0, 200) ?? '';
  } catch {
    return '';
  }
}

export function EntradaPage() {
  const [idioma, setIdioma] = useState<Idioma>(idiomaGuardado);
  const [codigo, setCodigo] = useState(codigoDelEnlace);
  const [apellido, setApellido] = useState('');
  const [tocado, setTocado] = useState(false);
  // Lo que este telefono ya encontro antes. El QR vive pegado en la pantalla
  // de la villa: el huesped lo abre mas de una vez, y hasta hoy cada vez
  // tenia que volver a buscar su codigo de Airbnb.
  const [guardada, setGuardada] = useState(miEstadia);
  const [llave] = useState(llaveDelEnlace);
  const check = useCheckReservation();

  // Si lo ultimo que se pregunto fue con la llave del QR. Sale de la
  // pregunta, no de un estado aparte: despues de que la llave rebota el
  // huesped escribe su codigo en el mismo formulario, y lo que la pantalla
  // tiene que decirle entonces ya no es «ese enlace no abre».
  const conLlave = check.variables !== undefined && 'llave' in check.variables;
  const llaveNoAbrio = conLlave && check.data !== undefined && !check.data.found;

  // Se abre sola, una sola vez por visita.
  //
  // `abrir` es `check.mutate`, que React Query mantiene estable. Si en su
  // lugar la dependencia fuera `check`, el efecto se volveria a disparar en
  // cada cambio de estado de la mutacion y la pantalla pediria la llave en
  // bucle: probado a proposito, 25.087 veces en diez segundos. El techo por
  // IP de la funcion leeria al huesped como alguien probando a ciegas y lo
  // dejaria afuera. Tiene prueba propia.
  const abrir = check.mutate;
  useEffect(() => {
    if (!llave) return;
    abrir({ llave });
  }, [llave, abrir]);

  // Encontrada una vez, no se vuelve a preguntar. No es una sesion con
  // permisos: es su nombre y sus fechas, que el ya vio en esta pantalla.
  const encontrada = check.data;
  useEffect(() => {
    if (encontrada?.found && encontrada.reserva) {
      recordarEstadia({
        reserva: encontrada.reserva,
        guestName: encontrada.guestName ?? null,
        checkin: encontrada.checkin ?? null,
        checkout: encontrada.checkout ?? null,
      });
    }
  }, [encontrada]);
  const copy = entradaCopy[idioma];

  useEffect(() => {
    document.documentElement.lang = idioma;
    try {
      localStorage.setItem(LLAVE_IDIOMA, idioma);
    } catch {
      /* en modo privado no se puede guardar; no es motivo para romper nada */
    }
  }, [idioma]);

  const sinCodigo = tocado && codigo.trim().length < 4;
  const sinApellido = tocado && apellido.trim().length < 2;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTocado(true);
    if (codigo.trim().length < 4 || apellido.trim().length < 2 || check.isPending) return;
    check.mutate({ codigo: codigo.trim(), apellido: apellido.trim() });
  }

  function deNuevo() {
    check.reset();
    setCodigo('');
    setApellido('');
    setTocado(false);
  }

  return (
    <main
      data-theme="guest"
      className="flex min-h-dvh flex-col items-center bg-bg px-5 py-6 text-text"
    >
      <div className="flex w-full max-w-md justify-end">
        <button
          type="button"
          onClick={() => setIdioma(idioma === 'en' ? 'es' : 'en')}
          className="min-h-11 rounded-pill px-3 text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
        >
          {copy.cambiarIdioma}
        </button>
      </div>

      <section className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-7 text-center">
        <LogoDelHotel className="w-40 max-w-full" />

        <div aria-live="polite" className="flex w-full flex-col items-center gap-7">
          {conLlave && check.isPending ? (
            /* Entrando con la llave del QR: no se le pone un formulario
               delante para quitarselo medio segundo despues. */
            <div className="flex flex-col items-center gap-3">
              <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
              <p className="m-0 text-base text-muted">{copy.conLlaveBuscando}</p>
            </div>
          ) : check.data?.found ? (
            /*
              El huesped que se identifica NO puede quedar en una pantalla sin
              salida. Hasta el 20 de noviembre de 2026 esto terminaba en las
              fechas: ni un boton, ni un enlace. Se identificaba, leia «vamos
              a dejarte los dias listos» y ahi se acababa todo.

              Todavia no hay a donde mandarlo —/app es la demo, con los datos
              de otra persona—, asi que lo que se le da es lo unico cierto:
              que su reserva esta, y por donde escribir. Los mismos contactos
              que ya tenia el camino de «no la encontramos».
            */
            <div className="flex flex-col items-center gap-3">
              <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
              <h1 className="m-0 font-display text-3xl font-medium">
                {copy.foundTitle(check.data.guestName ?? '')}
              </h1>
              {check.data.checkin ? (
                <p className="m-0 text-sm text-gold">
                  {copy.fechas(
                    fecha(check.data.checkin, idioma),
                    fecha(check.data.checkout, idioma),
                  )}
                </p>
              ) : null}
              <p className="m-0 text-base leading-relaxed text-muted">{copy.foundBody}</p>

              <div className="mt-2 flex flex-col items-center gap-1 text-sm">
                <p className="m-0 text-muted">{copy.foundContacto}</p>
                <a href={`mailto:${copy.contactEmail}`} className="text-gold">
                  {copy.contactEmail}
                </a>
                <a href={copy.whatsappHref} className="text-gold">
                  {copy.contactWhatsapp}
                </a>
              </div>
            </div>
          ) : guardada && !check.data ? (
            /*
              Este telefono ya encontro esta estadia. No se le vuelve a pedir
              el codigo: el QR vive pegado en la pantalla de la villa y el
              huesped lo abre mas de una vez.

              No es una sesion con permisos —no abre ninguna puerta—: es su
              nombre y sus fechas, que el mismo ya vio aca. Por eso vive en su
              telefono y se olvida sola dos dias despues de la salida.
            */
            <div className="flex flex-col items-center gap-3">
              <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
              <h1 className="m-0 font-display text-3xl font-medium">
                {copy.volvisteTitle(guardada.guestName ?? '')}
              </h1>
              {guardada.checkin ? (
                <p className="m-0 text-sm text-gold">
                  {copy.fechas(fecha(guardada.checkin, idioma), fecha(guardada.checkout, idioma))}
                </p>
              ) : null}
              <p className="m-0 text-base leading-relaxed text-muted">{copy.volvisteBody}</p>

              <div className="mt-2 flex flex-col items-center gap-1 text-sm">
                <p className="m-0 text-muted">{copy.foundContacto}</p>
                <a href={`mailto:${copy.contactEmail}`} className="text-gold">
                  {copy.contactEmail}
                </a>
                <a href={copy.whatsappHref} className="text-gold">
                  {copy.contactWhatsapp}
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  olvidarEstadia();
                  setGuardada(null);
                }}
                className="mt-2 text-[13px] text-muted underline"
              >
                {copy.noSoyYo}
              </button>
            </div>
          ) : check.data && !check.data.found && !llaveNoAbrio ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
              <h1 className="m-0 font-display text-3xl font-medium">{copy.notFoundTitle}</h1>
              <p className="m-0 text-base leading-relaxed text-muted">{copy.notFoundBody}</p>
              <div className="flex flex-col items-center gap-1 text-sm">
                <a href={`mailto:${copy.contactEmail}`} className="text-gold">
                  {copy.contactEmail}
                </a>
                <a href={copy.whatsappHref} className="text-gold">
                  {copy.contactWhatsapp}
                </a>
              </div>
              <Button variant="outline" onClick={deNuevo}>
                {copy.tryAgain}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
                <h1 className="m-0 font-display text-4xl leading-none font-medium">{copy.title}</h1>
                <p className="m-0 text-base leading-relaxed text-muted">
                  {llaveNoAbrio ? copy.llaveVencida : copy.description}
                </p>
              </div>

              <form className="flex w-full flex-col gap-4" onSubmit={submit} noValidate>
                <div className="flex flex-col gap-1 text-left">
                  <Input
                    label={copy.codigoLabel}
                    autoComplete="off"
                    autoCapitalize="characters"
                    placeholder={copy.codigoPlaceholder}
                    value={codigo}
                    onChange={(event) => setCodigo(event.target.value)}
                    onBlur={() => setTocado(true)}
                    error={sinCodigo ? copy.faltaCodigo : undefined}
                  />
                  <p className="m-0 text-sm leading-relaxed text-muted">{copy.codigoHelp}</p>
                </div>

                <Input
                  label={copy.apellidoLabel}
                  autoComplete="family-name"
                  placeholder={copy.apellidoPlaceholder}
                  value={apellido}
                  onChange={(event) => setApellido(event.target.value)}
                  onBlur={() => setTocado(true)}
                  error={sinApellido ? copy.faltaApellido : undefined}
                />

                {check.isError ? (
                  <p role="alert" className="m-0 text-sm text-on-alert">
                    {copy.error}
                  </p>
                ) : null}

                <Button type="submit" size="lg" disabled={check.isPending}>
                  {check.isPending ? copy.submitting : copy.submit}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Qué es esto, dicho al huésped. El manual del equipo lo llama
            Servicio 3.0: «anticipar y conectar… reducir fricciones», con una
            regla que manda sobre cualquier pantalla — «la tecnología prepara
            al equipo; la persona entrega el servicio». Por eso lo último que
            se lee no es lo que hace la app, sino que del otro lado hay
            alguien. Y por eso se nombra: HUMAYA Experience. */}
        <div className="mt-2 flex flex-col items-center gap-1.5 border-t border-line-soft pt-6 text-center">
          <span className="text-eyebrow text-gold">{copy.queEsTitulo}</span>
          <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">
            {copy.queEsCuerpo}
          </p>
          <p className="m-0 text-[13px] font-medium text-text">{copy.queEsPersona}</p>
        </div>
      </section>
    </main>
  );
}
