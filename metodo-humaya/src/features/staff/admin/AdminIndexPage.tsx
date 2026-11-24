import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { MARCA } from '@/marca';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { adminCopy } from './copy';
import { useSoyPlataforma } from '@/hooks/useSoyPlataforma';
import { seccionesAdmin } from './secciones';

/**
 * La portada de Admin: qué se configura y dónde.
 *
 * ── POR QUÉ FICHAS CON UNA EXPLICACIÓN Y NO UNA LISTA DE NOMBRES ────────
 * Porque «Marca» y «Ajustes» no dicen qué hay adentro. Una palabra alcanza
 * para volver a un lugar donde ya se estuvo; para entrar la primera vez hace
 * falta la frase.
 */
export function AdminIndexPage() {
  const [idioma] = useIdiomaRecepcion();
  const esPlataforma = useSoyPlataforma();
  const copy = adminCopy[idioma];
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">
        {copy.portadaAntes}
        <strong className="font-medium text-text">{MARCA.hotel}</strong>
        {copy.portadaDespues}
      </p>

      <ul
        aria-label={copy.portadaLista}
        className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3"
      >
        {seccionesAdmin(idioma, esPlataforma).map(({ ruta, titulo, cuerpo, Icon }) => (
          <li key={ruta}>
            <Link to={ruta} className="block h-full no-underline">
              <Card className="flex h-full flex-col gap-2">
                <Icon size={24} strokeWidth={1.6} className="text-gold" aria-hidden="true" />
                <h2 className="m-0 font-display text-xl font-medium text-text">{titulo}</h2>
                <p className="m-0 text-[13px] leading-relaxed text-muted">{cuerpo}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
