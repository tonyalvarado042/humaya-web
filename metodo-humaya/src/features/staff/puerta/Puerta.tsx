import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { HumayaLogo } from '@/components/HumayaLogo';
import { Button, Input } from '@/components/ui';
import { useIdiomaElegido } from '@/hooks/useIdiomaElegido';
import {
  alCambiar,
  entrar,
  ErrorDeEntrada,
  quienSoy,
  salir,
  type FalloDeEntrada,
  type Persona,
} from '@/services/sesion';
import { puertaCopy, type PuertaTextos } from './copy';
import { PuertaContexto } from './contexto';

const LLAVE_IDIOMA = 'humaya.recepcion.idioma';

type Estado = { fase: 'revisando' } | { fase: 'fuera' } | { fase: 'adentro'; persona: Persona };

function mensajeDe(motivo: FalloDeEntrada, copy: PuertaTextos): string {
  switch (motivo) {
    case 'sin_confirmar':
      return copy.errorSinConfirmar;
    case 'muchos_intentos':
      return copy.errorMuchosIntentos;
    case 'red':
      return copy.errorRed;
    default:
      return copy.errorCredenciales;
  }
}

/** El botón de idioma, igual que en /entrada: dice a dónde lleva. */
function BotonIdioma({ copy, onClick }: { copy: PuertaTextos; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-end rounded-pill border border-line-strong px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-text"
    >
      {copy.cambiarIdioma}
    </button>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return (
    <div data-theme="staff" className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div className="flex w-full max-w-100 flex-col gap-6">{children}</div>
    </div>
  );
}

function Encabezado({ copy }: { copy: PuertaTextos }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* El símbolo dorado, no el wordmark: el wordmark es blanco y el fondo de
          recepción es crema (rgb(244,240,232)). Blanco sobre crema no se ve.
          Comprobado en pantalla, no supuesto. */}
      <HumayaLogo variant="mark" className="w-14" />
      <span className="text-[12px] tracking-[0.18em] text-muted uppercase">{copy.area}</span>
    </div>
  );
}

interface FormProps {
  copy: PuertaTextos;
  onIdioma: () => void;
  onEntro: () => void;
}

function Formulario({ copy, onIdioma, onEntro }: FormProps) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [errorClave, setErrorClave] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    const faltaCorreo = !correo.trim();
    const faltaClave = !clave;
    setErrorCorreo(faltaCorreo ? copy.faltaCorreo : null);
    setErrorClave(faltaClave ? copy.faltaClave : null);
    if (faltaCorreo || faltaClave) return;

    setEnviando(true);
    try {
      await entrar(correo, clave);
      onEntro();
    } catch (fallo) {
      setError(
        fallo instanceof ErrorDeEntrada ? mensajeDe(fallo.motivo, copy) : mensajeDe('red', copy),
      );
      setEnviando(false);
    }
  }

  return (
    <Marco>
      <BotonIdioma copy={copy} onClick={onIdioma} />
      <Encabezado copy={copy} />
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <h1 className="m-0 text-center text-[22px] text-text">{copy.title}</h1>
        <p className="m-0 text-center text-[14px] text-muted">{copy.description}</p>
        <Input
          label={copy.correoLabel}
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder={copy.correoPlaceholder}
          value={correo}
          error={errorCorreo ?? undefined}
          onChange={(evento) => setCorreo(evento.target.value)}
        />
        <Input
          label={copy.claveLabel}
          type="password"
          autoComplete="current-password"
          placeholder={copy.clavePlaceholder}
          value={clave}
          error={errorClave ?? undefined}
          onChange={(evento) => setClave(evento.target.value)}
        />
        {error ? (
          <p role="alert" className="m-0 text-[13px] text-on-alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={enviando}>
          {enviando ? copy.submitting : copy.submit}
        </Button>
      </form>
    </Marco>
  );
}

/** Entró, pero el CRM todavía no le dio rol. No se adivina nada: se explica. */
function SinAcceso({
  copy,
  persona,
  onIdioma,
  onSalir,
}: {
  copy: PuertaTextos;
  persona: Persona;
  onIdioma: () => void;
  onSalir: () => void;
}) {
  return (
    <Marco>
      <BotonIdioma copy={copy} onClick={onIdioma} />
      <Encabezado copy={copy} />
      <div className="flex flex-col gap-3 text-center">
        <h1 className="m-0 text-[22px] text-text">{copy.sinRolTitle}</h1>
        <p className="m-0 text-[14px] text-muted">{copy.sinRolBody(persona.correo)}</p>
        <p className="m-0 text-[13px] text-muted-soft">{copy.sinRolHint}</p>
      </div>
      <Button variant="outline" onClick={onSalir}>
        {copy.salir}
      </Button>
    </Marco>
  );
}

/**
 * La puerta de /staff.
 *
 * Hasta hoy recepción estaba abierta: experience.stayhumaya.com/staff
 * respondía 200 a cualquiera. El cuarto estaba vacío —la bandeja solo conocía
 * las dos estadías de demo—, pero las pantallas que siguen traen 48 reservas
 * reales con nombres y correos. Esto va antes que esos datos, no después.
 */
export function Puerta({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useIdiomaElegido(LLAVE_IDIOMA);
  const copy = puertaCopy[idioma];
  const [estado, setEstado] = useState<Estado>({ fase: 'revisando' });

  const revisar = useCallback(async () => {
    try {
      const persona = await quienSoy();
      setEstado(persona ? { fase: 'adentro', persona } : { fase: 'fuera' });
    } catch {
      // Si no se puede preguntar, se queda afuera. Falla cerrado.
      setEstado({ fase: 'fuera' });
    }
  }, []);

  useEffect(() => {
    let vivo = true;
    let cortar: (() => void) | undefined;

    // El linter ve que `revisar` llama setState y lo marca como cascada de
    // renders. No lo es: `revisar` es async y el setState ocurre despues del
    // await de `quienSoy()`, ya fuera del cuerpo del efecto. Y tiene que
    // dispararse al montar, porque es la pregunta "hay sesion?" que decide si
    // esta pantalla existe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void revisar();
    void alCambiar(() => {
      if (vivo) void revisar();
    }).then((fn) => {
      if (vivo) cortar = fn;
      else fn();
    });

    return () => {
      vivo = false;
      cortar?.();
    };
  }, [revisar]);

  const cambiarIdioma = () => setIdioma(idioma === 'en' ? 'es' : 'en');

  if (estado.fase === 'revisando') {
    return (
      <Marco>
        <p aria-live="polite" className="m-0 text-center text-[14px] text-muted">
          {copy.revisando}
        </p>
      </Marco>
    );
  }

  if (estado.fase === 'fuera') {
    return <Formulario copy={copy} onIdioma={cambiarIdioma} onEntro={revisar} />;
  }

  if (!estado.persona.entra) {
    return (
      <SinAcceso
        copy={copy}
        persona={estado.persona}
        onIdioma={cambiarIdioma}
        onSalir={() => void salir()}
      />
    );
  }

  return (
    <PuertaContexto.Provider value={{ persona: estado.persona, idioma, cambiarIdioma }}>
      {children}
    </PuertaContexto.Provider>
  );
}
