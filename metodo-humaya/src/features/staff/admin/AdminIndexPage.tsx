import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { MARCA } from '@/marca';
import { SECCIONES_ADMIN } from './secciones';

/**
 * La portada de Admin: qué se configura y dónde.
 *
 * ── POR QUÉ FICHAS CON UNA EXPLICACIÓN Y NO UNA LISTA DE NOMBRES ────────
 * Porque «Marca» y «Ajustes» no dicen qué hay adentro. Una palabra alcanza
 * para volver a un lugar donde ya se estuvo; para entrar la primera vez hace
 * falta la frase.
 */
export function AdminIndexPage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 max-w-prose text-sm leading-relaxed text-muted">
        Todo lo que se configura de <strong className="font-medium text-text">{MARCA.hotel}</strong>{' '}
        vive acá. Cada sección cambia lo que el huésped ve en el momento en que se guarda.
      </p>

      <ul
        aria-label="Lo que se configura"
        className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3"
      >
        {SECCIONES_ADMIN.map(({ ruta, titulo, cuerpo, Icon }) => (
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
