import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  /** Acción opcional: normalmente un Button. */
  action?: ReactNode;
}

/** Estado vacío. El mensaje explica qué pasó y qué se puede hacer. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface-sunken px-6 py-10 text-center">
      <p className="m-0 font-display text-2xl text-text">{title}</p>
      <p className="m-0 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action}
    </div>
  );
}
