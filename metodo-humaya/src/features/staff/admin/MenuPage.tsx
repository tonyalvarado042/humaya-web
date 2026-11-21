import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input } from '@/components/ui';
import { useAdminOpciones, useEditarOpcion, useToggleOpcion } from '@/hooks';
import { descripcionDeOpcion, etiquetaDeOpcion } from '@/i18n/opciones';
import type { CambiosOpcion } from '@/services/admin';
import type { AdminOpcion, PorIdioma } from '@/types';
import { ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useEsAdministrador } from '../puerta/contexto';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { menuCopy } from './copyMenu';

/**
 * El menú del huésped: qué opciones ve y cómo se llaman.
 *
 * ── QUÉ CAMBIÓ EL 20 DE NOVIEMBRE DE 2026 ───────────────────────────────
 * Hasta hoy esta lista solo se podía encender y apagar, y mostraba la columna
 * `etiqueta` como si fuera editable. No lo era: la app del huésped hace
 * `t('nav.' + clave, etiqueta)`, así que para las seis opciones sembradas
 * ganaba siempre la traducción del archivo. Cambiar el nombre no cambiaba
 * nada en ninguna pantalla.
 *
 * Ahora el nombre se guarda por idioma —`etiquetas`, `descripciones`— y la
 * app lo prefiere sobre su propia traducción. Ver `src/i18n/opciones.ts`.
 *
 * ── POR QUÉ SE MUESTRAN LOS DOS IDIOMAS A LA VEZ ────────────────────────
 * Porque es lo único que deja ver que renombrar el español no le cambió nada
 * al inglés. Sin eso, el único modo de comprobarlo sería abrir la app del
 * huésped y cambiarle el idioma.
 */
export function MenuPage() {
  const [idioma] = useIdiomaRecepcion();
  const copy = menuCopy[idioma];
  const opciones = useAdminOpciones();
  const toggle = useToggleOpcion();
  const editar = useEditarOpcion();
  const esAdmin = useEsAdministrador();
  const [editando, setEditando] = useState<string | null>(null);

  if (opciones.isPending) return <ScreenLoading label={copy.titulo} />;
  if (opciones.isError || !opciones.data) {
    return <ScreenError onRetry={() => void opciones.refetch()} />;
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 font-display text-2xl font-medium">{copy.titulo}</h2>
        <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">{copy.cuerpo}</p>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {opciones.data.map((opcion) => (
          <li key={opcion.id}>
            {editando === opcion.id ? (
              <Card>
                <FormularioNombres
                  opcion={opcion}
                  guardando={editar.isPending}
                  fallo={editar.isError}
                  onCancelar={() => setEditando(null)}
                  onGuardar={(cambios) =>
                    editar.mutate(
                      { id: opcion.id, cambios },
                      { onSuccess: () => setEditando(null) },
                    )
                  }
                />
              </Card>
            ) : (
              <Card className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-[14rem] flex-1 flex-col gap-1">
                  <h3 className="m-0 font-medium text-text">{etiquetaDeOpcion(opcion, 'es')}</h3>
                  {descripcionDeOpcion(opcion, 'es') ? (
                    <span className="text-[13px] text-muted">
                      {descripcionDeOpcion(opcion, 'es')}
                    </span>
                  ) : null}
                  <span className="text-[13px] text-muted-soft">
                    {copy.verEn}: {etiquetaDeOpcion(opcion, 'en')}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={opcion.habilitada ? 'success' : 'neutral'}>
                    {opcion.habilitada ? copy.habilitada : copy.deshabilitada}
                  </Badge>
                  {/* Cambiarle el nombre va directo a la tabla y RLS exige
                      `administrador`. Encenderla y apagarla pasa por la
                      funcion `humaya-admin`, que acepta cualquier rol de
                      recepcion: por eso ese boton no se esconde. */}
                  {esAdmin ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        editar.reset();
                        setEditando(opcion.id);
                      }}
                    >
                      {copy.editar}
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ id: opcion.id, habilitada: !opcion.habilitada })}
                  >
                    {opcion.habilitada ? copy.deshabilitar : copy.habilitar}
                  </Button>
                </div>
              </Card>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

interface FormularioProps {
  opcion: AdminOpcion;
  guardando: boolean;
  fallo: boolean;
  onCancelar: () => void;
  onGuardar: (cambios: CambiosOpcion) => void;
}

/**
 * El formulario existe SOLO mientras se edita, y eso no es casualidad: así
 * cada vez que se abre, el estado se siembra con lo que está guardado. Si
 * viviera en MenuPage, cancelar y volver a entrar mostraría lo que alguien
 * tecleó y descartó — lo contrario de cancelar.
 */
function FormularioNombres({ opcion, guardando, fallo, onCancelar, onGuardar }: FormularioProps) {
  const [idioma] = useIdiomaRecepcion();
  const copy = menuCopy[idioma];
  const [etiquetas, setEtiquetas] = useState<PorIdioma>(opcion.etiquetas ?? {});
  const [descripciones, setDescripciones] = useState<PorIdioma>(opcion.descripciones ?? {});

  /**
   * Lo que se vería si este campo se deja en blanco. Va como `placeholder`
   * para que quede claro que vacío NO es «sin nombre»: es «el que trae la
   * app».
   */
  const sinEsto = (idioma: 'es' | 'en', campo: 'etiqueta' | 'descripcion') => {
    const pelada: AdminOpcion = { ...opcion, etiquetas: {}, descripciones: {} };
    const texto =
      campo === 'etiqueta' ? etiquetaDeOpcion(pelada, idioma) : descripcionDeOpcion(pelada, idioma);
    return texto ? copy.pordefecto(texto) : copy.sinTexto;
  };

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGuardar({ etiquetas, descripciones });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <div>
        <h3 className="m-0 font-display text-lg font-medium">{copy.nombres}</h3>
        <p className="m-0 max-w-prose text-[13px] leading-relaxed text-muted">
          {copy.nombresCuerpo}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={copy.etiquetaEs}
          placeholder={sinEsto('es', 'etiqueta')}
          value={etiquetas.es ?? ''}
          onChange={(event) => setEtiquetas({ ...etiquetas, es: event.target.value })}
        />
        <Input
          label={copy.etiquetaEn}
          placeholder={sinEsto('en', 'etiqueta')}
          value={etiquetas.en ?? ''}
          onChange={(event) => setEtiquetas({ ...etiquetas, en: event.target.value })}
        />
        <Input
          label={copy.descripcionEs}
          placeholder={sinEsto('es', 'descripcion')}
          value={descripciones.es ?? ''}
          onChange={(event) => setDescripciones({ ...descripciones, es: event.target.value })}
        />
        <Input
          label={copy.descripcionEn}
          placeholder={sinEsto('en', 'descripcion')}
          value={descripciones.en ?? ''}
          onChange={(event) => setDescripciones({ ...descripciones, en: event.target.value })}
        />
      </div>

      {fallo ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {copy.sinPermiso}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={guardando}>
          {guardando ? copy.guardando : copy.guardar}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancelar} disabled={guardando}>
          {copy.cancelar}
        </Button>
      </div>
    </form>
  );
}
