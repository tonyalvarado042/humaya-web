import { useState } from 'react';
import { SegmentedControl } from '@/components/ui';
import { UiKitCatalog } from './UiKitCatalog';

type ThemeChoice = 'guest' | 'staff' | 'both';

const themeOptions = [
  { value: 'guest' as const, label: 'Guest' },
  { value: 'staff' as const, label: 'Staff' },
  { value: 'both' as const, label: 'Los dos' },
];

/**
 * Catálogo del sistema visual (Fase 1). Vive en features/dev/ para no romper la
 * regla de ARCHITECTURE.md de que una feature no importa de otra.
 */
export function UiKitPage() {
  const [theme, setTheme] = useState<ThemeChoice>('guest');
  const themes: ('guest' | 'staff')[] = theme === 'both' ? ['guest', 'staff'] : [theme];

  return (
    <div data-theme="staff" className="min-h-dvh bg-bg text-text">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow text-gold">Humaya · Fase 1</span>
          <h1 className="m-0 font-display text-3xl font-medium">Sistema visual</h1>
        </div>
        <SegmentedControl label="Tema" options={themeOptions} value={theme} onChange={setTheme} />
      </header>

      <div className={theme === 'both' ? 'grid gap-px bg-line lg:grid-cols-2' : undefined}>
        {themes.map((name) => (
          <div key={name} data-theme={name} className="bg-bg text-text">
            <UiKitCatalog themeName={name} />
          </div>
        ))}
      </div>
    </div>
  );
}
