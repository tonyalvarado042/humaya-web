import { MARCA, temaActual } from '@/marca';
import { esImagen } from '@/services/tema';
import { cn } from './ui/cn';

interface LogoDelHotelProps {
  /** `mark` es el cuadrado; `wordmark`, el largo para fondos oscuros. */
  variant?: 'mark' | 'wordmark';
  className?: string;
  decorative?: boolean;
}

/**
 * El logo del hotel que sirve esta pantalla.
 *
 * ── POR QUÉ DEJÓ DE LLAMARSE HumayaLogo ─────────────────────────────────
 * Porque pintaba `/wordmark-white.png` SIEMPRE, de cualquier hotel. El 21 de
 * noviembre de 2026, probando el hotel demo en el servidor local, la barra de
 * recepción y el Home del huésped decían «HUMAYA» con la marca verde del
 * demo alrededor. Un componente que se llama como un hotel termina mostrando
 * ese hotel en todos lados.
 *
 * ── POR QUÉ UN HOTEL SIN LOGO MUESTRA SU NOMBRE ─────────────────────────
 * Porque la alternativa es mostrarle al huésped el logotipo de otra empresa,
 * y eso no es un detalle de diseño: es decirle que está en otro hotel. El
 * nombre escrito con la tipografía y el acento del hotel se ve bien y es
 * verdad.
 *
 * El logo propio se carga en `humaya_hoteles.tema` (`logo`, `logoMarca`), que
 * es donde ya viven los colores y las letras. Subirlo desde Admin todavía no
 * existe: hoy se pone la ruta a mano.
 */
export function LogoDelHotel({
  variant = 'wordmark',
  className,
  decorative = false,
}: LogoDelHotelProps) {
  const tema = temaActual();
  const propio = variant === 'mark' ? tema?.logoMarca : tema?.logo;

  if (esImagen(propio)) {
    return (
      <img
        src={propio.trim()}
        alt={decorative ? '' : MARCA.hotel}
        className={cn('block h-auto object-contain', className)}
      />
    );
  }

  // El nombre, en la tipografía de títulos del hotel. `aria-hidden` cuando es
  // decorativo, igual que el `alt=""` de la imagen: si al lado ya dice el
  // nombre, repetirlo le estorba a quien usa un lector de pantalla.
  return (
    <span
      aria-hidden={decorative || undefined}
      className={cn(
        'block font-display leading-none font-medium tracking-[0.12em] text-balance uppercase',
        className,
      )}
    >
      {variant === 'mark' ? inicial(MARCA.hotel) : MARCA.hotel}
    </span>
  );
}

/** La inicial, para donde el logo largo no cabe. */
function inicial(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase() || '·';
}
