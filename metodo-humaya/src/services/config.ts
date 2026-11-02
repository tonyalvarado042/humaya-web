/**
 * Mientras no exista backend, los servicios devuelven datos de ejemplo.
 * La variable vive en .env.local (y .env.example la documenta).
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

/**
 * Se llama al entrar a cada servicio. Falla fuerte y claro en vez de fingir que
 * hay una API: el día que exista, se implementa la rama real acá al lado.
 */
export function assertMocks(service: string): void {
  if (!USE_MOCKS) {
    throw new Error(
      `El servicio ${service} todavía no tiene API real. Dejá VITE_USE_MOCKS sin definir o en true.`,
    );
  }
}
