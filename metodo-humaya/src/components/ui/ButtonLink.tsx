import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/**
 * Un enlace con aspecto de botón. Navegar es trabajo de un `a`, no de un
 * `button`: esto deja la semántica correcta sin repetir los estilos.
 *
 * Con react-router se usa como `<Link>` renderizado por su prop `component`, o
 * directamente para enlaces externos.
 */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </a>
  );
}
