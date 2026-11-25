import { useState } from 'react';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { useGuardarGuia, useGuiaDeLaCasa } from '@/hooks';
import type { GuiaDeLaCasa as Guia, Regla, Telefono } from '@/services/tv';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { tvCopy, type TvTextos } from './copyTv';

/**
 * La guía de la casa: lo que el televisor contesta cuando el huésped busca
 * cómo funciona la villa.
 *
 * ── POR QUÉ EXISTE ESTA PANTALLA ────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «un hotel nace vacío y no se puede
 * llenar… arregla eso». Esta sección lo decía con todas las letras: la guía
 * «se cambia en la base, en humaya_tv_ajustes». O sea que para que un hotel
 * nuevo tuviera reglas, alguien tenía que escribirle un `update` de jsonb.
 *
 * ── POR QUÉ UN SOLO «GUARDAR» ───────────────────────────────────────────
 * Igual que en «Alrededor»: esto se escribe de a tandas —cinco reglas de una
 * sentada— y un guardado por campo serían treinta escrituras y treinta
 * formas de quedar a medias.
 *
 * ── POR QUÉ ES UNA SOLA PARA TODO EL HOTEL ──────────────────────────────
 * Porque las reglas son del hotel y no de la villa. Con una copia por villa,
 * cambiar la hora de silencio sería cambiarla diez veces y que la décima
 * quede vieja. Lo único que una villa pisa es el saludo, desde «Editar».
 */
export function GuiaDeLaCasa() {
  const guia = useGuiaDeLaCasa();
  if (!guia.data) return null;
  return <Editor inicial={guia.data} />;
}

function Editor({ inicial }: { inicial: Guia }) {
  const [idioma] = useIdiomaRecepcion();
  const copy = tvCopy[idioma];
  const guardar = useGuardarGuia();
  const [guia, setGuia] = useState<Guia>(inicial);

  const cambiar = (cambio: Partial<Guia>) => setGuia((antes) => ({ ...antes, ...cambio }));

  return (
    <Card>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          // Nada en blanco: una regla sin título en el televisor es una
          // tarjeta vacía que el huésped no entiende.
          guardar.mutate({
            welcome: guia.welcome.trim(),
            rules: guia.rules.filter((r) => r.title.trim() || r.body.trim()),
            howto: guia.howto.filter((r) => r.title.trim() || r.body.trim()),
            checkout: {
              time: guia.checkout.time.trim(),
              steps: guia.checkout.steps.map((p) => p.trim()).filter(Boolean),
            },
            emergency: guia.emergency.filter((t) => t.name.trim() || t.phone.trim()),
          });
        }}
      >
        <div>
          <h3 className="m-0 font-display text-lg font-medium">{copy.guiaTitulo}</h3>
          <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">
            {copy.guiaCuerpo}
          </p>
        </div>

        <Seccion titulo={copy.guiaBienvenida} ayuda={copy.guiaBienvenidaAyuda}>
          <Textarea
            label={copy.guiaBienvenida}
            hideLabel
            rows={3}
            value={guia.welcome}
            onChange={(e) => cambiar({ welcome: e.target.value })}
          />
        </Seccion>

        <Fichas
          copy={copy}
          titulo={copy.guiaReglas}
          ayuda={copy.guiaReglasAyuda}
          fichas={guia.rules}
          onCambiar={(rules) => cambiar({ rules })}
        />

        <Fichas
          copy={copy}
          titulo={copy.guiaComoFunciona}
          ayuda={copy.guiaComoFuncionaAyuda}
          fichas={guia.howto}
          onCambiar={(howto) => cambiar({ howto })}
        />

        <Seccion titulo={copy.guiaSalida} ayuda={copy.guiaSalidaAyuda}>
          <div className="max-w-50">
            <Input
              label={copy.guiaHora}
              inputMode="numeric"
              placeholder="11:00"
              value={guia.checkout.time}
              onChange={(e) => cambiar({ checkout: { ...guia.checkout, time: e.target.value } })}
            />
          </div>
          {guia.checkout.steps.map((paso, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="min-w-50 flex-1">
                <Input
                  label={`${copy.guiaPaso} ${i + 1}`}
                  value={paso}
                  onChange={(e) =>
                    cambiar({
                      checkout: {
                        ...guia.checkout,
                        steps: guia.checkout.steps.map((p, n) => (n === i ? e.target.value : p)),
                      },
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  cambiar({
                    checkout: {
                      ...guia.checkout,
                      steps: guia.checkout.steps.filter((_, n) => n !== i),
                    },
                  })
                }
              >
                {copy.guiaQuitar}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() =>
              cambiar({ checkout: { ...guia.checkout, steps: [...guia.checkout.steps, ''] } })
            }
          >
            {copy.guiaAgregarPaso}
          </Button>
        </Seccion>

        <Seccion titulo={copy.guiaEmergencias} ayuda={copy.guiaEmergenciasAyuda}>
          {guia.emergency.length === 0 ? (
            <p className="m-0 text-[13px] text-muted-soft">{copy.guiaNadaTodavia}</p>
          ) : null}
          {guia.emergency.map((fila, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="min-w-50 flex-1">
                <Input
                  label={copy.guiaQuien}
                  value={fila.name}
                  onChange={(e) =>
                    cambiar({ emergency: cambiarEn(guia.emergency, i, { name: e.target.value }) })
                  }
                />
              </div>
              <div className="min-w-35 flex-1">
                <Input
                  label={copy.guiaTelefono}
                  inputMode="tel"
                  value={fila.phone}
                  onChange={(e) =>
                    cambiar({ emergency: cambiarEn(guia.emergency, i, { phone: e.target.value }) })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => cambiar({ emergency: guia.emergency.filter((_, n) => n !== i) })}
              >
                {copy.guiaQuitar}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => cambiar({ emergency: [...guia.emergency, { name: '', phone: '' }] })}
          >
            {copy.guiaAgregar}
          </Button>
        </Seccion>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={guardar.isPending}>
            {guardar.isPending ? copy.guardando : copy.guardar}
          </Button>
          {guardar.isSuccess ? (
            <span className="text-[13px] text-muted">{copy.guardado}</span>
          ) : null}
          {guardar.isError ? (
            <span role="alert" className="text-[13px] text-on-alert">
              {copy.errorGuardar}
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

/** Cambia un campo de la fila `i` sin tocar las demás. */
function cambiarEn(filas: Telefono[], i: number, cambio: Partial<Telefono>): Telefono[] {
  return filas.map((fila, n) => (n === i ? { ...fila, ...cambio } : fila));
}

function Seccion({
  titulo,
  ayuda,
  children,
}: {
  titulo: string;
  ayuda: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 rounded-card border border-line p-4">
      <legend className="px-1 text-[13px] font-medium text-text">{titulo}</legend>
      <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">{ayuda}</p>
      {children}
    </fieldset>
  );
}

/** Una lista de fichas con título y texto. La comparten reglas y «cómo funciona». */
function Fichas({
  copy,
  titulo,
  ayuda,
  fichas,
  onCambiar,
}: {
  copy: TvTextos;
  titulo: string;
  ayuda: string;
  fichas: Regla[];
  onCambiar: (fichas: Regla[]) => void;
}) {
  return (
    <Seccion titulo={titulo} ayuda={ayuda}>
      {fichas.length === 0 ? (
        <p className="m-0 text-[13px] text-muted-soft">{copy.guiaNadaTodavia}</p>
      ) : null}
      {fichas.map((ficha, i) => (
        <div key={i} className="flex flex-col gap-2 border-t border-line-soft pt-2.5">
          <Input
            label={copy.guiaTituloCampo}
            value={ficha.title}
            onChange={(e) =>
              onCambiar(fichas.map((f, n) => (n === i ? { ...f, title: e.target.value } : f)))
            }
          />
          <Textarea
            label={copy.guiaTextoCampo}
            rows={2}
            value={ficha.body}
            onChange={(e) =>
              onCambiar(fichas.map((f, n) => (n === i ? { ...f, body: e.target.value } : f)))
            }
          />
          <Button
            type="button"
            variant="ghost"
            className="w-fit"
            onClick={() => onCambiar(fichas.filter((_, n) => n !== i))}
          >
            {copy.guiaQuitar}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => onCambiar([...fichas, { title: '', body: '' }])}
      >
        {copy.guiaAgregar}
      </Button>
    </Seccion>
  );
}
