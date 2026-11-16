import { useEffect, useState, type FormEvent } from 'react';
import { HumayaLogo } from '@/components/HumayaLogo';
import { Button, Input } from '@/components/ui';
import { useCheckReservation } from '@/hooks';
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
export function EntradaPage() {
  const [idioma, setIdioma] = useState<Idioma>(idiomaGuardado);
  const [codigo, setCodigo] = useState('');
  const [apellido, setApellido] = useState('');
  const [tocado, setTocado] = useState(false);
  const check = useCheckReservation();
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
        <HumayaLogo className="w-40 max-w-full" />

        <div aria-live="polite" className="flex w-full flex-col items-center gap-7">
          {check.data?.found ? (
            <div className="flex flex-col items-center gap-3">
              <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
              <h1 className="m-0 font-display text-3xl font-medium">
                {copy.foundTitle(check.data.guestName ?? '')}
              </h1>
              <p className="m-0 text-base leading-relaxed text-muted">{copy.foundBody}</p>
              {check.data.checkin ? (
                <p className="m-0 text-sm text-gold">
                  {copy.fechas(
                    fecha(check.data.checkin, idioma),
                    fecha(check.data.checkout, idioma),
                  )}
                </p>
              ) : null}
            </div>
          ) : check.data && !check.data.found ? (
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
                <p className="m-0 text-base leading-relaxed text-muted">{copy.description}</p>
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
      </section>
    </main>
  );
}
