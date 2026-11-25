import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LogoDelHotel } from '@/components/LogoDelHotel';
import { Button, Input } from '@/components/ui';
import { useIdiomaElegido } from '@/hooks/useIdiomaElegido';
import { aplicarHotel, negocioActual } from '@/marca';
import type { Hotel } from '@/services/hotel';
import {
  cualAbrir,
  hotelDeLaDireccion,
  misHoteles,
  olvidarHotel,
  recordarHotel,
  hotelRecordado,
} from '@/services/misHoteles';
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

type Estado =
  | { fase: 'revisando' }
  | { fase: 'fuera' }
  | { fase: 'buscandoHoteles'; persona: Persona }
  | { fase: 'elegirHotel'; persona: Persona; hoteles: Hotel[] }
  | { fase: 'sinHotel'; persona: Persona }
  | { fase: 'hotelesFallaron'; persona: Persona }
  | { fase: 'adentro'; persona: Persona; varios: boolean };

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
      <LogoDelHotel variant="mark" className="w-14" />
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

/** Un aviso con título, cuerpo y un botón. Sirve a tres de las fases. */
function Aviso({
  copy,
  onIdioma,
  titulo,
  cuerpo,
  pista,
  boton,
  onBoton,
}: {
  copy: PuertaTextos;
  onIdioma: () => void;
  titulo: string;
  cuerpo: string;
  pista?: string;
  boton: string;
  onBoton: () => void;
}) {
  return (
    <Marco>
      <BotonIdioma copy={copy} onClick={onIdioma} />
      <Encabezado copy={copy} />
      <div className="flex flex-col gap-3 text-center">
        <h1 className="m-0 text-[22px] text-text">{titulo}</h1>
        <p className="m-0 text-[14px] text-muted">{cuerpo}</p>
        {pista ? <p className="m-0 text-[13px] text-muted-soft">{pista}</p> : null}
      </div>
      <Button variant="outline" onClick={onBoton}>
        {boton}
      </Button>
    </Marco>
  );
}

/**
 * En qué hotel está esta persona.
 *
 * Solo aparece cuando la cuenta trabaja en más de uno: con uno solo se abre
 * sin preguntar, porque preguntar algo que tiene una sola respuesta es un
 * trámite, no una elección.
 */
function ElegirHotel({
  copy,
  hoteles,
  onIdioma,
  onElegir,
  onSalir,
}: {
  copy: PuertaTextos;
  hoteles: Hotel[];
  onIdioma: () => void;
  onElegir: (hotel: Hotel) => void;
  onSalir: () => void;
}) {
  return (
    <Marco>
      <BotonIdioma copy={copy} onClick={onIdioma} />
      <Encabezado copy={copy} />
      <div className="flex flex-col gap-2 text-center">
        <h1 className="m-0 text-[22px] text-text">{copy.elegirHotelTitle}</h1>
        <p className="m-0 text-[14px] text-muted">{copy.elegirHotelBody}</p>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {hoteles.map((hotel) => (
          <li key={hotel.negocioId}>
            <button
              type="button"
              onClick={() => onElegir(hotel)}
              className="flex min-h-12 w-full items-center justify-between rounded-xl border border-line-strong px-4 text-left text-[15px] text-text transition-colors hover:border-text"
            >
              <span>{hotel.marcaHotel || hotel.codigo}</span>
              <span className="text-[13px] text-muted-soft">{hotel.codigo}</span>
            </button>
          </li>
        ))}
      </ul>
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
 *
 * ── Y DE QUÉ HOTEL ES ESTA PANTALLA ─────────────────────────────────────
 * En el dominio del huésped lo dice la ruta. Acá no: `hotelexp.liderax10.com`
 * es la misma dirección para todos los hoteles, así que lo dice la cuenta.
 *
 * Eso estaba anunciado en `hotel.ts` y nunca escrito. Comprobado entrando el
 * 24 de noviembre de 2026: TODA la recepción del dominio compartido mostraba
 * «No pudimos cargar esta pantalla · Puede ser un problema de conexión»,
 * porque `elNegocio()` lanzaba `sin_hotel_resuelto` antes de pedir nada.
 */
export function Puerta({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useIdiomaElegido(LLAVE_IDIOMA);
  const copy = puertaCopy[idioma];
  const [estado, setEstado] = useState<Estado>({ fase: 'revisando' });

  /**
   * Con el hotel ya resuelto por el dominio no hay nada que preguntar; sin
   * él hay que buscarlo en la cuenta.
   */
  const resolverElHotel = useCallback(async (persona: Persona) => {
    if (negocioActual()) {
      setEstado({ fase: 'adentro', persona, varios: false });
      return;
    }
    setEstado({ fase: 'buscandoHoteles', persona });
    let hoteles: Hotel[];
    try {
      hoteles = await misHoteles();
    } catch {
      setEstado({ fase: 'hotelesFallaron', persona });
      return;
    }
    if (hoteles.length === 0) {
      setEstado({ fase: 'sinHotel', persona });
      return;
    }
    // La dirección manda sobre lo recordado: quien abre
    // `/staff/inicio?hotel=bikeandbed` quiere ESE hotel, no el de la vez
    // pasada. Un código que esta cuenta no puede ver no abre nada: `cualAbrir`
    // busca dentro de la lista que dio la base.
    const elegido = cualAbrir(hoteles, hotelDeLaDireccion() ?? hotelRecordado());
    if (!elegido) {
      setEstado({ fase: 'elegirHotel', persona, hoteles });
      return;
    }
    aplicarHotel(elegido);
    recordarHotel(elegido.codigo);
    setEstado({ fase: 'adentro', persona, varios: hoteles.length > 1 });
  }, []);

  const revisar = useCallback(async () => {
    try {
      const persona = await quienSoy();
      if (!persona) {
        setEstado({ fase: 'fuera' });
        return;
      }
      // Sin rol no se pregunta por hoteles: no hay nada que pueda ver.
      if (!persona.entra) {
        setEstado({ fase: 'adentro', persona, varios: false });
        return;
      }
      await resolverElHotel(persona);
    } catch {
      // Si no se puede preguntar, se queda afuera. Falla cerrado.
      setEstado({ fase: 'fuera' });
    }
  }, [resolverElHotel]);

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

  /** Volver a preguntar en cuál hotel está. Lo ofrece el menú de recepción. */
  const cambiarHotel = useCallback(() => {
    olvidarHotel();
    aplicarHotel(null);
    setEstado({ fase: 'revisando' });
    void revisar();
  }, [revisar]);

  if (estado.fase === 'revisando' || estado.fase === 'buscandoHoteles') {
    return (
      <Marco>
        <p aria-live="polite" className="m-0 text-center text-[14px] text-muted">
          {estado.fase === 'buscandoHoteles' ? copy.buscandoHoteles : copy.revisando}
        </p>
      </Marco>
    );
  }

  if (estado.fase === 'fuera') {
    return <Formulario copy={copy} onIdioma={cambiarIdioma} onEntro={revisar} />;
  }

  if (estado.fase === 'elegirHotel') {
    return (
      <ElegirHotel
        copy={copy}
        hoteles={estado.hoteles}
        onIdioma={cambiarIdioma}
        onElegir={(hotel) => {
          aplicarHotel(hotel);
          recordarHotel(hotel.codigo);
          setEstado({ fase: 'adentro', persona: estado.persona, varios: true });
        }}
        onSalir={() => void salir()}
      />
    );
  }

  if (estado.fase === 'sinHotel') {
    return (
      <Aviso
        copy={copy}
        onIdioma={cambiarIdioma}
        titulo={copy.sinHotelTitle}
        cuerpo={copy.sinHotelBody(estado.persona.correo)}
        pista={copy.sinHotelHint}
        boton={copy.salir}
        onBoton={() => void salir()}
      />
    );
  }

  if (estado.fase === 'hotelesFallaron') {
    return (
      <Aviso
        copy={copy}
        onIdioma={cambiarIdioma}
        titulo={copy.hotelesFallaronTitle}
        cuerpo={copy.hotelesFallaronBody}
        boton={copy.reintentar}
        onBoton={() => void revisar()}
      />
    );
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
    <PuertaContexto.Provider
      value={{
        persona: estado.persona,
        idioma,
        cambiarIdioma,
        cambiarHotel: estado.varios ? cambiarHotel : null,
      }}
    >
      {children}
    </PuertaContexto.Provider>
  );
}
