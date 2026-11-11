/**
 * /entrada — el huésped llega acá desde el link que Cloudbeds le manda al
 * reservar. Real desde el día uno, como el Concierge: llama a la Edge
 * Function humaya-entrada en vez de mocks.
 */
export interface EntradaResult {
  found: boolean;
  guestName?: string | null;
  checkin?: string | null;
  checkout?: string | null;
}

const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';

export async function checkReservation(email: string): Promise<EntradaResult> {
  const response = await fetch(`${FN_BASE}/humaya-entrada`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error(`entrada_http_${response.status}`);
  }
  return response.json() as Promise<EntradaResult>;
}
