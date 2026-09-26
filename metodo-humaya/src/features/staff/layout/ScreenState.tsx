import type { ReactNode } from 'react';
import { Button, Skeleton } from '@/components/ui';

interface LoadingProps {
  label: string;
  rows?: number;
}

/**
 * Estados de pantalla del dashboard. Mismo contrato que las piezas de
 * guest-app, distinto espaciado: acá el ancho es variable y el padding crece
 * con la pantalla.
 */
export function ScreenLoading({ label, rows = 4 }: LoadingProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-11 lg:py-9">
      <span aria-live="polite" className="sr-only">
        Cargando {label}…
      </span>
      <Skeleton variant="line" className="w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} variant="block" className="h-24" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} variant="block" className="h-16" />
      ))}
    </div>
  );
}

interface ErrorProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

export function ScreenError({
  title = 'No pudimos cargar esta pantalla',
  description = 'Puede ser un problema de conexión. Probá de nuevo en un momento.',
  onRetry,
}: ErrorProps) {
  return (
    <div
      role="alert"
      className="m-4 flex max-w-xl flex-col items-start gap-3 rounded-card border border-line bg-surface p-5 lg:m-11"
    >
      <p className="m-0 font-display text-2xl text-text">{title}</p>
      <p className="m-0 text-sm leading-relaxed text-muted">{description}</p>
      <Button variant="ghost" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

interface ScreenProps {
  children: ReactNode;
}

/** Contenedor de pantalla del dashboard: el padding crece con el ancho. */
export function Screen({ children }: ScreenProps) {
  return <div className="flex flex-col gap-5 px-4 py-6 lg:gap-6 lg:px-11 lg:py-9">{children}</div>;
}

interface HeadingProps {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}

/** Encabezado de pantalla: fecha arriba, título grande, acción a la derecha. */
export function ScreenHeading({ eyebrow, title, action }: HeadingProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-eyebrow text-muted">{eyebrow}</span>
        <h1 className="m-0 font-display text-[34px] leading-none font-medium lg:text-[46px]">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
