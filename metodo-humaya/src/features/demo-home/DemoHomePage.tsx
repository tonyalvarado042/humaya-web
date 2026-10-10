import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HumayaLogo } from '@/components/HumayaLogo';
import { buttonClasses } from '@/components/ui';
import { demoHomeCopy as copy } from './copy';

/** Portada del origen dedicado del MVP. La landing pública vive en otro origen. */
export function DemoHomePage() {
  useEffect(() => {
    document.documentElement.lang = 'es';
  }, []);

  return (
    <main
      data-theme="guest"
      className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10 text-text"
    >
      <section className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <HumayaLogo className="w-52 max-w-full" />

        <div className="flex flex-col items-center gap-3">
          <span className="text-eyebrow text-gold">{copy.eyebrow}</span>
          <h1 className="m-0 font-display text-5xl leading-none font-medium sm:text-6xl">
            {copy.title}
          </h1>
          <p className="m-0 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {copy.description}
          </p>
        </div>

        <nav aria-label="Accesos de la demo" className="grid w-full max-w-md gap-3 sm:grid-cols-2">
          <Link to="/app" className={buttonClasses('primary', 'lg', 'w-full')}>
            {copy.guestCta}
          </Link>
          <Link to="/staff" className={buttonClasses('outline', 'lg', 'w-full')}>
            {copy.staffCta}
          </Link>
        </nav>

        <p className="m-0 max-w-md text-xs leading-relaxed text-muted-soft">{copy.disclaimer}</p>

        <Link to="/entrada" className="text-sm text-gold no-underline">
          {copy.entradaCta}
        </Link>
      </section>
    </main>
  );
}
