/** Une clases de Tailwind descartando las vacías, `false` y `undefined`. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
