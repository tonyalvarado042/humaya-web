import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';
import type { VideoStyle } from './types';

interface VideoStageProps {
  src: string;
  style: VideoStyle;
  children: ReactNode;
}

/**
 * Envuelve cada fase del reproductor con el video de demostración, en uno de
 * los cuatro tratamientos visuales que Anthony pidió comparar. "takeover"
 * (pantalla completa) es el recomendado: el video queda de fondo a toda
 * pantalla y los controles, el contador y la barra de progreso se sobreponen
 * encima. Los otros tres ("immersive", "framed", "bubble") muestran el video
 * en línea, arriba del contenido.
 */
export function VideoStage({ src, style, children }: VideoStageProps) {
  if (style === 'takeover') {
    return (
      <div className="relative -mx-5 -mt-6 min-h-[calc(100dvh-152px)] overflow-hidden">
        <video
          key={src}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85"
        />
        <div className="relative z-10 flex min-h-[calc(100dvh-152px)] flex-col gap-5 px-5 py-6 text-[#f2ede4]">
          {children}
        </div>
      </div>
    );
  }

  const videoClass = cn(
    'w-full object-cover',
    style === 'framed' && 'aspect-video rounded-card border border-line-strong p-1',
    style === 'bubble' && 'float-right ml-3 mb-3 aspect-square w-28 rounded-pill',
    style === 'immersive' && 'aspect-video rounded-card',
  );

  return (
    <div className="flex flex-col gap-5">
      <video
        key={src}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className={videoClass}
      />
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
