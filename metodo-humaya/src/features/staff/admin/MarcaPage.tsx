import { useState, type FormEvent } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useGuardarMarca, useMarcaDelHotel } from '@/hooks';
import { aplicarTemaNuevo } from '@/marca';
import { textoQueSeLee } from '@/services/contraste';
import { type Tema } from '@/services/tema';
import { ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useEsAdministrador } from '../puerta/contexto';
import { CampoDeColor } from './CampoDeColor';
import { marcaCopy as copy } from './copyMarca';

/**
 * La marca de este hotel: nombres, colores y letras.
 *
 * ── POR QUÉ ESTA PANTALLA EXISTE ────────────────────────────────────────
 * Tony, 20 de noviembre de 2026: «todos debe ser configurables colores font y
 * etiquetas en admin». Hasta hoy la marca eran variables de entorno fijadas
 * al compilar y una paleta escrita en `tokens.css`: un hotel nuevo salía
 * dorado, y «cambiar el color» era un despliegue.
 *
 * ── POR QUÉ SE MIDE EL CONTRASTE ────────────────────────────────────────
 * Porque el error más fácil de cometer acá es elegir un color bonito que no
 * se lee, y no enterarse hasta que un huésped no encuentra el botón. Cada
 * campo de acento dice su razón de contraste contra el fondo donde se va a
 * usar DE VERDAD —leído del navegador, no supuesto— y si no llega, lo dice.
 *
 * ── POR QUÉ EL TEMA VIAJA COMPLETO AL GUARDAR ───────────────────────────
 * `tema` es una sola columna `jsonb`: mandar la mitad borraría la otra mitad.
 * Este formulario lo leyó entero al abrir y lo manda entero.
 */
export function MarcaPage() {
  const marca = useMarcaDelHotel();
  const guardar = useGuardarMarca();
  const esAdmin = useEsAdministrador();

  if (marca.isPending) return <ScreenLoading label={copy.titulo} />;
  if (marca.isError || !marca.data) {
    return <ScreenError title={copy.noCargo} onRetry={() => void marca.refetch()} />;
  }

  return (
    <Formulario
      // `key` para que el formulario vuelva a nacer con lo guardado cuando el
      // servidor devuelve datos nuevos. Sin esto, el estado inicial se fija en
      // el primer render y la pantalla seguiría mostrando lo viejo.
      key={JSON.stringify(marca.data)}
      inicial={marca.data}
      esAdmin={esAdmin}
      guardando={guardar.isPending}
      fallo={guardar.isError}
      guardado={guardar.isSuccess}
      onGuardar={(cambios) => guardar.mutate(cambios)}
      onProbar={(tema) => aplicarTemaNuevo(tema)}
    />
  );
}

interface Inicial {
  marcaExperiencia: string;
  marcaHotel: string;
  correo: string;
  tema: Tema | null;
}

interface FormularioProps {
  inicial: Inicial;
  esAdmin: boolean;
  guardando: boolean;
  fallo: boolean;
  guardado: boolean;
  onGuardar: (cambios: Inicial) => void;
  onProbar: (tema: Tema | null) => void;
}

/**
 * El fondo real contra el que se va a leer un color, leído del navegador.
 *
 * ── POR QUÉ NO ESTÁ ESCRITO EL HEX ACÁ ──────────────────────────────────
 * Porque ARCHITECTURE.md dice que ningún color hex vive fuera de
 * `tokens.css`, y porque un hex copiado acá mentiría en el momento en que
 * este mismo hotel cambie su fondo: mediría contra el negro de Humaya y no
 * contra el suyo.
 *
 * Devuelve null cuando no hay hoja de estilos cargada —los tests— y entonces
 * no se muestra ninguna medición. Es correcto: la cuenta se prueba aparte, en
 * `contraste.test.ts`.
 */
function fondoReal(lado: 'guest' | 'staff', variable: '--bg' | '--surface'): string | null {
  if (typeof document === 'undefined') return null;
  const caja = document.createElement('div');
  caja.setAttribute('data-theme', lado);
  caja.style.display = 'none';
  document.body.appendChild(caja);
  const valor = getComputedStyle(caja).getPropertyValue(variable).trim();
  caja.remove();
  return /^#[0-9a-fA-F]{6}$/.test(valor) ? valor : null;
}

const FUENTES_SUGERIDAS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Libre Baskerville',
  'Lora',
  'Inter',
  'Jost',
  'Work Sans',
  'Figtree',
];

function Formulario({
  inicial,
  esAdmin,
  guardando,
  fallo,
  guardado,
  onGuardar,
  onProbar,
}: FormularioProps) {
  const [experiencia, setExperiencia] = useState(inicial.marcaExperiencia);
  const [hotel, setHotel] = useState(inicial.marcaHotel);
  const [correo, setCorreo] = useState(inicial.correo);
  const [tema, setTema] = useState<Tema>(inicial.tema ?? {});

  const campo = (clave: keyof Tema) => (typeof tema[clave] === 'string' ? tema[clave] : '') ?? '';
  const poner = (clave: keyof Tema, valor: string) => setTema({ ...tema, [clave]: valor });

  // Se leen UNA vez, al nacer el formulario: el fondo de referencia es el que
  // está puesto ahora, no el que el formulario tiene a medio escribir. Va en
  // el inicializador y no en un `useEffect`: no hay nada con lo que
  // sincronizarse, es una sola lectura que además limpia lo que crea.
  const [fondos] = useState(() => ({
    guest: fondoReal('guest', '--bg'),
    staff: fondoReal('staff', '--surface'),
  }));

  // El acento del huésped se mide contra SU fondo si lo cambió, y si no
  // contra el que está puesto. El de recepción, contra el blanco de las
  // fichas, que es donde vive el texto de recepción.
  const fondoHuesped = campo('huespedFondo') || fondos.guest;
  const fondoStaff = campo('staffFondo') || fondos.staff;

  const acento = campo('acento');
  const sugerido = acento ? textoQueSeLee(acento) : null;

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGuardar({
      marcaExperiencia: experiencia.trim(),
      marcaHotel: hotel.trim(),
      correo: correo.trim(),
      tema,
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
        <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">{copy.cuerpo}</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="m-0 font-display text-lg font-medium">{copy.nombresTitulo}</h3>
            <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">
              {copy.nombresCuerpo}
            </p>
          </div>
          <Input
            label={copy.marcaExperienciaLabel}
            hint={copy.marcaExperienciaAyuda}
            value={experiencia}
            onChange={(event) => setExperiencia(event.target.value)}
          />
          <Input
            label={copy.marcaHotelLabel}
            value={hotel}
            onChange={(event) => setHotel(event.target.value)}
          />
          <Input
            label={copy.correoLabel}
            hint={copy.correoAyuda}
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="m-0 font-display text-lg font-medium">{copy.coloresTitulo}</h3>
            <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">
              {copy.coloresCuerpo}
            </p>
          </div>

          <CampoDeColor
            label={copy.acentoLabel}
            ayuda={copy.acentoAyuda}
            valor={acento}
            onChange={(valor) => poner('acento', valor)}
            contra={fondoHuesped}
          />
          <CampoDeColor
            label={copy.acentoStaffLabel}
            ayuda={copy.acentoStaffAyuda}
            valor={campo('acentoStaff')}
            onChange={(valor) => poner('acentoStaff', valor)}
            contra={fondoStaff}
          />
          <CampoDeColor
            label={copy.sobreAcentoLabel}
            ayuda={copy.sobreAcentoAyuda}
            valor={campo('sobreAcento')}
            onChange={(valor) => poner('sobreAcento', valor)}
            contra={acento || null}
            extra={
              sugerido ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => poner('sobreAcento', sugerido)}
                >
                  {copy.sugerir}
                </Button>
              ) : null
            }
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h4 className="m-0 text-[13px] font-medium tracking-wide text-muted uppercase">
                {copy.huespedTitulo}
              </h4>
              <CampoDeColor
                label={copy.fondoLabel}
                valor={campo('huespedFondo')}
                onChange={(valor) => poner('huespedFondo', valor)}
              />
              <CampoDeColor
                label={copy.superficieLabel}
                valor={campo('huespedSuperficie')}
                onChange={(valor) => poner('huespedSuperficie', valor)}
              />
              <CampoDeColor
                label={copy.textoLabel}
                valor={campo('huespedTexto')}
                onChange={(valor) => poner('huespedTexto', valor)}
                contra={fondoHuesped}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="m-0 text-[13px] font-medium tracking-wide text-muted uppercase">
                {copy.staffTitulo}
              </h4>
              <CampoDeColor
                label={copy.fondoLabel}
                valor={campo('staffFondo')}
                onChange={(valor) => poner('staffFondo', valor)}
              />
              <CampoDeColor
                label={copy.textoLabel}
                valor={campo('staffTexto')}
                onChange={(valor) => poner('staffTexto', valor)}
                contra={fondoStaff}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="m-0 font-display text-lg font-medium">{copy.fuentesTitulo}</h3>
            <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">
              {copy.fuentesCuerpo}
            </p>
          </div>

          {/* Un datalist y no un select: la lista son sugerencias, y una marca
              puede traer una fuente que no está en ninguna lista nuestra. */}
          <datalist id="fuentes-sugeridas">
            {FUENTES_SUGERIDAS.map((fuente) => (
              <option key={fuente} value={fuente} />
            ))}
          </datalist>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={copy.fuenteTitulosLabel}
              list="fuentes-sugeridas"
              placeholder="Cormorant Garamond"
              value={campo('fuenteTitulos')}
              onChange={(event) => poner('fuenteTitulos', event.target.value)}
            />
            <Input
              label={copy.fuenteTextoLabel}
              list="fuentes-sugeridas"
              placeholder="Jost"
              value={campo('fuenteTexto')}
              onChange={(event) => poner('fuenteTexto', event.target.value)}
            />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-text">
            <input
              type="checkbox"
              checked={tema.fuenteGoogle === true}
              onChange={(event) => setTema({ ...tema, fuenteGoogle: event.target.checked })}
              className="mt-0.5 size-4.5 shrink-0 accent-gold"
            />
            <span className="flex flex-col gap-0.5">
              <span>{copy.fuenteGoogleLabel}</span>
              <span className="text-[13px] leading-relaxed text-muted">
                {copy.fuenteGoogleAyuda}
              </span>
            </span>
          </label>
        </div>
      </Card>

      {fallo ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {copy.sinPermiso}
        </p>
      ) : null}
      {guardado ? (
        <p role="status" className="m-0 text-sm text-on-success">
          {copy.guardado}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {/* Ver antes de guardar: elegir una paleta a ciegas es adivinar. No
            toca la base, así que lo puede usar cualquiera de recepción. */}
        <Button type="button" variant="outline" onClick={() => onProbar(tema)}>
          {copy.probar}
        </Button>
        <Button type="button" variant="ghost" onClick={() => onProbar(inicial.tema)}>
          {copy.volver}
        </Button>
        {esAdmin ? (
          <Button type="submit" disabled={guardando}>
            {guardando ? copy.guardando : copy.guardar}
          </Button>
        ) : null}
      </div>
      <p className="m-0 text-[13px] text-muted-soft">{copy.probarAyuda}</p>
    </form>
  );
}
