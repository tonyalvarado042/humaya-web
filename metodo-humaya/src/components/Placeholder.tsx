interface PlaceholderProps {
  area: string;
  title: string;
  description: string;
}

/**
 * Pantalla provisional de la Fase 0. Las fases 3 y 4 la reemplazan por los
 * layouts reales de la app del huésped y del dashboard de recepción.
 */
export function Placeholder({ area, title, description }: PlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-6 py-12">
      <p className="text-xs uppercase tracking-[0.16em]">{area}</p>
      <h1 className="text-3xl font-medium">{title}</h1>
      <p className="text-base leading-relaxed">{description}</p>
    </main>
  );
}
