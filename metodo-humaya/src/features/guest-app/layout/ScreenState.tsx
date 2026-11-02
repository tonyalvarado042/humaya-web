import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton } from '@/components/ui';

interface LoadingProps {
  /** Qué se está cargando, para el aviso de lectores de pantalla. */
  label: string;
  lines?: number;
}

/**
 * Estado de carga. Los Skeleton son decorativos; el aviso lo da el aria-live,
 * como quedó definido en la Fase 1.
 */
export function ScreenLoading({ label, lines = 3 }: LoadingProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      <span aria-live="polite" className="sr-only">
        {t('common.loading', { label })}
      </span>
      <Skeleton variant="line" className="w-1/3" />
      <Skeleton variant="block" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} variant="line" className={index % 2 === 0 ? 'w-full' : 'w-2/3'} />
      ))}
    </div>
  );
}

interface ErrorProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

/** Estado de error, siempre con una salida: reintentar. */
export function ScreenError({ title, description, onRetry }: ErrorProps) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="m-5 flex flex-col items-start gap-3 rounded-card border border-line-strong bg-surface p-5"
    >
      <p className="m-0 font-display text-2xl text-text">{title ?? t('common.errorTitle')}</p>
      <p className="m-0 text-sm leading-relaxed text-muted">
        {description ?? t('common.errorDescription')}
      </p>
      <Button variant="outline" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  );
}

interface ScreenProps {
  children: ReactNode;
}

/** Contenedor de pantalla: el padding y el ritmo vertical, en un solo lugar. */
export function Screen({ children }: ScreenProps) {
  return <div className="flex flex-col gap-5 px-5 py-6">{children}</div>;
}

interface HeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** El encabezado que abre cada pantalla: rótulo en versalitas y título grande. */
export function ScreenHeading({ eyebrow, title, description, action }: HeadingProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-eyebrow text-gold">{eyebrow}</span>
        <h1 className="m-0 font-display text-4xl leading-none font-medium">{title}</h1>
        {description ? <p className="m-0 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}
