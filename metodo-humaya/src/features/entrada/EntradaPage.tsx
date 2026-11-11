import { useState, type FormEvent } from 'react';
import { HumayaLogo } from '@/components/HumayaLogo';
import { Button, Input } from '@/components/ui';
import { useCheckReservation } from '@/hooks';
import { entradaCopy as copy } from './copy';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * El link que Cloudbeds manda al huésped apenas reserva apunta acá. No hay
 * estadía todavía (nadie eligió nada), así que vive fuera de /app y no usa
 * StayProvider. Si encuentra la reserva, por ahora solo confirma: el resto
 * del MVP sigue siendo datos de ejemplo, así que no lo mete a la app con
 * contenido de otro huésped.
 */
export function EntradaPage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const check = useCheckReservation();

  const invalid = touched && !EMAIL_RE.test(email.trim());

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    const clean = email.trim();
    if (!EMAIL_RE.test(clean) || check.isPending) return;
    check.mutate(clean);
  }

  function tryAgain() {
    check.reset();
    setEmail('');
    setTouched(false);
  }

  return (
    <main
      data-theme="guest"
      className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10 text-text"
    >
      <section className="flex w-full max-w-md flex-col items-center gap-7 text-center">
        <HumayaLogo className="w-40 max-w-full" />

        <div aria-live="polite" className="flex w-full flex-col items-center gap-7">
          {check.data?.found ? (
            <div className="flex flex-col items-center gap-3">
              <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
              <h1 className="m-0 font-display text-3xl font-medium">
                {copy.foundTitle(check.data.guestName ?? '')}
              </h1>
              <p className="m-0 text-base leading-relaxed text-muted">{copy.foundBody}</p>
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
              <Button variant="outline" onClick={tryAgain}>
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

              <form className="flex w-full flex-col gap-3" onSubmit={submit} noValidate>
                <Input
                  label={copy.emailLabel}
                  type="email"
                  autoComplete="email"
                  placeholder={copy.emailPlaceholder}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setTouched(true)}
                  error={invalid ? copy.invalidEmail : undefined}
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
