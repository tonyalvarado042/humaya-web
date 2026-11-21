import { useId } from 'react';
import { Button } from '@/components/ui';
import { contraste, veredicto, type Veredicto } from '@/services/contraste';
import { esColor } from '@/services/tema';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { marcaCopy, type MarcaTextos } from './copyMarca';

/**
 * Un color de la marca: la muestra que se puede abrir, el hex escrito, y
 * —cuando corresponde— si se lee sobre el fondo donde va a usarse.
 *
 * ── POR QUÉ LA MUESTRA Y EL TEXTO A LA VEZ ──────────────────────────────
 * El `<input type="color">` es cómodo para buscar un tono y espantoso para
 * poner uno exacto: el hex de una marca viene escrito en un manual, no se
 * busca a ojo. Los dos campos son el mismo valor.
 *
 * ── POR QUÉ MIDE EL CONTRASTE ───────────────────────────────────────────
 * Regla de la casa: si se sabe de antemano que algo va a salir mal, se dice
 * ANTES. Un dorado claro sobre blanco se ve precioso en el selector y es
 * ilegible en la pantalla, y eso no se descubre hasta que un huésped no
 * encuentra el botón.
 */
interface CampoDeColorProps {
  label: string;
  ayuda?: string;
  valor: string;
  onChange: (valor: string) => void;
  /** El fondo contra el que se va a leer este color, si hay que medirlo. */
  contra?: string | null;
  /** Un botón extra, como «usar el que se lee». */
  extra?: React.ReactNode;
}

/**
 * El veredicto del contraste, con su color.
 *
 * Era una constante de modulo que leia `copy` al importar el archivo: con dos
 * idiomas se quedaba en el del primer render y el boton de idioma no la
 * cambiaba nunca.
 */
function tonos(copy: MarcaTextos): Record<Veredicto, { texto: string; clase: string }> {
  return {
    bien: { texto: copy.contrasteBien, clase: 'text-on-success' },
    justo: { texto: copy.contrasteJusto, clase: 'text-on-warning' },
    mal: { texto: copy.contrasteMal, clase: 'text-on-alert' },
    desconocido: { texto: '', clase: '' },
  };
}

export function CampoDeColor({ label, ayuda, valor, onChange, contra, extra }: CampoDeColorProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = marcaCopy[idioma];
  const id = useId();
  const puesto = esColor(valor);
  const razon = puesto && contra ? contraste(valor, contra) : null;
  const tono = tonos(copy)[veredicto(razon)];

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-text">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* El `title` va porque un cuadrito de color sin nombre no dice nada
            a quien usa un lector de pantalla; el campo de texto de al lado es
            el que de verdad etiqueta el valor. */}
        <input
          type="color"
          value={puesto ? valor : '#808080'}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label}: elegir en la paleta`}
          className="size-11 shrink-0 cursor-pointer rounded-xl border border-line-strong bg-surface p-1"
        />
        <input
          id={id}
          type="text"
          inputMode="text"
          spellCheck={false}
          placeholder="#000000"
          value={valor}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3 font-mono text-sm text-text"
        />
        {valor ? (
          <Button type="button" variant="ghost" onClick={() => onChange('')}>
            {copy.limpiar}
          </Button>
        ) : null}
        {extra}
      </div>
      {ayuda ? <p className="m-0 text-[13px] leading-relaxed text-muted">{ayuda}</p> : null}
      {razon !== null ? (
        <p className={`m-0 text-[13px] ${tono.clase}`} role="status">
          {copy.contrasteRazon(razon)} · {tono.texto}
        </p>
      ) : null}
      {valor && !puesto ? (
        <p className="m-0 text-[13px] text-on-alert" role="alert">
          {copy.noEsColor}
        </p>
      ) : null}
    </div>
  );
}
