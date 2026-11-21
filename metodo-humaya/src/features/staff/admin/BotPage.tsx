import { ConciergeBot } from './ConciergeBot';

/**
 * El Concierge: el bot que contesta de noche, su llave, lo que sabe y las
 * respuestas guardadas.
 *
 * Es una envoltura de una linea a proposito: `ConciergeBot` ya existia como
 * bloque dentro de la vieja pantalla unica de Admin, y separar Admin por
 * funcion no tenia por que reescribirlo.
 */
export function BotPage() {
  return <ConciergeBot />;
}
