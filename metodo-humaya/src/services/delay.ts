/** Retraso simulado de red, para que las pantallas muestren sus estados de carga. */
export function delay(minMs = 200, maxMs = 400): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
